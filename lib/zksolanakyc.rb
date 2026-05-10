`ruby

frozenstringliteral: true

requirerelative "zksolana_kyc/version"
requirerelative "zksolana_kyc/client"
requirerelative "zksolana_kyc/proof"
requirerelative "zksolana_kyc/config"

module ZkSolanaKyc
  class Error < StandardError; end
end
`
