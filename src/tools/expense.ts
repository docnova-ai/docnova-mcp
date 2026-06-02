import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiPost } from "../api-client.js";
import { READ_ONLY } from "../constants.js";
import { getDefaultCompanyId } from "../auth.js";

const dateRange = {
  companyId: z.string().uuid().optional().describe("Company UUID. If omitted, uses your account's default company."),
  from: z.string().describe("Start date YYYY-MM-DD"),
  to: z.string().describe("End date YYYY-MM-DD"),
};

function tool(
  server: McpServer,
  name: string,
  description: string,
  path: (id: string) => string
) {
  server.tool(name, description, dateRange, READ_ONLY, async ({ companyId, from, to }) => {
    try {
      const cid = companyId ?? await getDefaultCompanyId();
      if (!cid) throw new Error("companyId is required but could not be determined from your API key. Please provide it explicitly.");
      const result = await apiPost(path(cid), { from, to });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
    }
  });
}

export function registerExpenseTools(server: McpServer): void {
  tool(server, "expense_overview",
    "Total expense and VAT amounts by currency for a date range.",
    id => `/expense/reports/expense-overview/${id}`);

  tool(server, "expense_monthly",
    "Monthly expense amounts by currency for a date range.",
    id => `/expense/reports/expense-monthly/${id}`);

  tool(server, "expense_vat",
    "Monthly VAT on expenses by currency for a date range.",
    id => `/expense/reports/expense-vat/${id}`);
}
