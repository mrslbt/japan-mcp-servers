# Contributing

## Adding a new server

The fastest way to add a new Japanese service:

1. Copy an existing server directory (e.g., `servers/rakuten-mcp/`) to `servers/your-service-mcp/`
2. Update `package.json` — name, description, keywords, bin entry
3. Implement your tools in `src/index.ts`
4. Add a `.env.example` listing required credentials
5. Write a `README.md` with setup instructions, tool table, and example prompts
6. Add your server to the table in the root `README.md`
7. Open a PR

## Development

```bash
# Install everything
npm install

# Build all servers
npm run build

# Dev mode (single server, with hot reload)
cd servers/your-service-mcp
npm run dev

# Test with Claude Desktop — add to claude_desktop_config.json and restart
```

## Code conventions

- TypeScript strict mode, no `any`
- Read credentials from environment variables, never hardcode
- Validate credentials at startup in `main()` so users get immediate feedback
- Tool names: `verb_noun` (e.g., `search_products`, `get_profile`, `create_deal`)
- Include Japanese terms in tool descriptions where it helps (e.g., "勘定科目" for account items)
- Error messages should tell the user what to do, not just what went wrong
- Wrap `JSON.parse` in try-catch for API responses
- Don't expose raw API response bodies in error messages

## Pull requests

- One server or feature per PR
- Include a link to the API documentation you used
- Make sure `npm run build` passes (CI will check this)
- Update the server's README if you add or change tools
