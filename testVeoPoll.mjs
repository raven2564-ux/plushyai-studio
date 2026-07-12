const apiKey = process.env.GEMINI_API_KEY;

async function run() {
  const operationName = "models/veo-3.1-fast-generate-preview/operations/0qzq6q1526or";
  // Check if we need to hit /v1beta/operations/... or /v1beta/models/.../operations/...
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'GET'
  });

  const data = await response.json();
  console.log("Status:", response.status);
  console.log(JSON.stringify(data, null, 2));
}

run();
