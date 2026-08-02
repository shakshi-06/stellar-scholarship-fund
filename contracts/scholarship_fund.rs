//! ScholarChain - Decentralized Scholarship Fund
//! Soroban Smart Contract on Stellar Testnet
//!
//! Deploy with:
//!   stellar contract deploy --wasm target/wasm32-unknown-unknown/release/scholarship_fund.wasm \
//!     --network testnet --source <your_keypair>

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, Map, String, Symbol, Vec,
    log, events,
};

// ─── Data types ───────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone)]
pub struct Scholarship {
    pub id: u64,
    pub recipient: Address,
    pub goal_xlm: i128,       // in stroops (1 XLM = 10_000_000 stroops)
    pub raised_xlm: i128,
    pub is_active: bool,
    pub title: String,
}

#[contracttype]
pub enum DataKey {
    Admin,
    ScholarshipCount,
    Scholarship(u64),
    Donation(u64, Address),  // scholarship_id + donor address
}

// ─── Contract ─────────────────────────────────────────────────────────────────

#[contract]
pub struct ScholarshipFund;

#[contractimpl]
impl ScholarshipFund {

    /// Initialize the contract with an admin wallet.
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::ScholarshipCount, &0u64);
        log!(&env, "ScholarChain: Initialized with admin {}", admin);
    }

    /// Create a new scholarship entry.
    pub fn create_scholarship(
        env: Env,
        caller: Address,
        recipient: Address,
        goal_xlm: i128,
        title: String,
    ) -> u64 {
        caller.require_auth();
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if caller != admin {
            panic!("Only admin can create scholarships");
        }
        let count: u64 = env.storage().instance().get(&DataKey::ScholarshipCount).unwrap_or(0);
        let id = count + 1;
        let scholarship = Scholarship {
            id,
            recipient: recipient.clone(),
            goal_xlm,
            raised_xlm: 0,
            is_active: true,
            title,
        };
        env.storage().instance().set(&DataKey::Scholarship(id), &scholarship);
        env.storage().instance().set(&DataKey::ScholarshipCount, &id);

        // Emit event
        env.events().publish(
            (symbol_short!("created"), id),
            recipient,
        );
        id
    }

    /// Record a donation to a scholarship (called after payment is confirmed).
    pub fn record_donation(
        env: Env,
        donor: Address,
        scholarship_id: u64,
        amount_xlm: i128,
    ) {
        donor.require_auth();
        let mut scholarship: Scholarship = env.storage()
            .instance()
            .get(&DataKey::Scholarship(scholarship_id))
            .expect("Scholarship not found");

        if !scholarship.is_active {
            panic!("Scholarship is no longer active");
        }
        if amount_xlm <= 0 {
            panic!("Donation amount must be positive");
        }

        scholarship.raised_xlm += amount_xlm;
        env.storage().instance().set(&DataKey::Scholarship(scholarship_id), &scholarship);

        // Track individual donation
        let prev_donation: i128 = env.storage()
            .instance()
            .get(&DataKey::Donation(scholarship_id, donor.clone()))
            .unwrap_or(0);
        env.storage().instance().set(
            &DataKey::Donation(scholarship_id, donor.clone()),
            &(prev_donation + amount_xlm),
        );

        // Emit event
        env.events().publish(
            (symbol_short!("donated"), scholarship_id),
            (donor, amount_xlm),
        );

        // Auto-close if goal reached
        if scholarship.raised_xlm >= scholarship.goal_xlm {
            let mut s = scholarship.clone();
            s.is_active = false;
            env.storage().instance().set(&DataKey::Scholarship(scholarship_id), &s);
            env.events().publish(
                (symbol_short!("funded"), scholarship_id),
                s.recipient,
            );
        }
    }

    /// Get scholarship details.
    pub fn get_scholarship(env: Env, id: u64) -> Scholarship {
        env.storage()
            .instance()
            .get(&DataKey::Scholarship(id))
            .expect("Scholarship not found")
    }

    /// Get total scholarship count.
    pub fn get_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::ScholarshipCount).unwrap_or(0)
    }

    /// Get donation amount from a specific donor to a scholarship.
    pub fn get_donation(env: Env, scholarship_id: u64, donor: Address) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::Donation(scholarship_id, donor))
            .unwrap_or(0)
    }

    /// Admin can deactivate a scholarship.
    pub fn deactivate(env: Env, caller: Address, scholarship_id: u64) {
        caller.require_auth();
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if caller != admin {
            panic!("Only admin can deactivate scholarships");
        }
        let mut scholarship: Scholarship = env.storage()
            .instance()
            .get(&DataKey::Scholarship(scholarship_id))
            .expect("Scholarship not found");
        scholarship.is_active = false;
        env.storage().instance().set(&DataKey::Scholarship(scholarship_id), &scholarship);
    }
}
