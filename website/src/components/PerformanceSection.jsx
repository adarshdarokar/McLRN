import React, { useEffect, useRef, memo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './PerformanceSection.css';

gsap.registerPlugin(ScrollTrigger);

const PerformanceSection = memo(() => {
  const containerRef = useRef(null);
  const rpmNeedleRef = useRef(null);
  const speedRef = useRef(null);
  const throttleRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create a master timeline for the performance stats
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%',
          end: 'center center',
          scrub: 1
        }
      });

      // Animate RPM needle rotation
      tl.fromTo(rpmNeedleRef.current,
        { rotation: -120 },
        { rotation: 120, ease: 'power2.inOut', duration: 2 },
        0
      );

      // Animate digital speed text
      tl.fromTo(speedRef.current,
        { innerText: 0 },
        { 
          innerText: 212, 
          snap: { innerText: 1 },
          ease: 'power2.inOut',
          duration: 2
        },
        0
      );

      // Animate throttle bar
      tl.fromTo(throttleRef.current,
        { scaleY: 0 },
        { scaleY: 1, ease: 'power3.out', duration: 2 },
        0
      );

    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section className="performance-section" ref={containerRef}>
      <div className="performance-content">
        <h2>UNCOMPROMISING POWER</h2>
        <p>The beating heart of the 750S. Immediate response, relentless delivery.</p>
      </div>

      <div className="dashboard-ui">
        {/* RPM Gauge */}
        <div className="gauge-container">
          <div className="gauge-ring"></div>
          <div className="gauge-marks"></div>
          <div className="needle" ref={rpmNeedleRef}></div>
          <div className="gauge-center">
            <span className="rpm-text">RPM x1000</span>
            <span className="gear-text">7</span>
          </div>
        </div>

        {/* Speed Stats */}
        <div className="speed-stats">
          <div className="digital-speed" ref={speedRef}>0</div>
          <div className="speed-unit">MPH</div>
        </div>

        {/* Throttle Bar */}
        <div className="throttle-container">
          <div className="throttle-label">THROTTLE</div>
          <div className="throttle-track">
            <div className="throttle-fill" ref={throttleRef}></div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default PerformanceSection;
