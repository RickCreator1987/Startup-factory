# frozen_string_literal: true

require_relative "zk_solana_kyc/version"
require_relative "zk_solana_kyc/client"
require_relative "zk_solana_kyc/proof"
require_relative "zk_solana_kyc/config"

module ZkSolanaKyc
  class Error < StandardError; end
end
