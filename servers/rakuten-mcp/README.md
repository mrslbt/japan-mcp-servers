# @japan-mcp/rakuten

MCP server for [Rakuten Web Service APIs](https://webservice.rakuten.co.jp/).

Search Japan's largest e-commerce marketplace, plus Rakuten Books and Rakuten Travel.

## Setup

1. Register at [Rakuten Web Service](https://webservice.rakuten.co.jp/) (free)
2. Create an application to get an **Application ID** and **Access Key**
3. Set the environment variables:

```bash
export RAKUTEN_APP_ID="your-app-id-here"
export RAKUTEN_ACCESS_KEY="your-access-key-here"
```

## Tools

| Tool | Description |
|------|-------------|
| `search_products` | Full-text product search with price filters, sorting, and pagination |
| `get_genre_ranking` | Bestseller rankings (overall or by category) |
| `search_genres` | Browse product category hierarchy |
| `search_books` | Search Rakuten Books by title, author, ISBN |
| `search_travel` | Search hotels on Rakuten Travel by keyword |
| `search_travel_vacancy` | Search available hotel rooms with date/price/location filters |
| `get_product_reviews` | Read product reviews with rating and date sorting |

## Usage with Claude Desktop

```json
{
  "mcpServers": {
    "rakuten": {
      "command": "node",
      "args": ["path/to/servers/rakuten-mcp/dist/index.js"],
      "env": {
        "RAKUTEN_APP_ID": "your-app-id-here",
        "RAKUTEN_ACCESS_KEY": "your-access-key-here"
      }
    }
  }
}
```

## Example Prompts

- "Find wireless earphones under 10,000 yen with good reviews"
- "What are the top sellers on Rakuten right now?"
- "Search for hotels in Kyoto on Rakuten Travel"
- "Find available rooms near Tokyo Station for April 15-17 under 15,000 yen"
- "Find books by Haruki Murakami on Rakuten Books"

## License

MIT
