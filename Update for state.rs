// In state.rs:
impl ComplianceStatus {
    // Define the constant size fields
    const WALLET_SIZE: usize = 32;
    const STATUS_SIZE: usize = 1; // Assuming 1-byte for simple enum
    const VALID_UNTIL_SIZE: usize = 8;
    
    // Anchor adds an 8-byte discriminator at the start
    pub const LEN: usize = 8 + Self::WALLET_SIZE + Self::STATUS_SIZE + Self::VALID_UNTIL_SIZE; 
}
