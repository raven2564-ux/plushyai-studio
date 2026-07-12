const apiKey = process.env.GEMINI_API_KEY;

async function run() {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-fast-generate-preview:predictLongRunning?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      instances: [
        { prompt: "a cat running" }
      ],
      parameters: {
        sampleCount: 1,
        durationSeconds: 4
      }
    })
  });

  const data = await response.json();
  console.log("Status:", response.status);
  console.log(JSON.stringify(data, null, 2));
}

run();
