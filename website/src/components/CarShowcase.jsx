import React, { useEffect, useRef, memo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './CarShowcase.css';

gsap.registerPlugin(ScrollTrigger);

const CarShowcase = memo(() => {
  const sectionRef = useRef(null);
  const carRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the main car in on scroll
      gsap.fromTo(carRef.current,
        { scale: 0.8, opacity: 0, y: 100 },
        { 
          scale: 1, 
          opacity: 1, 
          y: 0, 
          duration: 1.5, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'center center',
            scrub: 1
          }
        }
      );

      // Hotspots animation
      const hotspots = gsap.utils.toArray('.hotspot');
      gsap.fromTo(hotspots, 
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          stagger: 0.2,
          duration: 0.5,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'center 80%'
          }
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="car-showcase" ref={sectionRef}>
      <div className="showcase-header">
        <h2>AERODYNAMIC PURITY</h2>
        <p>Every surface mapped for maximum performance.</p>
      </div>
      
      <div className="showcase-interactive">
        <div className="car-container" ref={carRef}>
          <img src="/images/aero.png" alt="McLaren Aero" className="main-car-img" loading="lazy" decoding="async" />
          
          <div className="hotspot pos-1">
            <span className="dot"></span>
            <div className="hotspot-info">
              <h4>Active Rear Wing</h4>
              <p>Deploys automatically to increase downforce or act as an airbrake.</p>
            </div>
          </div>

          <div className="hotspot pos-2">
            <span className="dot"></span>
            <div className="hotspot-info">
              <h4>Carbon Intakes</h4>
              <p>Feeds cold air directly into the twin-turbo V8.</p>
            </div>
          </div>
          
          <div className="hotspot pos-3">
            <span className="dot"></span>
            <div className="hotspot-info">
              <h4>Dihedral Doors</h4>
              <p>Lightweight engineering with iconic theatricality.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default CarShowcase;
