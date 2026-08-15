#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype,
    symbol_short, Address, Env, String,
};

#[contracttype]
pub enum Key {
    Count,
    Request(u64),
    FundedWallet(Address),
}

#[contracttype]
#[derive(Clone)]
pub struct Request {
    pub id: u64,
    pub student_wallet: Address,
    pub purpose: String,
    pub field: String,
    pub location: String,
    pub description: String,
    pub goal_stroops: i128,
    pub raised_stroops: i128,
    pub created_at: u64,
    pub expires_at: u64,
    pub donor_count: u32,
    pub is_active: bool,
}

#[contract]
pub struct RequestPool;

#[contractimpl]
impl RequestPool {
    pub fn post_request(
        env: Env,
        student: Address,
        purpose: String,
        field: String,
        location: String,
        description: String,
        goal_stroops: i128,
        duration_days: u64,
    ) -> u64 {
        student.require_auth();
        if goal_stroops <= 0 { panic!("Goal must be positive"); }
        if duration_days == 0 || duration_days > 30 { panic!("Duration 1-30 days only"); }

        let count: u64 = env.storage().instance().get(&Key::Count).unwrap_or(0);
        let id = count + 1;
        let now = env.ledger().timestamp();

        let request = Request {
            id, student_wallet: student.clone(), purpose: purpose.clone(),
            field, location, description, goal_stroops,
            raised_stroops: 0,
            created_at: now,
            expires_at: now + duration_days * 86400,
            donor_count: 0, is_active: true,
        };

        env.storage().instance().set(&Key::Request(id), &request);
        env.storage().instance().set(&Key::Count, &id);
        env.events().publish((symbol_short!("posted"), id), (student, goal_stroops, purpose));
        id
    }

    pub fn record_donation(env: Env, donor: Address, request_id: u64, amount_stroops: i128) {
        donor.require_auth();
        let mut r: Request = env.storage().instance().get(&Key::Request(request_id)).expect("Not found");
        if env.ledger().timestamp() > r.expires_at { panic!("Expired"); }
        if !r.is_active { panic!("Inactive"); }
        if amount_stroops <= 0 { panic!("Amount must be positive"); }
        r.raised_stroops += amount_stroops;
        r.donor_count += 1;
        if r.raised_stroops >= r.goal_stroops {
            r.is_active = false;
            env.storage().instance().set(&Key::FundedWallet(r.student_wallet.clone()), &true);
            env.events().publish((symbol_short!("funded"), request_id), r.student_wallet.clone());
        }
        env.storage().instance().set(&Key::Request(request_id), &r);
        env.events().publish((symbol_short!("donated"), request_id), (donor, amount_stroops));
    }

    pub fn get_request(env: Env, id: u64) -> Request {
        env.storage().instance().get(&Key::Request(id)).expect("Not found")
    }

    pub fn get_count(env: Env) -> u64 {
        env.storage().instance().get(&Key::Count).unwrap_or(0)
    }

    pub fn is_previously_funded(env: Env, wallet: Address) -> bool {
        env.storage().instance().get(&Key::FundedWallet(wallet)).unwrap_or(false)
    }
}
