const key = process.env.GEMINI_API_KEY || 'YOUR_API_KEY';
fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + key)
.then(r => r.json())
.then(data => {
  if (data.models) {
    console.log(data.models.map(m => m.name).join('\n'));
  } else {
    console.log(data);
  }
})
.catch(console.error);
