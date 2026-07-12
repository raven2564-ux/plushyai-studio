import React from 'react';
import './Loader.css';

export function Loader() {
  return (
    <div className="loader-container">
      <div className="hex-loader">
        <div className="hex"></div>
        <div className="hex"></div>
        <div className="hex"></div>
      </div>
    </div>
  );
}
