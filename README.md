# ScholarChain — Decentralized Scholarship Fund on Stellar

<div align="center">

**[Live Demo](https://stellar-scholarship-fund.vercel.app)** &nbsp;|&nbsp; **[Demo Video](https://drive.google.com/file/d/1chqA7ZeK-s0GX4YlB9DaaNI5Zn4MP7fZ/view?usp=sharing)** &nbsp;|&nbsp; **[Stellar Explorer](https://stellar.expert/explorer/testnet)**

![CI](https://github.com/shakshi-06/stellar-scholarship-fund/actions/workflows/ci.yml/badge.svg)
![Stellar](https://img.shields.io/badge/Stellar-Testnet-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Tests](https://img.shields.io/badge/Tests-20%20passing-brightgreen)

</div>

---

## Problem Statement

Every year, thousands of deserving students in India lose access to education because scholarship money never reaches them. Traditional scholarship systems rely on banks, NGOs, and government portals — each layer adding delays, fees, and opportunities for funds to go missing. There is no way for a donor to verify that their money actually reached the student.

## Solution

ScholarChain is a peer-to-peer scholarship funding platform built on the Stellar blockchain. Students post funding requests directly. Donors browse requests and send XLM straight to the student's wallet — no middlemen, no treasury, no approval gates. Every transaction is permanent, public, and verifiable on Stellar Explorer.

---

## Live Demo

**[https://stellar-scholarship-fund.vercel.app](https://stellar-scholarship-fund.vercel.app)**

---

## Demo Video

**[Watch Demo Video](https://drive.google.com/file/d/1chqA7ZeK-s0GX4YlB9DaaNI5Zn4MP7fZ/view?usp=sharing)**

---

## Screenshots

### Desktop UI — Landing Page
<img width="880" alt="Landing Page Desktop" src="https://github.com/user-attachments/assets/f8010a3a-304e-40ea-a5f4-f0ff0f7c1f0e" />

### Desktop UI — Donor Dashboard
<img width="880" alt="Donor Dashboard" src="https://github.com/user-attachments/assets/0fa32e5b-9df7-432a-a562-0a3db9856600" />

### Desktop UI — Transaction Success
<img width="880" alt="Transaction Success" src="https://github.com/user-attachments/assets/87fb522f-7da1-4bd0-a0f3-942c4dbf8f2c" />

### Mobile Responsive UI

<div align="center">
  <img width="220" alt="Mobile Landing" src="https://github.com/user-attachments/assets/82aee7e8-73c9-459c-bbbc-8c12f9ff50c7" />
  &nbsp;&nbsp;
  <img width="220" alt="Mobile How It Works" src="https://github.com/user-attachments/assets/cf5979ab-63b6-40d9-87e7-9c32cea5cc72" />
  &nbsp;&nbsp;
  <img width="220" alt="Mobile Donor View" src="https://github.com/user-attachments/assets/d151566d-643e-4e16-9e04-5c052e5345a9" />
</div>

### CI/CD Pipeline
<img width="880" alt="CI/CD Pipeline" src="https://github.com/user-attachments/assets/a074f647-1b94-444a-ac96-fbc87e272ed2" />

### Test Output — 20 Passing Tests
<img width="680" alt="Test Output" src="https://github.com/user-attachments/assets/7ee7d410-3f80-4c94-a89b-8b6477171759" />

### Analytics — Vercel Dashboard
> *[Add Vercel Analytics dashboard screenshot here after users interact with the site]*

---

## Proof of 10+ User Wallet Interactions

Real user wallet interactions on Stellar Testnet — verified on Stellar Explorer:

| User | Wallet Address | Transaction |
|------|---------------|-------------|
| User 1 | GDXIKW2PGV6VNSSPEZNXK3WSQEE7LX76U6MCS35OVI7F5FSE22J32PDB | [View](https://stellar.expert/explorer/testnet/account/GDXIKW2PGV6VNSSPEZNXK3WSQEE7LX76U6MCS35OVI7F5FSE22J32PDB) |
| User 2 | GDUSXB... | [View on Explorer](https://stellar.expert/explorer/testnet) |
| User 3 | GDSA63...K6K4 | [View on Explorer](https://stellar.expert/explorer/testnet) |
| + 7 more | See feedback sheet | [Feedback Sheet](https://docs.google.com/spreadsheets/d/104NvoOncNrUJKg1X19WQBJOJdbUu6OqKqI5cbAd8E7k/edit?usp=sharing) |

---

## User Feedback Summary

**[Full Feedback Responses](https://docs.google.com/spreadsheets/d/104NvoOncNrUJKg1X19WQBJOJdbUu6OqKqI5cbAd8E7k/edit?usp=sharing)**

10+ users tested ScholarChain on Stellar Testnet. Key findings:
- Users found the landing page clear and the two-role concept intuitive
- Wallet connection via Freighter worked smoothly across all testers
- The live activity strip and transaction hash display were highlighted as trust-building features
- Suggested improvement: add a notification when their request gets funded

---

## Submission Checklist

| Requirement | Status |
|-------------|--------|
| Public GitHub repository | Done |
| README with complete documentation | Done |
| 15+ meaningful commits | Done |
| Live demo link | Done |
| Contract deployment address | Done |
| Screenshots: Product UI | Done |
| Screenshots: Mobile responsive design | Done |
| Screenshots: Analytics/monitoring | Add after users interact |
| Demo video link | Done |
| Proof of 10+ user wallet interactions | Done |
| Basic user feedback summary | Done |

---

## Contract Information

| Field | Value |
|-------|-------|
| Network | Stellar Testnet |
| ScholarshipFund Contract | `CBDPWFS3CYFFWTGQKVEHXE2DDC5H52RQBWEUOEPRAIQRDAOQDLSNTQQD` |
| ScholarshipRegistry Contract | `CDEZQ5BPXY7T6BB3X3ZFBXUBSKKEDAHQFN4FSMOWQHJTL5S5CHFIXZ7G` |
| Transaction Hash | `9061b1cd51891bcd2fcd9dfcfb8b2193f51cb010479e7aa5563df9d4de98d99d` |

- [Verify Contract on Explorer](https://stellar.expert/explorer/testnet/contract/CBDPWFS3CYFFWTGQKVEHXE2DDC5H52RQBWEUOEPRAIQRDAOQDLSNTQQD)
- [Verify Transaction on Explorer](https://stellar.expert/explorer/testnet/tx/9061b1cd51891bcd2fcd9dfcfb8b2193f51cb010479e7aa5563df9d4de98d99d)

---

## How It Works

**For Students:**
1. Connect Freighter wallet (set to Testnet)
2. Click "I need funding" on the landing page
3. Post a funding request — describe your need, set a goal in XLM, choose 7/14/30 day deadline
4. Donors send XLM directly to your wallet address
5. Track received payments in the Received tab

**For Donors:**
1. Connect Freighter wallet
2. Click "I want to donate" on the landing page
3. Browse student requests — filter by field, sort by urgency, search by keyword
4. Click "Fund this student", enter amount, sign with Freighter
5. XLM arrives in the student's wallet within 5 seconds

---

## Features

- Landing page with hero, live activity strip, how it works section
- Role-based portals: Student and Donor — no admin required
- Student portal: post requests, view my requests with countdown timer, received payments tab
- Donor portal: browse, filter by field, sort, keyword search, fund any student
- Direct P2P payments — no treasury, no middlemen
- SC-FUND memo on all transactions for verified badge detection
- Previously funded badge on repeat student requests
- Expiry system — requests auto-expire after chosen deadline
- Real-time activity strip polling Stellar Horizon
- Mobile responsive layout
- CI/CD pipeline via GitHub Actions
- Vercel Analytics integration
- 20 passing tests across 3 files
- Soroban smart contracts deployed on Stellar Testnet

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Wallet | Freighter (`@stellar/freighter-api`) |
| Blockchain | Stellar Testnet |
| Smart Contracts | Soroban (Rust) |
| SDK | `@stellar/stellar-sdk` |
| Testing | Vitest + Testing Library |
| CI/CD | GitHub Actions |
| Analytics | Vercel Analytics |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 20+
- [Freighter Wallet](https://www.freighter.app/) set to **Testnet**

### Installation

```bash
git clone https://github.com/shakshi-06/stellar-scholarship-fund.git
cd stellar-scholarship-fund
npm install
npm run dev
```

Open `http://localhost:5173`

### Get Test XLM
Click **Get Test XLM** in the navbar after connecting — uses Stellar Friendbot.

---

## Running Tests

```bash
npm test
```

20 tests passing across 3 files:

| File | Tests | Covers |
|------|-------|--------|
| `stellar.test.js` | 6 | formatXLM, shortAddress, network constants |
| `freighter.test.js` | 9 | install detection, connect, decline handling |
| `ScholarshipCard.test.jsx` | 5 | render, progress, click handler |

---

## CI/CD Pipeline

GitHub Actions runs on every push to `main`:
1. Install dependencies
2. Run 20 tests
3. Build project
4. Upload artifact

---

## Project Structure

```
stellar-scholarship-fund/
├── .github/workflows/ci.yml
├── contracts/
│   ├── request_pool/          New Soroban contract (student requests)
│   ├── scholarship_fund/      Original fund contract
│   └── registry/              Registry contract
├── src/
│   ├── components/
│   │   ├── ui/                shadcn/ui primitives
│   │   ├── Navbar.jsx
│   │   └── ActivityStrip.jsx
│   ├── context/
│   │   ├── WalletContext.jsx
│   │   └── AppContext.jsx
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── StudentPortal.jsx
│   │   └── DonorPortal.jsx
│   ├── utils/
│   │   ├── stellar.js
│   │   ├── freighter.js
│   │   └── contract.js
│   └── __tests__/
└── README.md
```

---

## Author

Built by **Shakshi** for the **Stellar Journey to Mastery — Level 4** challenge.

- GitHub: [shakshi-06](https://github.com/shakshi-06)
- Network: Stellar Testnet
- Deployment: [https://stellar-scholarship-fund.vercel.app](https://stellar-scholarship-fund.vercel.app)

## License

MIT
