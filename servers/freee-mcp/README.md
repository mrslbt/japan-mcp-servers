# @japan-mcp/freee

MCP server for the [freee Accounting API](https://developer.freee.co.jp/).

AI-powered accounting for Japanese businesses. freee is Japan's #1 cloud accounting SaaS.

## Setup

1. Register at the [freee Developer Portal](https://developer.freee.co.jp/)
2. Create an application and obtain an **Access Token** via OAuth
3. Set environment variables:

```bash
export FREEE_ACCESS_TOKEN="your-token-here"
export FREEE_COMPANY_ID="your-company-id"
```

## Tools

| Tool | Description |
|------|-------------|
| `list_deals` | List transactions (income/expense) with date filters |
| `create_deal` | Record a new transaction with optional payment settlement |
| `list_account_items` | Browse account categories (勘定科目) |
| `list_partners` | View and search trading partners (取引先) |
| `get_trial_balance` | Pull trial balance sheet (試算表) |
| `get_profit_and_loss` | Pull P&L statement (損益計算書) |
| `get_company_info` | Get company details |

## Usage with Claude Desktop

```json
{
  "mcpServers": {
    "freee": {
      "command": "node",
      "args": ["path/to/servers/freee-mcp/dist/index.js"],
      "env": {
        "FREEE_ACCESS_TOKEN": "your-token-here",
        "FREEE_COMPANY_ID": "your-company-id"
      }
    }
  }
}
```

## Note on Invoices

The old freee Accounting invoice endpoints (`/api/1/invoices`) were abolished by freee in 2023-2025. Invoice management has moved to the separate [freee Invoice API](https://developer.freee.co.jp/reference/iv). See the [migration guide](https://developer.freee.co.jp/guideline/content-rel/invoice-transition-guide) for details.

## Example Prompts

- "Record a 3,500 yen lunch expense for today, paid from petty cash"
- "Show me the P&L for fiscal year 2025"
- "What account categories are available?"

## License

MIT
