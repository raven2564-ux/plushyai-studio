import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './LandingPage.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export function LandingPage() {
  const { loginWithGoogle } = useAuth();
  const [enlargedModel, setEnlargedModel] = useState(null);
  
  const showcaseItems = [
    // Use public, permanent URLs for showcase
    { type: 'image', url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80' },
    { type: 'image', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80' },
    { type: 'image', url: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=400&q=80' },
    { type: 'image', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80' },
    // 3D models (from public CDN)
    { type: '3d', url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' },
    { type: '3d', url: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb' },
    { type: '3d', url: 'https://modelviewer.dev/shared-assets/models/Horse.glb' },
    { type: '3d', url: 'https://modelviewer.dev/shared-assets/models/Burger.glb' },
    // Sample videos (placeholder)
    { type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { type: 'video', url: 'https://www.w3schools.com/html/movie.mp4' },
    { type: 'image', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80' },
    { type: 'image', url: 'https://images.unsplash.com/photo-1488888307935-1a252f41e961?w=400&q=80' }
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
                    src={item.url}
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
