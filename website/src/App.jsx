import React, { useEffect, useRef, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ScrollStory from './components/ScrollStory';
import './App.css';

import gsap from 'gsap';

const CarShowcase = lazy(() => import('./components/CarShowcase'));
const SpecsSection = lazy(() => import('./components/SpecsSection'));
const PerformanceSection = lazy(() => import('./components/PerformanceSection'));
const CustomizationPanel = lazy(() => import('./components/CustomizationPanel'));
const Footer = lazy(() => import('./components/Footer'));
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const cursorRef = useRef(null);

  useEffect(() => {
    // Smooth scrolling using Lenis
    const lenis = new Lenis({
      lerp: 0.1, 
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1, 
      syncTouch: true,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Custom Cursor tracking
    const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.15, ease: "power2.out" });
    const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.15, ease: "power2.out" });

    const onMouseMove = (e) => {
      if (cursorRef.current) {
        xTo(e.clientX);
        yTo(e.clientY);
      }
    };

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      lenis.destroy();
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <div className="app">
      <div className="custom-cursor" ref={cursorRef}></div>
      <Navbar />
      <HeroSection />
      <ScrollStory />
      <Suspense fallback={<div style={{ height: '100vh', background: '#1E1F22' }}></div>}>
        <CarShowcase />
        <PerformanceSection />
        <SpecsSection />
        <CustomizationPanel />
        <Footer />
      </Suspense>
    </div>
  );
}

export default App;
