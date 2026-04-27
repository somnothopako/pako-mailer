# Pako Newsletter Mailer

A simple self-hosted newsletter tool for your Pako waitlist — built with Node.js, Express, Nodemailer, and Supabase.

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (from Supabase → Settings → API) |
| `SMTP_HOST` | Your SMTP server (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | Usually `587` (TLS) or `465` (SSL) |
| `SMTP_SECURE` | `true` for port 465, `false` for 587 |
| `SMTP_USER` | Your SMTP login email |
| `SMTP_PASS` | Your SMTP password or App Password |
| `FROM_NAME` | Display name for the sender |
| `FROM_EMAIL` | Sender email address |

### 3. Run the server
```bash
npm start
```

Then open **http://localhost:3000** in your browser.

---

## Features

- **View all waitlist subscribers** from your Supabase database
- **Select specific recipients** or send to everyone
- **Search subscribers** by name or email
- **Write HTML emails** with live preview
- **Personalisation tokens** — `{{first_name}}`, `{{surname}}`, `{{email}}`
- **SMTP connection test** button (top right)

---

## SMTP Providers

### Gmail
- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587`
- Use an [App Password](https://support.google.com/accounts/answer/185833) (not your main password)

### SendGrid
- `SMTP_HOST=smtp.sendgrid.net`
- `SMTP_PORT=587`
- `SMTP_USER=apikey`
- `SMTP_PASS=your-sendgrid-api-key`

### Brevo (formerly Sendinblue)
- `SMTP_HOST=smtp-relay.brevo.com`
- `SMTP_PORT=587`

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/subscribers` | Returns all signups |
| `POST` | `/api/send` | Sends newsletter |
| `POST` | `/api/test-connection` | Verifies SMTP credentials |

### POST /api/send body
```json
{
  "subject": "Your subject line",
  "html": "<h1>Hello {{first_name}}!</h1>",
  "recipientIds": [] 
}
```
> Leave `recipientIds` as an empty array `[]` to send to **everyone**.
