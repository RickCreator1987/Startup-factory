herepub fn verify_address(ctx: Context<VerifyAddress>) -> Result<()> {
    let verified_address = &mut ctx.accounts.verified_address;
    let user_key = ctx.accounts.user.key();
    let verifier_key = ctx.accounts.registry_authority.key();

    verified_address.user = user_key;
    verified_address.verifier = verifier_key;
    verified_address.verified = true;
    verified_address.timestamp = Clock::get()?.unix_timestamp;

    emit!(AddressVerified {
        user: user_key,
        verifier: verifier_key,
        timestamp: verified_address.timestamp,
    });

    msg!(
        "✅ Verified address {} by authority {}",
        user_key,
        verifier_key
    );

    Ok(())
}

pub fn revoke_address(ctx: Context<RevokeAddress>) -> Result<()> {
    let verified_address = &mut ctx.accounts.verified_address;
    let user_key = ctx.accounts.user.key();
    let revoked_by = ctx.accounts.registry_authority.key();

    require!(
        verified_address.user == user_key,
        CustomError::UserKeyMismatch
    );
    require!(verified_address.verified, CustomError::AddressNotVerified);

    emit!(AddressRevoked {
        user: user_key,
        revoked_by,
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!(
        "🚫 Revoked verification for {} by authority {}",
        user_key,
        revoked_by
    );

    Ok(())
}
