hereuse anchor_lang::prelude::*;

// Import the ComplianceStatus data structure and KycStatus enum
use crate::state::{ComplianceStatus, KycStatus};
// Note: We don't need to import errors here, as Anchor handles that via #[error_code] in errors.rs

// --- INSTRUCTION CONTEXTS ---

// Context for initializing a new ComplianceStatus account
#[derive(Accounts)]
pub struct InitializeComplianceStatus<'info> {
    // 1. ComplianceStatus PDA account
    #[account(
        init, // Instruct Anchor to create this account
        payer = authority,
        space = ComplianceStatus::LEN, // Allocate space based on the size we calculated in state.rs
        seeds = [b"compliance_status", target_wallet.key().as_ref()], // Same seeds as used in the Transfer Hook
        bump,
    )]
    pub compliance_status: Account<'info, ComplianceStatus>,
    
    // 2. The wallet address the compliance status is for.
    /// CHECK: This account is only used for deriving the PDA
    pub target_wallet: AccountInfo<'info>,

    // 3. The account authorized to create/set compliance statuses (The Issuer/Admin).
    #[account(mut)]
    pub authority: Signer<'info>,

    // 4. Required Solana system accounts
    pub system_program: Program<'info, System>,
}

// Context for updating an existing ComplianceStatus account
#[derive(Accounts)]
pub struct UpdateComplianceStatus<'info> {
    // 1. The existing ComplianceStatus PDA account
    #[account(
        mut, // Must be mutable to change the data
        seeds = [b"compliance_status", target_wallet.key().as_ref()],
        bump,
        has_one = authority // Anchor constraint: Only the authority can update it
    )]
    pub compliance_status: Account<'info, ComplianceStatus>,

    // 2. The wallet address the compliance status is for.
    /// CHECK: This is used to derive the PDA
    pub target_wallet: AccountInfo<'info>, 

    // 3. The account authorized to update the status (The Issuer/Admin).
    pub authority: Signer<'info>,
}


// --- INSTRUCTION HANDLERS ---

// Creates and initializes the ComplianceStatus PDA.
pub fn initialize_compliance_status(
    ctx: Context<InitializeComplianceStatus>,
    status: KycStatus,
    valid_until: i64,
) -> Result<()> {
    let compliance_status = &mut ctx.accounts.compliance_status;
    
    // Set the initial state data
    compliance_status.wallet = ctx.accounts.target_wallet.key();
    compliance_status.status = status;
    compliance_status.valid_until = valid_until;

    msg!("Initialized compliance status for: {}", compliance_status.wallet);
    msg!("Status: {:?}, Valid Until: {}", status, valid_until);
    
    Ok(())
}

// Updates the status and/or expiration of an existing ComplianceStatus PDA.
pub fn update_compliance_status(
    ctx: Context<UpdateComplianceStatus>,
    new_status: KycStatus,
    new_valid_until: i64,
) -> Result<()> {
    let compliance_status = &mut ctx.accounts.compliance_status;
    
    // Update the status and expiration
    compliance_status.status = new_status;
    compliance_status.valid_until = new_valid_until;

    msg!("Updated compliance status for: {}", compliance_status.wallet);
    msg!("New Status: {:?}, New Valid Until: {}", new_status, new_valid_until);

    Ok(())
}
