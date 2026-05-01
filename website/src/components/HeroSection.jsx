import React, { useEffect, useRef, memo } from 'react';
import gsap from 'gsap';
import './HeroSection.css';

const HeroSection = memo(() => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const pRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
        titleRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out', delay: 0.2 }
      )
      .fromTo(
        subtitleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
        '-=0.8'
      )
      .fromTo(
        pRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.5, ease: 'power2.out' },
        '-=0.5'
      )
      .fromTo(
        scrollRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', repeat: -1, yoyo: true },
        '-=0.5'
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero-section" ref={containerRef}>
      <div className="hero-bg">
        <img src="/images/cinematic.png" alt="McLaren Cinematic" loading="eager" decoding="async" />
        <div className="hero-overlay"></div>
      </div>
      <div className="hero-content">
        <h1 ref={titleRef}>MCLAREN 750S</h1>
        <h3 ref={subtitleRef}>THE PURSUIT OF LIGHTNESS</h3>
        <p ref={pRef}>A new benchmark in performance, engagement, and purity of response.</p>
        <div className="scroll-indicator" ref={scrollRef}>
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <span>SLIDE DOWN</span>
        </div>
      </div>
    </section>
  );
});

export default HeroSection;
