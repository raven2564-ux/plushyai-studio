import React, { useState } from 'react';
import './StickerGallery.css';
import { Loader } from './Loader';
import { useAuth } from './AuthContext';
import { db, storage, collection, addDoc, deleteDoc, doc, getDocs, query, ref, uploadBytes, getDownloadURL, deleteObject } from '../firebase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

function MutedVideo({ src, className, controls = false }) {
  const videoRef = React.useRef(null);
  const isWallpaper = !controls;

  React.useEffect(() => {
    if (videoRef.current && isWallpaper) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.loop = true;
      videoRef.current.play().catch(err => console.warn("Autoplay block:", err));
    } else if (videoRef.current && !isWallpaper) {
      videoRef.current.defaultMuted = false;
      videoRef.current.muted = false;
      videoRef.current.loop = false;
    }
  }, [src, isWallpaper]);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      autoPlay={isWallpaper}
      loop={isWallpaper}
      muted={isWallpaper}
      playsInline
      controls={controls}
      onEnded={(e) => {
        if (isWallpaper) {
          e.target.currentTime = 0;
          e.target.play().catch(err => console.warn("Manual loop block:", err));
        }
      }}
    />
  );
}

export function StickerGallery({ stickers, isGenerating, onViewChange }) {
  const [activeTab, setActiveTab] = useState('all');
  const [lightboxCreation, setLightboxCreation] = useState(null);
  
  // Diagnostics State
  const { currentUser } = useAuth();
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagnosticsLogs, setDiagnosticsLogs] = useState([]);

  const handleDownload = async (creation) => {
    try {
      // Use our backend proxy to avoid CORS issues when fetching images/videos/glb
      const res = await fetch(`${BACKEND_URL}/api/proxy-glb?url=${encodeURIComponent(creation.url)}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      let extension = 'png';
      if (creation.url.includes('jpeg') || creation.url.includes('jpg')) extension = 'jpg';
      if (creation.mode === 'video' || creation.url.includes('mp4') || creation.url.includes('video')) extension = 'mp4';
      if (creation.mode === '3d' || creation.url.includes('glb')) extension = 'glb';
      if (creation.mode === 'wallpaper') extension = 'mp4';
      a.download = `${creation.mode}-${creation.id}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error("Eroare la descarcare:", e);
      window.open(creation.url, '_blank');
    }
  };

  const handleCopy = async (creation) => {
    try {
      const res = await fetch(creation.url);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      alert("Imagine copiată în clipboard! Poți da paste (Ctrl+V) oriunde.");
    } catch (err) {
      console.error(err);
      alert("Copierea a eșuat. Folosește un browser compatibil.");
    }
  };

  const withTimeout = (promise, ms, errorMsg) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms))
    ]);
  };

  const runDiagnostics = async () => {
    setDiagnosticsRunning(true);
    const logs = [];

    const addLog = (name, status, details) => {
      logs.push({ name, status, details });
      setDiagnosticsLogs([...logs]);
    };

    // 1. Auth Check
    addLog("Verificare Autentificare", "pending", "Se verifică starea contului...");
    if (!currentUser) {
      addLog("Verificare Autentificare", "error", "Nu ești autentificat! Te rog să te conectezi cu Google folosind butonul de sus.");
      setDiagnosticsRunning(false);
      return;
    } else {
      addLog("Verificare Autentificare", "success", `Autentificat ca: ${currentUser.email} (UID: ${currentUser.uid})`);
    }

    // 2. Firestore Read Check
    addLog("Citire din Firestore", "pending", "Se citește colecția ta de creații...");
    try {
      const q = collection(db, `users/${currentUser.uid}/creations`);
      await withTimeout(
        getDocs(q),
        8000,
        "Conexiunea la Firestore a expirat (Timeout). Asigură-te că ai creat baza de date în Firebase Console (apasă pe butonul 'Create Database' din tab-ul Firestore Database)."
      );
      addLog("Citire din Firestore", "success", "Citirea a reușit! Colecția poate fi accesată.");
    } catch (e) {
      addLog("Citire din Firestore", "error", `Eroare citire: ${e.message}. Cel mai probabil regulile Firestore nu permit citirea sau baza de date nu este activată.`);
    }

    // 3. Firestore Write Check
    addLog("Scriere în Firestore", "pending", "Se creează un document de test...");
    let testDocRef = null;
    try {
      testDocRef = await withTimeout(
        addDoc(collection(db, `users/${currentUser.uid}/creations`), {
          prompt: "TEST_DIAGNOSTICS_CONNECTION",
          style: "test",
          mode: "test",
          url: "https://example.com/test.png",
          aspectRatio: "1:1",
          createdAt: new Date().toISOString(),
          isTest: true
        }),
        8000,
        "Scrierea în Firestore a expirat (Timeout). Acest lucru se întâmplă de obicei când baza de date Firestore nu este creată în consola Firebase, sau regulile blochează scrierea în totalitate iar SDK-ul rămâne blocat offline."
      );
      addLog("Scriere în Firestore", "success", `Scrierea a reușit! ID document test: ${testDocRef.id}`);
    } catch (e) {
      addLog("Scriere în Firestore", "error", `Eroare scriere: ${e.message}`);
    }

    // 4. Firestore Delete Check (Clean up)
    if (testDocRef) {
      addLog("Curățare Firestore", "pending", "Se șterge documentul de test...");
      try {
        await withTimeout(
          deleteDoc(doc(db, `users/${currentUser.uid}/creations`, testDocRef.id)),
          6000,
          "Curățarea documentului din Firestore a expirat."
        );
        addLog("Curățare Firestore", "success", "Documentul de test a fost șters cu succes!");
      } catch (e) {
        addLog("Curățare Firestore", "error", `Nu s-a putut șterge documentul de test: ${e.message}`);
      }
    }

    // 5. Firebase Storage Check
    addLog("Încărcare în Storage", "pending", "Se încarcă un fișier text de test...");
    let testStorageRef = null;
    try {
      if (!storage) {
        throw new Error("Firebase Storage nu este inițializat. Verifică config-ul.");
      }
      const filename = `test-diagnostics-${Date.now()}.txt`;
      testStorageRef = ref(storage, `users/${currentUser.uid}/creations/${filename}`);
      const blob = new Blob(["test-data"], { type: 'text/plain' });
      
      await withTimeout(
        uploadBytes(testStorageRef, blob),
        8000,
        "Încărcarea în Storage a expirat (Timeout). Asigură-te că ai activat Storage în Firebase Console și că regulile de securitate permit scrierea."
      );
      
      const downloadUrl = await withTimeout(
        getDownloadURL(testStorageRef),
        6000,
        "Generarea URL-ului de descărcare a expirat."
      );
      
      addLog("Încărcare în Storage", "success", `Încărcarea a reușit! Fișierul a fost stocat la URL.`);
    } catch (e) {
      addLog("Încărcare în Storage", "error", `Eroare Storage: ${e.message}`);
    }

    // 6. Firebase Storage Delete Check
    if (testStorageRef) {
      addLog("Curățare Storage", "pending", "Se șterge fișierul de test din Storage...");
      try {
        await withTimeout(
          deleteObject(testStorageRef),
          6000,
          "Ștergerea fișierului din Storage a expirat."
        );
        addLog("Curățare Storage", "success", "Fișierul de test a fost șters din Storage!");
      } catch (e) {
        addLog("Curățare Storage", "error", `Nu s-a putut șterge fișierul din Storage: ${e.message}`);
      }
    }

    setDiagnosticsRunning(false);
  };

  const handleCopyRules = (text, type) => {
    navigator.clipboard.writeText(text);
    alert(`Regulile pentru ${type} au fost copiate în clipboard!`);
  };

  const getCount = (mode) => {
    if (mode === 'all') return stickers.length;
    return stickers.filter(s => s.mode === mode).length;
  };

  const filteredStickers = stickers.filter((creation) => {
    // Filter out test documents
    if (creation.isTest) return false;
    if (activeTab === 'all') return true;
    return creation.mode === activeTab;
  });

  return (
    <section className="gallery-section" id="gallery">
      <div className="gallery-header">
        <div className="gallery-title-area">
          <h3>Your Creations</h3>
          <p>Your recent generations appear here</p>
        </div>
        
        <div className="gallery-tabs-and-actions">
          {/* Category Selector Tabs */}
          <div className="gallery-tabs">
            <button 
              className={`gallery-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              📂 All <span className="tab-count">({getCount('all')})</span>
            </button>
            <button 
              className={`gallery-tab-btn ${activeTab === 'sticker' ? 'active' : ''}`}
              onClick={() => setActiveTab('sticker')}
            >
              ✨ Stickers <span className="tab-count">({getCount('sticker')})</span>
            </button>
            <button 
              className={`gallery-tab-btn ${activeTab === 'image' ? 'active' : ''}`}
              onClick={() => setActiveTab('image')}
            >
              🖼️ Images <span className="tab-count">({getCount('image')})</span>
            </button>
            <button 
              className={`gallery-tab-btn ${activeTab === 'video' ? 'active' : ''}`}
              onClick={() => setActiveTab('video')}
            >
              🎥 Videos <span className="tab-count">({getCount('video')})</span>
            </button>
            <button 
              className={`gallery-tab-btn ${activeTab === '3d' ? 'active' : ''}`}
              onClick={() => setActiveTab('3d')}
            >
              📦 3D Objects <span className="tab-count">({getCount('3d')})</span>
            </button>
          </div>

        </div>
      </div>

      {/* Diagnostics Panel */}
      {showDiagnostics && (
        <div className="diagnostics-panel glass-panel">
          <div className="diagnostics-header">
            <h4>🔧 SYSTEM DIAGNOSTICS: FIREBASE STATUS</h4>
            <span className="pulse-dot"></span>
          </div>
          <p className="diagnostics-intro">
            Dacă imaginile tale dispar sau nu se încarcă în My Gallery, folosește acest instrument pentru a testa conexiunea de securitate la Firestore Database și Firebase Storage.
          </p>
          
          <div className="diagnostics-controls">
            <button 
              className="btn-primary run-diag-btn" 
              onClick={runDiagnostics} 
              disabled={diagnosticsRunning}
            >
              {diagnosticsRunning ? "Se testează..." : "Rulează Test Conectare Database"}
            </button>
          </div>

          {diagnosticsLogs.length > 0 && (
            <div className="diagnostics-logs">
              {diagnosticsLogs.map((log, index) => (
                <div key={index} className={`log-item status-${log.status}`}>
                  <span className="log-icon">
                    {log.status === 'pending' && '⏳'}
                    {log.status === 'success' && '✓'}
                    {log.status === 'error' && '✗'}
                  </span>
                  <div className="log-details">
                    <strong>{log.name}</strong>: {log.details}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Show guides if any check failed */}
          {diagnosticsLogs.some(log => log.status === 'error') && (
            <div className="diagnostics-guide">
              <div className="guide-box">
                <h5>📝 Regulile Firebase Firestore recomandate:</h5>
                <p>Mergi în <strong>Firebase Console &rarr; Firestore Database &rarr; Rules</strong> și lipește următorul cod:</p>
                <div className="code-block-container">
                  <pre className="rules-code">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /creations/{creationId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}`}
                  </pre>
                  <button className="btn-secondary btn-copy-code" onClick={() => handleCopyRules(`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /creations/{creationId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}`, "Firestore Database")}>Copiază Regulile Firestore</button>
                </div>
              </div>

              <div className="guide-box">
                <h5>📦 Regulile Firebase Storage recomandate:</h5>
                <p>Mergi în <strong>Firebase Console &rarr; Storage &rarr; Rules</strong> (nu Firestore) și lipește următorul cod:</p>
                <div className="code-block-container">
                  <pre className="rules-code">
{`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`}
                  </pre>
                  <button className="btn-secondary btn-copy-code" onClick={() => handleCopyRules(`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`, "Firebase Storage")}>Copiază Regulile Storage</button>
                </div>
              </div>

              <div className="guide-box">
                <h5>⚠️ Ce să mai verifici în Consolă:</h5>
                <ul>
                  <li>Nu uita să apeși pe butonul albastru <strong>"Publish"</strong> după ce ai lipit regulile!</li>
                  <li>Asigură-te că baza de date a fost de fapt creată dând click pe <strong>"Create Database"</strong> din Firestore Database.</li>
                  <li>Dacă tot nu merge, asigură-te că proiectul tău Firebase are upgrade-ul de plată făcut la <strong>Blaze (Pay-As-You-Go)</strong>, deoarece Google Imagen și Veo necesită acces API care este disponibil doar pe abonamentul Blaze.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid or Empty State */}
      {filteredStickers.length === 0 && !isGenerating ? (
        <div className="no-creations-message glass-panel">
          <div className="empty-state-icon">🎨</div>
          <h4>Momentan nu ai nicio creație în galerie</h4>
          <p>
            {activeTab === 'all' 
              ? 'Toate stickerele, imaginile și videoclipurile pe care le generezi vor apărea aici.' 
              : `Nu ai generat nicio creație în categoria "${activeTab}" încă.`}
          </p>
          
          {onViewChange && (
            <button className="btn-primary empty-state-cta" onClick={() => onViewChange('create')}>
              Creează Prima Ta Artă AI ✨
            </button>
          )}


        </div>
      ) : (
        <div className="gallery-grid">
          {/* Show loader only if we are generating */}
          {isGenerating && (
            <div className="gallery-card generating-card glass-panel">
              <Loader />
              <p className="generating-text">AI is painting the pixels...</p>
            </div>
          )}

          {filteredStickers.map((creation) => {
            let ratioCSS = '1 / 1';
            if (creation.aspectRatio === '16:9') ratioCSS = '16 / 9';
            if (creation.aspectRatio === '9:16') ratioCSS = '9 / 16';

            return (
              <div key={creation.id} className="gallery-card glass-panel" style={{ gridRowEnd: creation.aspectRatio === '9:16' ? 'span 2' : 'span 1' }}>
                <div 
                  className="card-image-container" 
                  style={{ aspectRatio: ratioCSS, cursor: (creation.mode === '3d' || creation.url.includes('.glb')) ? 'grab' : 'zoom-in' }}
                  onClick={() => {
                    if (creation.mode !== '3d' && !creation.url.includes('.glb')) {
                      setLightboxCreation(creation);
                    }
                  }}
                >
                  {creation.mode === '3d' || creation.url.includes('.glb') ? (
                    <model-viewer
                      src={`${BACKEND_URL}/api/proxy-glb?url=${encodeURIComponent(creation.url)}`}
                      alt={creation.prompt}
                      auto-rotate
                      camera-controls
                      shadow-intensity="1"
                      environment-image="neutral"
                      style={{ width: '100%', height: '100%', display: 'block', minHeight: '200px', backgroundColor: '#151522', borderRadius: '8px' }}
                    ></model-viewer>
                  ) : creation.mode === 'wallpaper' ? (
                    <MutedVideo src={creation.url} className="creation-image" controls={false} />
                  ) : creation.mode === 'video' || creation.url.includes('.mp4') || creation.url.includes('video') ? (
                    <MutedVideo src={creation.url} className="creation-image" controls={true} />
                  ) : (
                    <img 
                      src={creation.url} 
                      alt={creation.prompt} 
                      className="creation-image" 
                    />
                  )}
                  <div className="image-overlay" onClick={e => e.stopPropagation()}>
                    <button className="btn-icon" title="Enlarge" onClick={() => setLightboxCreation(creation)}>🔍</button>
                    <button className="btn-icon" title="Download" onClick={() => handleDownload(creation)}>⬇️</button>
                    {creation.mode !== 'video' && creation.mode !== '3d' && (
                      <button className="btn-icon" title="Copy Image" onClick={() => handleCopy(creation)}>📋</button>
                    )}
                  </div>
                </div>
                <div className="card-content">
                  <div className="card-tags">
                    <div className="style-badge">{creation.mode === 'sticker' ? 'Sticker' : creation.mode === 'video' ? 'Video' : creation.mode === '3d' ? '3D Object' : creation.mode === 'wallpaper' ? 'Wallpaper' : 'Image'}</div>
                    <div className="style-badge secondary">{creation.style}</div>
                  </div>
                  <p className="prompt-text" title={creation.prompt}>
                    {creation.prompt}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal with X button */}
      {lightboxCreation && (
        <div className="lightbox-overlay" onClick={() => setLightboxCreation(null)}>
          <button className="lightbox-close" onClick={() => setLightboxCreation(null)} title="Close">&times;</button>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            {lightboxCreation.mode === '3d' || lightboxCreation.url.includes('.glb') ? (
              <model-viewer
                src={`${BACKEND_URL}/api/proxy-glb?url=${encodeURIComponent(lightboxCreation.url)}`}
                alt={lightboxCreation.prompt}
                auto-rotate
                camera-controls
                shadow-intensity="1"
                environment-image="neutral"
                touch-action="pan-y"
                style={{ width: '100%', height: '500px', maxWidth: '600px', minWidth: '300px', display: 'block', backgroundColor: '#151522', borderRadius: '12px' }}
              ></model-viewer>
            ) : lightboxCreation.mode === 'wallpaper' ? (
              <MutedVideo src={lightboxCreation.url} className="lightbox-media" controls={false} />
            ) : lightboxCreation.mode === 'video' || lightboxCreation.url.includes('.mp4') || lightboxCreation.url.includes('video') ? (
              <MutedVideo src={lightboxCreation.url} className="lightbox-media" controls={true} />
            ) : (
              <img src={lightboxCreation.url} alt={lightboxCreation.prompt} className="lightbox-media" />
            )}
            <p className="lightbox-prompt">{lightboxCreation.prompt}</p>
          </div>
        </div>
      )}
    </section>
  );
}
