#!/bin/bash

echo "Checking package.json for icon dependencies..."
grep -E "@radix-ui/react-icons|lucide-react" package.json

echo -e "\nChecking installed packages..."
pnpm list @radix-ui/react-icons lucide-react

echo -e "\nChecking node_modules..."
ls node_modules/@radix-ui/react-icons
ls node_modules/lucide-react

echo -e "\nChecking import paths..."
find src -type f -name "*.tsx" | xargs grep -l "@radix-ui/react-icons"
find src -type f -name "*.tsx" | xargs grep -l "lucide-react"