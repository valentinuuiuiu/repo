#!/bin/bash

# Make scripts executable
chmod +x install-radix-icons.sh
chmod +x install-lucide-icons.sh

# Install Radix UI icons
pnpm add @radix-ui/react-icons

# Install Lucide React icons
pnpm add lucide-react

# Optional: Verify installations
pnpm list @radix-ui/react-icons lucide-react