#[macro_use]
extern crate serde_derive;
use serde::{Serialize, Deserialize};
use dotenv;
use std::env;
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use actix_cors::Cors;

#[derive(Serialize, Deserialize, Debug)]
struct HealthResponse {
    status: String
}

#[get("/health")]
async fn health() -> impl Responder {
    let health_response = HealthResponse {
        status: "healthy".to_string()
    };

    let response_body = serde_json::to_string(&health_response).unwrap();
    HttpResponse::Ok()
        .content_type("application/json")
        .body(&response_body)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();


    HttpServer::new(|| {
        let cors = Cors::permissive();

        App::new()
            .wrap(cors)
            .service(health)
    })
    .bind("127.0.0.1:8000")?
    .run()
    .await
}
