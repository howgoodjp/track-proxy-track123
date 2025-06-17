const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

console.log('Server 正在啟動', new Date().toLocaleString());

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = 'fbc3d11fdac44bbfa7cd434e49aa8e4c';

app.post('/track', async (req, res) => {
  const { shipCode } = req.body;
  if (!shipCode) {
    console.error('缺少 shipCode');
    return res.status(400).json({ error: 'Missing shipCode' });
  }

  try {
    // 1. 先建立 tracking
    const postResp = await fetch('https://api.track123.com/trackings/post', {
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
    const postText = await postResp.text();
    let postData;
    try {
      postData = JSON.parse(postText);
    } catch (e) {
      console.error('Track123 建立 tracking 回傳非 JSON：', postText);
      return res.status(502).json({ error: 'Track123 建立 tracking 回傳非 JSON', detail: postText });
    }

    // 2. 查詢 tracking
    const getUrl = `https://api.track123.com/trackings/get?carrier_code=seven&tracking_number=${encodeURIComponent(shipCode)}`;
    const getResp = await fetch(getUrl, {
      method: 'GET',
      headers: {
        'Track123-Api-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });
    const getText = await getResp.text();
    let getData;
    try {
      getData = JSON.parse(getText);
    } catch (e) {
      console.error('Track123 查詢 tracking 回傳非 JSON：', getText);
      return res.status(502).json({ error: 'Track123 查詢 tracking 回傳非 JSON', detail: getText });
    }

    res.json(getData);

  } catch (e) {
    console.error('API failed:', e);
    res.status(500).json({ error: 'API failed', detail: String(e) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Track123 Proxy API running on ' + port));

