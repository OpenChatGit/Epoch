# Agent Tools Documentation

## Overview

The Agent mode in Epoch now uses **6 different tools** that enable the agent to handle more complex tasks. Each tool has a specific function and is automatically selected by the agent based on the user's request.

---

## 🔍 Tool 1: `search` (Web Search)

**What it does:**
- Searches the internet for current information
- Uses Google Search via the Serper API
- Returns relevant search results

**When the agent uses it:**
- When current information is needed
- For questions about facts, news, or data
- When information needs to be fetched from the internet

**Example requests:**
```
"Search for current Bitcoin prices"
"Find information about artificial intelligence"
"What are the latest news about Tesla?"
```

**What the agent does:**
1. Recognizes that current information is needed
2. Calls `search` with the search query
3. Receives relevant search results
4. Presents the information in a beautiful UI component

---

## 🖼️ Tool 2: `searchImage` (Image Search)

**What it does:**
- Searches for images on the internet
- Returns an image URL that can be used in UI components
- Uses Google Image Search via the Serper API

**When the agent uses it:**
- When images related to a topic are needed
- For visual representations
- When the user asks for images

**Example requests:**
```
"Show me images of sunsets"
"Find an image of a robot"
"Search for images of Paris"
```

**What the agent does:**
1. Recognizes that an image is needed
2. Calls `searchImage` with the search query
3. Receives an image URL
4. Displays the image in an Image component

---

## 🧮 Tool 3: `calculate` (Mathematical Calculations)

**What it does:**
- Performs mathematical calculations
- Supports basic arithmetic (+, -, *, /)
- Supports percentage calculations
- Supports square root functions (sqrt)

**When the agent uses it:**
- For mathematical questions
- For calculations and percentage problems
- For numerical problems

**Example requests:**
```
"Calculate 15% of 200"
"What is 2 + 2 * 3?"
"Calculate the square root of 16"
"How much is 25% of 1000?"
```

**What the agent does:**
1. Recognizes a mathematical calculation
2. Calls `calculate` with the mathematical expression
3. Receives the result
4. Displays the result in a Text or Metric component

**Supported operations:**
- Addition: `+`
- Subtraction: `-`
- Multiplication: `*`
- Division: `/`
- Percentage: `%`
- Square root: `sqrt(16)`

---

## 📊 Tool 4: `analyzeData` (Data Analysis)

**What it does:**
- Analyzes arrays of numbers
- Calculates various statistics
- Supports: sum, average, minimum, maximum, median, range, count

**When the agent uses it:**
- For data analysis tasks
- For statistical calculations
- When multiple numbers need to be analyzed

**Example requests:**
```
"Analyze these numbers: [10, 20, 30, 40, 50]"
"Calculate the average of [5, 10, 15, 20, 25]"
"What is the sum of [100, 200, 300]?"
"Find the maximum and minimum of [1, 5, 3, 9, 2]"
```

**What the agent does:**
1. Recognizes that data needs to be analyzed
2. Calls `analyzeData` with the numbers and desired operation
3. Receives the statistical result
4. Displays the result in a Stats, Metric, or Chart component

**Available operations:**
- `sum` - Sum of all numbers
- `avg` - Average
- `min` - Minimum
- `max` - Maximum
- `count` - Count of numbers
- `median` - Median value
- `range` - Range (Max - Min)

---

## ✅ Tool 5: `validateJson` (JSON Validation)

**What it does:**
- Validates JSON strings
- Checks if JSON is correctly formatted
- Returns formatted JSON or an error message

**When the agent uses it:**
- For JSON validation
- When JSON data needs to be verified
- When processing JSON data

**Example requests:**
```
"Validate this JSON: {'name': 'John', 'age': 30}"
"Check if this JSON string is valid: [1, 2, 3, 4]"
"Format and validate this JSON"
```

**What the agent does:**
1. Recognizes that JSON needs to be validated
2. Calls `validateJson` with the JSON string
3. Receives validated, formatted JSON or error message
4. Displays the result in a CodeBlock component

**Example:**
```json
Input:  '{"name":"John","age":30}'
Output: {
  "name": "John",
  "age": 30
}
```

---

## 🌐 Tool 6: `fetchApi` (HTTP API Calls)

**What it does:**
- Makes HTTP requests to external APIs
- Supports GET, POST, PUT, DELETE methods
- Can send headers and body
- Returns API responses

**When the agent uses it:**
- For API calls
- When data needs to be fetched from external services
- For REST API integrations

**Example requests:**
```
"Get current Bitcoin prices from the CoinGecko API"
"Call the GitHub API to get information about a repository"
"Load weather data from a weather API"
```

**What the agent does:**
1. Recognizes that data needs to be fetched from an API
2. Calls `fetchApi` with the API URL and parameters
3. Receives the API response
4. Processes and displays the data in UI components

**Supported HTTP methods:**
- `GET` - Retrieve data (default)
- `POST` - Send data
- `PUT` - Update data
- `DELETE` - Delete data

**Example API call:**
```javascript
// Agent calls:
fetchApi({
  url: "https://api.coingecko.com/v3/simple/price?ids=bitcoin",
  method: "GET"
})

// Receives:
{
  "bitcoin": {
    "usd": 45000,
    "eur": 42000
  }
}
```

---

## 🎯 How the Agent Combines Tools

The agent can use multiple tools **sequentially** to solve complex tasks:

### Example 1: Research + Analysis
```
User: "Find Bitcoin prices and calculate the average"

1. Agent calls `fetchApi` → Fetches Bitcoin prices
2. Agent calls `analyzeData` → Calculates average
3. Agent shows result in Chart component
```

### Example 2: Search + Image + Calculation
```
User: "Search for sunsets, show an image and calculate 20% of 100"

1. Agent calls `search` → Finds information
2. Agent calls `searchImage` → Fetches image
3. Agent calls `calculate` → Calculates 20
4. Agent displays everything in a beautiful UI
```

### Example 3: API + Validation + Analysis
```
User: "Fetch data from an API, validate the JSON and analyze the numbers"

1. Agent calls `fetchApi` → Fetches data
2. Agent calls `validateJson` → Validates JSON
3. Agent calls `analyzeData` → Analyzes numbers
4. Agent shows results in various components
```

---

## 📋 Tool Overview Table

| Tool | Category | Input | Output | Speed |
|------|----------|-------|--------|-------|
| `search` | Web | Search query (String) | Search results (Text) | ~2 seconds |
| `searchImage` | Web | Search query (String) | Image URL (String) | ~2 seconds |
| `calculate` | Data | Mathematical expression (String) | Result (Number) | ~0.1 seconds |
| `analyzeData` | Data | Number array + Operation | Statistics (Number) | ~0.1 seconds |
| `validateJson` | Data | JSON string | Formatted JSON or error | ~0.05 seconds |
| `fetchApi` | API | URL + Method + Headers/Body | API response (JSON) | ~1 second |

---

## 💡 Best Practices for Users

### 1. Make Clear Requests
**Good:**
```
"Calculate the average of [10, 20, 30, 40, 50]"
```

**Bad:**
```
"Numbers"
```

### 2. Provide Specific Information
**Good:**
```
"Get Bitcoin prices from the CoinGecko API"
```

**Bad:**
```
"API"
```

### 3. Combined Requests Are Possible
**Good:**
```
"Search for Python tutorials and show me an image of Python"
```

The agent will automatically use both tools!

---

## 🔧 Technical Details

### Tool Selection
The agent automatically selects the right tool based on:
- The user's request
- The conversation context
- Available tools
- Tool descriptions

### Error Handling
All tools have built-in error handling:
- Errors return an error message
- The agent can then try an alternative strategy
- Errors are clearly communicated to the user

### Performance
- Tools are executed asynchronously
- The agent can use tools in parallel (when possible)
- Results are streamed so the user sees immediate feedback

---

## 🚀 Next Steps

The agent is continuously being improved. Planned enhancements:
- More tools (e.g., file operations, code execution)
- Intelligent tool orchestration
- Multi-agent coordination
- Workflow state management

---

**Note:** The agent automatically selects the right tools. You don't need to specify which tool to use - just make your request!
