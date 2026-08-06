const key = process.env.GEMINI_API_KEY || 'YOUR_API_KEY';
const promptText = `Return a JSON array with [1,2,3]`;
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=' + key, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    contents:[{parts:[{text: promptText}]}],
    generationConfig: {
      responseMimeType: "application/json",
    },
  })
})
.then(r => r.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(console.error);
