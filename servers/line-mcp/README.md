# @japan-mcp/line

MCP server for the [LINE Messaging API](https://developers.line.biz/en/docs/messaging-api/).

Connect AI assistants to Japan's dominant messaging platform (95M+ monthly active users).

## Setup

1. Create a LINE Official Account and Messaging API channel at [LINE Developers Console](https://developers.line.biz/console/)
2. Issue a **Channel Access Token** (long-lived)
3. Set the environment variable:

```bash
export LINE_CHANNEL_ACCESS_TOKEN="your-token-here"
```

## Tools

| Tool | Description |
|------|-------------|
| `send_push_message` | Send a message to a user or group |
| `send_multicast_message` | Message multiple users at once (max 500) |
| `send_broadcast_message` | Broadcast to all followers |
| `get_profile` | Get user display name, picture, status message |
| `get_group_summary` | Get group info |
| `get_group_members` | List group member IDs |
| `get_message_quota` | Check messaging quota and usage |
| `get_bot_info` | Get bot information |
| `get_followers_count` | Follower count for a given date |
| `get_message_delivery_stats` | Message delivery analytics |
| `create_rich_menu` | Create interactive bottom menus |

## Usage with Claude Desktop

```json
{
  "mcpServers": {
    "line": {
      "command": "node",
      "args": ["path/to/servers/line-mcp/dist/index.js"],
      "env": {
        "LINE_CHANNEL_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

## Example Prompts

- "Send a meeting reminder to group Uxxx"
- "How many followers did our bot gain today?"
- "What's our messaging quota looking like?"

## License

MIT
