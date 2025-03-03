#!/bin/bash

# Exit on any error
set -e

# Ensure script is executable
chmod +x install-icons.sh
chmod +x run-install.sh
chmod +x diagnose-icons.sh

# Update dependencies
pnpm update

# Install icon libraries
pnpm add @radix-ui/react-icons lucide-react

# Optional: Verify installations
pnpm list @radix-ui/react-icons lucide-react

# Diagnose potential issues
./diagnose-icons.sh

echo "Setup complete. Please restart your development server."