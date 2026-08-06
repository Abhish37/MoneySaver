const key = process.env.GEMINI_API_KEY || 'YOUR_API_KEY';
const imageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; 
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=' + key, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    contents:[{
      parts:[
        {text: 'Describe this image'},
        {inline_data: {mime_type: 'image/png', data: imageBase64}}
      ]
    }]
  })
})
.then(r => r.json().then(j => ({status: r.status, json: j})))
.then(console.log)
.catch(console.error);
