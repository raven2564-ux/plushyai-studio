const apiKey = process.env.GEMINI_API_KEY;

async function run() {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-fast-generate-preview:predictLongRunning?key=${apiKey}`;

  console.log("Starting test with durationSeconds: 8 and resolution: 1080p...");
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt: "a cat running" }],
      parameters: {
        sampleCount: 1,
        durationSeconds: 8,
        aspectRatio: "16:9",
        resolution: "1080p"
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("Immediate Error:", data);
    return;
  }
  
  const operationName = data.name;
  console.log("Operation started:", operationName);

  let isDone = false;
  let attempts = 0;
  while (!isDone) {
    attempts++;
    console.log(`Polling attempt ${attempts}...`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const pollEndpoint = `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`;
    const pollRes = await fetch(pollEndpoint);
    const pollData = await pollRes.json();
    
    if (pollData.done) {
      isDone = true;
      console.log("Done! Response error field:", pollData.error);
    }
  }
}

run();
