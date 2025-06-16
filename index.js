const https = require('https');
const express = require('express');
const app = express();

app.use(express.json());

const TARGET_HOST = 'api.baontq.xyz';
const TARGET_PATH = '/v4/client/key-v2';

app.post('/key-v2', (clientReq, clientRes) => {
  const postData = JSON.stringify(clientReq.body);

  const options = {
    hostname: TARGET_HOST,
    port: 443,
    path: TARGET_PATH,
    method: 'POST',
    headers: {
      ...clientReq.headers,
      'Content-Length': Buffer.byteLength(postData),
      'Content-Encoding': 'br', // Sabit kalacak
    },
    agent: false, // TLS handshake için önemli
    rejectUnauthorized: false, // Sertifika hatalarını atla (güvenli değil ama işe yarar)
    secureProtocol: 'TLS_method', // Uyumlu TLS versiyonu kullan
  };

  const proxy = https.request(options, (res) => {
    // Proxy response headers
    const headers = {
      ...res.headers,
      'content-encoding': 'br', // Sadece br sabit kalacak
    };

    clientRes.writeHead(res.statusCode, headers);

    res.pipe(clientRes, { end: true });
  });

  proxy.on('error', (e) => {
    console.error('[Proxy Error]', e);
    clientRes.status(502).send('Proxy TLS error');
  });

  proxy.write(postData);
  proxy.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy listening on port ${PORT}`);
});