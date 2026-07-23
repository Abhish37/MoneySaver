# Contributing to MoneySaver

First off, thank you for considering contributing to MoneySaver! Your time and effort help make this platform better for millions of Indian shoppers. 🎉

Please read this guide carefully before opening issues, submitting pull requests, or participating in discussions.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How to Report a Bug](#how-to-report-a-bug)
3. [How to Request a Feature](#how-to-request-a-feature)
4. [Development Environment Setup](#development-environment-setup)
5. [Git Branch Naming Conventions](#git-branch-naming-conventions)
6. [Commit Message Format](#commit-message-format)
7. [Pull Request Process](#pull-request-process)
8. [Code Review Process](#code-review-process)
9. [Style Guidelines](#style-guidelines)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by the [MoneySaver Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to abide by its terms. Please report unacceptable behavior to **conduct@moneysaver.in**.

---

## 🐛 How to Report a Bug

We use [GitHub Issues](https://github.com/your-org/money-saver/issues) to track bugs. Before opening a new issue, please:

1. **Search existing issues** to ensure the bug has not already been reported.
2. If no existing issue covers your bug, [open a new issue](https://github.com/your-org/money-saver/issues/new?template=bug_report.md).

### A good bug report includes:

- A **clear and descriptive title** (e.g., `OCR parser fails to detect PhonePe reward screenshot on Android 14`)
- **Steps to reproduce** the bug, as specifically as possible
- **Expected behavior** — what you expected to happen
- **Actual behavior** — what actually happened
- **Screenshots or logs** (if applicable)
- **Environment details**: OS, browser/app version, device type
- Any **additional context** that may help

> ⚠️ **Security vulnerabilities must NOT be reported via GitHub Issues.** Please follow our [Security Policy](./SECURITY.md) and email **security@moneysaver.in** instead.

---

## 💡 How to Request a Feature

Feature requests are welcome! To submit a feature request:

1. **Search existing issues** tagged `enhancement` to see if it has already been requested.
2. If not, [open a new issue](https://github.com/your-org/money-saver/issues/new?template=feature_request.md) with the label `enhancement`.

### A good feature request includes:

- A **clear title** describing the feature
- **The problem it solves** — describe what user pain point this addresses
- **Proposed solution** — how you imagine it working
- **Alternatives considered** — any other solutions you evaluated
- **Additional context** — mockups, references, examples

Feature requests are reviewed during sprint planning. High-impact, well-defined requests are prioritized.

---

## 🛠️ Development Environment Setup

> ⚠️ The tech stack is pending finalization in the TRD. This section will be updated once Document 02 is complete. Below is the anticipated setup.

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (or **pnpm** / **yarn** as specified in TRD)
- **Git** ≥ 2.40
- **Docker** (for local database and Redis instances)
- A code editor — **VS Code** is recommended

### Setup Steps

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/money-saver.git
cd money-saver

# 2. Add the upstream remote
git remote add upstream https://github.com/your-org/money-saver.git

# 3. Install frontend dependencies
cd frontend && npm install

# 4. Install backend dependencies
cd ../backend && npm install

# 5. Set up environment variables
cp .env.example .env
# Open .env and fill in the required values (see .env.example for documentation)

# 6. Start local services with Docker
docker-compose up -d

# 7. Run database migrations
npm run db:migrate

# 8. Start the development servers
npm run dev
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## 🌿 Git Branch Naming Conventions

All branches must follow this naming convention:

```
<type>/<short-description>
```

| Prefix | Use For | Example |
|--------|---------|---------|
| `feat/` | New features or enhancements | `feat/ocr-screenshot-parser` |
| `fix/` | Bug fixes | `fix/coupon-vault-duplicate-entries` |
| `docs/` | Documentation only changes | `docs/update-contributing-guide` |
| `chore/` | Build process, tooling, config, CI/CD | `chore/update-eslint-config` |
| `refactor/` | Code refactoring (no feature or fix) | `refactor/savings-stacker-engine` |
| `test/` | Adding or updating tests | `test/ocr-parser-unit-tests` |
| `hotfix/` | Critical production bug fixes | `hotfix/card-optimizer-crash` |

### Rules:
- Use **lowercase** and **hyphens** only (no underscores, no uppercase)
- Keep descriptions **short but meaningful** (2–5 words)
- Branch off `main` for features; branch off `main` for hotfixes unless told otherwise

---

## 📝 Commit Message Format

This project follows the **[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)** specification. Every commit message must be structured as:

```
<type>(<optional scope>): <short description>

[optional body]

[optional footer(s)]
```

### Types

| Type | When to Use |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `chore` | Build process, dependency updates, config changes |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or updating tests |
| `style` | Formatting changes (no logic change) |
| `perf` | Performance improvements |
| `ci` | CI/CD configuration changes |
| `revert` | Reverts a previous commit |

### Examples

```bash
feat(ocr): add Google Vision API integration for screenshot parsing

fix(coupon-vault): remove duplicate entries on concurrent submit

docs(readme): update tech stack table after TRD finalization

chore(deps): upgrade eslint to v9.0.0

feat(stacker)!: redesign savings stacking algorithm

BREAKING CHANGE: SavingsStack API response shape has changed.
Old: { total_savings: number }
New: { savings: { total: number, breakdown: StackLayer[] } }
```

### Rules:
- Use **lowercase** for type and scope
- Subject line must be **≤72 characters**
- Use **imperative mood** in the subject: "add feature" not "added feature"
- For breaking changes, append `!` after the type or include `BREAKING CHANGE:` in the footer

---

## 🔁 Pull Request Process

1. **Sync your fork** with the upstream `main` branch before starting work:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch** following the naming convention above.

3. **Write your code** — ensure it is well-commented and follows the style guidelines.

4. **Write or update tests** for your changes.

5. **Ensure all tests pass** locally:
   ```bash
   npm run test
   npm run lint
   ```

6. **Commit your changes** using Conventional Commits format.

7. **Push your branch** and [open a Pull Request](https://github.com/your-org/money-saver/compare) against `main`.

### PR Checklist

Before marking your PR as ready for review, confirm the following:

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have added comments to any hard-to-understand areas
- [ ] I have updated relevant documentation (README, inline docs, etc.)
- [ ] My changes generate no new warnings or linting errors
- [ ] I have added tests that prove my fix / feature works
- [ ] All new and existing tests pass locally
- [ ] Any dependent changes are merged and published
- [ ] I have updated `CHANGELOG.md` under `[Unreleased]` if applicable
- [ ] My PR title follows the Conventional Commits format

---

## 👓 Code Review Process

- All PRs require **at least one approval** from a project maintainer before merging.
- Reviewers aim to respond within **2 business days**.
- PRs are reviewed for: correctness, test coverage, security implications, code clarity, and alignment with the project architecture.
- Maintainers may request changes. Please address all review comments before re-requesting a review.
- Once approved and CI passes, a maintainer will **squash-merge** the PR into `main`.
- **Do not** merge your own PRs unless you are a sole maintainer with explicit permission.

---

## 🎨 Style Guidelines

> Detailed style guidelines will be finalized in the TRD and UI/UX Brief. In the meantime, follow these principles:

- **Consistency over cleverness** — write code that the next developer can easily understand
- **No magic numbers** — use named constants
- **DRY** (Don't Repeat Yourself) — extract reusable logic into shared utilities
- **SOLID principles** — especially Single Responsibility and Dependency Inversion
- All files must end with a **newline character**
- Indentation: **2 spaces** (no tabs)
- Strings: **single quotes** in JavaScript/TypeScript

---

Thank you for your contribution! Every issue reported, suggestion made, and line of code contributed brings MoneySaver one step closer to helping Indian shoppers save more. 💰
