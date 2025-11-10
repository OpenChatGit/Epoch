# Epoch Example Tools for LLM CLI

Example tools demonstrating how to create custom tools for Epoch's LLM CLI integration.

## Available Tools

### 1. weather_info
Get current weather information for any city.

```bash
llm "What's the weather in Tokyo?" --tool weather_info
```

### 2. currency_convert
Convert between different currencies with live exchange rates.

```bash
llm "Convert 100 USD to EUR" --tool currency_convert
```

### 3. random_quote
Get a random inspirational quote.

```bash
llm "Give me a motivational quote" --tool random_quote
```

### 4. github_user_info
Fetch GitHub user profile information.

```bash
llm "Tell me about GitHub user torvalds" --tool github_user_info
```

### 5. calculate_tip
Calculate tips and split bills.

```bash
llm "Calculate 20% tip on $85 split between 4 people" --tool calculate_tip
```

### 6. word_count
Analyze text statistics (words, characters, sentences).

```bash
llm "Count the words in this text: Hello world, this is a test!" --tool word_count
```

### 7. color_info
Get detailed information about a color from its hex code.

```bash
llm "Tell me about the color #FF5733" --tool color_info
```

## Installation

### From Source

```bash
cd examples/llm-epoch-example-tool
pip install -e .
```

### Verify Installation

```bash
llm tools list
```

You should see all the example tools listed.

## Usage in Epoch

1. Install the tools (see above)
2. Open Epoch
3. Go to Settings → Provider Settings
4. Select "LLM CLI (Multi-Provider)"
5. In "Enabled Tools" field, add:
   ```
   weather_info, currency_convert, random_quote, github_user_info, calculate_tip, word_count, color_info
   ```
6. Save and start chatting!

## Example Conversations

### Weather Query
```
You: "What's the weather like in Paris and London? Compare them."

AI will:
1. Call weather_info("Paris")
2. Call weather_info("London")
3. Compare the results
4. Generate a comparison component
```

### Currency Conversion
```
You: "I have 1000 USD. How much is that in EUR, GBP, and JPY?"

AI will:
1. Call currency_convert(1000, "USD", "EUR")
2. Call currency_convert(1000, "USD", "GBP")
3. Call currency_convert(1000, "USD", "JPY")
4. Display results in a table
```

### GitHub Research
```
You: "Compare the GitHub profiles of torvalds and gvanrossum"

AI will:
1. Call github_user_info("torvalds")
2. Call github_user_info("gvanrossum")
3. Create a comparison component
```

### Bill Splitting
```
You: "We had dinner for $250, want to tip 18%, split between 5 people"

AI will:
1. Call calculate_tip(250, 18, 5)
2. Display the breakdown
```

## Creating Your Own Tools

Use these examples as templates for your own tools:

1. **Copy the structure** from `llm_epoch_example.py`
2. **Add your tool function** with proper docstring
3. **Register it** with `@tool_registry.register`
4. **Install** with `pip install -e .`
5. **Test** with `llm "test query" --tool your_tool`

### Tool Template

```python
@tool_registry.register
def my_custom_tool(param1: str, param2: int = 10) -> str:
    """
    Brief description of what the tool does
    
    Args:
        param1: Description of first parameter
        param2: Description of second parameter (optional)
        
    Returns:
        Description of return value
    """
    try:
        # Your tool logic here
        result = do_something(param1, param2)
        return f"Result: {result}"
    except Exception as e:
        return f"Error: {str(e)}"
```

## Best Practices

1. **Always handle errors** - Wrap logic in try-except
2. **Set timeouts** - For network requests (10s recommended)
3. **Validate inputs** - Check parameters before processing
4. **Return strings** - LLM CLI expects string returns
5. **Add docstrings** - They help the AI understand your tool
6. **Keep it simple** - One tool = one clear purpose

## Testing

```bash
# Test individual tool
llm "What's the weather in Berlin?" --tool weather_info

# Test with multiple tools
llm "Get weather in Paris and convert 100 EUR to USD" \
    --tool weather_info \
    --tool currency_convert

# Test in Epoch
# Just enable the tools in settings and chat naturally
```

## Troubleshooting

### Tool not found
```bash
# List installed tools
llm tools list

# Reinstall
pip install -e . --force-reinstall
```

### Import errors
```bash
# Install dependencies
pip install llm requests
```

### API rate limits
Some tools use free APIs with rate limits. If you hit limits:
- Wait a few minutes
- Consider using paid API keys
- Implement caching in your tools

## Contributing

Want to add more example tools? Submit a PR with:
- Tool implementation
- Documentation
- Example usage
- Tests (optional but appreciated)

## License

MIT License - Feel free to use these examples in your own projects!

## Resources

- [LLM CLI Tool Documentation](https://llm.datasette.io/en/stable/tools.html)
- [Epoch Custom Tools Guide](../../docs/CUSTOM_TOOLS.md)
- [Python Packaging Guide](https://packaging.python.org/)
