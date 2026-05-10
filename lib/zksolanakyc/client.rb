`ruby

frozenstringliteral: true

require "faraday"
require "json"

module ZkSolanaKyc
  class Client
    def initialize(config)
      @config = config
      @conn   = Faraday.new(url: config.api_endpoint) do |f|
        f.request :json
        f.response :json, content_type: /\bjson$/
        f.adapter Faraday.default_adapter
      end
    end

    # Example: register a user and get a zk-proof handle
    def registersubject(subjectid:, attributes:)
      post("/subjects", {
        subjectid: subjectid,
        attributes: attributes,
        network: @config.network
      })
    end

    # Example: verify a zk-proof against a Solana program
    def verifyproof(programid:, proof_payload:)
      post("/verify", {
        programid: programid,
        proof: proof_payload,
        network: @config.network
      })
    end

    private

    def post(path, body)
      resp = @conn.post(path) do |req|
        req.headers["Authorization"] = "Bearer #{@config.api_key}"
        req.body = body
      end

      raise ZkSolanaKyc::Error, resp.body unless resp.success?

      resp.body
    end
  end
end
`
