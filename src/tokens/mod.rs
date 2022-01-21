use serde::{Serialize, Deserialize};
use jsonwebtoken::{encode, decode, Header, Algorithm, Validation, EncodingKey, DecodingKey};
use actix_web::{post, web, HttpResponse, Responder};
use std::time::{SystemTime, Duration, UNIX_EPOCH};


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

#[post("/tokens")]
pub async fn create_token(create_token_web_request: web::Json<CreateTokenRequest>) -> impl Responder {
    let create_token_request = create_token_web_request.into_inner();

    let twenty_four_hours = Duration::from_secs(86400);
    let now = SystemTime::now();
    let expires_at = now + twenty_four_hours;

    let iat = match now.duration_since(UNIX_EPOCH) {
        Ok(n) => n.as_secs(),
        Err(_) => panic!("Failed to calculate iat"),
    };

    let exp = match expires_at.duration_since(UNIX_EPOCH) {
        Ok(n) => n.as_secs(),
        Err(_) => panic!("Failed to calculate exp"),
    };


    let claim = Claims {
        sub: create_token_request.public_key,
        iat,
        exp
    };

    HttpResponse::Ok()
}
