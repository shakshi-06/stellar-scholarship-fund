# ScholarChain — Decentralized Scholarship Fund on Stellar

<div align="center">

**[Live Demo](https://stellar-scholarship-fund.vercel.app)** &nbsp;|&nbsp; **[Demo Video](https://drive.google.com/file/d/115AQTwqrVKhO6BbTxyRB5l6jVW3ZEJZp/view?usp=sharing)** &nbsp;|&nbsp; **[Stellar Explorer](https://stellar.expert/explorer/testnet)**

![CI](https://github.com/shakshi-06/stellar-scholarship-fund/actions/workflows/ci.yml/badge.svg)
![Stellar](https://img.shields.io/badge/Stellar-Testnet-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Tests](https://img.shields.io/badge/Tests-20%20passing-brightgreen)

</div>

---

## The Problem

Every year, thousands of deserving students in India lose access to education because scholarship money never reaches them. Traditional scholarship systems rely on banks, NGOs, and government portals — each layer adding delays, fees, and opportunities for funds to go missing. There is no way for a donor to verify that their money actually reached the student.

## The Solution

ScholarChain puts scholarship funds directly on the Stellar blockchain. A donor connects their Freighter wallet, selects a student, and sends XLM — the payment goes straight to the student's wallet in seconds, with a permanent transaction hash that anyone can verify on Stellar Explorer. No middlemen. No hidden fees. No trust required.

---

## Screenshots

### Mobile Responsive UI

<div align="center">
  <img width="240" alt="Mobile Home" src="https://github.com/user-attachments/assets/82aee7e8-73c9-459c-bbbc-8c12f9ff50c7" />
  &nbsp;
  <img width="240" alt="Mobile Scholarships" src="https://github.com/user-attachments/assets/cf5979ab-63b6-40d9-87e7-9c32cea5cc72" />
  &nbsp;
  <img width="240" alt="Mobile Donate" src="https://github.com/user-attachments/assets/d151566d-643e-4e16-9e04-5c052e5345a9" />
</div>

### Desktop UI

<img width="880" alt="Desktop UI" src="https://github.com/user-attachments/assets/f8010a3a-304e-40ea-a5f4-f0ff0f7c1f0e" />

### Wallet Connected State

<img width="880" alt="Wallet Connected" src="https://github.com/user-attachments/assets/0fa32e5b-9df7-432a-a562-0a3db9856600" />

### Donation Flow

<img width="880" alt="Donation Flow" src="https://github.com/user-attachments/assets/1379f9b1-7021-4422-8170-5c19be8c2f88" />

### Transaction Success

<img width="880" alt="Transaction Success" src="https://github.com/user-attachments/assets/87fb522f-7da1-4bd0-a0f3-942c4dbf8f2c" />

### CI/CD Pipeline Running

<img width="880" alt="CI/CD Pipeline" src="https://github.com/user-attachments/assets/a074f647-1b94-444a-ac96-fbc87e272ed2" />

### Test Output

<img width="680" alt="Test Output" src="https://github.com/user-attachments/assets/7ee7d410-3f80-4c94-a89b-8b6477171759" />

---

## Contract Information

**Network:** Stellar Testnet

| Field | Value |
|-------|-------|
| ScholarshipFund Contract | `CBDPWFS3CYFFWTGQKVEHXE2DDC5H52RQBWEUOEPRAIQRDAOQDLSNTQQD` |
| ScholarshipRegistry Contract | `CDEZQ5BPXY7T6BB3X3ZFBXUBSKKEDAHQFN4FSMOWQHJTL5S5CHFIXZ7G` |
| Deployer Address | `GBSDMYKZ5XKUYWFPECBE6E2XSCD44UCYEOWXOYFQGWXYRVTIF34AKALD` |
| Transaction Hash | `9061b1cd51891bcd2fcd9dfcfb8b2193f51cb010479e7aa5563df9d4de98d99d` |

Verify on Stellar Explorer:
- [ScholarshipFund Contract](https://stellar.expert/explorer/testnet/contract/CBDPWFS3CYFFWTGQKVEHXE2DDC5H52RQBWEUOEPRAIQRDAOQDLSNTQQD)
- [Transaction](https://stellar.expert/explorer/testnet/tx/9061b1cd51891bcd2fcd9dfcfb8b2193f51cb010479e7aa5563df9d4de98d99d)

---

## Submission Checklist

| Requirement | Status |
|-------------|--------|
| Public GitHub repository | Done |
| README with complete documentation | Done |
| 10+ meaningful commits | Done |
| Live demo link | Done |
| Contract deployment address | Done |
| Transaction hash for contract interaction | Done |
| Screenshot: Mobile responsive UI | Done |
| Screenshot: CI/CD pipeline running | Done |
| Screenshot: Test output (20 passing) | Done |
| Demo video (1-2 minutes) | Done |

---

## Features

- Freighter wallet connect and disconnect
- XLM balance fetch and real-time display
- Send XLM transactions on Stellar Testnet
- Transaction success and failure feedback with hash
- View every transaction on Stellar Explorer
- Friendbot integration to fund testnet accounts
- Live activity feed polling Stellar Horizon every 8 seconds
- Filter scholarships by field of study
- Mobile responsive layout down to 320px
- CI/CD pipeline via GitHub Actions
- Two Soroban smart contracts with inter-contract communication
- 20 passing tests across 3 test files

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Styling | Pure CSS with custom properties |
| Wallet | Freighter (`@stellar/freighter-api`) |
| Blockchain | Stellar Testnet |
| Smart Contracts | Soroban (Rust) — ScholarshipFund + Registry |
| SDK | `@stellar/stellar-sdk` |
| Testing | Vitest + Testing Library |
| CI/CD | GitHub Actions |
| Deployment | Vercel |

---

## Smart Contracts

Two contracts demonstrating inter-contract communication:

**ScholarshipFund** — main contract managing scholarships, donations, and events. Calls into the Registry on every scholarship creation and goal completion.

**ScholarshipRegistry** — secondary contract receiving cross-contract calls from ScholarshipFund to maintain a global index of all scholarships and their funded status.

### Contract Functions

| Contract | Function | Description |
|----------|----------|-------------|
| ScholarshipFund | `initialize(admin, registry)` | Set up with admin wallet and registry address |
| ScholarshipFund | `create_scholarship(caller, recipient, goal, title)` | Admin creates a scholarship |
| ScholarshipFund | `record_donation(donor, id, amount)` | Record donation and notify registry |
| ScholarshipFund | `get_scholarship(id)` | Read scholarship data |
| ScholarshipFund | `deactivate(caller, id)` | Admin closes a scholarship |
| ScholarshipRegistry | `register(id, recipient, fund)` | Called by ScholarshipFund on creation |
| ScholarshipRegistry | `mark_funded(id)` | Called by ScholarshipFund when goal is reached |

### Deploy to Testnet

```bash
# Deploy Registry
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/scholarship_registry.wasm \
  --network testnet --source deployer

# Deploy ScholarshipFund
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/scholarship_fund.wasm \
  --network testnet --source deployer

# Initialize
stellar contract invoke \
  --id FUND_CONTRACT_ADDRESS \
  --network testnet --source deployer \
  -- initialize \
  --admin YOUR_ADDRESS \
  --registry REGISTRY_CONTRACT_ADDRESS
```

---

## Error Handling

| Error | Cause | User Message |
|-------|-------|-------------|
| `FREIGHTER_NOT_INSTALLED` | Extension not found | Link to install Freighter |
| `USER_DECLINED` | User rejected wallet access | "Connection cancelled" |
| `INSUFFICIENT_BALANCE` | Not enough XLM | "Get Test XLM first" |
| `USER_DECLINED_SIGN` | User rejected signing | "Transaction cancelled" |
| `TX_BUILD_FAILED` | Transaction build error | "Please try again" |
| `TX_SUBMIT_FAILED` | Network rejection | "Please try again" |

---

## Getting Started

### Prerequisites

- Node.js 20+
- [Freighter Wallet](https://www.freighter.app/) browser extension set to **Testnet**

### Installation

```bash
git clone https://github.com/shakshi-06/stellar-scholarship-fund.git
cd stellar-scholarship-fund
npm install
npm run dev
```

Open `http://localhost:5173`

### Get Test XLM

1. Connect Freighter wallet (set to Testnet)
2. Click **Get Test XLM** in the wallet panel
3. 10,000 XLM test tokens arrive via Stellar Friendbot

---

## Running Tests

```bash
npm test
```

20 tests passing across 3 files:

| File | Tests | Covers |
|------|-------|--------|
| `stellar.test.js` | 6 | formatXLM, shortAddress, network constants, explorer URL |
| `freighter.test.js` | 9 | install detection, connect flow, decline handling, error cases |
| `ScholarshipCard.test.jsx` | 5 | render, progress display, click handler, days left |

---

## CI/CD Pipeline

GitHub Actions runs on every push to `main`:

1. Install dependencies (`npm ci`)
2. Run all 20 tests (`npm test`)
3. Build project (`npm run build`)
4. Upload build artifact

Pipeline file: `.github/workflows/ci.yml`

---

## Project Structure

```
stellar-scholarship-fund/
├── .github/workflows/ci.yml
├── contracts/
│   ├── scholarship_fund/        Main Soroban contract
│   └── registry/                Registry contract (inter-contract comms)
├── src/
│   ├── __tests__/               20 passing tests
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── ScholarshipCard.jsx
│   │   ├── DonateModal.jsx
│   │   ├── WalletPanel.jsx
│   │   ├── ScholarshipList.jsx
│   │   ├── ActivityFeed.jsx     Real-time event streaming
│   │   ├── HowItWorks.jsx
│   │   └── Footer.jsx
│   ├── context/WalletContext.jsx
│   ├── utils/
│   │   ├── stellar.js
│   │   └── freighter.js
│   ├── App.jsx
│   └── index.css
└── README.md
```

---

## Author

Built by **Shakshi** for the **Stellar Journey to Mastery — Orange Belt** challenge.

- GitHub: [shakshi-06](https://github.com/shakshi-06)
- Network: Stellar Testnet
- Wallet: `GDX2ILXF5EHCELK6KREHFGDFKPJMAH74FIATNESSVNKYD4LPPSAGZNGL`

## License

MIT
