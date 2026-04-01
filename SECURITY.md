# Security

## Reporting vulnerabilities

If you find a security issue, **do not open a public GitHub issue.** Instead, email marselbait@gmail.com with details. I'll respond within 48 hours.

## How credentials are handled

Each server reads API credentials from environment variables at startup. Credentials are never logged, cached to disk, or included in error messages.

| Server | Environment variables |
|--------|-----------------------|
| LINE | `LINE_CHANNEL_ACCESS_TOKEN` |
| Rakuten | `RAKUTEN_APP_ID`, `RAKUTEN_ACCESS_KEY` |
| freee | `FREEE_ACCESS_TOKEN`, `FREEE_COMPANY_ID` |

### Rakuten API note

The Rakuten API requires credentials as URL query parameters (this is how their API works, not a design choice on our end). These are sent over HTTPS but will appear in Rakuten's server access logs. Keep your keys rotated and scoped appropriately.

## Best practices

- Never commit `.env` files (already in `.gitignore`)
- Use scoped, minimal-permission API tokens
- Rotate credentials regularly
- When using Claude Desktop, credentials in `claude_desktop_config.json` are stored in plain text on disk — secure that file appropriately
