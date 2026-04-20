# @japan-mcp/line

Model Context Protocol server for the [LINE Messaging API](https://developers.line.biz/en/docs/messaging-api/).

Connects AI assistants to LINE Official Accounts for 1:1 messaging, group operations, and delivery analytics.

## Setup

1. Create a LINE Official Account and Messaging API channel at the [LINE Developers Console](https://developers.line.biz/console/).
2. Issue a **Channel Access Token** (long-lived).
3. Set the environment variable:

```bash
export LINE_CHANNEL_ACCESS_TOKEN="your-token-here"
```

## Configuration

| Variable | Required | Description |
|---|---|---|
| `LINE_CHANNEL_ACCESS_TOKEN` | yes | Long-lived channel access token |
| `LINE_ENABLE_BROADCAST` | no | Set to `true` to expose `send_multicast_message` and `send_broadcast_message`. Disabled by default. |

## Tools

| Tool | Description |
|------|-------------|
| `send_push_message` | Send a message to a user or group |
| `send_multicast_message` | Message up to 500 users at once. **Disabled unless `LINE_ENABLE_BROADCAST=true`.** |
| `send_broadcast_message` | Broadcast to all followers. **Disabled unless `LINE_ENABLE_BROADCAST=true`.** |
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

## Example prompts

- "Send a meeting reminder to group Uxxx"
- "How many followers did our bot gain today?"
- "What's our messaging quota looking like?"

## Safety

LINE messages count against your Official Account's monthly quota and are visible to every recipient. Key safeguards:

- **Broadcast and multicast tools are disabled by default.** `send_multicast_message` and `send_broadcast_message` are only registered when `LINE_ENABLE_BROADCAST=true`. Prompt injection against an ungated agent could otherwise spam every follower. Only enable in trusted contexts where tool inputs cannot be influenced by untrusted content.
- **Push messages reach one recipient at a time.** `send_push_message` stays enabled because the blast radius is bounded to the user, group, or room ID supplied.
- **Messaging API channels have a monthly quota.** Check `get_message_quota` before enabling broadcast tools, and remember that each broadcast to `n` followers counts as `n` messages.

Even with these gates on, review any outbound-message request before approving the tool call. Treat tool inputs derived from model output as untrusted.

## Disclaimer

This is an unofficial, community-built MCP server. Not affiliated with, endorsed by, or sponsored by LY Corporation or LINE Corporation. LINE is a trademark of its respective owners. Use at your own risk. The author accepts no liability for quota consumed, messages sent in error, or follower loss through misuse, prompt injection, or bugs.

## License

[MIT](LICENSE)
