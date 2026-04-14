#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const LINE_API_BASE = "https://api.line.me/v2";

function getToken(): string {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "LINE_CHANNEL_ACCESS_TOKEN environment variable is required. " +
        "Get one at https://developers.line.biz/console/"
    );
  }
  return token;
}

async function lineRequest(
  path: string,
  options: RequestInit = {}
): Promise<unknown> {
  const token = getToken();
  const url = path.startsWith("http") ? path : `${LINE_API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const status = res.status;
    await res.text();
    throw new Error(`LINE API error (HTTP ${status}) on ${path}`);
  }

  const text = await res.text();
  if (!text) return { success: true };
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`LINE API returned malformed JSON on ${path}`);
  }
}

const server = new McpServer({
  name: "line-mcp",
  version: "0.1.0",
});

// --- Tools ---

server.tool(
  "send_push_message",
  "Send a push message to a LINE user or group",
  {
    to: z.string().min(1).describe("User ID, group ID, or room ID"),
    text: z.string().describe("Message text to send"),
  },
  async ({ to, text }) => {
    await lineRequest("/bot/message/push", {
      method: "POST",
      body: JSON.stringify({
        to,
        messages: [{ type: "text", text }],
      }),
    });
    return { content: [{ type: "text", text: `Message sent to ${to}` }] };
  }
);

server.tool(
  "send_multicast_message",
  "Send a message to multiple LINE users at once",
  {
    userIds: z.array(z.string()).min(1).max(500).describe("Array of user IDs (max 500)"),
    text: z.string().describe("Message text to send"),
  },
  async ({ userIds, text }) => {
    await lineRequest("/bot/message/multicast", {
      method: "POST",
      body: JSON.stringify({
        to: userIds,
        messages: [{ type: "text", text }],
      }),
    });
    return {
      content: [
        {
          type: "text",
          text: `Message sent to ${userIds.length} users`,
        },
      ],
    };
  }
);

server.tool(
  "send_broadcast_message",
  "Broadcast a message to all friends of your LINE Official Account",
  {
    text: z.string().describe("Message text to broadcast"),
  },
  async ({ text }) => {
    await lineRequest("/bot/message/broadcast", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ type: "text", text }],
      }),
    });
    return { content: [{ type: "text", text: "Broadcast message sent" }] };
  }
);

server.tool(
  "get_profile",
  "Get a LINE user's profile (display name, picture, status message)",
  {
    userId: z.string().min(1).describe("LINE user ID"),
  },
  async ({ userId }) => {
    const profile = await lineRequest(`/bot/profile/${encodeURIComponent(userId)}`);
    return {
      content: [{ type: "text", text: JSON.stringify(profile, null, 2) }],
    };
  }
);

server.tool(
  "get_group_summary",
  "Get summary info about a LINE group",
  {
    groupId: z.string().min(1).describe("LINE group ID"),
  },
  async ({ groupId }) => {
    const summary = await lineRequest(`/bot/group/${encodeURIComponent(groupId)}/summary`);
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
    };
  }
);

server.tool(
  "get_group_members",
  "List members of a LINE group (automatically paginates through all members)",
  {
    groupId: z.string().min(1).describe("LINE group ID"),
  },
  async ({ groupId }) => {
    const allMemberIds: string[] = [];
    let nextToken: string | undefined;

    do {
      const params = nextToken ? `?start=${encodeURIComponent(nextToken)}` : "";
      const page = (await lineRequest(
        `/bot/group/${encodeURIComponent(groupId)}/members/ids${params}`
      )) as { memberIds?: string[]; next?: string };

      if (page.memberIds) allMemberIds.push(...page.memberIds);
      nextToken = page.next;
    } while (nextToken);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { memberIds: allMemberIds, totalCount: allMemberIds.length },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "get_message_quota",
  "Check your LINE messaging quota and consumption",
  {},
  async () => {
    const [quota, consumption] = await Promise.all([
      lineRequest("/bot/message/quota"),
      lineRequest("/bot/message/quota/consumption"),
    ]);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ quota, consumption }, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "get_bot_info",
  "Get your LINE bot's basic information",
  {},
  async () => {
    const info = await lineRequest("/bot/info");
    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
    };
  }
);

server.tool(
  "get_followers_count",
  "Get the number of followers for a specific date",
  {
    date: z
      .string()
      .regex(/^\d{8}$/, "Must be YYYYMMDD format (e.g., 20260330)")
      .refine((d) => {
        const y = +d.slice(0, 4), m = +d.slice(4, 6) - 1, day = +d.slice(6, 8);
        const dt = new Date(y, m, day);
        return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === day;
      }, "Invalid date")
      .describe("Date in YYYYMMDD format (e.g., 20260330)"),
  },
  async ({ date }) => {
    const count = await lineRequest(
      `/bot/insight/followers?date=${date}`
    );
    return {
      content: [{ type: "text", text: JSON.stringify(count, null, 2) }],
    };
  }
);

server.tool(
  "get_message_delivery_stats",
  "Get message delivery statistics for a specific date",
  {
    date: z
      .string()
      .regex(/^\d{8}$/, "Must be YYYYMMDD format (e.g., 20260330)")
      .refine((d) => {
        const y = +d.slice(0, 4), m = +d.slice(4, 6) - 1, day = +d.slice(6, 8);
        const dt = new Date(y, m, day);
        return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === day;
      }, "Invalid date")
      .describe("Date in YYYYMMDD format (e.g., 20260330)"),
  },
  async ({ date }) => {
    const stats = await lineRequest(
      `/bot/insight/message/delivery?date=${date}`
    );
    return {
      content: [{ type: "text", text: JSON.stringify(stats, null, 2) }],
    };
  }
);

server.tool(
  "create_rich_menu",
  "Create a rich menu for your LINE bot (the menu that appears at the bottom of chats)",
  {
    name: z.string().describe("Rich menu name (not shown to users)"),
    chatBarText: z.string().describe("Text shown on the menu bar"),
    areas: z
      .array(
        z.object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
          actionType: z.enum(["message", "uri", "postback"]),
          actionData: z.string().describe("Message text, URI, or postback data"),
        })
      )
      .describe("Tappable areas with actions"),
  },
  async ({ name, chatBarText, areas }) => {
    const richMenu = await lineRequest("/bot/richmenu", {
      method: "POST",
      body: JSON.stringify({
        size: { width: 2500, height: 1686 },
        selected: false,
        name,
        chatBarText,
        areas: areas.map((a) => ({
          bounds: { x: a.x, y: a.y, width: a.width, height: a.height },
          action:
            a.actionType === "uri"
              ? { type: "uri", uri: a.actionData }
              : a.actionType === "postback"
                ? { type: "postback", data: a.actionData }
                : { type: "message", text: a.actionData },
        })),
      }),
    });
    return {
      content: [{ type: "text", text: JSON.stringify(richMenu, null, 2) }],
    };
  }
);

// --- Prompts ---

server.prompt(
  "send_message",
  "Send a message to a LINE user or group",
  {
    to: z.string().describe("User ID or group ID"),
    message: z.string().describe("Message to send"),
  },
  ({ to, message }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Send this message on LINE to ${to}: "${message}"`,
        },
      },
    ],
  })
);

server.prompt(
  "broadcast_announcement",
  "Broadcast an announcement to all LINE followers",
  {
    message: z.string().describe("Announcement text"),
  },
  ({ message }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Broadcast this announcement to all LINE followers: "${message}"`,
        },
      },
    ],
  })
);

server.prompt(
  "check_delivery_stats",
  "Check LINE message delivery statistics for a date",
  {
    date: z.string().describe("Date in YYYYMMDD format"),
  },
  ({ date }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Show me the LINE message delivery stats for ${date}`,
        },
      },
    ],
  })
);

server.prompt(
  "group_members",
  "List all members of a LINE group",
  {
    groupId: z.string().describe("LINE group ID"),
  },
  ({ groupId }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `List all members in LINE group ${groupId}`,
        },
      },
    ],
  })
);

server.prompt(
  "check_quota",
  "Check remaining LINE messaging quota",
  {},
  () => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: "How many LINE messages can I still send this month? Check my quota and consumption.",
        },
      },
    ],
  })
);

// --- Resources ---

server.resource("bot-info", "line://bot-info", async (uri) => {
  const info = await lineRequest("/bot/info");
  return {
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(info, null, 2),
      },
    ],
  };
});

// --- Start ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("LINE MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
