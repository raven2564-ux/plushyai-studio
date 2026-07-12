const url = 'https://firebasestorage.googleapis.com/v0/b/plushyai-720cd.firebasestorage.app/o/users%2F9sw4PSABkEMImaMGNg5eaINv83u1%2Fcreations%2Fsticker-1780417997539.png?alt=media';
fetch(url).then(r => console.log('Status without token:', r.status)).catch(console.error);
