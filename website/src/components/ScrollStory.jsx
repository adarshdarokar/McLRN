import React, { useEffect, useRef, useState, memo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollStory.css';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 40;

const ScrollStory = memo(() => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const phase1Ref = useRef(null);
  const phase2Ref = useRef(null);
  const phase3Ref = useRef(null);

  const lastDrawnFrameRef = useRef(-1);

  // Use a custom hook or local logic to preload images.
  // For simplicity here, we write it locally inside the component.
  const [images, setImages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const loadedImages = [];
    let loadedCount = 0;

    for (let i = 1; i <= FRAME_COUNT; i++) {
        const img = new Image();
        const paddedIndex = i.toString().padStart(3, '0');
        img.src = `/frames/ezgif-frame-${paddedIndex}.jpg`;
        
        img.onload = () => {
            loadedCount++;
            setLoadingProgress(Math.round((loadedCount / FRAME_COUNT) * 100));
            if (loadedCount === FRAME_COUNT) {
                setLoaded(true);
            }
        };
        loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  useEffect(() => {
    if (!loaded || images.length === 0) return;

    let ctx = gsap.context(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d', { alpha: false });

      const drawFrame = (frameIndex) => {
        if (frameIndex === lastDrawnFrameRef.current) return;
        lastDrawnFrameRef.current = frameIndex;

        const currentImage = images[frameIndex];
        
        if (currentImage && context) {
          const canvasAspect = canvas.width / canvas.height;
          const imgAspect = currentImage.width / currentImage.height;
          
          let drawWidth, drawHeight, offsetX, offsetY;
          
          if (canvasAspect > imgAspect) {
            drawWidth = canvas.width;
            drawHeight = currentImage.height * (canvas.width / currentImage.width);
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
          } else {
            drawHeight = canvas.height;
            drawWidth = currentImage.width * (canvas.height / currentImage.height);
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
          }
          
          drawWidth = Math.round(drawWidth);
          drawHeight = Math.round(drawHeight);
          offsetX = Math.round(offsetX);
          offsetY = Math.round(offsetY);
          
          context.fillStyle = '#1E1F22';
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          context.imageSmoothingEnabled = true;
          context.imageSmoothingQuality = 'high';
          
          context.drawImage(currentImage, offsetX, offsetY, drawWidth, drawHeight);
        }
      };

      const resizeCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const parent = canvas.parentElement;
        const width = parent.clientWidth;
        const height = parent.clientHeight;
        const pxRatio = Math.min(window.devicePixelRatio || 1, 2); 

        canvas.width = width * pxRatio;
        canvas.height = height * pxRatio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        lastDrawnFrameRef.current = -1;
        drawFrame(0);
      };

      let resizeTimeout;
      const debouncedResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCanvas, 150);
      };

      resizeCanvas();
      window.addEventListener('resize', debouncedResize, { passive: true });

      // Create a timeline instead of manually calculating styles.
      const tl = gsap.timeline({
        scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: '+=300%', // pin for 3 viewport heights
            pin: true,
            scrub: true, // Ultra-responsive sync
        }
      });

      let lastProgress = -1;

      // Update frame on progress
      tl.to({}, {
          duration: 1, // Timeline length 1 to easily map percentages
          onUpdate(self) {
              const progress = this.progress();
              if (Math.abs(progress - lastProgress) < 0.0005) return;
              lastProgress = progress;
              
              const frameIndex = Math.min(
                FRAME_COUNT - 1,
                Math.floor(progress * (FRAME_COUNT - 1))
              );
              drawFrame(frameIndex);
          }
      }, 0);

      // Phase 1 (0 -> 0.3)
      tl.fromTo(phase1Ref.current, { opacity: 1, y: 0, scale: 1 }, { opacity: 0, y: -50, scale: 0.95, duration: 0.3 }, 0);
      
      // Phase 2 (0.3 -> 0.6)
      tl.fromTo(phase2Ref.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.15 }, 0.3);
      tl.to(phase2Ref.current, { opacity: 0, y: -50, duration: 0.15 }, 0.45);

      // Phase 3 (0.6 -> 1.0)
      tl.fromTo(phase3Ref.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.2 }, 0.6);

      return () => {
        window.removeEventListener('resize', debouncedResize);
        clearTimeout(resizeTimeout);
      };
    }, containerRef);

    return () => ctx.revert();
  }, [loaded, images]);

  if (!loaded) {
    return (
      <div className="scroll-loading-screen">
        <h2>SYSTEM BOOT</h2>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${loadingProgress}%` }}></div>
        </div>
        <p>{loadingProgress}%</p>
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
