const apiKey = process.env.GEMINI_API_KEY;

async function run() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  const imageModels = data.models.filter(m => m.name.includes("imagen"));
  console.log(JSON.stringify(imageModels, null, 2));
}

run();
