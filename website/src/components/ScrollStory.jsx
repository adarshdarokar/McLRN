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

  // Cache rendering dimensions so we don't recalculate on every frame
  const renderDimsRef = useRef({ width: 0, height: 0, x: 0, y: 0 });

  useEffect(() => {
    // 1. Load the first frame immediately so we can render the canvas
    const firstImg = new Image();
    const firstIndexStr = (1).toString().padStart(3, '0');
    firstImg.src = `/frames/ezgif-frame-${firstIndexStr}.jpg`;
    
    firstImg.onload = () => {
      imagesRef.current[0] = firstImg;
      imageLoadStatusRef.current[0] = true;
      setInitialLoaded(true);

      // 2. Start background loading for the rest of the sequence
      for (let i = 2; i <= FRAME_COUNT; i++) {
        const img = new Image();
        const paddedIndex = i.toString().padStart(3, '0');
        img.src = `/frames/ezgif-frame-${paddedIndex}.jpg`;
        
        img.onload = () => {
          imagesRef.current[i - 1] = img;
          imageLoadStatusRef.current[i - 1] = true;
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

  const renderLoop = () => {
    renderRequestedRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Lerp current frame towards target frame
    let current = currentFrameRef.current;
    const target = targetFrameRef.current;
    
    // If we're close enough, snap to target
    if (Math.abs(target - current) < 0.001) {
      current = target;
    } else {
      current += (target - current) * LERP_FACTOR;
    }
    
    currentFrameRef.current = current;

    // Draw the frames using blending for ultra-smooth sub-frame rendering
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
      const pxRatio = Math.min(window.devicePixelRatio || 1, 2); 

      canvas.width = width * pxRatio;
      canvas.height = height * pxRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Set constant properties once
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';

      // Assuming first image is available to get aspect ratio
      const firstImage = imagesRef.current[0];
      if (firstImage) {
        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = firstImage.width / firstImage.height;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
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
            end: '+=300%', // pin for 3 viewport heights
            pin: true,
            scrub: true, // Ultra-responsive sync
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
              
              if (Math.abs(targetFrameRef.current - targetFrame) > 0.0001) {
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
