# japan-mcp-servers

[![MCP Badge](https://lobehub.com/badge/mcp/mrslbt-japan-mcp-servers)](https://lobehub.com/mcp/mrslbt-japan-mcp-servers)

A monorepo of Model Context Protocol servers for Japanese services: LINE Messaging, Rakuten Web Service, and freee Accounting.

## Servers

| Package | Service | Scope |
|---|---|---|
| [`rakuten-mcp`](https://www.npmjs.com/package/rakuten-mcp) | Rakuten Ichiba / Books / Travel | Product search, rankings, book search, hotel availability |
| [`line-mcp`](./servers/line-mcp) | LINE Messaging | Messages, groups, rich menus, analytics |
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

Claude Code:

```bash
claude mcp add rakuten -e RAKUTEN_APP_ID=... -e RAKUTEN_ACCESS_KEY=... -- npx -y rakuten-mcp
```

### LINE and freee (from source)

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

Credentials are validated on first tool call, not at startup.

## Example queries

```
Send a meeting reminder to my LINE group.
LINEグループにミーティングのリマインダーを送って。

Search Rakuten for wireless earphones under ¥10,000.
楽天で1万円以下のワイヤレスイヤホンを検索して。

Record this month's expenses in freee.
今月の経費をfreeeに登録して。

Find available hotels in Kyoto on Rakuten Travel.
楽天トラベルで京都の空室を探して。

Show me the P&L statement from freee.
freeeの損益計算書を見せて。
```

## LINE

> An official server is available at [`@line/line-bot-mcp-server`](https://github.com/line/line-bot-mcp-server). Use that for production. The implementation here was built independently and covers a broader tool set.

Requires `LINE_CHANNEL_ACCESS_TOKEN` from the [LINE Developers Console](https://developers.line.biz/console/).

| Tool | Description |
|---|---|
| `send_push_message` | Send to a user or group. |
| `send_multicast_message` | Send to up to 500 users. |
| `send_broadcast_message` | Send to all followers. |
| `get_profile` | User display name, picture, status. |
| `get_group_summary` | Group info. |
| `get_group_members` | List all member IDs (auto-paginates). |
| `get_message_quota` | Quota and current consumption. |
| `get_bot_info` | Bot details. |
| `get_followers_count` | Follower count by date. |
| `get_message_delivery_stats` | Delivery analytics by date. |
| `create_rich_menu` | Create interactive bottom menus. |

## Rakuten

Requires `RAKUTEN_APP_ID` and `RAKUTEN_ACCESS_KEY` from [Rakuten Web Service](https://webservice.rakuten.co.jp/).

| Tool | Description |
|---|---|
| `search_products` | Full-text search with price filters and sorting. |
| `get_genre_ranking` | Bestseller rankings by category. |
| `search_genres` | Browse the category tree. |
| `search_books` | Search by title, author, ISBN, or keyword. |
| `search_travel` | Hotel search by keyword. |
| `search_travel_vacancy` | Available rooms by date, location, price. |
| `get_product_reviews` | Product reviews with rating sort. |

## freee

> An official server is available at [`freee-mcp`](https://github.com/freee/freee-mcp) covering 330+ APIs. Use that for production. The implementation here was built independently as a lightweight alternative.

Requires `FREEE_ACCESS_TOKEN` and `FREEE_COMPANY_ID` from the [freee Developer Portal](https://developer.freee.co.jp/).

| Tool | Description |
|---|---|
| `list_deals` | List income and expense transactions. |
| `create_deal` | Record transactions with optional payment settlement. |
| `list_account_items` | Browse account categories (勘定科目). |
| `list_partners` | Search trading partners (取引先). |
| `get_trial_balance` | Trial balance sheet (試算表). |
| `get_profit_and_loss` | P&L statement (損益計算書). |
| `get_company_info` | Company details. |

> freee deprecated invoice endpoints during 2023-2025. Invoice management has moved to the [freee Invoice API](https://developer.freee.co.jp/reference/iv).

## Project structure

```
japan-mcp-servers/
├── servers/
│   ├── line-mcp/           # LINE Messaging API
│   ├── rakuten-mcp/        # Rakuten Ichiba, Books, Travel
│   └── freee-mcp/          # freee Accounting
├── .github/
│   ├── workflows/ci.yml
│   └── ISSUE_TEMPLATE/
├── tsup.config.js
├── tsconfig.json
└── package.json            # npm workspaces
```

Each server is a standalone npm package. They share build tooling and have no runtime dependencies on each other.

## Roadmap

Planned servers (contributions welcome):

- Mercari — product search, listing management
- Yahoo! Japan — search, auctions, shopping
- SmartHR — HR and employee management
- Money Forward — personal finance
- Tabelog — restaurant search
- Suumo — real estate
- Hotpepper — restaurant and beauty reservations

PayPay is already available as a separate repo: [`paypay-mcp`](https://github.com/mrslbt/paypay-mcp).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). In short: copy an existing server's structure, implement tools, open a PR.

## License

[MIT](LICENSE)
