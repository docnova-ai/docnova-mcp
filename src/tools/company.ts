import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet } from "../api-client.js";

export function registerCompanyTools(server: McpServer): void {
  // --- company_get ---
  server.tool(
    "company_get",
    "Get company information including profile, user count, and credits.",
    {
      companyId: z.string().uuid().describe("Company UUID"),
    },
    async ({ companyId }) => {
      try {
        const result = await apiGet("/company/get-company-info", { compId: companyId });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    }
  );

  // --- company_stats ---
  server.tool(
    "company_stats",
    "Get invoice totals and financial summary for a company.",
    {
      companyId: z.string().uuid().describe("Company UUID"),
    },
    async ({ companyId }) => {
      try {
        const result = await apiGet("/company/invoice-sum", { compId: companyId });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    }
  );
}
