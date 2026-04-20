# @japan-mcp/freee

Model Context Protocol server for the [freee Accounting API](https://developer.freee.co.jp/).

Read-mostly access to Japanese cloud accounting data: transactions, trial balance, P&L, partners, account items.

## Setup

1. Register at the [freee Developer Portal](https://developer.freee.co.jp/).
2. Create an application and obtain an **Access Token** via OAuth.
3. Set environment variables:

```bash
export FREEE_ACCESS_TOKEN="your-token-here"
export FREEE_COMPANY_ID="your-company-id"
```

## Configuration

| Variable | Required | Description |
|---|---|---|
| `FREEE_ACCESS_TOKEN` | yes | OAuth access token |
| `FREEE_COMPANY_ID` | yes | Numeric company ID from your freee settings |
| `FREEE_ENABLE_WRITES` | no | Set to `true` to expose `create_deal`. Disabled by default. |

## Tools

| Tool | Description |
|------|-------------|
| `list_deals` | List transactions (income/expense) with date filters |
| `create_deal` | Record a new transaction with optional payment settlement. **Disabled unless `FREEE_ENABLE_WRITES=true`.** |
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

## Note on invoices

The old freee Accounting invoice endpoints (`/api/1/invoices`) were retired by freee between October 2023 and January 2025. Invoice management has moved to the separate [freee Invoice API](https://developer.freee.co.jp/reference/iv). See the [migration guide](https://developer.freee.co.jp/guideline/content-rel/invoice-transition-guide) for details.

## Example prompts

- "Record a 3,500 yen lunch expense for today, paid from petty cash"
- "Show me the P&L for fiscal year 2025"
- "What account categories are available?"

## Safety

Accounting records feed tax filings, audits, and financial reporting. Key safeguards:

- **Write tools are disabled by default.** `create_deal` is only registered when `FREEE_ENABLE_WRITES=true`. Read tools (`list_*`, `get_*`) stay enabled because they cannot mutate records. Only enable writes in trusted agent contexts where tool inputs cannot be influenced by untrusted content.
- **Writes are durable.** freee deals may post to ledger and link to payment sources. Review amount, issue date, account item, and payment source before approving any `create_deal` call.
- **Tokens are scoped per company.** Double-check `FREEE_COMPANY_ID` before enabling writes so an agent does not post entries to the wrong books.

Even with these gates on, review any write request before approving the tool call. Treat tool inputs derived from model output as untrusted.

## Disclaimer

This is an unofficial, community-built MCP server. Not affiliated with, endorsed by, or sponsored by freee K.K. freee is a trademark of its respective owners. Use at your own risk. The author accepts no liability for incorrect accounting entries, misfiled taxes, or data loss through misuse, prompt injection, or bugs.

## License

[MIT](LICENSE)
