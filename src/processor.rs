use anchor_lang::prelude::*;
use crate::state::Registry;

pub struct Processor;

impl Processor {
    pub fn initialize_registry(ctx: Context<crate::InitializeRegistry>) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        registry.owner = *ctx.accounts.signer.key;
        registry.verified_accounts = Vec::new();
        Ok(())
    }

    pub fn verify_address(ctx: Context<crate::VerifyAddress>, user: Pubkey) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        if !registry.verified_accounts.contains(&user) {
            registry.verified_accounts.push(user);
        }
        Ok(())
    }

    pub fn revoke_address(ctx: Context<crate::RevokeAddress>, user: Pubkey) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        registry.verified_accounts.retain(|x| x != &user);
        Ok(())
    }
}
