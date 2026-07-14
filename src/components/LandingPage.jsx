import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './LandingPage.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export function LandingPage() {
  const { loginWithGoogle } = useAuth();
  const [enlargedModel, setEnlargedModel] = useState(null);
  
  const showcaseItems = [
    { type: '3d', url: 'https://firebasestorage.googleapis.com/v0/b/plushyai-720cd.firebasestorage.app/o/users%2F9sw4PSABkEMImaMGNg5eaINv83u1%2Fcreations%2F3d-1780429216535.glb?alt=media&token=9343c443-f915-4605-a238-fadf85809fa1' },
    { type: '3d', url: 'https://firebasestorage.googleapis.com/v0/b/plushyai-720cd.firebasestorage.app/o/users%2F9sw4PSABkEMImaMGNg5eaINv83u1%2Fcreations%2F3d-1780456244386.glb?alt=media&token=6fb486f7-6206-4b91-9ae6-b20cf61be499' },
    { type: '3d', url: 'https://firebasestorage.googleapis.com/v0/b/plushyai-720cd.firebasestorage.app/o/users%2F9sw4PSABkEMImaMGNg5eaINv83u1%2Fcreations%2F3d-1780454799248.glb?alt=media&token=c5c82384-b619-4623-a968-eb4879201d93' },
    { type: '3d', url: 'https://firebasestorage.googleapis.com/v0/b/plushyai-720cd.firebasestorage.app/o/users%2F9sw4PSABkEMImaMGNg5eaINv83u1%2Fcreations%2F3d-1780420422429.glb?alt=media&token=daec59ec-d958-4f2b-ac27-9c256fd7e893' },
    { type: 'image', url: 'https://firebasestorage.googleapis.com/v0/b/plushyai-720cd.firebasestorage.app/o/users%2F9sw4PSABkEMImaMGNg5eaINv83u1%2Fcreations%2Fsticker-1780417995028.png?alt=media&token=aff554fa-4057-45e0-a10b-e82e0ebdebd3' },
    { type: 'image', url: 'https://firebasestorage.googleapis.com/v0/b/plushyai-720cd.firebasestorage.app/o/users%2F9sw4PSABkEMImaMGNg5eaINv83u1%2Fcreations%2Fsticker-1780419558100.png?alt=media&token=b839c872-fcff-4bd0-9f0b-2f8f6541ef43' },
    { type: 'image', url: 'https://firebasestorage.googleapis.com/v0/b/plushyai-720cd.firebasestorage.app/o/users%2F9sw4PSABkEMImaMGNg5eaINv83u1%2Fcreations%2Fimage-1780404199447.png?alt=media&token=c8ccea83-f76b-49a2-bc45-077c6d8db328' },
    { type: 'image', url: 'https://firebasestorage.googleapis.com/v0/b/plushyai-720cd.firebasestorage.app/o/users%2F9sw4PSABkEMImaMGNg5eaINv83u1%2Fcreations%2Fimage-1780417753904.png?alt=media&token=bb3ea100-4b7b-4ed2-9c48-6ec8aea9928e' },
    { type: 'video', url: 'https://firebasestorage.googleapis.com/v0/b/plushyai-720cd.firebasestorage.app/o/users%2F9sw4PSABkEMImaMGNg5eaINv83u1%2Fcreations%2Fvideo-1780389384989.mp4?alt=media&token=b06e4f4c-2aa1-4a91-b439-75a2db9b06cf' },
    { type: 'video', url: 'https://firebasestorage.googleapis.com/v0/b/plushyai-720cd.firebasestorage.app/o/users%2F9sw4PSABkEMImaMGNg5eaINv83u1%2Fcreations%2Fvideo-1780640370917.mp4?alt=media&token=79ec23be-7851-4b0b-a0bd-b42a9e83b934' },
    { type: 'video', url: 'https://firebasestorage.googleapis.com/v0/b/plushyai-720cd.firebasestorage.app/o/users%2F9sw4PSABkEMImaMGNg5eaINv83u1%2Fcreations%2Fvideo-1780628085543.mp4?alt=media&token=a31c1de4-d21d-46ca-879a-cc13359706f8' },
    { type: 'video', url: 'https://firebasestorage.googleapis.com/v0/b/plushyai-720cd.firebasestorage.app/o/users%2F9sw4PSABkEMImaMGNg5eaINv83u1%2Fcreations%2Fvideo-1780389556955.mp4?alt=media&token=2ba4247a-af16-44ad-9b00-f1a13a84171f' }
  ];

  return (
    <>
    <div className="landing-container glass-panel">
      <div className="landing-content">
        <h2 className="landing-title">
          Welcome to <span className="text-gradient">PlushyAi Studio</span>
        </h2>
        <p className="landing-subtitle">
          Turn your imagination into reality. Generate highly detailed 3D Objects, stunning Images, Stickers, and cinematic Videos using the power of AI.
        </p>

        {/* About Section */}
        <div className="about-section">
          <div className="about-badge">📖 What is PlushyAi?</div>
          
          <div className="about-grid">
            <div className="about-card">
              <div className="about-icon">🎨</div>
              <h3>Generate Anything</h3>
              <p>From cute stickers to professional 3D models, you can create it all with a simple text prompt.</p>
            </div>

            <div className="about-card">
              <div className="about-icon">🧠</div>
              <h3>AI-Powered Magic</h3>
              <p>Our platform uses the latest AI models to turn your ideas into stunning creations in minutes.</p>
            </div>

            <div className="about-card">
              <div className="about-icon">🔐</div>
              <h3>Your Work is Safe</h3>
              <p>All your creations are stored securely in your account, and you can access them anytime.</p>
            </div>
          </div>
        </div>
        
        <div className="landing-showcase">
          <div className="showcase-badge">✨ Interactive Showcase</div>
          
          <div className="models-grid">
            {showcaseItems.map((item, index) => (
              <div className="model-wrapper" key={index} style={{ position: 'relative' }}>
                {item.type === '3d' ? (
                  <model-viewer
                    src={`${BACKEND_URL}/api/proxy-glb?url=${encodeURIComponent(item.url)}`}
                    alt="Showcase 3D Object"
                    auto-rotate
                    camera-controls
                    shadow-intensity="1"
                    environment-image="neutral"
                    style={{ width: '100%', height: '300px', backgroundColor: '#f8f0f8', borderRadius: '12px', outline: 'none', cursor: 'grab', border: '1px solid rgba(255, 158, 196, 0.4)' }}
                  ></model-viewer>
                ) : item.type === 'video' ? (
                  <video 
                    src={item.url} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    style={{ width: '100%', height: '300px', objectFit: 'cover', backgroundColor: '#f0f4ff', borderRadius: '12px', border: '1px solid rgba(158, 210, 255, 0.4)' }} 
                  />
                ) : (
                  <img 
                    src={item.url} 
                    alt="Showcase Item" 
                    style={{ width: '100%', height: '300px', objectFit: 'contain', backgroundColor: '#fff5f8', borderRadius: '12px', border: '1px solid rgba(255, 158, 196, 0.4)' }} 
                  />
                )}
                <div 
                  className="enlarge-button-overlay"
                  style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 10 }}
                >
                  <button 
                    className="btn-icon" 
                    title="Enlarge" 
                    onClick={() => setEnlargedModel({ type: item.type, url: item.url })}
                    style={{ background: 'rgba(255, 158, 196, 0.4)', backdropFilter: 'blur(5px)', padding: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                  >
                    🔍
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="showcase-caption">Interact with these generated creations or click 🔍 to enlarge! 👆</p>
        </div>

        <div className="landing-cta">
          <p>Ready to create your own?</p>
          <button className="btn-primary btn-large" onClick={loginWithGoogle}>
            🚀 Sign In with Google to Start
          </button>
        </div>
      </div>
    </div>

    {/* Lightbox for enlarged Item */}
    {enlargedModel && (
      <div className="lightbox-overlay" onClick={() => setEnlargedModel(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(245, 235, 245, 0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button className="lightbox-close" onClick={() => setEnlargedModel(null)} title="Close" style={{ position: 'absolute', top: '20px', right: '30px', background: 'none', border: 'none', color: '#3d3d4f', fontSize: '40px', cursor: 'pointer' }}>&times;</button>
        <div className="lightbox-content" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '800px', height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {enlargedModel.type === '3d' ? (
            <model-viewer
              src={`${BACKEND_URL}/api/proxy-glb?url=${encodeURIComponent(enlargedModel.url)}`}
              alt="Enlarged 3D Object"
              auto-rotate
              camera-controls
              shadow-intensity="1"
              environment-image="neutral"
              style={{ width: '100%', height: '100%', backgroundColor: '#f8f0f8', borderRadius: '16px', outline: 'none', border: '1px solid rgba(255, 158, 196, 0.4)' }}
            ></model-viewer>
          ) : enlargedModel.type === 'video' ? (
            <video 
              src={enlargedModel.url} 
              autoPlay 
              loop 
              controls
              style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '16px', outline: 'none', border: '1px solid rgba(158, 210, 255, 0.4)' }} 
            />
          ) : (
            <img 
              src={enlargedModel.url} 
              alt="Enlarged Item" 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '16px', border: '1px solid rgba(255, 158, 196, 0.4)' }} 
            />
          )}
        </div>
      </div>
    )}
    </>
  );
}
