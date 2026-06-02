import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost } from "../api-client.js";
import { READ_ONLY, WRITE_OP } from "../constants.js";
import { getDefaultCompanyId } from "../auth.js";

const COMPANY_ID_FIELD = z.string().uuid().optional().describe("Company UUID. If omitted, uses your account's default company.");

async function resolveCompanyId(provided?: string): Promise<string> {
  const cid = provided ?? await getDefaultCompanyId();
  if (!cid) throw new Error("companyId is required but could not be determined from your API key. Please provide it explicitly.");
  return cid;
}

export function registerPartnerTools(server: McpServer): void {
  server.tool(
    "partner_search",
    "Search partners (customers/suppliers) for a company by name.",
    {
      companyId: COMPANY_ID_FIELD,
      partnerName: z.string().optional().describe("Filter by partner name"),
      page: z.number().int().min(0).default(0).describe("Page number"),
      size: z.number().int().min(1).max(100).default(20).describe("Page size"),
    },
    READ_ONLY,
    async ({ companyId, partnerName, page, size }) => {
      try {
        const cid = await resolveCompanyId(companyId);
        const params: Record<string, string> = { page: String(page), size: String(size) };
        if (partnerName) params.partnerName = partnerName;
        const result = await apiGet(`/partner/list-by-company/${cid}`, params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    }
  );

  server.tool(
    "partner_get",
    "Get full details of a single partner by UUID.",
    {
      partnerId: z.string().uuid().describe("Partner UUID"),
    },
    READ_ONLY,
    async ({ partnerId }) => {
      try {
        const result = await apiGet(`/partner/get/${partnerId}`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    }
  );

  server.tool(
    "partner_create",
    "Create a new partner for a company. Provide a PartnerDto JSON object with AccountingCustomerParty.",
    {
      companyId: COMPANY_ID_FIELD,
      partnerDto: z.record(z.unknown()).describe("PartnerDto JSON object including AccountingCustomerParty"),
    },
    WRITE_OP,
    async ({ companyId, partnerDto }) => {
      try {
        const cid = await resolveCompanyId(companyId);
        const result = await apiPost(`/partner/save/${cid}`, partnerDto);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    }
  );
}
