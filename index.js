const http = require("http");
const https = require("https");
const brotli = require("brotli");

// Sabit dönecek JSON body (brotli sıkıştırılacak)
const fixedResponse = {
  response: "u1PI9B/Y6/z57GWlnUYjRat6ZzL149+2zbgyTlRvvCwyiAUu0RiQ88+ixulk15BvzU5xRi9Fkt8Ky6VvbobRAdm7b2YL4KjMbpA5b4D++mE/QIbe3/LZhbhF8aQH1wjzbOPWhRwcDW4AiqWnTrTAOs40E4D4E4g5Yxes1UP5CI6hg7uitS0khAWpk32feaU2rPYGwIHY27Nyy4F9EdX7SMFR+WTpGP7yr/x/EXRCgmNvhlCZRpzpRMDjhHxu4jwEb4ZcxvoAIdks0A2IvEu526RhiX2iNxj5yXoBKiEpEJ1YmDdu0ZDGOW6k/Brfgsq+tpCvPC8GO8d8pPoSzogBX83QLzVSzOqTte3HxgVI8zQugP/yw7qadiGGpzjvfjX3o6KkknOkA5n09QT00hup9euEVKGoClIjmJhaL823Kx9C8LnQaiuHnuHG/iFMP75rmeNJzf5cC6yKhR3YSIikEfcU/Jh4JkhBbd47fI8U4n5aTfULbpHhQxTQePybvbD4eKcUHjPxmr1Z5znbClWrIFUxBtWD41YL+JFGXiaPOi+yaUhXCCa/Yc5qtod0AqMqQb1p5g8givX5LKYDOmmnV1dSHvhSVgyAb32JwkAdysZf1KPquws2c18HxQ8Rmfr8Vz76ZVcstpXHcQJzBAqvC1W/8Ph3tinsPK+DJpz0xXZgec7OG5uYzxdgir8PhOPNducjlcelsjKwBikQ6UtFme3mUSGoJAQcBEXOnRE56NSw52iYqGBdR1j/cuu2PxbZxJZUGG21gEVX79eaywwN0TFuKExOxWiZeREy7XyG4CtflUvSEG574+eIIRZE2Lg/AC1T2EK1BJ3lcnnLlHyl8F+T3QYAQX2fWR0BY526rlQcb6+4x2KYjvacqxjL3o0tRgjvoXZfA9F4+VwptCDD/u8ERSygSYjy6AbY+aAE7MNhPxuJ9bEWopRkrv+JnM9oFDd6nrzwx4trfr6IN4+/yA=="
};

const targetUrl = "https://api.baontq.xyz/v4/client/key-v2";

const server = http.createServer((req, res) => {
  const options = {
    method: "POST",
    headers: req.headers
  };

  const proxyReq = https.request(targetUrl, options, (proxyRes) => {
    let originalHeaders = { ...proxyRes.headers };

    // Brotli ile sıkıştırılmış sabit body
    const body = Buffer.from(JSON.stringify(fixedResponse));
    const compressed = brotli.compress(body);

    // Orijinal tüm header'ları ayarla (content-* hariç)
    Object.entries(originalHeaders).forEach(([key, value]) => {
      if (!["content-length", "content-encoding"].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    res.setHeader("Content-Encoding", "br");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Length", Buffer.byteLength(compressed));
    res.writeHead(200);
    res.end(compressed);
  });

  proxyReq.on("error", (e) => {
    res.writeHead(502);
    res.end(`Proxy error: ${e.message}`);
  });

  // İsteği pipe et (gelen body varsa onu da gönder)
  req.pipe(proxyReq);
});

server.listen(3000, () => {
  console.log("Proxy listening on http://localhost:3000/");
});
