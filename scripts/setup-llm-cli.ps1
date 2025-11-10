# Epoch LLM CLI Setup Script (PowerShell)
# This script helps you set up LLM CLI for use with Epoch

$ErrorActionPreference = "Stop"

Write-Host "🚀 Epoch LLM CLI Setup" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed. Please install Python 3.8+ first." -ForegroundColor Red
    Write-Host "Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if pip is available
try {
    python -m pip --version | Out-Null
    Write-Host "✅ pip found" -ForegroundColor Green
} catch {
    Write-Host "❌ pip is not available. Please reinstall Python with pip." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Install pipx
Write-Host "📦 Installing pipx..." -ForegroundColor Yellow
try {
    python -m pip install --user pipx
    python -m pipx ensurepath
    Write-Host "✅ pipx installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  pipx might already be installed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "⚠️  Please restart your PowerShell terminal and run this script again if this is your first time installing pipx." -ForegroundColor Yellow
Write-Host ""

# Install LLM CLI
Write-Host "📦 Installing LLM CLI..." -ForegroundColor Yellow
try {
    pipx install llm
    Write-Host "✅ LLM CLI installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  LLM CLI might already be installed" -ForegroundColor Yellow
}

Write-Host ""

# Verify installation
try {
    $llmVersion = llm --version 2>&1
    Write-Host "✅ LLM CLI verified: $llmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ LLM CLI installation failed. Please check the error messages above." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Ask user which provider to configure
Write-Host "Which provider would you like to configure?" -ForegroundColor Cyan
Write-Host "1) OpenAI (gpt-4o, gpt-4o-mini, etc.)"
Write-Host "2) Anthropic (Claude 3.5 Sonnet, etc.)"
Write-Host "3) Google (Gemini Pro, etc.)"
Write-Host "4) Skip for now"
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "📝 Configuring OpenAI..." -ForegroundColor Yellow
        Write-Host "You'll need an API key from: https://platform.openai.com/api-keys" -ForegroundColor Cyan
        llm keys set openai
        Write-Host "✅ OpenAI configured" -ForegroundColor Green
        Write-Host ""
        Write-Host "Testing with gpt-4o-mini..." -ForegroundColor Yellow
        llm "Say hello!" -m gpt-4o-mini
    }
    "2" {
        Write-Host ""
        Write-Host "📝 Installing Claude plugin..." -ForegroundColor Yellow
        llm install llm-claude-3
        Write-Host "You'll need an API key from: https://console.anthropic.com/" -ForegroundColor Cyan
        llm keys set anthropic
        Write-Host "✅ Anthropic configured" -ForegroundColor Green
        Write-Host ""
        Write-Host "Testing with Claude 3.5 Sonnet..." -ForegroundColor Yellow
        llm "Say hello!" -m claude-3-5-sonnet-20241022
    }
    "3" {
        Write-Host ""
        Write-Host "📝 Installing Gemini plugin..." -ForegroundColor Yellow
        llm install llm-gemini
        Write-Host "You'll need an API key from: https://makersuite.google.com/app/apikey" -ForegroundColor Cyan
        llm keys set google
        Write-Host "✅ Google configured" -ForegroundColor Green
        Write-Host ""
        Write-Host "Testing with Gemini Pro..." -ForegroundColor Yellow
        llm "Say hello!" -m gemini-pro
    }
    "4" {
        Write-Host "⏭️  Skipping provider configuration" -ForegroundColor Yellow
    }
    default {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🔧 Installing useful plugins..." -ForegroundColor Yellow

# Install common plugins
Write-Host "  - Web search plugin..." -ForegroundColor Gray
try {
    llm install llm-plugin-search 2>$null
} catch {
    Write-Host "    (already installed or not available)" -ForegroundColor Gray
}

Write-Host "  - Calculator plugin..." -ForegroundColor Gray
try {
    llm install llm-plugin-calculator 2>$null
} catch {
    Write-Host "    (already installed or not available)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Next steps:" -ForegroundColor Cyan
Write-Host "1. Open Epoch"
Write-Host "2. Go to Settings → Provider Settings"
Write-Host "3. Select 'LLM CLI (Multi-Provider)'"
Write-Host "4. Configure your model and tools"
Write-Host "5. Start chatting!"
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Cyan
Write-Host "  - Quick Start: docs/QUICK_START_LLM_CLI.md"
Write-Host "  - Full Guide: docs/LLM_CLI_INTEGRATION.md"
Write-Host "  - Custom Tools: docs/CUSTOM_TOOLS.md"
Write-Host ""
Write-Host "🎉 Happy chatting with Epoch!" -ForegroundColor Magenta
