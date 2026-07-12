const url = 'https://firebasestorage.googleapis.com/v0/b/plushyai-720cd.firebasestorage.app/o/users%2F9sw4PSABkEMImaMGNg5eaINv83u1%2Fcreations%2Fsticker-1780417995028.png?alt=media&token=aff554fa-4057-45e0-a10b-e82e0ebdebd3';
const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(url);

fetch(proxyUrl).then(r => {
  console.log(r.status, r.headers.get('content-type'));
}).catch(console.error);
