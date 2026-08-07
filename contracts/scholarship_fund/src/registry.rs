#![no_std]
#![allow(dead_code)]

use soroban_sdk::{
    contract, contractimpl, contracttype,
    symbol_short, Address, Env,
};

#[contracttype]
pub enum RegKey {
    Admin,
    Count,
    Entry(u64),
}

#[contracttype]
#[derive(Clone)]
pub struct RegistryEntry {
    pub scholarship_id: u64,
    pub recipient: Address,
    pub fund_contract: Address,
    pub is_funded: bool,
}

#[contract]
pub struct ScholarshipRegistry;

#[contractimpl]
impl ScholarshipRegistry {

    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&RegKey::Admin, &admin);
        env.storage().instance().set(&RegKey::Count, &0u64);
    }

    /// Called by ScholarshipFund via inter-contract call
    pub fn register(env: Env, id: u64, recipient: Address, fund: Address) {
        let count: u64 = env.storage().instance()
            .get(&RegKey::Count).unwrap_or(0);
        let entry = RegistryEntry {
            scholarship_id: id,
            recipient,
            fund_contract: fund,
            is_funded: false,
        };
        env.storage().instance().set(&RegKey::Entry(count + 1), &entry);
        env.storage().instance().set(&RegKey::Count, &(count + 1));
        env.events().publish((symbol_short!("reg"), id), count + 1);
    }

    /// Called by ScholarshipFund when goal is reached
    pub fn mark_funded(env: Env, id: u64) {
        let count: u64 = env.storage().instance()
            .get(&RegKey::Count).unwrap_or(0);
        for i in 1..=count {
            if let Some(mut entry) = env.storage().instance()
                .get::<RegKey, RegistryEntry>(&RegKey::Entry(i))
            {
                if entry.scholarship_id == id {
                    entry.is_funded = true;
                    env.storage().instance().set(&RegKey::Entry(i), &entry);
                    env.events().publish((symbol_short!("funded"), id), i);
                    break;
                }
            }
        }
    }

    pub fn get_count(env: Env) -> u64 {
        env.storage().instance().get(&RegKey::Count).unwrap_or(0)
    }

    pub fn get_entry(env: Env, index: u64) -> RegistryEntry {
        env.storage().instance()
            .get(&RegKey::Entry(index))
            .expect("Not found")
    }
}
