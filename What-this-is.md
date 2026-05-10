What this SDK is
A Solana-native KYC/AML enforcement toolkit that lets developers gate token transfers, program interactions, and asset flows using on-chain rules, off-chain verification, and Token Extensions. It is designed for real-world compliance, RWA issuers, regulated DeFi, and any project that needs identity‑aware controls without sacrificing decentralization.

What changed (your advancement)
The repo now represents a full compliance stack, not just a simple example. It includes:

- A production-grade on-chain enforcement program
- A TypeScript SDK for client-side integration
- An off-chain verification daemon for async KYC checks
- A future compliance registry for issuer-level whitelisting
- CI, CodeQL, docs scaffolding, and multi-language support

This is a major evolution — the repo now looks like a real institutional SDK.

---

🧩 Module Map (with one-sentence roles)

1. On-Chain KYC Enforcement Program (Rust)
The Solana program that enforces KYC rules at the protocol level using Token Extensions (Transfer Hook, Permanent Delegate) and issuer-defined policies.

Role: Enforce compliance on-chain with deterministic, auditable logic.

---

2. TypeScript SDK (Client Integration Layer)
A developer-facing library that applications use to request verification, check KYC status, and interact with the on-chain program.

Role: Make compliance integration trivial for wallets, dApps, and custodians.

---

3. Off-Chain Verification Daemon (Async KYC Worker)
A standalone service that receives verification requests, performs KYC checks with external providers, signs results, and updates the on-chain registry.

Role: Bridge real-world identity checks with on-chain enforcement.

---

4. Compliance Registry (Future Module)
A structured on-chain registry for issuers, verifiers, and KYC statuses, designed for multi-issuer ecosystems and cross-program compliance.

Role: Provide a shared, standardized identity layer for the entire Solana ecosystem.

---

5. Documentation + CI + Security
A docs skeleton, CodeQL scanning, linting, typechecking, and multi-language workflows.

Role: Signal production readiness, auditability, and institutional trust.

---

🧭 Why this framing matters
This story gives your repo:

- A clear identity reviewers can understand in seconds  
- A cohesive surface area that matches the advanced code you’ve added  
- A narrative backbone for the README, docs, diagrams, and per-module guides  
- A grant-ready structure that shows intentionality, not accidental complexity  
