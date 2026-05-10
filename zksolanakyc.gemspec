# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "zk_solana_kyc"
  spec.version       = ZkSolanaKyc::VERSION
  spec.authors       = ["RickCreator87"]
  spec.email         = ["gitdigitalproducts@gmail.com]

  spec.summary       = "Zero-knowledge Solana KYC compliance SDK"
  spec.description   = "Ruby SDK for integrating zk-based KYC compliance flows with Solana programs and services."
  spec.homepage      = "https://github.com/GitDigital-Products/zk_solana_kyc"
  spec.license       = "MIT"

  spec.required_ruby_version = ">= 3.0"

  spec.files         = Dir.chdir(__dir__) do
    `git ls-files -z`.split("\x0").select do |f|
      f.match(%r{\A(lib|README|LICENSE|CHANGELOG|bin)/})
    end
  end

  spec.bindir        = "bin"
  spec.executables   = Dir.glob("bin/*").map { |f| File.basename(f) }
  spec.require_paths = ["lib"]

  spec.metadata = {
    "source_code_uri" => spec.homepage,
    "changelog_uri"   => "#{spec.homepage}/blob/main/CHANGELOG.md"
  }

  spec.add_dependency "faraday", "~> 2.0"
  spec.add_dependency "rbnacl",  "~> 7.0" # example for crypto
  spec.add_development_dependency "rspec", "~> 3.0"
end
