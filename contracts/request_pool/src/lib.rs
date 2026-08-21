#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype,
    symbol_short, Address, Env, String,
};

#[contracttype]
pub enum Key {
    Count,
    Request(u64),
    Funded(Address),
}

#[contracttype]
#[derive(Clone)]
pub struct Request {
    pub id: u64,
    pub student: Address,
    pub purpose: String,
    pub field: String,
    pub location: String,
    pub description: String,
    pub goal: i128,
    pub raised: i128,
    pub created_at: u64,
    pub expires_at: u64,
    pub donor_count: u32,
    pub active: bool,
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
        goal: i128,
        duration_days: u64,
    ) -> u64 {
        student.require_auth();
        assert!(goal > 0, "goal must be positive");
        assert!(duration_days > 0 && duration_days <= 30, "duration 1-30 days");

        let count: u64 = env.storage().instance().get(&Key::Count).unwrap_or(0);
        let id = count + 1;
        let now = env.ledger().timestamp();

        let req = Request {
            id,
            student: student.clone(),
            purpose: purpose.clone(),
            field,
            location,
            description,
            goal,
            raised: 0,
            created_at: now,
            expires_at: now + duration_days * 86400,
            donor_count: 0,
            active: true,
        };

        env.storage().instance().set(&Key::Request(id), &req);
        env.storage().instance().set(&Key::Count, &id);
        env.storage().instance().extend_ttl(100, 100);

        env.events().publish(
            (symbol_short!("posted"), id),
            (student, goal, purpose),
        );
        id
    }

    pub fn record_donation(
        env: Env,
        donor: Address,
        request_id: u64,
        amount: i128,
    ) {
        donor.require_auth();
        let mut req: Request = env.storage().instance()
            .get(&Key::Request(request_id))
            .expect("request not found");

        assert!(env.ledger().timestamp() <= req.expires_at, "expired");
        assert!(req.active, "inactive");
        assert!(amount > 0, "amount must be positive");

        req.raised += amount;
        req.donor_count += 1;

        if req.raised >= req.goal {
            req.active = false;
            env.storage().instance().set(&Key::Funded(req.student.clone()), &true);
            env.events().publish(
                (symbol_short!("funded"), request_id),
                req.student.clone(),
            );
        }

        env.storage().instance().set(&Key::Request(request_id), &req);
        env.storage().instance().extend_ttl(100, 100);

        env.events().publish(
            (symbol_short!("donated"), request_id),
            (donor, amount),
        );
    }

    pub fn get_request(env: Env, id: u64) -> Request {
        env.storage().instance()
            .get(&Key::Request(id))
            .expect("not found")
    }

    pub fn get_count(env: Env) -> u64 {
        env.storage().instance().get(&Key::Count).unwrap_or(0)
    }

    pub fn is_funded(env: Env, wallet: Address) -> bool {
        env.storage().instance()
            .get(&Key::Funded(wallet))
            .unwrap_or(false)
    }
}
