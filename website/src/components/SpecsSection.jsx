import React, { useEffect, useRef, memo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './SpecsSection.css';

gsap.registerPlugin(ScrollTrigger);

const SpecsSection = memo(() => {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const items = gsap.utils.toArray('.spec-item');
      const fills = gsap.utils.toArray('.spec-fill');

      gsap.set(items, { y: 30, opacity: 0 });
      
      ScrollTrigger.batch(items, {
        interval: 0.1,
        batchMax: 4,
        onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out', overwrite: true }),
        onLeaveBack: batch => gsap.to(batch, { opacity: 0, y: 30, stagger: 0.1, duration: 0.4, ease: 'power2.out', overwrite: true }),
        start: 'top 85%'
      });

      fills.forEach((fill) => {
        const width = fill.getAttribute('data-width');
        gsap.set(fill, { width: width });
        gsap.fromTo(fill,
          { scaleX: 0 },
          {
            scaleX: 1, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: fill.parentElement, start: 'top 85%', toggleActions: 'play none none reverse' }
          }
        );
      });

    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section className="specs-section" id="specs" ref={containerRef}>
      <div className="specs-container">
        <h2 className="section-title">TECHNICAL SPECIFICATIONS</h2>
        
        <div className="specs-grid">
          <div className="spec-item">
            <h4>Top Speed</h4>
            <div className="spec-value">212 <span>mph</span></div>
            <div className="spec-bar"><div className="spec-fill" data-width="90%"></div></div>
          </div>
          
          <div className="spec-item">
            <h4>Maximum Power</h4>
            <div className="spec-value">750 <span>PS</span></div>
            <div className="spec-bar"><div className="spec-fill" data-width="95%"></div></div>
          </div>
          
          <div className="spec-item">
            <h4>0-60 MPH</h4>
            <div className="spec-value">2.7 <span>sec</span></div>
            <div className="spec-bar"><div className="spec-fill" data-width="98%"></div></div>
          </div>
          
          <div className="spec-item">
            <h4>Dry Weight</h4>
            <div className="spec-value">2,815 <span>lbs</span></div>
            <div className="spec-bar"><div className="spec-fill" data-width="85%"></div></div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default SpecsSection;
