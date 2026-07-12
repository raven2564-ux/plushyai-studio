import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { StickerGallery } from './components/StickerGallery';
import { AuthProvider, useAuth } from './components/AuthContext';
import { LandingPage } from './components/LandingPage';
import { db, doc, collection, addDoc, query, orderBy, getDocs, updateDoc, increment, storage, ref, uploadString, getDownloadURL, uploadBytes, onSnapshot } from './firebase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const compressBase64Image = (base64Str, maxWidth = 800, maxHeight = 800) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressedDataUrl);
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

const uploadToFirebaseStorage = async (fileUrlOrBase64, mode, userId) => {
  if (!storage) {
    console.warn("Firebase Storage is not configured. Falling back to original URL.");
    return fileUrlOrBase64;
  }
  
  try {
    const filename = `${mode}-${Date.now()}`;
    
    if (mode === 'video' || mode === '3d') {
      const res = await fetch(fileUrlOrBase64);
      const blob = await res.blob();
      const ext = mode === '3d' ? 'glb' : 'mp4';
      const storageRef = ref(storage, `users/${userId}/creations/${filename}.${ext}`);
      const uploadResult = await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      console.log(`[Storage] ${mode} uploaded successfully:`, downloadUrl);
      return downloadUrl;
    } else {
      const storageRef = ref(storage, `users/${userId}/creations/${filename}.png`);
      const uploadResult = await uploadString(storageRef, fileUrlOrBase64, 'data_url');
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      console.log("[Storage] Image uploaded successfully:", downloadUrl);
      return downloadUrl;
    }
  } catch (error) {
    console.error("[Storage] Failed to upload to Firebase Storage:", error);
    // Fallback: If Storage fails, compress the image to <100kb so it fits in Firestore
    if (fileUrlOrBase64.startsWith('data:image')) {
      try {
        const compressed = await compressBase64Image(fileUrlOrBase64);
        console.log("[Storage Fallback] Image compressed successfully, new size:", compressed.length);
        return compressed;
      } catch (compressErr) {
        console.error("Compression failed:", compressErr);
      }
    }
    return fileUrlOrBase64;
  }
};

function App() {
  const [creations, setCreations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [view, setView] = useState('create');
  const [error, setError] = useState(null);
  const { currentUser, credits } = useAuth();

  useEffect(() => {
    // Check for Stripe redirect statuses
    const urlQuery = new URLSearchParams(window.location.search);
    if (urlQuery.get("success")) {
      alert("Payment accepted! The premium credits have been added to your account.");
      window.history.replaceState(null, '', window.location.pathname);
    }
    if (urlQuery.get("canceled")) {
      alert("Transaction was canceled. You have not been charged.");
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setCreations([]);
      return;
    }
    
    // Set up a real-time listener to automatically load and update creations list
    const q = query(collection(db, `users/${currentUser.uid}/creations`), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetched = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      setCreations(fetched);
    }, (error) => {
      console.error("Error listening to creations:", error);
      alert(`Database Read Error: ${error.message}\nVerifică regulile Firestore Database!`);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const saveAndAddCreation = async (creationData) => {
    const newCreation = { ...creationData, createdAt: new Date().toISOString() };
    
    if (currentUser) {
      // Save to Firebase in the background. The onSnapshot listener will
      // automatically update the UI creations list instantly.
      addDoc(collection(db, `users/${currentUser.uid}/creations`), newCreation)
        .then((docRef) => {
          console.log("Saved to Firebase successfully, ID:", docRef.id);
        })
        .catch((e) => {
          console.error("Failed to save to Firebase in background:", e);
          alert(`Database Write Error: ${e.message}\nCreația nu s-a putut salva permanent în cont.`);
        });
    }
  };

  const getStylePrompt = (basePrompt, style, mode) => {
    // Add high quality modifiers for all generations
    const qualityModifiers = "8k resolution, highly detailed, masterpiece, crystal clear, sharp focus, high quality, vivid details";
    
    if (mode === 'sticker') {
      const stickerModifiers = "die-cut sticker with a clean white outline border, solid dark background, isolated, single object";
      switch(style) {
        case '3d':
          return `${basePrompt}, 3D render, highly detailed, octane render, beautiful lighting, ${qualityModifiers}, ${stickerModifiers}`;
        case 'cartoon':
          return `${basePrompt}, cartoon style, vector art, 2D illustration, vibrant colors, flat shading, ${qualityModifiers}, ${stickerModifiers}`;
        case 'pixel':
          return `${basePrompt}, pixel art style, 16-bit retro, sharp pixels, clear details, ${stickerModifiers}`;
        case 'minimalist':
          return `${basePrompt}, minimalist, simple geometric shapes, flat design, vector, ${qualityModifiers}, ${stickerModifiers}`;
        default:
          return `${basePrompt}, ${qualityModifiers}, ${stickerModifiers}`;
      }
    } else if (mode === 'video') {
      // Video Mode logic
      switch(style) {
        case 'animation':
          return `${basePrompt}, 3D animation, Pixar style, highly detailed, smooth motion, high quality`;
        case 'drone':
          return `${basePrompt}, FPV drone shot, aerial view, cinematic flying, sweeping landscape, highly detailed`;
        case 'slowmo':
          return `${basePrompt}, slow motion, 120fps, highly detailed, dramatic, cinematic lighting`;
        case 'timelapse':
          return `${basePrompt}, time lapse, fast forward motion, hyperlapse, highly detailed`;
        default:
          return `${basePrompt}, high quality video, smooth motion`;
      }
    } else if (mode === '3d') {
      // 3D Object Mode logic
      switch(style) {
        case 'detailed':
          return `${basePrompt}, highly detailed 3D model, textured, high polygon mesh, clean UVs, PBR material`;
        case 'cartoon3d':
          return `${basePrompt}, cute 3D model, stylized, toy-like, vibrant colors, smooth mesh, PBR material`;
        case 'lowpoly':
          return `${basePrompt}, low poly 3D model, flat shading, geometric, game asset, textured`;
        case 'anime3d':
          return `${basePrompt}, anime style 3D model, cel shaded, vibrant anime colors, Genshin Impact style character or prop, stylized texture, high quality`;
        default:
          return `${basePrompt}, textured 3D model, GLB format`;
      }
    } else if (mode === 'wallpaper') {
      // Wallpaper / Animated Mode logic
      switch(style) {
        case 'cinemagraph':
          return `${basePrompt}, cinemagraph style, subtle motion, only one element moves, everything else still, seamless loop, elegant, dreamy atmosphere, high quality, 4k resolution, static camera, tripod shot, no camera movement`;
        case 'fullAnimation':
          return `${basePrompt}, fully animated scene, dynamic motion, flowing movement, vibrant colors, cinematic quality, smooth animation, seamless loop, static camera, tripod shot, no camera movement, ${qualityModifiers}`;
        case 'particles':
          return `${basePrompt}, floating particles, magical sparkles, dust motes in light beams, ethereal atmosphere, gentle particle effects, seamless loop, static camera, tripod shot, no camera movement, ${qualityModifiers}`;
        case 'ambient':
          return `${basePrompt}, slow ambient motion, relaxing movement, gentle breeze, calming atmosphere, meditation background, soft lighting, seamless loop, static camera, tripod shot, no camera movement, ${qualityModifiers}`;
        default:
          return `${basePrompt}, seamless loop, high quality live wallpaper, static camera, tripod shot, no camera movement`;
      }
    } else {
      // Image Mode logic
      switch(style) {
        case 'realistic':
          return `${basePrompt}, highly detailed, photorealistic, 8k resolution, cinematic lighting, ultra detailed, sharp focus, masterpiece, photography`;
        case 'cinematic':
          return `${basePrompt}, cinematic shot, dramatic lighting, anamorphic lens, depth of field, epic scope, ${qualityModifiers}`;
        case 'anime':
          return `${basePrompt}, anime style, studio ghibli, makoto shinkai style, vibrant colors, beautiful anime art, ${qualityModifiers}`;
        case 'none':
        default:
          return `${basePrompt}, ${qualityModifiers}`;
      }
    }
  };

  const handleGenerate = async ({ prompt, style, mode, aspectRatio, imageBase64 }) => {
    if (!currentUser) {
      alert("Please sign in to generate art!");
      return;
    }

    const isAdmin = currentUser.email === 'd91173916@gmail.com';
    let cost = 15; // default image
    if (mode === 'sticker') cost = 10;
    else if (mode === 'video' || mode === 'wallpaper') cost = 75;
    else if (mode === '3d') cost = 150;

    if (!isAdmin && credits < cost) {
      alert(`You need ${cost} credits to generate this. Please buy more credits!`);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const enhancedPrompt = getStylePrompt(prompt, style, mode);
      
      const executeGeneration = async (attempt = 1) => {
        try {
          if (mode === 'video' || mode === 'wallpaper') {
        // Video & Wallpaper generation (both use Veo 3.1)
        let endpoint;
        let requestBody;

        if (mode === 'wallpaper') {
          endpoint = `${BACKEND_URL}/api/generate-animate`;
          requestBody = { enhancedPrompt, aspectRatio };
          if (imageBase64) {
            requestBody.imageBase64 = imageBase64;
          }
        } else {
          endpoint = `${BACKEND_URL}/api/generate`;
          requestBody = { mode, aspectRatio, enhancedPrompt };
        }
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        if (!response.ok) {
          const errorMsg = data.error || "Failed to start video generation.";
          if (typeof errorMsg === 'string' && errorMsg.toLowerCase().includes("internal server issue")) {
            throw new Error("RETRY_INTERNAL");
          }
          throw new Error(errorMsg);
        }
        
        const operationName = data.operationName;
        if (!operationName) throw new Error("No operation ID received for video generation.");

        // Poll for completion
        let isDone = false;
        let videoData = null;
        
        while (!isDone) {
          // Wait 10 seconds before polling
          await new Promise(resolve => setTimeout(resolve, 10000));
          
          const pollEndpoint = `${BACKEND_URL}/api/poll-video?operationName=${encodeURIComponent(operationName)}`;
          const pollRes = await fetch(pollEndpoint);
          const pollData = await pollRes.json();
          
          if (!pollRes.ok) throw new Error(pollData.error || "Error polling video status.");
          
          if (pollData.done) {
            isDone = true;
            if (pollData.error) {
              if (pollData.error.message?.toLowerCase().includes("internal server issue")) {
                throw new Error("RETRY_INTERNAL");
              }
              throw new Error(pollData.error.message);
            }
            videoData = pollData.response;
          }
        }

        const videoUri = videoData.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
        
        if (!videoUri) throw new Error("No video was returned from the API.");
        
        const videoUrl = `${BACKEND_URL}/api/video?uri=${encodeURIComponent(videoUri)}`;
        
        // Upload to Firebase Storage for permanent access
        const permanentVideoUrl = await uploadToFirebaseStorage(videoUrl, 'video', currentUser.uid);

        await saveAndAddCreation({
          id: Date.now(),
          prompt: prompt,
          style: style,
          mode: mode,
          url: permanentVideoUrl,
          aspectRatio: aspectRatio
        });
      } else {
        // Image, Sticker & 3D Mode
        const endpoint = `${BACKEND_URL}/api/generate`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode, aspectRatio, enhancedPrompt })
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data.error || "Failed to communicate with API servers.";
          if (typeof errorMsg === 'string' && errorMsg.toLowerCase().includes("internal server issue")) {
            throw new Error("RETRY_INTERNAL");
          }
          throw new Error(errorMsg);
        }

        const mediaUrl = mode === '3d' ? data.modelUrl : data.imageUrl;
        
        if (!mediaUrl) throw new Error(`No ${mode === '3d' ? '3D model' : 'image'} was returned from the API.`);

        // Upload to Firebase Storage for permanent access
        const permanentMediaUrl = await uploadToFirebaseStorage(mediaUrl, mode, currentUser.uid);

        await saveAndAddCreation({
          id: Date.now(),
          prompt: prompt,
          style: style,
          mode: mode,
          url: permanentMediaUrl,
          aspectRatio: mode === 'image' ? aspectRatio : '1:1'
        });
      }
        } catch (err) {
          if (err.message === "RETRY_INTERNAL" && attempt < 3) {
            console.warn(`[Generation] Internal server error on attempt ${attempt}. Retrying...`);
            // Add a small delay before retrying
            await new Promise(res => setTimeout(res, 2000));
            return executeGeneration(attempt + 1);
          }
          throw err;
        }
      };

      await executeGeneration();

      // Deduct credits if not admin
      if (!isAdmin) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, { credits: increment(-cost) });
        } catch (e) {
          console.error("Failed to deduct credits:", e);
        }
      }

      // Automatically switch to gallery view to see the newly generated creation
      setView('gallery');

    } catch (err) {
      console.error(err);
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app-container">
      {/* Animated Cyberpunk Background */}
      <div className="video-background">
        <img 
          src="/bg-image.jpg" 
          alt="Background"
          className="bg-video-element"
        />
        <div className="video-overlay"></div>
      </div>

      <Header currentView={view} onViewChange={setView} />
      <main className="main-content container">
        {!currentUser ? (
          <LandingPage />
        ) : view === 'create' ? (
          <PromptInput onGenerate={handleGenerate} isGenerating={isGenerating} />
        ) : (
          <StickerGallery stickers={creations} isGenerating={isGenerating} onViewChange={setView} />
        )}
      </main>
    </div>
  );
}

export default App;
