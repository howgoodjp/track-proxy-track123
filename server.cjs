const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = 'fbc3d11fdac44bbfa7cd434e49aa8e4c'; // <--- 這裡換成你自己的 Track123 金鑰

app.post('/track', async (req, res) => {
  const { shipCode } = req.body;
  if (!shipCode) return res.status(400).json({ error: 'Missing shipCode' });

  try {
    const result = await fetch('https://api.track123.com/v1/trackings/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Track123-Api-Key': API_KEY,
      },
      body: JSON.stringify({
        carrier_code: "seven",
        tracking_number: shipCode,
      }),
    });
    const data = await result.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'API failed', detail: String(e) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Track123 Proxy API running on ' + port));

