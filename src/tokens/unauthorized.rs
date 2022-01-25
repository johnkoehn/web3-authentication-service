use actix_web::{ HttpResponse };
use serde::{Serialize, Deserialize};


const NO_SIGNED_TOKEN: &str = "Must have a signed token in the Authorization header";
const INVALID_SIGNED_TOKEN: &str = "Invalid Signed Token";
const NO_BEARER: &str = "Authorization header must start with \"Bearer \"";
const NO_BASE_TOKEN: &str = "Base-Token header must be present";
const INVALID_SIGNATURE: &str = "Authorization token signature does not match the public key of the base token";
const INVALID_ISSUER: &str = "Invalid issuer";
const INVALID_KEY: &str = "Invalid base token signature";
const EXPIRED_TOKEN: &str = "Expired token";

pub enum ErrorTypes {
    NoSignedToken,
    InvalidSignedToken,
    NoBearer,
    NoBaseToken,
    InvalidSignature,
    InvalidIssuer,
    InvalidKey,
    ExpiredToken
}

#[derive(Serialize, Deserialize, Debug)]
struct UnauthorizedResponseBody {
    message: String
}


pub fn error(error_type: ErrorTypes) -> HttpResponse {
    let error_message = match error_type {
        ErrorTypes::NoSignedToken => NO_SIGNED_TOKEN,
        ErrorTypes::InvalidSignedToken => INVALID_SIGNED_TOKEN,
        ErrorTypes::NoBearer => NO_BEARER,
        ErrorTypes::NoBaseToken => NO_BASE_TOKEN,
        ErrorTypes::InvalidSignature => INVALID_SIGNATURE,
        ErrorTypes::InvalidIssuer => INVALID_ISSUER,
        ErrorTypes::InvalidKey => INVALID_KEY,
        ErrorTypes::ExpiredToken => EXPIRED_TOKEN
    };

    let unauthorized_response_body = UnauthorizedResponseBody {
        message: error_message.to_string()
    };

    let response_body = serde_json::to_string(&unauthorized_response_body).unwrap();
    HttpResponse::Unauthorized()
        .content_type("application/json")
        .body(&response_body)
}