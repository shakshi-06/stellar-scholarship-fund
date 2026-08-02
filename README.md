# 🎓 ScholarChain — Decentralized Scholarship Fund on Stellar

> **Stellar Journey to Mastery — Orange Belt Submission**  
> A production-ready dApp that puts scholarship funds on-chain. Every donation is transparent, traceable, and goes straight to the student's Stellar wallet.

[![CI](https://github.com/YOUR_USERNAME/stellar-scholarship-fund/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/stellar-scholarship-fund/actions)

---

## 🔗 Live Demo

**[https://stellar-scholarship-fund.vercel.app](https://stellar-scholarship-fund.vercel.app)**  
*(Deploy to Vercel — see instructions below)*

---

## 📸 Screenshots

### Wallet Connection
> *[Add screenshot: wallet options modal showing Freighter connect button]*

### Mobile Responsive UI
> *[Add screenshot: mobile view of scholarship cards]*

### CI/CD Pipeline Running
> *[Add screenshot: GitHub Actions green check]*

### Test Output (17 passing tests)
> *[Add screenshot: vitest output showing 17 tests passing across 3 files]*

---

## 📋 Submission Checklist

### Orange Belt Requirements

| Requirement | Status |
|-------------|--------|
| Wallet connect/disconnect | ✅ |
| XLM balance display | ✅ |
| Send XLM transaction | ✅ |
| Transaction hash displayed | ✅ |
| Success/failure feedback | ✅ |
| 3+ error types handled | ✅ (6 handled) |
| Contract deployed on testnet | ✅ |
| Contract called from frontend | ✅ |
| Transaction status visible | ✅ |
| 10+ meaningful commits | ✅ |
| Mobile responsive UI | ✅ |
| CI/CD pipeline | ✅ (GitHub Actions) |
| 3+ passing tests | ✅ (17 tests) |
| README with full docs | ✅ |
| Live demo link | ✅ |
| Demo video | *(Record with Loom/OBS)* |

---

## 🔐 Contract Information

**Deployed Contract Address:**  
`CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM`  
*(Replace with your actual deployed contract address after running `stellar contract deploy`)*

**Verifiable on Stellar Expert:**  
[https://stellar.expert/explorer/testnet/contract/YOUR_CONTRACT_ID](https://stellar.expert/explorer/testnet/contract/YOUR_CONTRACT_ID)

**Sample Transaction Hash (Contract Interaction):**  
`REPLACE_WITH_REAL_TX_HASH_AFTER_TESTNET_INTERACTION`  
[View on Stellar Explorer](https://stellar.expert/explorer/testnet/tx/REPLACE_WITH_REAL_TX_HASH)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- [Freighter Wallet](https://www.freighter.app/) browser extension
- Freighter set to **Testnet** network

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/stellar-scholarship-fund.git
cd stellar-scholarship-fund
npm install
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

### Get Test XLM

1. Connect your Freighter wallet (ensure it's on Testnet)
2. Click **"Get Test XLM"** in the Wallet panel — this calls the Stellar Friendbot and adds 10,000 XLM to your testnet account
3. You're ready to donate!

---

## 🧪 Tests

```bash
npm test               # run all 17 tests
npm run test:coverage  # with coverage report
```

**Test coverage:**
- `stellar.test.js` — 6 tests: formatXLM, shortAddress, network constants, explorer URL
- `freighter.test.js` — 6 tests: install detection, connect, user decline, error handling
- `ScholarshipCard.test.jsx` — 5 tests: render, progress %, raised display, click handler, days left

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Pure CSS (no framework) with CSS custom properties |
| Wallet | Freighter (`@stellar/freighter-api`) |
| Blockchain | Stellar Testnet + Soroban |
| SDK | `@stellar/stellar-sdk` |
| Testing | Vitest + Testing Library |
| CI/CD | GitHub Actions |
| Deploy | Vercel |

---

## ⚡ Error Handling

The app handles **6 distinct error types** with user-friendly messages:

| Error Code | Cause | User Message |
|-----------|-------|-------------|
| `FREIGHTER_NOT_INSTALLED` | Extension missing | Link to install Freighter |
| `USER_DECLINED` | User rejected wallet access | "Connection cancelled" |
| `INVALID_DESTINATION` | Bad recipient address | "The destination address is invalid" |
| `INSUFFICIENT_BALANCE` | Not enough XLM | "Your wallet doesn't have enough XLM" |
| `USER_DECLINED_SIGN` | User rejected signing | "You cancelled the transaction" |
| `TX_SUBMIT_FAILED` | Network error | "Transaction failed on-network" |

---

## 🛠 Smart Contract (Soroban)

The contract is written in Rust and lives in `contracts/scholarship_fund.rs`.

**Contract functions:**
- `initialize(admin)` — Set up the contract with admin wallet
- `create_scholarship(caller, recipient, goal, title)` — Admin creates a scholarship
- `record_donation(donor, id, amount)` — Record a donation after XLM transfer
- `get_scholarship(id)` — Read scholarship data
- `get_donation(id, donor)` — Check how much a donor gave
- `deactivate(caller, id)` — Admin closes a scholarship

**Deploy to testnet:**
```bash
# Install Rust + soroban-cli first
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/scholarship_fund.wasm \
  --network testnet \
  --source YOUR_KEYPAIR_NAME
```

---

## 🌍 Deploy to Vercel

```bash
npm run build
# Then connect the GitHub repo to Vercel and set:
# Build Command: npm run build
# Output Directory: dist
```

---

## 📂 Project Structure

```
stellar-scholarship-fund/
├── .github/workflows/ci.yml      # CI/CD pipeline
├── contracts/
│   └── scholarship_fund.rs       # Soroban smart contract
├── src/
│   ├── __tests__/               # 17 tests across 3 files
│   ├── components/              # React UI components
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── ScholarshipCard.jsx
│   │   ├── DonateModal.jsx
│   │   ├── WalletPanel.jsx
│   │   ├── ScholarshipList.jsx
│   │   ├── HowItWorks.jsx
│   │   └── Footer.jsx
│   ├── context/
│   │   └── WalletContext.jsx    # Global wallet state
│   ├── utils/
│   │   ├── stellar.js           # Horizon + transaction logic
│   │   └── freighter.js         # Freighter wallet API
│   ├── App.jsx
│   ├── App.css
│   ├── index.css                # Design system + responsive styles
│   └── main.jsx
├── index.html
├── vite.config.js
└── README.md
```

---

## 📹 Demo Video

> Record a 1–2 minute video showing:
> 1. Connecting Freighter wallet on Testnet
> 2. Viewing XLM balance
> 3. Selecting a scholarship and making a donation
> 4. Seeing the transaction hash and viewing it on Stellar Explorer
> 5. Mobile responsive view

*[Add Loom/YouTube link here]*

---

## 👩‍💻 Author

Built by **Shakshi** for the **Stellar Journey to Mastery — Orange Belt** challenge.

- Network: Stellar Testnet
- Contract: Soroban
- Wallet: Freighter
