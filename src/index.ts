#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerInvoiceTools } from "./tools/invoice.js";
import { registerPartnerTools } from "./tools/partner.js";
import { registerCompanyTools } from "./tools/company.js";
import { registerFinanceTools } from "./tools/finance.js";
import { registerExpenseTools } from "./tools/expense.js";

// Fail fast — no API key, no start
if (!process.env.DOCNOVA_API_KEY) {
  console.error("[docnova-mcp] FATAL: DOCNOVA_API_KEY environment variable is required.");
  process.exit(1);
}

const server = new McpServer({
  name: "docnova-mcp",
  version: "0.1.0",
});

registerInvoiceTools(server);
registerPartnerTools(server);
registerCompanyTools(server);
registerFinanceTools(server);
registerExpenseTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[docnova-mcp] ready");
}

main().catch((err) => {
  console.error("[docnova-mcp] Fatal:", err);
  process.exit(1);
});
