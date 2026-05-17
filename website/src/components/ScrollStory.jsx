import React, { useEffect, useRef, useState, memo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollStory.css';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 40;

// Easing factor for the buttery smooth interpolation (0 to 1).
// Lower = smoother but more delayed.
const LERP_FACTOR = 0.08;

const ScrollStory = memo(() => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const phase1Ref = useRef(null);
  const phase2Ref = useRef(null);
  const phase3Ref = useRef(null);

  // We only care about initial load to show the UI quickly
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Instead of React state, keep images in a ref to avoid re-renders
  const imagesRef = useRef([]);
  // Track loaded status per image
  const imageLoadStatusRef = useRef(new Array(FRAME_COUNT).fill(false));

  // Animation states
  const targetFrameRef = useRef(0);
  const currentFrameRef = useRef(0);
  const renderRequestedRef = useRef(false);
  const lastRenderTimeRef = useRef(0);

  // Performance and device tracking
  const isLowEndRef = useRef(false);
  const maxFpsRef = useRef(60);

  // Cache rendering dimensions so we don't recalculate on every frame
  const renderDimsRef = useRef({ width: 0, height: 0, x: 0, y: 0 });

  useEffect(() => {
    // 0. Performance Detection
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const deviceMemory = navigator.deviceMemory || 4;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    isLowEndRef.current = isMobile || hardwareConcurrency <= 4 || deviceMemory <= 4;
    maxFpsRef.current = 60; // Remove artificial capping, let browser handle it
    
    // Load all frames for smooth animation instead of skipping
    const frameStep = 1;

    // 1. Load the first frame immediately so we can render the canvas
    const firstImg = new Image();
    const firstIndexStr = (1).toString().padStart(3, '0');
    firstImg.src = `/frames/ezgif-frame-${firstIndexStr}.jpg`;
    
    firstImg.onload = () => {
      imagesRef.current[0] = firstImg;
      imageLoadStatusRef.current[0] = true;
      if (frameStep > 1) {
        imagesRef.current[1] = firstImg;
        imageLoadStatusRef.current[1] = true;
      }
      setInitialLoaded(true);

      // 2. Start background loading for the rest of the sequence
      for (let i = 1 + frameStep; i <= FRAME_COUNT; i += frameStep) {
        const img = new Image();
        const paddedIndex = i.toString().padStart(3, '0');
        img.src = `/frames/ezgif-frame-${paddedIndex}.jpg`;
        
        img.onload = () => {
          imagesRef.current[i - 1] = img;
          imageLoadStatusRef.current[i - 1] = true;
          // Fill the gap for skipped frames
          if (frameStep > 1 && i < FRAME_COUNT) {
              imagesRef.current[i] = img;
              imageLoadStatusRef.current[i] = true;
          }
          // Trigger a render just in case this is the frame we are currently waiting for
          requestRender();
        };
      }
    };
  }, []);

  // Safe wrapper for requestAnimationFrame
  const requestRender = () => {
    if (!renderRequestedRef.current) {
      renderRequestedRef.current = true;
      requestAnimationFrame(renderLoop);
    }
  };

  const renderLoop = (timestamp) => {
    renderRequestedRef.current = false;

    // Calculate delta time to make lerp frame-rate independent
    const delta = timestamp - (lastRenderTimeRef.current || timestamp - 16.66);
    const safeDelta = Math.min(delta, 50); // Cap to 50ms to prevent huge jumps

    // Smooth lerp based on delta time (0.08 was originally for 60fps / 16.66ms)
    const timeAdjustedLerp = 1 - Math.pow(1 - LERP_FACTOR, safeDelta / 16.66);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Lerp current frame towards target frame
    let current = currentFrameRef.current;
    const target = targetFrameRef.current;
    
    // Always use precise snap threshold for maximum smoothness
    const snapThreshold = 0.001;
    if (Math.abs(target - current) < snapThreshold) {
      current = target;
    } else {
      current += (target - current) * timeAdjustedLerp;
    }
    
    if (current === currentFrameRef.current && current === target) {
      return; // No change needed
    }

    currentFrameRef.current = current;
    lastRenderTimeRef.current = timestamp;

    // Draw the frames
    const index1 = Math.floor(current);
    const index2 = Math.min(FRAME_COUNT - 1, index1 + 1);
    const blendRatio = current - index1;

    const img1 = imagesRef.current[index1];
    const img2 = imagesRef.current[index2];
    
    const dims = renderDimsRef.current;

    // Base background
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#1E1F22';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw lower frame fully opaque
    if (img1 && imageLoadStatusRef.current[index1]) {
      ctx.drawImage(img1, dims.x, dims.y, dims.width, dims.height);
    }

    // Draw upper frame on top with partial opacity for crossfade effect
    // Crossfade adds to smoothness, keep it enabled but we optimize by lowering resolution on low-end
    if (blendRatio > 0 && img2 && imageLoadStatusRef.current[index2]) {
      ctx.globalAlpha = blendRatio;
      ctx.drawImage(img2, dims.x, dims.y, dims.width, dims.height);
      ctx.globalAlpha = 1.0; // Reset
    }

    // Continue loop if we haven't reached the target
    if (current !== target) {
      requestRender();
    }
  };

  useEffect(() => {
    if (!initialLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d', { alpha: false });

    // Calculate dimensions ONLY on resize, not every frame
    const calculateDimensions = () => {
      const parent = canvas.parentElement;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      // On low-end devices, drop resolution slightly for massive GPU performance gain, keeps animation smooth 
      const maxRatio = isLowEndRef.current ? 1 : 2;
      const pxRatio = Math.min(window.devicePixelRatio || 1, maxRatio); 

      canvas.width = width * pxRatio;
      canvas.height = height * pxRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Set constant properties once
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = isLowEndRef.current ? 'low' : 'high';

      // Assuming first image is available to get aspect ratio
      const firstImage = imagesRef.current[0];
      if (firstImage) {
        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = firstImage.width / firstImage.height;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        // Fix: Use 'contain' logic on mobile screens to prevent horizontal cropping
        // Keep 'cover' logic on desktop for the cinematic full-screen look
        const isMobileScreen = window.innerWidth <= 768;
        
        if (isMobileScreen) {
          // Hybrid logic for mobile: Fit width, but apply a slight cinematic zoom 
          // so the car is larger on screen without severe horizontal cropping.
          const mobileZoom = 1.4; // 40% zoom on mobile
          drawWidth = canvas.width * mobileZoom;
          drawHeight = firstImage.height * (canvas.width / firstImage.width) * mobileZoom;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = (canvas.height - drawHeight) / 2;
        } else {
          // Original cover logic for desktop
          if (canvasAspect > imgAspect) {
            drawWidth = canvas.width;
            drawHeight = firstImage.height * (canvas.width / firstImage.width);
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
          } else {
            drawHeight = canvas.height;
            drawWidth = firstImage.width * (canvas.height / firstImage.height);
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
          }
        }
        
        renderDimsRef.current = {
          width: Math.round(drawWidth),
          height: Math.round(drawHeight),
          x: Math.round(offsetX),
          y: Math.round(offsetY)
        };
      }

      // Force a redraw after resize
      requestRender();
    };

    let resizeTimeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(calculateDimensions, 150);
    };

    calculateDimensions();
    window.addEventListener('resize', debouncedResize, { passive: true });

    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: window.innerWidth <= 768 ? '+=150%' : '+=300%', // Reduce pin duration on mobile
            pin: true,
            scrub: true, // Ultra-responsive sync
            invalidateOnRefresh: true, // Refresh layout on resize/orientation change
        }
      });

      tl.to({}, {
          duration: 1, 
          onUpdate(self) {
              const progress = this.progress();
              // Calculate target frame instead of direct rendering
              const targetFrame = Math.min(
                FRAME_COUNT - 1,
                progress * (FRAME_COUNT - 1)
              );
              
              // Micro-scroll threshold to prevent excessive tiny updates
              const updateThreshold = 0.001;
              if (Math.abs(targetFrameRef.current - targetFrame) > updateThreshold) {
                 targetFrameRef.current = targetFrame;
                 requestRender();
              }
          }
      }, 0);

      // Phase 1 (0 -> 0.3)
      tl.fromTo(phase1Ref.current, { opacity: 1, y: 0, scale: 1 }, { opacity: 0, y: -50, scale: 0.95, duration: 0.3 }, 0);
      
      // Phase 2 (0.3 -> 0.6)
      tl.fromTo(phase2Ref.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.15 }, 0.3);
      tl.to(phase2Ref.current, { opacity: 0, y: -50, duration: 0.15 }, 0.45);

      // Phase 3 (0.6 -> 1.0)
      tl.fromTo(phase3Ref.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.2 }, 0.6);

    }, containerRef);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
      ctx.revert();
    };
  }, [initialLoaded]);

  if (!initialLoaded) {
    // Keep a much simpler, faster initial loader
    return (
      <div className="scroll-loading-screen">
        <h2>SYSTEM BOOT</h2>
        {/* We removed the heavy progress bar that causes 40 re-renders */}
      </div>
    );
  }

  return (
    <section className="scroll-story" ref={containerRef}>
      <canvas ref={canvasRef} className="story-canvas" />
      <div className="story-gradient-overlay" />
      
      <div className="story-hud">
        <div className="hud-part" ref={phase1Ref}>
          <h2>ENGINEERED FOR IMPACT</h2>
          <p>The pinnacle of our Series models.</p>
        </div>

        <div className="hud-part" ref={phase2Ref} style={{ opacity: 0 }}>
          <h2>ACTIVE AERO</h2>
          <p>Sculpted to conquer the wind. Maximum downforce.</p>
        </div>

        <div className="hud-part" ref={phase3Ref} style={{ opacity: 0 }}>
          <h2>CARBON HEART</h2>
          <div className="hud-list">
              <div className="list-item"><h4>CHASSIS</h4><span>Carbon Monocell</span></div>
              <div className="list-item"><h4>V8</h4><span>Twin-Turbo</span></div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default ScrollStory;
