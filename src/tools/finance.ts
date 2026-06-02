import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiPost } from "../api-client.js";
import { READ_ONLY } from "../constants.js";

const dateRange = {
  companyId: z.string().uuid().describe("Company UUID"),
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
      const result = await apiPost(path(companyId), { from, to });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
    }
  });
}

export function registerFinanceTools(server: McpServer): void {
  tool(server, "finance_overview",
    "Income/expense/VAT overview totals by currency for a date range.",
    id => `/invoice/payment/statistics/overview/${id}`);

  tool(server, "finance_monthly_income_expense",
    "Monthly income, expense, and net amounts by currency for a date range.",
    id => `/invoice/payment/statistics/monthly-income-expense/${id}`);

  tool(server, "finance_ap_ar",
    "Monthly accounts receivable and payable breakdown with net position.",
    id => `/invoice/payment/statistics/ap-ar/${id}`);

  tool(server, "finance_vat",
    "Monthly VAT income, VAT expense, and net VAT by currency.",
    id => `/invoice/payment/statistics/vat/${id}`);

  tool(server, "finance_outstanding",
    "Monthly invoiced vs paid vs outstanding receivables and payables.",
    id => `/invoice/payment/statistics/income-expense-outstanding/${id}`);
}
