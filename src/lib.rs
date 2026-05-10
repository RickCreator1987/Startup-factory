use anchor_lang::prelude::*;
pub mod state;
pub mod processor;

declare_id!("ReplaceWithProgramId11111111111111111111111111");

#[program]
pub mod compliance_registry {
    use super::*;

    pub fn initialize_registry(ctx: Context<InitializeRegistry>) -> Result<()> {
        processor::Processor::initialize_registry(ctx)
    }

    pub fn verify_address(ctx: Context<VerifyAddress>, user: Pubkey) -> Result<()> {
        processor::Processor::verify_address(ctx, user)
    }

    pub fn revoke_address(ctx: Context<RevokeAddress>, user: Pubkey) -> Result<()> {
        processor::Processor::revoke_address(ctx, user)
    }
}

#[derive(Accounts)]
pub struct InitializeRegistry<'info> {
    #[account(init, payer = signer, space = 8 + state::Registry::MAX_SIZE)]
    pub registry: Account<'info, state::Registry>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyAddress<'info> {
    #[account(mut)]
    pub registry: Account<'info, state::Registry>,
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct RevokeAddress<'info> {
    #[account(mut)]
    pub registry: Account<'info, state::Registry>,
    pub signer: Signer<'info>,
}
