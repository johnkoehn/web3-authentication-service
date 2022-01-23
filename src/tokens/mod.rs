use serde::{Serialize, Deserialize};
use jsonwebtoken::{encode, decode, Header, Algorithm, Validation, EncodingKey, DecodingKey};
use actix_web::{post, web, HttpResponse, Responder};
use std::time::{SystemTime, Duration, UNIX_EPOCH};
use std::error::Error;


// Our claims struct, it needs to derive `Serialize` and/or `Deserialize`
#[derive(Serialize, Deserialize, Debug)]
pub struct Claims {
    // the public key of the user
    sub: String,
    iat: u64,
    exp: u64,
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
