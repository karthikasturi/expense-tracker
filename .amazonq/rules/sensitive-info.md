# Sensitive Information Handling Rules

## Prohibited Actions

- **DO NOT** read, access, or display `.env` files or any environment configuration files
- **DO NOT** access secrets, API keys, tokens, or credentials
- **DO NOT** display passwords, authentication tokens, or security keys
- **DO NOT** access or expose PII (Personally Identifiable Information) including:
  - Names, email addresses, phone numbers
  - Social security numbers, tax IDs
  - Physical addresses, IP addresses
  - Credit card numbers, bank account details
  - Biometric data, medical records

## Required Actions

- **ALWAYS** redact sensitive information when encountered
- **ALWAYS** use placeholders like `<API_KEY>`, `<PASSWORD>`, `<EMAIL>` in examples
- **ALWAYS** mask credentials in logs or outputs
- **ALWAYS** sanitize data before displaying to users