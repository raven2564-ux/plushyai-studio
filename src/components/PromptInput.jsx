import React, { useState, useRef } from 'react';
import './PromptInput.css';

const STYLES = {
  sticker: [
    { id: '3d', label: '3D Render', icon: '🧊' },
    { id: 'cartoon', label: 'Cartoon', icon: '🎨' },
    { id: 'pixel', label: 'Pixel Art', icon: '👾' },
    { id: 'minimalist', label: 'Minimalist', icon: '✨' },
  ],
  image: [
    { id: 'realistic', label: 'Realistic', icon: '📸' },
    { id: 'cinematic', label: 'Cinematic', icon: '🎬' },
    { id: 'none', label: 'No Style', icon: '📝' },
  ],
  video: [
    { id: 'animation', label: 'Animation', icon: '🎞️' },
    { id: 'drone', label: 'Drone Shot', icon: '🚁' },
    { id: 'slowmo', label: 'Slow Motion', icon: '⏱️' },
    { id: 'timelapse', label: 'Time Lapse', icon: '⏳' },
  ],
  '3d': [
    { id: 'detailed', label: 'Detailed Mesh', icon: '🧱' },
    { id: 'cartoon3d', label: 'Cartoon 3D', icon: '🧸' },
    { id: 'lowpoly', label: 'Low Poly', icon: '📐' },
    { id: 'anime3d', label: 'Anime 3D', icon: '🌸' },
  ],
  wallpaper: [
    { id: 'cinemagraph', label: 'Cinemagraph', icon: '🌊' },
    { id: 'fullAnimation', label: 'Full Animation', icon: '🎆' },
    { id: 'particles', label: 'Particles', icon: '✨' },
    { id: 'ambient', label: 'Ambient', icon: '🌙' },
  ]
};

const ASPECT_RATIOS = [
  { id: '1:1', label: 'Square (1:1)' },
  { id: '16:9', label: 'Landscape (16:9)' },
  { id: '9:16', label: 'Portrait (9:16)' }
];

const WALLPAPER_FORMATS = [
  { id: '16:9', label: '🖥️ Desktop (16:9)', icon: '🖥️' },
  { id: '9:16', label: '📱 Phone (9:16)', icon: '📱' },
];

export function PromptInput({ onGenerate, isGenerating }) {
  const [mode, setMode] = useState('sticker');
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('3d');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setUploadedImage(null);
    setUploadedImagePreview(null);
    // Reset style selection when switching modes
    if (newMode === 'sticker') {
      setSelectedStyle('3d');
      setAspectRatio('1:1'); // Stickers are usually square
    } else if (newMode === 'video') {
      setSelectedStyle('animation');
      setAspectRatio('16:9'); // Videos usually look best in landscape
    } else if (newMode === '3d') {
      setSelectedStyle('detailed');
      setAspectRatio('1:1');
    } else if (newMode === 'wallpaper') {
      setSelectedStyle('cinemagraph');
      setAspectRatio('16:9');
    } else {
      setSelectedStyle('realistic');
    }
  };

  const handleImageUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result); // base64 string
      setUploadedImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleImageUpload(file);
  };

  const removeImage = () => {
    setUploadedImage(null);
    setUploadedImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onGenerate({ 
        prompt, 
        style: selectedStyle, 
        mode, 
        aspectRatio,
        ...(mode === 'wallpaper' && uploadedImage ? { imageBase64: uploadedImage } : {})
      });
    }
  };

  const getPlaceholder = () => {
    switch(mode) {
      case 'video': return "Ex: A drone flying over a snowy mountain range during sunset...";
      case '3d': return "Ex: A fantasy golden key, highly detailed, realistic game asset...";
      case 'sticker': return "Ex: An astronaut kitten flying through a galaxy of donuts...";
      case 'wallpaper': return "Ex: A magical forest with floating fireflies and gentle wind blowing through cherry blossoms...";
      default: return "Ex: A cyberpunk cityscape in the rain with a flying car...";
    }
  };

  const getCost = () => {
    if (mode === 'sticker') return 10;
    if (mode === 'image') return 15;
    if (mode === 'video' || mode === 'wallpaper') return 75;
    if (mode === '3d') return 150;
    return 15;
  };

  const getButtonLabel = () => {
    const cost = getCost();
    switch(mode) {
      case 'sticker': return `✨ Generate Sticker (-${cost} 💳)`;
      case 'video': return `🎥 Generate Video (-${cost} 💳)`;
      case '3d': return `📦 Generate 3D Object (-${cost} 💳)`;
      case 'wallpaper': return uploadedImage ? `🎆 Animate Image (-${cost} 💳)` : `🎆 Generate Wallpaper (-${cost} 💳)`;
      default: return `🎨 Generate Image (-${cost} 💳)`;
    }
  };

  return (
    <section className="prompt-section">
      <div className="prompt-header">
        <h2>Transform your ideas into art!</h2>
        <p>Choose your mode and describe what you want to create.</p>
      </div>

      <div className="mode-toggle">
        <button 
          className={`mode-btn ${mode === 'sticker' ? 'active' : ''}`}
          onClick={() => handleModeChange('sticker')}
        >
          ✨ Sticker
        </button>
        <button 
          className={`mode-btn ${mode === 'image' ? 'active' : ''}`}
          onClick={() => handleModeChange('image')}
        >
          🖼️ Image
        </button>
        <button 
          className={`mode-btn ${mode === 'video' ? 'active' : ''}`}
          onClick={() => handleModeChange('video')}
        >
          🎥 Video
        </button>
        <button 
          className={`mode-btn ${mode === '3d' ? 'active' : ''}`}
          onClick={() => handleModeChange('3d')}
        >
          📦 3D Object
        </button>
      </div>

      <form onSubmit={handleSubmit} className="prompt-form glass-panel">
        {/* Wallpaper Image Upload Area */}
        {mode === 'wallpaper' && (
          <div className="upload-section">
            <span className="selector-label">Upload an image to animate (optional):</span>
            {!uploadedImagePreview ? (
              <div 
                className={`upload-drop-area ${isDragging ? 'dragging' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-drop-icon">📷</div>
                <p className="upload-drop-text">Drag & drop an image here or <span className="upload-browse">browse</span></p>
                <p className="upload-drop-hint">PNG, JPG, WEBP — max 10MB</p>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div className="upload-preview">
                <img src={uploadedImagePreview} alt="Upload preview" className="upload-preview-image" />
                <button type="button" className="upload-remove-btn" onClick={removeImage}>✕ Remove</button>
              </div>
            )}
          </div>
        )}

        <div className="input-group">
          <textarea
            className="prompt-textarea"
            placeholder={getPlaceholder()}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            disabled={isGenerating}
          />
        </div>

        <div className="controls-group">
          <div className="options-panel">
            <div className="style-selector">
              <span className="selector-label">Style:</span>
              <div className="style-options">
                {STYLES[mode].map(style => (
                  <button
                    key={style.id}
                    type="button"
                    className={`style-btn ${selectedStyle === style.id ? 'active' : ''}`}
                    onClick={() => setSelectedStyle(style.id)}
                    disabled={isGenerating}
                  >
                    <span className="style-icon">{style.icon}</span>
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'wallpaper' && (
              <div className="style-selector aspect-selector">
                <span className="selector-label">Device Format:</span>
                <div className="style-options">
                  {WALLPAPER_FORMATS.map(format => (
                    <button
                      key={format.id}
                      type="button"
                      className={`style-btn ${aspectRatio === format.id ? 'active' : ''}`}
                      onClick={() => setAspectRatio(format.id)}
                      disabled={isGenerating}
                    >
                      {format.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(mode === 'image' || mode === 'video') && (
              <div className="style-selector aspect-selector">
                <span className="selector-label">Format (Ratio):</span>
                <div className="style-options">
                  {ASPECT_RATIOS.map(ratio => {
                    if (mode === 'video' && ratio.id === '1:1') return null;
                    return (
                      <button
                        key={ratio.id}
                        type="button"
                        className={`style-btn ${aspectRatio === ratio.id ? 'active' : ''}`}
                        onClick={() => setAspectRatio(ratio.id)}
                        disabled={isGenerating}
                      >
                        {ratio.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn-generate"
            disabled={!prompt.trim() || isGenerating}
          >
            {isGenerating ? (
              <span className="btn-content">
                <span className="spinner"></span> Processing...
              </span>
            ) : (
              <span className="btn-content">
                {getButtonLabel()}
              </span>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
