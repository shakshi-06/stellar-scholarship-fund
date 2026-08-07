# ScholarChain - Decentralized Scholarship Fund on Stellar

ScholarChain is a decentralized application that brings scholarship funding on-chain. Donors connect their Freighter wallet, browse active student scholarships, and send XLM directly to student wallets on the Stellar testnet. Every transaction is permanent, public, and verifiable on-chain with zero intermediaries.

---

## Live Demo - https://stellar-scholarship-fund.vercel.app/
## Demo Video - https://drive.google.com/file/d/115AQTwqrVKhO6BbTxyRB5l6jVW3ZEJZp/view?usp=sharing

---

## Screenshots

### Mobile Responsive UI
<img width="1080" height="2067" alt="WhatsApp Image 2026-06-28 at 20 25 19" src="https://github.com/user-attachments/assets/82aee7e8-73c9-459c-bbbc-8c12f9ff50c7" /> <img width="1080" height="2130" alt="WhatsApp Image 2026-06-28 at 20 25 20" src="https://github.com/user-attachments/assets/cf5979ab-63b6-40d9-87e7-9c32cea5cc72" /> <img width="1080" height="2132" alt="WhatsApp Image 2026-06-28 at 20 25 20 (1)" src="https://github.com/user-attachments/assets/d151566d-643e-4e16-9e04-5c052e5345a9" />



### Desktop UI
<img width="1890" height="903" alt="Screenshot 2026-06-28 201451" src="https://github.com/user-attachments/assets/f8010a3a-304e-40ea-a5f4-f0ff0f7c1f0e" />

### Wallet Connected State
<img width="1890" height="906" alt="Screenshot 2026-06-28 201416" src="https://github.com/user-attachments/assets/0fa32e5b-9df7-432a-a562-0a3db9856600" />

### Donation Flow
<img width="1895" height="910" alt="Screenshot 2026-06-28 201548" src="https://github.com/user-attachments/assets/1379f9b1-7021-4422-8170-5c19be8c2f88" />

### Transaction Success
<img width="1890" height="911" alt="Screenshot 2026-06-28 201739" src="https://github.com/user-attachments/assets/87fb522f-7da1-4bd0-a0f3-942c4dbf8f2c" />

### CI/CD Pipeline Running
<img width="1891" height="907" alt="image" src="https://github.com/user-attachments/assets/a074f647-1b94-444a-ac96-fbc87e272ed2" />

### Test Output
<img width="1186" height="232" alt="image" src="https://github.com/user-attachments/assets/7ee7d410-3f80-4c94-a89b-8b6477171759" />

---

## Contract Information

**Network:** Stellar Testnet

- **ScholarshipFund Contract:** `CBDPWFS3CYFFWTGQKVEHXE2DDC5H52RQBWEUOEPRAIQRDAOQDLSNTQQD`
- **ScholarshipRegistry Contract:** `CDEZQ5BPXY7T6BB3X3ZFBXUBSKKEDAHQFN4FSMOWQHJTL5S5CHFIXZ7G`
- **Contract Deployment Address:** `GBSDMYKZ5XKUYWFPECBE6E2XSCD44UCYEOWXOYFQGWXYRVTIF34AKALD`
- **Transaction Hash:** `9061b1cd51891bcd2fcd9dfcfb8b2193f51cb010479e7aa5563df9d4de98d99d`

Verify on Stellar Explorer:
- Contract: `https://stellar.expert/explorer/testnet/contract/GBSDMYKZ5XKUYWFPECBE6E2XSCD44UCYEOWXOYFQGWXYRVTIF34AKALD`
- Transaction: `https://stellar.expert/explorer/testnet/tx/9061b1cd51891bcd2fcd9dfcfb8b2193f51cb010479e7aa5563df9d4de98d99d`

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
shakshi-06 - (https://github.com/shakshi-06)
## License
This project is licensed under the MIT License.
