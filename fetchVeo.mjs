import fs from 'fs';

const apiKey = process.env.GEMINI_API_KEY;

async function run() {
  const operationName = "models/veo-3.1-fast-generate-preview/operations/fpx0k7pzi39f";
  const pollEndpoint = `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`;
  const pollRes = await fetch(pollEndpoint);
  const pollData = await pollRes.json();
  
  // write to a file so it's not truncated
  fs.writeFileSync('veo_response.json', JSON.stringify(pollData, null, 2));
  console.log("Saved to veo_response.json");
  // Log the first few lines to see the structure
  console.log(Object.keys(pollData));
  if (pollData.response) {
     console.log(Object.keys(pollData.response));
     if (pollData.response.predictions) {
        console.log(Object.keys(pollData.response.predictions[0]));
     }
  }
}

run();
