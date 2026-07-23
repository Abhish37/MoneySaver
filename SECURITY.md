# Security Policy

## Overview

The MoneySaver team takes the security of our platform and our users' data extremely seriously. We appreciate the efforts of security researchers and the community in helping us maintain a safe and trustworthy product. This document outlines our security practices, supported versions, and the process for responsibly disclosing vulnerabilities.

---

## 🛡️ Supported Versions

Only the latest released version receives active security patches. Older versions are not supported and users are encouraged to upgrade immediately.

| Version | Supported |
|---------|-----------|
| `0.1.x-alpha` (latest) | ✅ Active support |
| < `0.1.0` | ❌ Not supported |

> As MoneySaver matures beyond v1.0, a more formal long-term support (LTS) policy will be introduced.

---

## 📣 How to Report a Vulnerability

**⚠️ Please do NOT report security vulnerabilities via GitHub Issues, public discussions, or social media.** Public disclosure of a security issue before it is patched puts all users at risk.

### Reporting Channel

Report vulnerabilities directly and privately via email:

**📧 security@moneysaver.in**

Please use the subject line format:
```
[SECURITY] <Brief description of the vulnerability>
```

### Response SLA

| Stage | Timeline |
|-------|----------|
| **Acknowledgement** | Within **48 hours** of receiving your report |
| **Initial Assessment** | Within **5 business days** |
| **Patch Development** | Dependent on severity (see below) |
| **Public Disclosure** | Within **90 days** of initial report (coordinated) |

### Severity-Based Patch Timeline

| Severity | CVSS Score | Target Patch Time |
|----------|-----------|-------------------|
| Critical | 9.0–10.0 | Within 24–72 hours |
| High | 7.0–8.9 | Within 7 days |
| Medium | 4.0–6.9 | Within 30 days |
| Low | 0.1–3.9 | Next scheduled release |

---

## 📋 What to Include in Your Report

To help us triage and resolve the issue as quickly as possible, please include:

1. **Vulnerability Type** — e.g., SQL Injection, XSS, IDOR, SSRF, Authentication Bypass
2. **Affected Component** — specific module, endpoint, or feature (e.g., `/api/ocr/upload`, Card Optimizer)
3. **Steps to Reproduce** — a clear, numbered list of steps to reliably reproduce the issue
4. **Proof of Concept** — code, screenshots, or a recorded video demonstrating the vulnerability (do not exploit beyond what is necessary to prove the issue)
5. **Impact Assessment** — your assessment of the potential impact (data exposure, privilege escalation, etc.)
6. **Environment Details** — OS, browser, API client, version of the app tested
7. **Your Contact Information** — for follow-up questions and credit acknowledgement

---

## 🗓️ Coordinated Disclosure Timeline

We follow a **responsible / coordinated disclosure** model:

```
Day 0   → You report the vulnerability to security@moneysaver.in
Day 1–2 → We acknowledge receipt (within 48 hours)
Day 2–5 → We perform an initial triage and assess severity
Day 5+  → We develop and test a patch
Day X   → Patch is released (timeline depends on severity)
Day 90  → Public disclosure (coordinated with you, or we disclose if no response)
```

We will keep you informed at each stage of the process and will credit you in our security advisory (unless you prefer to remain anonymous).

If we cannot reproduce the issue or disagree with the severity assessment, we will communicate this transparently. We ask that you give us a reasonable opportunity to respond before escalating to public disclosure.

---

## 🔒 Security Practices

MoneySaver is built with security as a first-class concern. The following practices are enforced throughout development:

### Authentication & Authorization

- **JWT Tokens**: Access tokens are short-lived (e.g., 15 minutes). Refresh tokens are long-lived and stored securely in httpOnly, Secure, SameSite cookies — never in localStorage.
- **Password Hashing**: All user passwords are hashed using **bcrypt** or **argon2** with a strong work factor. Plaintext passwords are never stored, logged, or transmitted.
- **Role-Based Access Control (RBAC)**: All API endpoints enforce authorization checks server-side.

### Transport Security

- **HTTPS Only**: All production traffic is served exclusively over HTTPS. HTTP is redirected to HTTPS with an HTTP 301 redirect.
- **HSTS**: HTTP Strict Transport Security headers are enforced with a long `max-age`.

### Input Validation & Injection Prevention

- **Parameterized Queries / ORM**: All database queries use parameterized statements or a trusted ORM to prevent SQL Injection.
- **Input Sanitization**: All user-supplied input is validated and sanitized on the server side before use.
- **Content Security Policy (CSP)**: Strict CSP headers are set to mitigate XSS attacks.

### Rate Limiting & Abuse Prevention

- **API Rate Limiting**: All public-facing API endpoints are rate-limited per IP address and per authenticated user to prevent brute force and denial-of-service attacks.
- **Account Lockout**: Repeated failed login attempts trigger a temporary lockout with exponential backoff.

### Secrets Management

- **Environment Variables**: All secrets (API keys, database credentials, JWT secrets) are stored in environment variables and never hardcoded in source code.
- **`.env` files are gitignored**: The `.env` file is listed in `.gitignore`. Only `.env.example` (with blank values) is committed to the repository.

### OWASP Top 10 Awareness

Development and code review processes include a checklist for the [OWASP Top 10](https://owasp.org/www-project-top-ten/) vulnerabilities. A full OWASP audit is planned before the v1.0 production launch.

### Third-Party Dependencies

- Dependencies are audited regularly using `npm audit` / `pip audit`.
- Dependabot alerts are enabled for automated vulnerability notifications.
- Unused dependencies are removed to reduce the attack surface.

### Data Privacy

- MoneySaver does **not** store third-party account credentials (e.g., Amazon, Flipkart passwords). Only affiliate redirect links and user-submitted coupon codes are stored.
- Minimal PII (Personally Identifiable Information) is collected — only what is strictly necessary for the service to function.

---

## 🏅 Recognition

We deeply value the work of security researchers. Researchers who responsibly disclose valid vulnerabilities will be:

- Acknowledged in our **Security Hall of Fame** (with your permission)
- Credited in the relevant **Security Advisory**
- Considered for a **bug bounty reward** (formal bug bounty program to be announced post-v1.0)

---

*Thank you for helping keep MoneySaver and our users safe.*
