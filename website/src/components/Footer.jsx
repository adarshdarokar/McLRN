import React, { useEffect, useRef, memo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Footer.css';

gsap.registerPlugin(ScrollTrigger);

const Footer = memo(() => {
  const footerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(footerRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <footer className="footer" ref={footerRef} style={{ willChange: 'transform, opacity' }}>
      <div className="footer-top">
        <div className="footer-logo">
          <h2>McLAREN</h2>
          <p>Pioneering performance and technology.</p>
        </div>
        
        <div className="footer-links">
          <div className="link-group">
            <h4>Models</h4>
            <ul>
              <li><a href="#models">750S</a></li>
              <li><a href="#models">Artura</a></li>
              <li><a href="#models">GTS</a></li>
            </ul>
          </div>
          
          <div className="link-group">
            <h4>Ownership</h4>
            <ul>
              <li><a href="#finance">Finance</a></li>
              <li><a href="#service">Service</a></li>
              <li><a href="#accessories">Accessories</a></li>
            </ul>
          </div>
          
          <div className="link-group">
            <h4>Contact</h4>
            <ul>
              <li><a href="#retail">Find a Retailer</a></li>
              <li><a href="#enquire">Enquire</a></li>
              <li><a href="#careers">Careers</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} McLaren Automotive Limited. All rights reserved.</p>
        <div className="social-links">
          <a href="#ig">IG</a>
          <a href="#tw">TW</a>
          <a href="#fb">FB</a>
          <a href="#yt">YT</a>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
