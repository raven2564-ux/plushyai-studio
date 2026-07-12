const apiKey = process.env.GEMINI_API_KEY;

async function translateAndOptimizePrompt(prompt, apiKey) {
  if (!prompt || prompt.trim().length === 0) return prompt;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert translator and AI prompt engineer. You will receive an enhanced prompt for an AI image/video/sticker generator. This prompt contains a user-described subject (which might be in Romanian or another language) followed by specific English style modifiers (like '3D render', 'die-cut sticker', '8k resolution', etc.). Translate the non-English subject parts to English, optimize/refine them slightly for clarity and visual beauty, and keep all the English style modifiers intact at the end of the prompt. Respond ONLY with the final English prompt. Do not add quotes, markdown, or intro/outro.\n\nInput prompt: ${prompt}`
          }]
        }]
      })
    });

    const data = await response.json();
    if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
      let result = data.candidates[0].content.parts[0].text.trim();
      if (result.startsWith('"') && result.endsWith('"')) {
        result = result.substring(1, result.length - 1);
      }
      return result;
    }
  } catch (error) {
    console.error("Translate error", error);
  }
  return prompt;
}

async function run() {
  const enhancedPrompt = "u ruiny wood, fully animated scene, dynamic motion, flowing movement, vibrant colors, cinematic quality, smooth animation, seamless loop, 8k resolution, highly detailed, masterpiece, crystal clear, sharp focus, high quality, vivid details";
  const finalPrompt = await translateAndOptimizePrompt(enhancedPrompt, apiKey);
  console.log("Final Prompt:", finalPrompt);
  
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-fast-generate-preview:predictLongRunning?key=${apiKey}`;

  console.log("Starting Veo request...");
  const requestBody = {
    instances: [{ prompt: finalPrompt }],
    parameters: {
      sampleCount: 1,
      durationSeconds: 8,
      aspectRatio: "9:16",
      resolution: "1080p"
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
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
      console.log("Done! Error field:", pollData.error);
    }
  }
}

run();
