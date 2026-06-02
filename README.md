# docnova-mcp

MCP server for e-invoice platforms. Connect Claude Code or Claude Desktop to your e-invoice account to query invoices, partners, company data, and financial reports with natural language.

## Installation

No install needed — run directly via npx:

```bash
npx -y docnova-mcp
```

## Configuration

### Claude Code (`~/.claude/settings.json` or project `.claude/settings.json`)

```json
{
  "mcpServers": {
    "einvoice": {
      "command": "npx",
      "args": ["-y", "docnova-mcp"],
      "env": {
        "DOCNOVA_API_KEY": "your-api-key",
        "DOCNOVA_BASE_URL": "https://your-platform-api-url"
      }
    }
  }
}
```

Or via CLI:
```bash
claude mcp add einvoice -- npx -y docnova-mcp
```

### Claude Desktop (`claude_desktop_config.json`)

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "einvoice": {
      "command": "npx",
      "args": ["-y", "docnova-mcp"],
      "env": {
        "DOCNOVA_API_KEY": "your-api-key",
        "DOCNOVA_BASE_URL": "https://your-platform-api-url"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DOCNOVA_API_KEY` | ✅ | — | Your e-invoice platform API key |
| `DOCNOVA_BASE_URL` | — | `https://api-test.docnova.ai` | Your platform's backend API base URL |

## Available Tools

### Invoice
- **`invoice_search`** — Search invoices with filters (date, status, direction, partner name)
- **`invoice_get`** — Get full invoice details by UUID
- **`invoice_get_pdf`** — Get the PDF URL for an invoice
- **`invoice_summary`** — Invoice count and amount summary for a company
- **`invoice_create`** — Create and send a new invoice (UBLDto format)

### Partner
- **`partner_search`** — Search partners by name
- **`partner_get`** — Get partner details by UUID
- **`partner_create`** — Create a new partner

### Company
- **`company_get`** — Get company profile and info
- **`company_stats`** — Monthly invoice totals by currency

### Financial Reports
- **`finance_overview`** — Income/expense/VAT overview totals for a date range
- **`finance_monthly_income_expense`** — Monthly income, expense, and net amounts by currency
- **`finance_ap_ar`** — Monthly accounts receivable and payable with net position
- **`finance_vat`** — Monthly VAT income, VAT expense, and net VAT
- **`finance_outstanding`** — Monthly invoiced vs paid vs outstanding receivables/payables

### Expense Reports
- **`expense_overview`** — Total expense and VAT amounts by currency for a date range
- **`expense_monthly`** — Monthly expense amounts by currency
- **`expense_vat`** — Monthly VAT on expenses by currency

## Development

```bash
git clone https://github.com/docnova-ai/docnova-mcp.git
cd docnova-mcp
npm install
npm run dev          # tsx watch mode
npm run inspect      # MCP Inspector UI
npm run build        # compile to dist/
```

## Authentication

Your API key is exchanged for a short-lived JWT automatically — no manual token management needed.
Get your API key from your platform's portal → Settings → ERP Management → API Keys.
