// --- Backend API (Node.js / Express-style with mock logic for now) ---

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Mock user and treasury data
let treasuryLLR = 100000; // 100,000 LLR in reserve
let swapRate = 0.02; // 1 LLR = $0.02
const userBalances = {
  '0xUserWalletAddress': 5000 // user has 5000 LLR
};

// Mock Stables card tokens
const userCardTokens = {
  '0xUserWalletAddress': 'mock-card-token-123'
};

// Route: Swap LLR to USD
app.post('/api/swap', (req, res) => {
  const { wallet, amountLLR } = req.body;
  if (!wallet || !amountLLR || !userBalances[wallet]) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const llr = parseFloat(amountLLR);
  if (llr > userBalances[wallet]) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  const usd = llr * swapRate;
  if (llr > treasuryLLR) {
    return res.status(400).json({ error: 'Treasury limit exceeded' });
  }

  userBalances[wallet] -= llr;
  treasuryLLR -= llr;

  return res.json({ success: true, usdAmount: usd });
});

// Route: Top-Up Virtual Card via Stables API (Mocked)
app.post('/api/topup', (req, res) => {
  const { wallet, usdAmount } = req.body;
  const cardToken = userCardTokens[wallet];

  if (!cardToken || !usdAmount) {
    return res.status(400).json({ error: 'Missing card or amount' });
  }

  // Here you would call Stables API. Mocking response:
  console.log(`Topping up card ${cardToken} with $${usdAmount}`);
  return res.json({ success: true, message: `Card topped up with $${usdAmount}` });
});

const PORT = 4000;
app.listen(PORT, () => console.log(`LLR backend running on port ${PORT}`));
