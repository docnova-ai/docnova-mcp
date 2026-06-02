import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet } from "../api-client.js";
import { READ_ONLY } from "../constants.js";
import { getDefaultCompanyId } from "../auth.js";

const COMPANY_ID_FIELD = z.string().uuid().optional().describe("Company UUID. If omitted, uses your account's default company.");

async function resolveCompanyId(provided?: string): Promise<string> {
  const cid = provided ?? await getDefaultCompanyId();
  if (!cid) throw new Error("companyId is required but could not be determined from your API key. Please provide it explicitly.");
  return cid;
}

export function registerCompanyTools(server: McpServer): void {
  server.tool(
    "company_get",
    "Get company information including profile, user count, and credits.",
    {
      companyId: COMPANY_ID_FIELD,
    },
    READ_ONLY,
    async ({ companyId }) => {
      try {
        const cid = await resolveCompanyId(companyId);
        const result = await apiGet("/company/get-company-info", { compId: cid });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    }
  );

  server.tool(
    "company_stats",
    "Get monthly invoice totals and financial summary for a company.",
    {
      companyId: COMPANY_ID_FIELD,
    },
    READ_ONLY,
    async ({ companyId }) => {
      try {
        const cid = await resolveCompanyId(companyId);
        const result = await apiGet("/company/invoice-sum", { compId: cid });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    }
  );
}
