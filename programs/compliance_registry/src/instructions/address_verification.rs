use anchor_lang::prelude::*;

/// Account data stored for each verified address.
#[account]
pub struct VerifiedAddress {
    pub user: Pubkey,
    pub verifier: Pubkey,
    pub verified: bool,
    pub timestamp: i64,
}

#[derive(Accounts)]
#[instruction()]
pub struct VerifyAddress<'info> {
    /// The user whose address is being verified.
    #[account(mut)]
    pub user: Signer<'info>,

    /// PDA storing verification info.
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 32 + 1 + 8, // discriminator + fields
        seeds = [b"address", user.key().as_ref()],
        bump
    )]
    pub verified_address: Account<'info, VerifiedAddress>,

    /// The verifier (admin or registry authority).
    pub registry_authority: Signer<'info>,

    /// Required by Anchor for PDA creation.
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeAddress<'info> {
    /// Registry authority that performs the revoke.
    pub registry_authority: Signer<'info>,

    /// The verified address PDA to revoke.
    #[account(
        mut,
        seeds = [b"address", user.key().as_ref()],
        bump,
        has_one = user,
        close = user
    )]
    pub verified_address: Account<'info, VerifiedAddress>,

    /// The user whose address was verified.
    #[account(mut)]
    pub user: Signer<'info>,
}

/// Verifies a user address by creating its PDA record.
pub fn verify_address(ctx: Context<VerifyAddress>) -> Result<()> {
    let verified_account = &mut ctx.accounts.verified_address;

    verified_account.user = ctx.accounts.user.key();
    verified_account.verifier = ctx.accounts.registry_authority.key();
    verified_account.verified = true;
    verified_account.timestamp = Clock::get()?.unix_timestamp;

    emit!(AddressVerified {
        user: verified_account.user,
        verifier: verified_account.verifier,
        timestamp: verified_account.timestamp,
    });

    msg!(
        "✅ Address verified for user: {} by {}",
        verified_account.user,
        verified_account.verifier
    );

    Ok(())
}

/// Revokes a verified address by closing the PDA.
pub fn revoke_address(ctx: Context<RevokeAddress>) -> Result<()> {
    let verified_account = &mut ctx.accounts.verified_address;

    require!(
        verified_account.verified,
        CustomError::AddressNotVerified
    );

    emit!(AddressRevoked {
        user: verified_account.user,
        revoked_by: ctx.accounts.registry_authority.key(),
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!(
        "🚫 Address revoked for user: {} by {}",
        verified_account.user,
        ctx.accounts.registry_authority.key()
    );

    Ok(())
}

/// Custom error codes for clarity.
#[error_code]
pub enum CustomError {
    #[msg("This address is not verified.")]
    AddressNotVerified,
}

/// Events for off-chain indexing and front-end UI.
#[event]
pub struct AddressVerified {
    pub user: Pubkey,
    pub verifier: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct AddressRevoked {
    pub user: Pubkey,
    pub revoked_by: Pubkey,
    pub timestamp: i64,
}
