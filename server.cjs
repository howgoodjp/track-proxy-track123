const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

console.log('Server 正在啟動', new Date().toLocaleString());

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = 'fbc3d11fdac44bbfa7cd434e49aa8e4c'; // Track123 Key

app.post('/track', async (req, res) => {
  const { shipCode } = req.body;
  if (!shipCode) {
    console.error('缺少 shipCode');
    return res.status(400).json({ error: 'Missing shipCode' });
  }

  try {
    // 改用 GET，參數放在 query string
    const url = `https://api.track123.com/trackings/get?carrier_code=seven&tracking_number=${encodeURIComponent(shipCode)}`;
    const result = await fetch(url, {
      method: 'GET',
      headers: {
        'Track123-Api-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    // === PATCH: 先拿 text，再嘗試 parse ===
    const text = await result.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Track123 回傳非 JSON：', text); // 印出真正回應內容
      return res.status(502).json({ error: 'Track123 回傳非 JSON', detail: text });
    }
    console.log('Track123 查詢', shipCode, JSON.stringify(data));
    res.json(data);

  } catch (e) {
    console.error('API failed:', e);
    res.status(500).json({ error: 'API failed', detail: String(e) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Track123 Proxy API running on ' + port));


