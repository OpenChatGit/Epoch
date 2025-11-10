"""
Example tools for Epoch LLM CLI integration

This module provides example tools that demonstrate how to create
custom tools for use with Epoch's LLM CLI integration.
"""

import llm
import json
import requests
from typing import Optional


@llm.hookimpl
def register_tools(tool_registry):
    """Register example tools for Epoch"""
    
    @tool_registry.register
    def weather_info(city: str) -> str:
        """
        Get current weather information for a city
        
        Args:
            city: Name of the city
            
        Returns:
            Weather information as a formatted string
        """
        try:
            # Using wttr.in for simple weather data
            response = requests.get(
                f"https://wttr.in/{city}?format=j1",
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            current = data['current_condition'][0]
            
            result = f"""Weather in {city}:
Temperature: {current['temp_C']}°C ({current['temp_F']}°F)
Condition: {current['weatherDesc'][0]['value']}
Humidity: {current['humidity']}%
Wind: {current['windspeedKmph']} km/h
Feels like: {current['FeelsLikeC']}°C"""
            
            return result
        except Exception as e:
            return f"Error fetching weather: {str(e)}"
    
    @tool_registry.register
    def currency_convert(amount: float, from_currency: str, to_currency: str) -> str:
        """
        Convert currency from one to another
        
        Args:
            amount: Amount to convert
            from_currency: Source currency code (e.g., USD)
            to_currency: Target currency code (e.g., EUR)
            
        Returns:
            Converted amount with exchange rate
        """
        try:
            # Using exchangerate-api.com (free tier)
            response = requests.get(
                f"https://api.exchangerate-api.com/v4/latest/{from_currency.upper()}",
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            if to_currency.upper() not in data['rates']:
                return f"Currency {to_currency} not found"
            
            rate = data['rates'][to_currency.upper()]
            converted = amount * rate
            
            return f"{amount} {from_currency.upper()} = {converted:.2f} {to_currency.upper()} (Rate: {rate:.4f})"
        except Exception as e:
            return f"Error converting currency: {str(e)}"
    
    @tool_registry.register
    def random_quote() -> str:
        """
        Get a random inspirational quote
        
        Returns:
            A random quote with author
        """
        try:
            response = requests.get(
                "https://api.quotable.io/random",
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            return f'"{data["content"]}" - {data["author"]}'
        except Exception as e:
            return f"Error fetching quote: {str(e)}"
    
    @tool_registry.register
    def github_user_info(username: str) -> str:
        """
        Get GitHub user information
        
        Args:
            username: GitHub username
            
        Returns:
            User information as formatted string
        """
        try:
            response = requests.get(
                f"https://api.github.com/users/{username}",
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            result = f"""GitHub User: {data['login']}
Name: {data.get('name', 'N/A')}
Bio: {data.get('bio', 'N/A')}
Public Repos: {data['public_repos']}
Followers: {data['followers']}
Following: {data['following']}
Location: {data.get('location', 'N/A')}
Profile: {data['html_url']}"""
            
            return result
        except Exception as e:
            return f"Error fetching GitHub user: {str(e)}"
    
    @tool_registry.register
    def calculate_tip(bill_amount: float, tip_percentage: float = 15.0, split_by: int = 1) -> str:
        """
        Calculate tip and split bill
        
        Args:
            bill_amount: Total bill amount
            tip_percentage: Tip percentage (default 15%)
            split_by: Number of people to split the bill (default 1)
            
        Returns:
            Tip calculation breakdown
        """
        try:
            tip_amount = bill_amount * (tip_percentage / 100)
            total = bill_amount + tip_amount
            per_person = total / split_by
            
            result = f"""Bill Calculation:
Subtotal: ${bill_amount:.2f}
Tip ({tip_percentage}%): ${tip_amount:.2f}
Total: ${total:.2f}"""
            
            if split_by > 1:
                result += f"\nPer person ({split_by} people): ${per_person:.2f}"
            
            return result
        except Exception as e:
            return f"Error calculating tip: {str(e)}"
    
    @tool_registry.register
    def word_count(text: str) -> str:
        """
        Count words, characters, and sentences in text
        
        Args:
            text: Text to analyze
            
        Returns:
            Text statistics
        """
        try:
            words = len(text.split())
            chars = len(text)
            chars_no_spaces = len(text.replace(" ", ""))
            sentences = text.count('.') + text.count('!') + text.count('?')
            
            result = f"""Text Statistics:
Words: {words}
Characters (with spaces): {chars}
Characters (without spaces): {chars_no_spaces}
Sentences: {sentences}
Average word length: {chars_no_spaces / words if words > 0 else 0:.1f}"""
            
            return result
        except Exception as e:
            return f"Error analyzing text: {str(e)}"
    
    @tool_registry.register
    def color_info(color_hex: str) -> str:
        """
        Get information about a color from its hex code
        
        Args:
            color_hex: Hex color code (e.g., #FF5733 or FF5733)
            
        Returns:
            Color information including RGB values
        """
        try:
            # Remove # if present
            hex_code = color_hex.lstrip('#')
            
            if len(hex_code) != 6:
                return "Invalid hex color code. Use format: #RRGGBB or RRGGBB"
            
            # Convert to RGB
            r = int(hex_code[0:2], 16)
            g = int(hex_code[2:4], 16)
            b = int(hex_code[4:6], 16)
            
            # Calculate HSL
            r_norm = r / 255
            g_norm = g / 255
            b_norm = b / 255
            
            max_val = max(r_norm, g_norm, b_norm)
            min_val = min(r_norm, g_norm, b_norm)
            diff = max_val - min_val
            
            # Lightness
            l = (max_val + min_val) / 2
            
            # Saturation
            if diff == 0:
                s = 0
            else:
                s = diff / (1 - abs(2 * l - 1))
            
            # Hue
            if diff == 0:
                h = 0
            elif max_val == r_norm:
                h = 60 * (((g_norm - b_norm) / diff) % 6)
            elif max_val == g_norm:
                h = 60 * (((b_norm - r_norm) / diff) + 2)
            else:
                h = 60 * (((r_norm - g_norm) / diff) + 4)
            
            result = f"""Color Information:
Hex: #{hex_code.upper()}
RGB: rgb({r}, {g}, {b})
HSL: hsl({h:.0f}°, {s*100:.0f}%, {l*100:.0f}%)
Brightness: {(r + g + b) / 3:.0f}/255"""
            
            return result
        except Exception as e:
            return f"Error analyzing color: {str(e)}"


if __name__ == "__main__":
    print("This is an LLM CLI plugin. Install it with:")
    print("  pip install -e .")
    print("\nThen use it with:")
    print("  llm 'What is the weather in Paris?' --tool weather_info")
