#!/bin/bash

# Validate Firebase rules syntax
echo "🔍 Validating Firebase rules..."

# First compile the rules
echo "📋 Compiling Bolt rules..."
bun run compile-rules

if [ $? -ne 0 ]; then
    echo "❌ Bolt compilation failed!"
    exit 1
fi

# Check if the rules.json file is valid JSON
echo "📋 Checking JSON syntax..."
if ! cat firebase/rules.json | jq . > /dev/null 2>&1; then
    echo "❌ rules.json is not valid JSON!"
    exit 1
fi

echo "✅ JSON syntax is valid"

# Check for required sections in rules
echo "📋 Checking required rule sections..."

REQUIRED_SECTIONS=("chat" "playlists" "users" "presence" "usernames")

for section in "${REQUIRED_SECTIONS[@]}"; do
    if ! cat firebase/rules.json | jq -e ".rules.${section}" > /dev/null 2>&1; then
        echo "❌ Missing required section: $section"
        exit 1
    else
        echo "✅ Found section: $section"
    fi
done

# Check indexing
echo "📋 Checking indexing configuration..."

# Check chat timestamp index
if ! cat firebase/rules.json | jq -e '.rules.chat.".indexOn"' > /dev/null 2>&1; then
    echo "❌ Missing chat timestamp index"
    exit 1
else
    INDEX_VALUE=$(cat firebase/rules.json | jq -r '.rules.chat.".indexOn"[0]')
    if [ "$INDEX_VALUE" != "timestamp" ]; then
        echo "❌ Chat index should be 'timestamp', got: $INDEX_VALUE"
        exit 1
    else
        echo "✅ Chat timestamp index is correct"
    fi
fi

# Check usernames value index
if ! cat firebase/rules.json | jq -e '.rules.usernames.".indexOn"' > /dev/null 2>&1; then
    echo "❌ Missing usernames value index"
    exit 1
else
    INDEX_VALUE=$(cat firebase/rules.json | jq -r '.rules.usernames.".indexOn"[0]')
    if [ "$INDEX_VALUE" != ".value" ]; then
        echo "❌ Usernames index should be '.value', got: $INDEX_VALUE"
        exit 1
    else
        echo "✅ Usernames value index is correct"
    fi
fi

echo "🎉 All rules validation checks passed!"
echo "✅ Rules are ready for deployment"