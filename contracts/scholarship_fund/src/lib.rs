#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype,
    symbol_short, Address, Env, String,
};

// ─── Storage Keys ─────────────────────────────────────────────────────────────

#[contracttype]
pub enum DataKey {
    Admin,
    Count,
    Scholarship(u64),
    Donation(u64, Address),
    Registry,
}

// ─── Data Types ───────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone)]
pub struct Scholarship {
    pub id: u64,
    pub recipient: Address,
    pub goal_stroops: i128,
    pub raised_stroops: i128,
    pub is_active: bool,
    pub title: String,
    pub donor_count: u32,
}

// ─── Registry interface for inter-contract calls ──────────────────────────────
// We call the registry contract by invoking it directly via env.invoke_contract

fn notify_registry_register(
    env: &Env,
    registry: &Address,
    id: u64,
    recipient: &Address,
    fund: &Address,
) {
    use soroban_sdk::{vec, Symbol, Val, IntoVal};
    let args: soroban_sdk::Vec<Val> = vec![
        env,
        id.into_val(env),
        recipient.to_val(),
        fund.to_val(),
    ];
    env.invoke_contract::<()>(
        registry,
        &Symbol::new(env, "register"),
        args,
    );
}

fn notify_registry_funded(env: &Env, registry: &Address, id: u64) {
    use soroban_sdk::{vec, Val, IntoVal};
    let args: soroban_sdk::Vec<Val> = vec![env, id.into_val(env)];
    env.invoke_contract::<()>(
        registry,
        &soroban_sdk::Symbol::new(env, "mark_funded"),
        args,
    );
}

// ─── Main Contract ────────────────────────────────────────────────────────────

#[contract]
pub struct ScholarshipFund;

#[contractimpl]
impl ScholarshipFund {

    pub fn initialize(env: Env, admin: Address, registry: Option<Address>) {
        admin.require_auth();
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Count, &0u64);
        if let Some(reg) = registry {
            env.storage().instance().set(&DataKey::Registry, &reg);
        }
        env.events().publish((symbol_short!("init"),), admin);
    }

    pub fn create_scholarship(
        env: Env,
        caller: Address,
        recipient: Address,
        goal_stroops: i128,
        title: String,
    ) -> u64 {
        caller.require_auth();
        let admin: Address = env.storage().instance()
            .get(&DataKey::Admin).unwrap();
        if caller != admin { panic!("Only admin"); }

        let count: u64 = env.storage().instance()
            .get(&DataKey::Count).unwrap_or(0);
        let id = count + 1;

        let s = Scholarship {
            id,
            recipient: recipient.clone(),
            goal_stroops,
            raised_stroops: 0,
            is_active: true,
            title,
            donor_count: 0,
        };

        env.storage().instance().set(&DataKey::Scholarship(id), &s);
        env.storage().instance().set(&DataKey::Count, &id);

        env.events().publish(
            (symbol_short!("created"), id),
            (recipient.clone(), goal_stroops),
        );

        // Inter-contract: notify registry
        if let Some(reg) = env.storage().instance()
            .get::<DataKey, Address>(&DataKey::Registry)
        {
            notify_registry_register(
                &env, &reg, id,
                &recipient,
                &env.current_contract_address(),
            );
        }

        id
    }

    pub fn record_donation(
        env: Env,
        donor: Address,
        scholarship_id: u64,
        amount_stroops: i128,
    ) {
        donor.require_auth();
        let mut s: Scholarship = env.storage().instance()
            .get(&DataKey::Scholarship(scholarship_id))
            .expect("Not found");

        if !s.is_active { panic!("Inactive"); }
        if amount_stroops <= 0 { panic!("Amount must be positive"); }

        s.raised_stroops += amount_stroops;
        s.donor_count += 1;

        let prev: i128 = env.storage().instance()
            .get(&DataKey::Donation(scholarship_id, donor.clone()))
            .unwrap_or(0);
        env.storage().instance().set(
            &DataKey::Donation(scholarship_id, donor.clone()),
            &(prev + amount_stroops),
        );

        env.events().publish(
            (symbol_short!("donated"), scholarship_id),
            (donor.clone(), amount_stroops),
        );

        if s.raised_stroops >= s.goal_stroops {
            s.is_active = false;
            env.events().publish(
                (symbol_short!("funded"), scholarship_id),
                s.recipient.clone(),
            );
            // Inter-contract: notify registry goal reached
            if let Some(reg) = env.storage().instance()
                .get::<DataKey, Address>(&DataKey::Registry)
            {
                notify_registry_funded(&env, &reg, scholarship_id);
            }
        }

        env.storage().instance().set(&DataKey::Scholarship(scholarship_id), &s);
    }

    pub fn get_scholarship(env: Env, id: u64) -> Scholarship {
        env.storage().instance()
            .get(&DataKey::Scholarship(id))
            .expect("Not found")
    }

    pub fn get_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::Count).unwrap_or(0)
    }

    pub fn get_donation(env: Env, scholarship_id: u64, donor: Address) -> i128 {
        env.storage().instance()
            .get(&DataKey::Donation(scholarship_id, donor))
            .unwrap_or(0)
    }

    pub fn deactivate(env: Env, caller: Address, scholarship_id: u64) {
        caller.require_auth();
        let admin: Address = env.storage().instance()
            .get(&DataKey::Admin).unwrap();
        if caller != admin { panic!("Only admin"); }
        let mut s: Scholarship = env.storage().instance()
            .get(&DataKey::Scholarship(scholarship_id))
            .expect("Not found");
        s.is_active = false;
        env.storage().instance().set(&DataKey::Scholarship(scholarship_id), &s);
        env.events().publish(
            (symbol_short!("closed"), scholarship_id),
            caller,
        );
    }

    pub fn set_registry(env: Env, caller: Address, registry: Address) {
        caller.require_auth();
        let admin: Address = env.storage().instance()
            .get(&DataKey::Admin).unwrap();
        if caller != admin { panic!("Only admin"); }
        env.storage().instance().set(&DataKey::Registry, &registry);
    }
}
