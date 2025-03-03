#!/bin/bash

set -e  # Exit immediately if a non-zero status is encountered

# AI and Language Model Providers
pnpm add openai @anthropic-ai/sdk @google/generative-ai axios

# Embedding and Language Processing
pnpm add @langchain/core @langchain/openai @langchain/community

# Zod for type validation
pnpm add zod

# Optional: Additional AI and ML utilities
pnpm add @xenova/transformers

# Payment Provider SDKs
pnpm add stripe @paypal/paypal-server-sdk square braintree

# Streaming and Utility Libraries
pnpm add rxjs eventemitter3

# Optional: Additional Utility Types
pnpm add type-fest

# Ensure the script is executable
chmod +x "$0"

echo "AI providers and dependencies installed successfully!"
```