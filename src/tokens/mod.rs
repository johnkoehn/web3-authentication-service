extern crate ed25519_dalek;
use serde::{Serialize, Deserialize};
use jsonwebtoken::{encode, decode, Header, Algorithm, Validation, EncodingKey, DecodingKey};
use actix_web::{post, web::{self, Buf}, HttpResponse, Responder, HttpRequest};
use std::{time::{SystemTime, Duration, UNIX_EPOCH}, os::unix::prelude::OsStringExt};
use bs58;
use ed25519_dalek::{PublicKey, Verifier};
use rand::rngs::OsRng;
use ed25519_dalek::Keypair;
use ed25519_dalek::Signature;

pub mod unauthorized;

const ISSUER: &str = "https://exonerated.io/";

// Our claims struct, it needs to derive `Serialize` and/or `Deserialize`
#[derive(Serialize, Deserialize, Debug)]
pub struct Claims {
    // the public key of the user
    sub: String,
    iat: u64,
    exp: u64,
    iss: String
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CreateTokenRequest {
    public_key: String
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TokenResponse {
    access_token: String,
    token_type: String,
    expires_in: u64
}

#[post("/tokens/validate")]
pub async fn validate_token(request: HttpRequest) ->  impl Responder {
    // get the signed token
    let auth_header = request.headers().get("Authorization");

    if auth_header.is_none() {
        return unauthorized::error(unauthorized::ErrorTypes::NoSignedToken)
    }

    let signed_token = auth_header.unwrap().to_str().unwrap();

    if !signed_token.starts_with("Bearer ") {
        return unauthorized::error(unauthorized::ErrorTypes::NoBearer)
    }

    let result: Vec<&str> = signed_token.split("Bearer ").collect();
    if result.len() != 2 {
        return unauthorized::error(unauthorized::ErrorTypes::InvalidSignedToken)
    }

    let signed_token = result.get(1).unwrap();

    // get the jwt
    let base_token_header = request.headers().get("Base-Token");
    if base_token_header.is_none() {
        return unauthorized::error(unauthorized::ErrorTypes::NoBaseToken)
    }

    let base_token = base_token_header.unwrap().to_str().unwrap();
    println!("{}", base_token);
    // let base_token_encoded = bs58::encode(base_token.as_bytes());
    // let base_token_decoded = bs58::decode(base_token.as_bytes()).into_vec().unwrap();
    // let base_token_decoded = base_token_decoded.as_slice();
    // println!("{}", base_token_encoded);
    // TODO verify and decode the JWT

    // in the mean time we will get public key from header
    let public_key_header = request.headers().get("Public-Key");
    if public_key_header.is_none() {
        return unauthorized::error(unauthorized::ErrorTypes::InvalidSignedToken)
    }

    // let pubkey = recover(base_token.as_bytes(), &signed_token.as_bytes(), 0);
    // if pubkey.is_err() {
    //     println!("Error with pubkey {}", pubkey.err().unwrap());
    //     return unauthorized::error(unauthorized::ErrorTypes::InvalidSignature)
    // }

    // println!("{}", pubkey);
    // if pubkey != public_key_header.unwrap().to_str().unwrap() {
    //     return unauthorized::error(unauthorized::ErrorTypes::InvalidSignature)
    // }

    let pub_key = public_key_header.unwrap().to_str().unwrap().as_bytes();
    // println!("{}", pub_key);
    let pub_key = bs58::decode(pub_key).into_vec().unwrap();
    let pub_key = pub_key.as_slice();

    let test = bs58::decode(signed_token).into_vec().unwrap();
    let test = test.as_slice();

    // let pub_key = signature::UnparsedPublicKey::new(&signature::ED25519, pub_key);
    // let error = pub_key.verify(base_token_encoded.as_bytes(), test).unwrap_err();
    println!("{}", test.len());

    let public_key: PublicKey = PublicKey::from_bytes(pub_key).unwrap();
    let signature: Signature = Signature::from_bytes(&test[..]).unwrap();
    println!("{}", public_key.verify(base_token.as_bytes(), &signature).unwrap_err());


    // verify(pub_key,  base_token.to_string(), &test);
    HttpResponse::Ok().finish()
}

#[post("/tokens")]
pub async fn create_token(create_token_web_request: web::Json<CreateTokenRequest>) -> impl Responder {
    let create_token_request = create_token_web_request.into_inner();

    let twenty_four_hours = Duration::from_secs(86400);
    let now = SystemTime::now();
    let expires_at = now + twenty_four_hours;

    let iat = match now.duration_since(UNIX_EPOCH) {
        Ok(n) => n.as_secs(),
        Err(err) => {
            println!("Failed to calculate iat: {}", err);
            return HttpResponse::InternalServerError().finish()
        }
    };

    let exp = match expires_at.duration_since(UNIX_EPOCH) {
        Ok(n) => n.as_secs(),
        Err(err) => {
            println!("Failed to calculate exp: {}", err);
            return HttpResponse::InternalServerError().finish()
        }
    };

    let claims = Claims {
        iss: ISSUER.to_string(),
        sub: create_token_request.public_key,
        iat,
        exp
    };

    let key = b"secret";

    let mut header = Header::default();
    header.kid = Some("signing_key".to_owned());
    header.alg = Algorithm::HS256;

    let token = match encode(&header, &claims, &EncodingKey::from_secret(key)) {
        Ok(t) => t,
        Err(err) => {
            println!("Error creating token: {}", err);
            return HttpResponse::InternalServerError().body("")
        }
    };

    let response = TokenResponse {
        access_token: token,
        token_type: "Bearer".to_string(),
        expires_in: twenty_four_hours.as_secs()
    };

    let response_as_json = serde_json::to_string(&response).unwrap();

    HttpResponse::Ok()
        .content_type("application/json")
        .body(&response_as_json)
}
