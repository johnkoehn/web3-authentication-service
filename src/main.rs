use dotenv;
use std::{env, error::Error};

fn main() {
    dotenv::dotenv().ok();
    let test = env::var("TEST").unwrap();

    println!("Testing {}", &test);
}
