import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost, apiPostMultipart } from "../api-client.js";
import { CHARACTER_LIMIT, READ_ONLY, WRITE_OP } from "../constants.js";
import { getDefaultCompanyId } from "../auth.js";

const COMPANY_ID_FIELD = z.string().uuid().optional().describe("Company UUID. If omitted, uses your account's default company.");

async function resolveCompanyId(provided?: string): Promise<string> {
  const cid = provided ?? await getDefaultCompanyId();
  if (!cid) throw new Error("companyId is required but could not be determined from your API key. Please provide it explicitly.");
  return cid;
}

export function registerInvoiceTools(server: McpServer): void {
  server.tool(
    "invoice_search",
    "Search invoices with filters. Returns paged results including invoice list and currency totals.",
    {
      companyId: COMPANY_ID_FIELD,
      documentType: z.enum(["INCOMING", "OUTGOING"]).optional().describe("Filter by direction"),
      status: z.string().optional().describe("Invoice status (e.g. APPROVED, REJECTED, PENDING)"),
      startDate: z.string().optional().describe("Issue date start, YYYY-MM-DD"),
      endDate: z.string().optional().describe("Issue date end, YYYY-MM-DD"),
      partnerName: z.string().optional().describe("Filter by supplier or customer name"),
      page: z.number().int().min(0).default(0).describe("Page number (0-based)"),
      size: z.number().int().min(1).max(100).default(20).describe("Page size"),
    },
    READ_ONLY,
    async (args) => {
      try {
        const companyId = await resolveCompanyId(args.companyId);
        const result = await apiPost("/invoice/search", {
          companyId,
          documentType: args.documentType,
          status: args.status,
          startDate: args.startDate,
          endDate: args.endDate,
          partnerName: args.partnerName,
          page: args.page,
          size: args.size,
        });
        let text = JSON.stringify(result, null, 2);
        if (text.length > CHARACTER_LIMIT) {
          const r = result as Record<string, unknown>;
          text = JSON.stringify({ ...r, invoices: { truncated: true, message: `Response too large. Use smaller 'size' or add filters.` } }, null, 2);
        }
        return { content: [{ type: "text", text }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    }
  );

  server.tool(
    "invoice_get",
    "Get full details of a single invoice by its UUID.",
    {
      invoiceId: z.string().uuid().describe("Invoice UUID"),
    },
    READ_ONLY,
    async ({ invoiceId }) => {
      try {
        const result = await apiGet(`/invoice/get-invoice/${invoiceId}`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    }
  );

  server.tool(
    "invoice_get_pdf",
    "Get the PDF download URL for an invoice. Returns the direct URL that requires R-Auth header.",
    {
      invoiceId: z.string().uuid().describe("Invoice UUID"),
    },
    READ_ONLY,
    async ({ invoiceId }) => {
      try {
        const url = `https://api.docnova.ai/invoice/pdf/${invoiceId}`;
        return {
          content: [{
            type: "text",
            text: `PDF URL (requires R-Auth header): ${url}\n\nDownload with: GET ${url}?useGeneratedPdf=false`,
          }],
        };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    }
  );

  server.tool(
    "invoice_summary",
    "Get invoice count and amount summary for a company.",
    {
      companyId: COMPANY_ID_FIELD,
    },
    READ_ONLY,
    async ({ companyId }) => {
      try {
        const cid = await resolveCompanyId(companyId);
        const result = await apiGet(`/invoice/summary/${cid}`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    }
  );

  server.tool(
    "invoice_create",
    "Create and send a new invoice via Peppol/portal. Provide a UBLDto JSON object with CompanyId field.",
    {
      ublDto: z.record(z.unknown()).describe("UBLDto object as JSON. Must include CompanyId field."),
      embedPdf: z.boolean().default(false).describe("Embed PDF in the UBL"),
    },
    WRITE_OP,
    async ({ ublDto, embedPdf }) => {
      try {
        const result = await apiPostMultipart(
          "/invoice/send-portal-new",
          ublDto,
          { embedPdf: String(embedPdf) }
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    }
  );
}
