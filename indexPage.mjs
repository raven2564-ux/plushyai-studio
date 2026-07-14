import { google } from 'googleapis';
import fs from 'fs';

// Calea către fișierul cheie JSON descărcat
const KEY_FILE = './plushyai-720cd-290c50555016.json';
const URL_TO_INDEX = 'https://lovely-axolotl-366f68.netlify.app/';

if (!fs.existsSync(KEY_FILE)) {
  console.error(`Error: Key file ${KEY_FILE} not found!`);
  process.exit(1);
}

// Încarcă cheia privată
const keyData = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'));

// Configurează clientul JWT de autentificare
const jwtClient = new google.auth.JWT({
  keyFile: KEY_FILE,
  scopes: ['https://www.googleapis.com/auth/indexing']
});

jwtClient.authorize(async (err, tokens) => {
  if (err) {
    console.error('Authentication failed:', err);
    return;
  }

  console.log('Successfully authenticated with Google Cloud.');

  // Parametrii cererii pentru Indexing API
  const options = {
    url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens.access_token}`,
    },
    body: JSON.stringify({
      url: URL_TO_INDEX,
      type: 'URL_UPDATED', // Trimite semnal că pagina a fost creată/actualizată
    }),
  };

  try {
    // Trimite cererea de indexare direct
    const response = await fetch(options.url, {
      method: options.method,
      headers: options.headers,
      body: options.body
    });

    const data = await response.json();
    if (response.ok) {
      console.log('🎉 GOOGLE INDEXING SUCCESS!');
      console.log('Response:', data);
      console.log(`\nGooglebot will crawl "${URL_TO_INDEX}" very soon (usually within a few minutes).`);
    } else {
      console.error('Google API returned an error:', data);
    }
  } catch (fetchErr) {
    console.error('Network request failed:', fetchErr);
  }
});
