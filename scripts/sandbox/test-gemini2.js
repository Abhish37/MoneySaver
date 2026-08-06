const key = process.env.GEMINI_API_KEY || 'YOUR_API_KEY';
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + key, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({contents:[{parts:[{text: 'hello'}]}]})
})
.then(r => r.text())
.then(console.log)
.catch(console.error);
