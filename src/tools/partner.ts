import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost } from "../api-client.js";

export function registerPartnerTools(server: McpServer): void {
  // --- partner_search ---
  server.tool(
    "partner_search",
    "Search partners (customers/suppliers) for a company by name.",
    {
      companyId: z.string().uuid().describe("Company UUID"),
      partnerName: z.string().optional().describe("Filter by partner name"),
      page: z.number().int().min(0).default(0).describe("Page number"),
      size: z.number().int().min(1).max(100).default(20).describe("Page size"),
    },
    async ({ companyId, partnerName, page, size }) => {
      try {
        const params: Record<string, string> = {
          page: String(page),
          size: String(size),
        };
        if (partnerName) params.partnerName = partnerName;
        const result = await apiGet(`/partner/list-by-company/${companyId}`, params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    }
  );

  // --- partner_get ---
  server.tool(
    "partner_get",
    "Get full details of a single partner by UUID.",
    {
      partnerId: z.string().uuid().describe("Partner UUID"),
    },
    async ({ partnerId }) => {
      try {
        const result = await apiGet(`/partner/get/${partnerId}`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    }
  );

  // --- partner_create ---
  server.tool(
    "partner_create",
    "Create a new partner for a company. Provide a PartnerDto JSON object with AccountingCustomerParty.",
    {
      companyId: z.string().uuid().describe("Company UUID to attach the partner to"),
      partnerDto: z.record(z.unknown()).describe("PartnerDto JSON object including AccountingCustomerParty"),
    },
    async ({ companyId, partnerDto }) => {
      try {
        const result = await apiPost(`/partner/save/${companyId}`, partnerDto);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    }
  );
}
