const apiKey = process.env.GEMINI_API_KEY;

async function run() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  const veoModels = data.models.filter(m => m.name.includes("veo") || m.name.includes("video"));
  console.log(JSON.stringify(veoModels, null, 2));
}

run();
