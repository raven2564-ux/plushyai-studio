import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { PricingModal } from './PricingModal';
import './Header.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export function Header({ currentView, onViewChange }) {
  const { currentUser, credits, loginWithGoogle, logout } = useAuth();
  const [isBuying, setIsBuying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBuyCredits = async (packageId) => {
    if (!currentUser) return;
    setIsBuying(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: currentUser.uid, packageId }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        alert("Server error: Start the backend server (node index.js) with a valid Stripe key.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert(`An error occurred. Make sure the backend server is running.`);
    } finally {
      setIsBuying(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
    <header className="header">
      <div className="header-container container">
        <div className="header-logo" style={{ cursor: 'pointer' }} onClick={() => onViewChange('create')}>
          <span className="logo-icon">✨</span>
          <h1 className="logo-text">
            Plushy<span className="text-gradient">Ai</span> Studio
          </h1>
        </div>
        <nav className="header-nav">
          {currentUser ? (
            <div className="user-menu">
              <span className="credits-badge">
                💳 {currentUser.email === 'd91173916@gmail.com' ? 'Admin (∞)' : `${credits} Credits`}
              </span>
              <button 
                className={`btn-nav ${currentView === 'create' ? 'active' : ''}`}
                onClick={() => onViewChange('create')}
              >
                ✨ Create
              </button>
              <button 
                className={`btn-nav ${currentView === 'gallery' ? 'active' : ''}`}
                onClick={() => onViewChange('gallery')}
              >
                🎨 My Gallery
              </button>
              <button 
                className="btn-premium" 
                onClick={() => setIsModalOpen(true)}
              >
                🛒 Get Credits
              </button>
              <button className="btn-secondary" onClick={logout}>Sign Out</button>
            </div>
          ) : (
            <button className="btn-primary" onClick={loginWithGoogle}>Sign In with Google</button>
          )}
        </nav>
      </div>
    </header>
    
    <PricingModal 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)} 
      onSelectPackage={handleBuyCredits}
      isBuying={isBuying}
    />
    </>
  );
}
