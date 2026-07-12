import React from 'react';
import './PricingModal.css';

export function PricingModal({ isOpen, onClose, onSelectPackage, isBuying }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content pricing-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <h2 className="pricing-title">Choose Your <span className="text-gradient">Credits</span> Package</h2>
        <p className="pricing-subtitle">Use credits to generate stunning art and videos.</p>

        <div className="pricing-cards-container">
          
          {/* Basic Package */}
          <div className="pricing-card">
            <div className="card-header">
              <h3>Basic</h3>
              <p className="credits-amount">500 Credits</p>
            </div>
            <div className="card-price">
              <span className="currency">$</span>12<span className="decimals">.99</span>
            </div>
            <ul className="card-features">
              <li>~ 33 HD Images</li>
              <li>Or 50 Stickere</li>
              <li>Or 3 HD 3D Objects</li>
              <li>Or 6 Full HD Videos</li>
              <li>Full AI models access</li>
            </ul>
            <button 
              className="btn-package" 
              onClick={() => onSelectPackage('basic')}
              disabled={isBuying}
            >
              Buy
            </button>
          </div>

          {/* Starter Package */}
          <div className="pricing-card">
            <div className="card-header">
              <h3>Starter</h3>
              <p className="credits-amount">1000 Credits</p>
            </div>
            <div className="card-price">
              <span className="currency">$</span>19<span className="decimals">.99</span>
            </div>
            <ul className="card-features">
              <li>~ 66 HD Images</li>
              <li>Or 100 Stickere</li>
              <li>Or 6 HD 3D Objects</li>
              <li>Or 13 Full HD Videos</li>
              <li>Full AI models access</li>
            </ul>
            <button 
              className="btn-package" 
              onClick={() => onSelectPackage('starter')}
              disabled={isBuying}
            >
              Buy
            </button>
          </div>

          {/* Pro Package */}
          <div className="pricing-card popular">
            <div className="popular-badge">Most Popular</div>
            <div className="card-header">
              <h3>Pro</h3>
              <p className="credits-amount">2200 Credits</p>
            </div>
            <div className="card-price">
              <span className="currency">$</span>39<span className="decimals">.99</span>
            </div>
            <ul className="card-features">
              <li>~ 146 HD Images</li>
              <li>Or 220 Stickere</li>
              <li>Or 14 HD 3D Objects</li>
              <li>Or 29 Full HD Videos</li>
              <li>Priority Generation</li>
            </ul>
            <button 
              className="btn-package btn-premium-solid" 
              onClick={() => onSelectPackage('pro')}
              disabled={isBuying}
            >
              Buy Pro
            </button>
          </div>

          {/* Studio Package */}
          <div className="pricing-card">
            <div className="card-header">
              <h3>Studio</h3>
              <p className="credits-amount">6000 Credits</p>
            </div>
            <div className="card-price">
              <span className="currency">$</span>99<span className="decimals">.99</span>
            </div>
            <ul className="card-features">
              <li>~ 400 HD Images</li>
              <li>Or 600 Stickere</li>
              <li>Or 40 HD 3D Objects</li>
              <li>Or 80 Full HD Videos</li>
              <li>Best price per credit</li>
            </ul>
            <button 
              className="btn-package" 
              onClick={() => onSelectPackage('studio')}
              disabled={isBuying}
            >
              Buy
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
