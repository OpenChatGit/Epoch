#!/bin/bash

# Epoch LLM CLI Setup Script
# This script helps you set up LLM CLI for use with Epoch

set -e

echo "🚀 Epoch LLM CLI Setup"
echo "======================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo ""

# Check if pipx is installed
if ! command -v pipx &> /dev/null; then
    echo "📦 Installing pipx..."
    python3 -m pip install --user pipx
    python3 -m pipx ensurepath
    echo "✅ pipx installed"
    echo ""
    echo "⚠️  Please restart your terminal and run this script again."
    exit 0
fi

echo "✅ pipx found"
echo ""

# Install LLM CLI
echo "📦 Installing LLM CLI..."
pipx install llm
echo "✅ LLM CLI installed"
echo ""

# Verify installation
if ! command -v llm &> /dev/null; then
    echo "❌ LLM CLI installation failed. Please check the error messages above."
    exit 1
fi

echo "✅ LLM CLI verified: $(llm --version)"
echo ""

# Ask user which provider to configure
echo "Which provider would you like to configure?"
echo "1) OpenAI (gpt-4o, gpt-4o-mini, etc.)"
echo "2) Anthropic (Claude 3.5 Sonnet, etc.)"
echo "3) Google (Gemini Pro, etc.)"
echo "4) Skip for now"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "📝 Configuring OpenAI..."
        echo "You'll need an API key from: https://platform.openai.com/api-keys"
        llm keys set openai
        echo "✅ OpenAI configured"
        echo ""
        echo "Testing with gpt-4o-mini..."
        llm "Say hello!" -m gpt-4o-mini
        ;;
    2)
        echo ""
        echo "📝 Installing Claude plugin..."
        llm install llm-claude-3
        echo "You'll need an API key from: https://console.anthropic.com/"
        llm keys set anthropic
        echo "✅ Anthropic configured"
        echo ""
        echo "Testing with Claude 3.5 Sonnet..."
        llm "Say hello!" -m claude-3-5-sonnet-20241022
        ;;
    3)
        echo ""
        echo "📝 Installing Gemini plugin..."
        llm install llm-gemini
        echo "You'll need an API key from: https://makersuite.google.com/app/apikey"
        llm keys set google
        echo "✅ Google configured"
        echo ""
        echo "Testing with Gemini Pro..."
        llm "Say hello!" -m gemini-pro
        ;;
    4)
        echo "⏭️  Skipping provider configuration"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🔧 Installing useful plugins..."

# Install common plugins
echo "  - Web search plugin..."
llm install llm-plugin-search 2>/dev/null || echo "    (already installed or not available)"

echo "  - Calculator plugin..."
llm install llm-plugin-calculator 2>/dev/null || echo "    (already installed or not available)"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "1. Open Epoch"
echo "2. Go to Settings → Provider Settings"
echo "3. Select 'LLM CLI (Multi-Provider)'"
echo "4. Configure your model and tools"
echo "5. Start chatting!"
echo ""
echo "📖 Documentation:"
echo "  - Quick Start: docs/QUICK_START_LLM_CLI.md"
echo "  - Full Guide: docs/LLM_CLI_INTEGRATION.md"
echo "  - Custom Tools: docs/CUSTOM_TOOLS.md"
echo ""
echo "🎉 Happy chatting with Epoch!"
