# japan-mcp-servers

MCP servers for Japanese services. LINE, Rakuten, freee, with more on the way.

These servers implement the [Model Context Protocol](https://modelcontextprotocol.io/) so that AI assistants (Claude, Cursor, VS Code Copilot, etc.) can actually talk to the services that run Japan's digital infrastructure.

## Servers

| Package | Service | What it does |
|---------|---------|-------------|
| [`rakuten-mcp`](https://www.npmjs.com/package/rakuten-mcp) | Rakuten Ichiba / Books / Travel | Product search, rankings, book search, hotel availability |
| [`line-mcp`](./servers/line-mcp) | LINE Messaging | Send messages, manage groups, rich menus, analytics |
| [`freee-mcp`](./servers/freee-mcp) | freee Accounting | Transactions, P&L, trial balance, partners |

## Quick start

### Rakuten (via npm)

```bash
npx rakuten-mcp
```

Add to Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "rakuten": {
      "command": "npx",
      "args": ["-y", "rakuten-mcp"],
      "env": {
        "RAKUTEN_APP_ID": "your-app-id",
        "RAKUTEN_ACCESS_KEY": "your-access-key"
      }
    }
  }
}
```

Or with Claude Code:

```bash
claude mcp add rakuten -- npx -y rakuten-mcp
```

### LINE & freee (from source)

```bash
git clone https://github.com/mrslbt/japan-mcp-servers.git
cd japan-mcp-servers
npm install
npm run build
```

Then add to Claude Desktop:

```json
{
  "mcpServers": {
    "line": {
      "command": "node",
      "args": ["/absolute/path/to/servers/line-mcp/dist/index.js"],
      "env": {
        "LINE_CHANNEL_ACCESS_TOKEN": "your-token"
      }
    },
    "freee": {
      "command": "node",
      "args": ["/absolute/path/to/servers/freee-mcp/dist/index.js"],
      "env": {
        "FREEE_ACCESS_TOKEN": "your-token",
        "FREEE_COMPANY_ID": "your-company-id"
      }
    }
  }
}
```

Credentials are validated when you call a tool, not on startup.

## What you can do

Once configured, you can ask your AI assistant things like:

```
LINEグループにミーティングのリマインダーを送って
楽天で1万円以下のワイヤレスイヤホンを検索して
今月の経費をfreeeに登録して
楽天トラベルで京都の空室を探して
freeeの損益計算書を見せて
```

## LINE

> **Note:** LINE now has an official MCP server: [`@line/line-bot-mcp-server`](https://github.com/line/line-bot-mcp-server). Use that for production. The implementation here was built independently and covers a broader set of tools.

Connect to Japan's dominant messaging platform (95M+ MAU).

**Required:** `LINE_CHANNEL_ACCESS_TOKEN` from [LINE Developers Console](https://developers.line.biz/console/)

| Tool | |
|------|-|
| `send_push_message` | Send to a user or group |
| `send_multicast_message` | Send to up to 500 users |
| `send_broadcast_message` | Send to all followers |
| `get_profile` | User display name, picture, status |
| `get_group_summary` | Group info |
| `get_group_members` | List all member IDs (auto-paginates) |
| `get_message_quota` | Quota and current consumption |
| `get_bot_info` | Bot details |
| `get_followers_count` | Follower count by date |
| `get_message_delivery_stats` | Delivery analytics by date |
| `create_rich_menu` | Create interactive bottom menus |

## Rakuten

Search Japan's largest e-commerce marketplace, plus Books and Travel.

**Required:** `RAKUTEN_APP_ID` + `RAKUTEN_ACCESS_KEY` from [Rakuten Web Service](https://webservice.rakuten.co.jp/)

| Tool | |
|------|-|
| `search_products` | Full-text search with price filters and sorting |
| `get_genre_ranking` | Bestseller rankings by category |
| `search_genres` | Browse the category tree |
| `search_books` | Search by title, author, ISBN, or keyword |
| `search_travel` | Hotel search by keyword |
| `search_travel_vacancy` | Available rooms by date, location, price |
| `get_product_reviews` | Product reviews with rating sort |

## freee

> **Note:** freee now maintains an official MCP server: [`freee-mcp`](https://github.com/freee/freee-mcp) covering 330+ APIs. Use that for production. The implementation here was built independently as a lightweight alternative.

Cloud accounting for Japanese businesses. freee is Japan's #1 accounting SaaS.

**Required:** `FREEE_ACCESS_TOKEN` + `FREEE_COMPANY_ID` from [freee Developer Portal](https://developer.freee.co.jp/)

| Tool | |
|------|-|
| `list_deals` | List income/expense transactions |
| `create_deal` | Record transactions with optional payment settlement |
| `list_account_items` | Browse account categories (勘定科目) |
| `list_partners` | Search trading partners (取引先) |
| `get_trial_balance` | Trial balance sheet (試算表) |
| `get_profit_and_loss` | P&L statement (損益計算書) |
| `get_company_info` | Company details |

> **Note:** freee deprecated invoice endpoints in 2023-2025. Invoice management moved to the [freee Invoice API](https://developer.freee.co.jp/reference/iv).

## Project structure

```
japan-mcp-servers/
├── servers/
│   ├── line-mcp/           # LINE Messaging API
│   ├── rakuten-mcp/        # Rakuten Ichiba, Books, Travel
│   └── freee-mcp/          # freee Accounting
├── .github/
│   ├── workflows/ci.yml    # Build check on every push/PR
│   └── ISSUE_TEMPLATE/
├── tsup.config.js          # Shared build config
├── tsconfig.json            # Shared TypeScript config
└── package.json             # npm workspaces
```

Each server is a standalone npm package. They share build tooling but have zero runtime dependencies on each other.

## Roadmap

Planned servers (PRs welcome):

- Mercari - product search, listing management
- Yahoo! Japan - search, auctions, shopping
- SmartHR - HR / employee management
- Money Forward - personal finance
- PayPay - mobile payments
- Tabelog - restaurant search
- Suumo - real estate
- Hotpepper - restaurant & beauty reservations

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). The short version: copy an existing server's structure, implement your tools, open a PR.

## License

MIT
