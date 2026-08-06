const imageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
fetch('https://moneysaver-five.vercel.app/api/v1/vault/ocr-upload', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({imageBase64, fileName: 'test.png'})
})
.then(r => r.json().then(j => ({status: r.status, json: j})))
.then(console.log)
.catch(console.error);
