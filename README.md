# ScholarChain — Decentralized Scholarship Fund on Stellar

> **Stellar Journey to Mastery — Orange Belt Submission**

ScholarChain is a decentralized application that brings scholarship funding on-chain. Donors connect their Freighter wallet, browse active student scholarships, and send XLM directly to student wallets on the Stellar testnet. Every transaction is permanent, public, and verifiable on-chain with zero intermediaries.

---

## Live Demo

**[ADD YOUR DEPLOYMENT LINK HERE]**

---

## Demo Video

**[ADD YOUR LOOM / YOUTUBE LINK HERE]** *(1-2 minutes)*

---

## Screenshots

### Desktop UI
> *[Add screenshot of the full landing page on desktop]*

### Mobile Responsive UI
> *[Add screenshot of the app on mobile screen]*

### Wallet Connected State
> *[Add screenshot showing wallet pill with address and balance in navbar]*

### Donation Flow
> *[Add screenshot of the donation modal with amount selected]*

### Transaction Success
> *[Add screenshot of the success screen with transaction hash]*

### CI/CD Pipeline Running
> *[Add screenshot of GitHub Actions showing green check on Test & Build job]*

### Test Output
> *[Add screenshot of terminal showing 20 passing tests]*

---

## Contract Information

| Field | Value |
|-------|-------|
| Network | Stellar Testnet |
| Contract Address | `ADD YOUR DEPLOYED CONTRACT ADDRESS HERE` |
| Transaction Hash | `ADD A TRANSACTION HASH FROM A CONTRACT INTERACTION HERE` |

Verify on Stellar Explorer:
- Contract: `https://stellar.expert/explorer/testnet/contract/YOUR_CONTRACT_ADDRESS`
- Transaction: `https://stellar.expert/explorer/testnet/tx/YOUR_TX_HASH`

---

## Submission Checklist

| Requirement | Status |
|-------------|--------|
| Public GitHub repository | Done |
| README with complete documentation | Done |
| 10+ meaningful commits | Done |
| Live demo link | Add yours above |
| Contract deployment address | Add yours above |
| Transaction hash for contract interaction | Add yours above |
| Screenshot: Mobile responsive UI | Add above |
| Screenshot: CI/CD pipeline running | Add above |
| Screenshot: Test output (20 passing tests) | Add above |
| Demo video (1-2 minutes) | Add above |

---

## Features

- Freighter wallet connect and disconnect
- XLM balance fetch and display
- Send XLM transactions on Stellar Testnet
- Transaction success/failure feedback with hash
- View transaction on Stellar Explorer
- Friendbot integration to fund testnet accounts
- Filter scholarships by field
- Mobile responsive layout
- CI/CD pipeline via GitHub Actions
- Soroban smart contract (Rust) deployed on testnet
- 20 passing tests across 3 test files

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Styling | Pure CSS with custom properties |
| Wallet | Freighter (`@stellar/freighter-api`) |
| Blockchain | Stellar Testnet |
| Smart Contract | Soroban (Rust) |
| SDK | `@stellar/stellar-sdk` |
| Testing | Vitest + Testing Library |
| CI/CD | GitHub Actions |
| Deployment | Vercel |

---

## Error Handling

The app handles 6 distinct error types with clear user messages:

| Error | Cause | Message Shown |
|-------|-------|---------------|
| `FREIGHTER_NOT_INSTALLED` | Extension not found | Link to install Freighter |
| `USER_DECLINED` | User rejected wallet access | "Connection cancelled" |
| `INSUFFICIENT_BALANCE` | Not enough XLM | "Get Test XLM first" |
| `USER_DECLINED_SIGN` | User rejected signing | "Transaction cancelled" |
| `TX_BUILD_FAILED` | Transaction build error | "Please try again" |
| `TX_SUBMIT_FAILED` | Network rejection | "Please try again" |

---

## Smart Contract

The Soroban smart contract is written in Rust and located at `contracts/scholarship_fund.rs`.

**Functions:**

| Function | Description |
|----------|-------------|
| `initialize(admin)` | Set up contract with admin wallet |
| `create_scholarship(caller, recipient, goal, title)` | Admin creates a new scholarship |
| `record_donation(donor, id, amount)` | Record a donation after XLM transfer |
| `get_scholarship(id)` | Read scholarship data |
| `get_donation(id, donor)` | Check donation amount from a specific donor |
| `deactivate(caller, id)` | Admin closes a scholarship |

**Deploy to testnet:**
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/scholarship_fund.wasm \
  --network testnet \
  --source YOUR_KEYPAIR_NAME
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- [Freighter Wallet](https://www.freighter.app/) browser extension
- Freighter set to **Testnet** network

### Installation

```bash
git clone https://github.com/Shakshi-Kotwala/stellar-scholarship-fund.git
cd stellar-scholarship-fund
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Get Test XLM

1. Connect your Freighter wallet (set to Testnet)
2. Click **"Get Test XLM"** in the wallet panel
3. 10,000 XLM test tokens will be added via Stellar Friendbot

---

## Running Tests

```bash
npm test
```

Output: **20 tests passing** across 3 files:

| File | Tests | What it covers |
|------|-------|----------------|
| `stellar.test.js` | 6 | formatXLM, shortAddress, network constants, explorer URL |
| `freighter.test.js` | 9 | install detection, connect flow, decline handling, error cases |
| `ScholarshipCard.test.jsx` | 5 | render, progress display, click handler, days left |

---

## Project Structure

```
stellar-scholarship-fund/
├── .github/
│   └── workflows/
│       └── ci.yml                 CI/CD pipeline
├── contracts/
│   └── scholarship_fund.rs        Soroban smart contract
├── src/
│   ├── __tests__/                 20 passing tests
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── ScholarshipCard.jsx
│   │   ├── DonateModal.jsx
│   │   ├── WalletPanel.jsx
│   │   ├── ScholarshipList.jsx
│   │   ├── HowItWorks.jsx
│   │   └── Footer.jsx
│   ├── context/
│   │   └── WalletContext.jsx      Global wallet state
│   ├── utils/
│   │   ├── stellar.js             Horizon + transaction logic
│   │   └── freighter.js           Freighter wallet API
│   ├── App.jsx
│   ├── index.css                  Design system
│   └── main.jsx
├── index.html
├── vite.config.js
└── README.md
```

---

## CI/CD Pipeline

GitHub Actions runs on every push to `main`:

1. Install dependencies (`npm ci`)
2. Run all tests (`npm test`)
3. Build project (`npm run build`)
4. Upload build artifact

Pipeline file: `.github/workflows/ci.yml`

---

## Wallet Used

**Freighter Wallet (Testnet)**

Address: `GDX2ILXF5EHCELK6KREHFGDFKPJMAH74FIATNESSVNKYD4LPPSAGZNGL`

---

## Author

Built by **Shakshi** for the **Stellar Journey to Mastery — Orange Belt** challenge.

- GitHub: [Shakshi-Kotwala](https://github.com/Shakshi-Kotwala)
- Network: Stellar Testnet
- Wallet: Freighter
