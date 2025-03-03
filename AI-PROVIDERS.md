# AI Providers Integration

## Supported AI Providers

### Installed Providers
- OpenAI
- Anthropic
- Google Generative AI

### Payment Providers
- Stripe
- PayPal (Server SDK)
- Braintree
- Square

### Installation
Run the `install-ai-providers.sh` script to install AI-related dependencies:

```bash
./install-ai-providers.sh
```

### Troubleshooting Package Installation

#### Common Issues
- Deprecated packages
- Incorrect package names
- Registry access problems

#### Specific Package Notes
- PayPal: Migrated from `paypal-rest-sdk` to `@paypal/paypal-server-sdk`
- Adyen: Removed due to registry issues - verify the correct package name

### Adding New Providers
1. Verify the exact package name
2. Check npm registry availability
3. Add the package to `install-ai-providers.sh`
4. Update this documentation

### Configuration
Ensure you set the following environment variables in your `.env` file:
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_GENERATIVE_AI_KEY`
- `STRIPE_SECRET_KEY`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`

## Dependency Management
- Always use the latest recommended packages
- Check official documentation for up-to-date installation instructions
- Be prepared to update dependencies periodically

## Troubleshooting Steps
1. Verify pnpm and npm are up to date
2. Check network connectivity
3. Clear pnpm cache: `pnpm store prune`
4. Temporarily disable VPN or proxy
5. Verify package names against official documentation