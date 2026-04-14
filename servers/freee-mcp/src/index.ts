#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const FREEE_API_BASE = "https://api.freee.co.jp/api/1";

function getToken(): string {
  const token = process.env.FREEE_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "FREEE_ACCESS_TOKEN not set. Get one at https://developer.freee.co.jp/"
    );
  }
  return token;
}

function getCompanyId(): string {
  const id = process.env.FREEE_COMPANY_ID;
  if (!id) {
    throw new Error(
      "FREEE_COMPANY_ID not set. Find it in your freee account settings."
    );
  }
  if (Number.isNaN(Number(id))) {
    throw new Error("FREEE_COMPANY_ID must be a numeric value.");
  }
  return id;
}

async function freeeRequest(
  path: string,
  options: RequestInit = {}
): Promise<unknown> {
  const token = getToken();
  const url = `${FREEE_API_BASE}${path}`;
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
    // Consume body but don't expose raw API details in error messages
    await res.text();
    throw new Error(`freee API error (HTTP ${status}) on ${path}`);
  }

  const text = await res.text();
  if (!text) return { success: true };
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`freee API returned malformed JSON on ${path}`);
  }
}

const server = new McpServer({
  name: "freee-mcp",
  version: "0.1.0",
});

// --- Tools ---

server.tool(
  "list_deals",
  "List recent transactions/deals (収支) from freee",
  {
    type: z
      .enum(["income", "expense"])
      .optional()
      .describe("Filter by type: income (収入) or expense (支出)"),
    startDate: z
      .string()
      .optional()
      .describe("Start date (YYYY-MM-DD)"),
    endDate: z.string().optional().describe("End date (YYYY-MM-DD)"),
    limit: z.number().min(1).max(100).default(20).describe("Number of results"),
    offset: z.number().default(0).describe("Offset for pagination"),
  },
  async ({ type, startDate, endDate, limit, offset }) => {
    const companyId = getCompanyId();
    const params = new URLSearchParams({
      company_id: companyId,
      limit: String(limit),
      offset: String(offset),
    });
    if (type) params.set("type", type);
    if (startDate) params.set("start_issue_date", startDate);
    if (endDate) params.set("end_issue_date", endDate);

    const data = (await freeeRequest(
      `/deals?${params}`
    )) as { deals: Array<Record<string, unknown>> };

    return {
      content: [
        { type: "text", text: JSON.stringify(data.deals, null, 2) },
      ],
    };
  }
);

server.tool(
  "create_deal",
  "Create a new transaction/deal in freee (e.g., record an expense or income)",
  {
    type: z.enum(["income", "expense"]).describe("income (収入) or expense (支出)"),
    issueDate: z.string().describe("Transaction date (YYYY-MM-DD)"),
    dueDate: z.string().optional().describe("Due date (YYYY-MM-DD)"),
    partnerName: z.string().optional().describe("Trading partner name (取引先)"),
    amount: z.number().positive().describe("Amount in yen"),
    accountItemId: z.number().describe("Account item ID (勘定科目)"),
    taxCode: z.number().default(1).describe("Tax code (税区分)"),
    description: z.string().optional().describe("Description / memo"),
    payments: z
      .array(
        z.object({
          amount: z.number().positive().describe("Payment amount in yen"),
          fromWalletableType: z
            .enum(["wallet", "bank_account", "credit_card", "private_account_item"])
            .describe("Payment source type (wallet=現金, bank_account=銀行口座, credit_card=クレジットカード)"),
          fromWalletableId: z.number().describe("ID of the payment source (wallet, bank account, etc.)"),
          date: z.string().describe("Payment date (YYYY-MM-DD)"),
        })
      )
      .optional()
      .describe("Payment details. Omit for unsettled transactions (未決済). Include for settled transactions (cash, bank transfer, etc.)"),
  },
  async ({ type, issueDate, dueDate, partnerName, amount, accountItemId, taxCode, description, payments }) => {
    const companyId = getCompanyId();
    const body: Record<string, unknown> = {
      company_id: Number(companyId),
      issue_date: issueDate,
      type,
      details: [
        {
          account_item_id: accountItemId,
          tax_code: taxCode,
          amount,
          description: description || "",
        },
      ],
    };
    if (dueDate) body.due_date = dueDate;
    if (partnerName) body.partner_name = partnerName;
    if (payments) {
      body.payments = payments.map((p) => ({
        amount: p.amount,
        from_walletable_type: p.fromWalletableType,
        from_walletable_id: p.fromWalletableId,
        date: p.date,
      }));
    }

    const data = await freeeRequest("/deals", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

// NOTE: list_invoices and create_invoice were removed.
// freee abolished POST /api/1/invoices in October 2023 and
// GET /api/1/invoices in January 2025. Invoice management has
// moved to the separate freee Invoice API (https://developer.freee.co.jp/reference/iv).
// See the migration guide: https://developer.freee.co.jp/guideline/content-rel/invoice-transition-guide

server.tool(
  "list_account_items",
  "List account categories (勘定科目) from freee. Useful for knowing which account to assign transactions to",
  {},
  async () => {
    const companyId = getCompanyId();
    const data = (await freeeRequest(
      `/account_items?company_id=${encodeURIComponent(companyId)}`
    )) as { account_items: Array<Record<string, unknown>> };

    const items = data.account_items.map((item) => ({
      id: item.id,
      name: item.name,
      shortcut: item.shortcut,
      categories: item.categories,
    }));

    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
    };
  }
);

server.tool(
  "list_partners",
  "List trading partners (取引先) registered in freee",
  {
    keyword: z.string().optional().describe("Search by partner name"),
    limit: z.number().min(1).max(100).default(50).describe("Number of results"),
  },
  async ({ keyword, limit }) => {
    const companyId = getCompanyId();
    const params = new URLSearchParams({
      company_id: companyId,
      limit: String(limit),
    });
    if (keyword) params.set("keyword", keyword);

    const data = (await freeeRequest(
      `/partners?${params}`
    )) as { partners: Array<Record<string, unknown>> };

    return {
      content: [
        { type: "text", text: JSON.stringify(data.partners, null, 2) },
      ],
    };
  }
);

server.tool(
  "get_trial_balance",
  "Get the trial balance sheet (試算表) for a given period",
  {
    fiscalYear: z.number().describe("Fiscal year"),
    startMonth: z.number().min(1).max(12).optional().describe("Start month"),
    endMonth: z.number().min(1).max(12).optional().describe("End month"),
  },
  async ({ fiscalYear, startMonth, endMonth }) => {
    const companyId = getCompanyId();
    const params = new URLSearchParams({
      company_id: companyId,
      fiscal_year: String(fiscalYear),
    });
    if (startMonth) params.set("start_month", String(startMonth));
    if (endMonth) params.set("end_month", String(endMonth));

    const data = await freeeRequest(
      `/reports/trial_bs?${params}`
    );

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

server.tool(
  "get_profit_and_loss",
  "Get the profit and loss statement (損益計算書)",
  {
    fiscalYear: z.number().describe("Fiscal year"),
    startMonth: z.number().min(1).max(12).optional().describe("Start month"),
    endMonth: z.number().min(1).max(12).optional().describe("End month"),
  },
  async ({ fiscalYear, startMonth, endMonth }) => {
    const companyId = getCompanyId();
    const params = new URLSearchParams({
      company_id: companyId,
      fiscal_year: String(fiscalYear),
    });
    if (startMonth) params.set("start_month", String(startMonth));
    if (endMonth) params.set("end_month", String(endMonth));

    const data = await freeeRequest(
      `/reports/trial_pl?${params}`
    );

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

server.tool(
  "get_company_info",
  "Get basic company information from freee",
  {},
  async () => {
    const companyId = getCompanyId();
    const data = await freeeRequest(`/companies/${encodeURIComponent(companyId)}`);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

// --- Prompts ---

server.prompt(
  "record_expense",
  "Record an expense transaction in freee",
  {
    description: z.string().describe("What the expense was for"),
    amount: z.string().describe("Amount in yen"),
    date: z.string().describe("Date (YYYY-MM-DD)"),
  },
  ({ description, amount, date }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Record an expense in freee: ¥${amount} for "${description}" on ${date}`,
        },
      },
    ],
  })
);

server.prompt(
  "monthly_report",
  "Get a profit and loss report for a specific month",
  {
    year: z.string().describe("Fiscal year"),
    month: z.string().describe("Month number (1-12)"),
  },
  ({ year, month }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Show me the freee profit and loss report for ${year}/${month}`,
        },
      },
    ],
  })
);

server.prompt(
  "recent_transactions",
  "List recent transactions from freee",
  {
    type: z.enum(["income", "expense", "all"]).describe("Transaction type"),
    days: z.string().default("30").describe("How many days back to look"),
  },
  ({ type, days }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: type === "all"
            ? `Show me all freee transactions from the last ${days} days`
            : `Show me ${type} transactions from freee for the last ${days} days`,
        },
      },
    ],
  })
);

server.prompt(
  "trial_balance",
  "Get the trial balance sheet for a fiscal year",
  {
    year: z.string().describe("Fiscal year"),
  },
  ({ year }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Show me the freee trial balance for fiscal year ${year}`,
        },
      },
    ],
  })
);

server.prompt(
  "find_partner",
  "Search for a trading partner in freee",
  {
    name: z.string().describe("Partner name to search for"),
  },
  ({ name }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Search freee for a trading partner named "${name}"`,
        },
      },
    ],
  })
);

// --- Resources ---

server.resource(
  "account-items",
  "freee://account-items",
  async (uri) => {
    const companyId = getCompanyId();
    const data = await freeeRequest(
      `/account_items?company_id=${encodeURIComponent(companyId)}`
    );
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// --- Start ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("freee MCP server running on stdio");
  if (!process.env.FREEE_ACCESS_TOKEN || !process.env.FREEE_COMPANY_ID) {
    console.error("Warning: FREEE_ACCESS_TOKEN and/or FREEE_COMPANY_ID not set. Tools will fail until configured. Get your credentials at https://developer.freee.co.jp/");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
