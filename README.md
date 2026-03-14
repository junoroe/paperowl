# 🦉 PaperOwl

**Digital waivers and document signing made simple.**

PaperOwl is a self-hosted, open-source platform for creating digital waiver forms, collecting signatures, and generating signed PDF documents. Perfect for events, businesses, and organizations that need participants to sign waivers, releases, or consent forms.

## Features

- **Form Builder** — Create custom waiver forms with legal text, intro text, and thank-you pages
- **QR Code Generation** — Generate QR codes for each form so participants can sign on their phones
- **Digital Signatures** — Touch/mouse signature capture with canvas
- **PDF Generation** — Automatic PDF creation of signed documents
- **Email Delivery** — Signed PDFs emailed to signers automatically (via Brevo)
- **Dashboard** — View and manage all forms and submissions
- **Print-Ready** — Submission detail pages with print-optimized layout

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Database:** PostgreSQL
- **Auth:** JWT-based authentication with bcrypt password hashing
- **PDF:** [jsPDF](https://github.com/parallax/jsPDF) for client-side PDF generation
- **QR Codes:** [qrcode](https://github.com/soldair/node-qrcode) library
- **Email:** [Brevo](https://www.brevo.com/) (optional — works without it)
- **Deployment:** Self-hosted (Node.js) or any platform that supports Next.js

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 1. Clone and install

```bash
git clone https://github.com/junoroe/paperowl.git
cd paperowl
npm install
```

### 2. Set up the database

```sql
CREATE DATABASE paperowl;
CREATE USER paperowl WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE paperowl TO paperowl;
```

Then run the schema:

```bash
psql -U paperowl -d paperowl -f schema.sql
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and a strong JWT secret:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paperowl
DB_USER=paperowl
DB_PASSWORD=your_secure_password

JWT_SECRET=your_random_secret_at_least_32_characters

BASE_URL=http://localhost:3000

# Optional: Brevo API key for email delivery
BREVO_API_KEY=
```

### 4. Run

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

Visit `http://localhost:3000` to get started.

## Project Structure

```
paperowl/
├── app/
│   ├── api/
│   │   ├── auth/          # Login, signup, logout endpoints
│   │   ├── forms/          # Form CRUD + QR generation + submissions
│   │   └── public/         # Public form view + submission endpoint
│   ├── dashboard/          # Authenticated dashboard pages
│   ├── login/              # Login page
│   ├── sign/               # Public signing flow
│   └── submissions/        # Submission detail/print view
├── lib/
│   ├── auth.ts             # JWT auth + password hashing + token blacklist
│   ├── db.ts               # PostgreSQL connection pool
│   ├── email.ts            # Brevo email integration
│   ├── pdf.ts              # PDF generation
│   ├── validation.ts       # Input validation + sanitization
│   └── account-lockout.ts  # Brute-force protection
├── middleware.ts            # CORS + security headers
├── public/                 # Static assets
└── .env.example            # Environment variable template
```

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/login` | No | Login (returns JWT) |
| POST | `/api/auth/logout` | Yes | Blacklist token |
| GET | `/api/forms` | Yes | List user's forms |
| POST | `/api/forms` | Yes | Create a form |
| GET | `/api/forms/:id/submissions` | Yes | List form submissions |
| GET | `/api/forms/:id/qr` | Yes | Generate QR code |
| GET | `/api/public/forms/:slug` | No | Get public form data |
| POST | `/api/public/forms/:slug/submit` | No | Submit a signed form |

## Security

PaperOwl includes comprehensive security hardening:

- **Authentication:** bcrypt password hashing, JWT with token blacklist for logout
- **Rate Limiting:** Nginx-level rate limiting on auth and submission endpoints
- **Account Lockout:** 5 failed attempts → 15-minute lockout
- **Input Validation:** Email, password strength, signature size limits
- **CORS:** Origin checking via middleware
- **Security Headers:** HSTS, X-Content-Type-Options, X-Frame-Options, CSP, Referrer-Policy, Permissions-Policy
- **SQL Injection:** Parameterized queries throughout
- **XSS Protection:** React auto-escaping + HTML escaping in email templates

## Deployment

### Production Recommendations

1. **Run as non-root user** — Create a dedicated `paperowl` system user
2. **Use a reverse proxy** — Nginx with SSL (Let's Encrypt)
3. **Set file permissions** — `.env` should be `chmod 600`
4. **Set up backups** — Daily `pg_dump` with retention policy
5. **Enable auto-updates** — `unattended-upgrades` for security patches

### Nginx Example

```nginx
server {
    server_name paperowl.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/paperowl.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/paperowl.example.com/privkey.pem;
}
```

### Systemd Service

```ini
[Unit]
Description=PaperOwl
After=network.target postgresql.service

[Service]
Type=simple
User=paperowl
WorkingDirectory=/opt/paperowl
EnvironmentFile=/opt/paperowl/.env
ExecStart=/usr/bin/node node_modules/.bin/next start -p 3000
Restart=on-failure
NoNewPrivileges=yes
ProtectSystem=strict
ReadWritePaths=/opt/paperowl
PrivateTmp=yes

[Install]
WantedBy=multi-user.target
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

[MIT](LICENSE)
