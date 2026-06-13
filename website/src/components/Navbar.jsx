import React, { useEffect, useRef, useState, memo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Navbar.css';

gsap.registerPlugin(ScrollTrigger);

const Navbar = memo(() => {
  const navRef = useRef(null);
  const menuRef = useRef(null);
  const backdropRef = useRef(null);
  const linksRef = useRef([]);
  const tl = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let ctx = gsap.matchMedia();

    // Hide/show navbar on scroll
    const showNav = gsap.fromTo(
      navRef.current,
      { yPercent: -100 },
      { yPercent: 0, paused: true, duration: 0.3, ease: 'power2.out' }
    ).progress(1);

    let isScrolled = false;

    ScrollTrigger.create({
      start: 'top top',
      end: 'max',
      onUpdate: (self) => {
        if (self.direction === 1 && self.scroll() > 50) {
          showNav.reverse();
        } else {
          showNav.play();
        }
        
        const shouldBeScrolled = self.scroll() > 50;
        if (shouldBeScrolled !== isScrolled) {
          isScrolled = shouldBeScrolled;
          if (isScrolled) {
            navRef.current.classList.add('scrolled');
          } else {
            navRef.current.classList.remove('scrolled');
          }
        }
      },
    });

    // Mobile sidebar animations
    ctx.add("(max-width: 900px)", () => {
      gsap.set(menuRef.current, { xPercent: 100 });
      gsap.set(backdropRef.current, { autoAlpha: 0 });
      
      tl.current = gsap.timeline({ paused: true })
        .to(backdropRef.current, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0)
        .to(menuRef.current, { xPercent: 0, duration: 0.6, ease: "power3.inOut" }, 0)
        .from(linksRef.current, { y: 30, opacity: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" }, "-=0.3");

      if (isOpen) {
        tl.current.progress(1);
      }
    });

    // Desktop reset
    ctx.add("(min-width: 901px)", () => {
      gsap.set(menuRef.current, { clearProps: "all" });
      gsap.set(backdropRef.current, { clearProps: "all" });
      gsap.set(linksRef.current, { clearProps: "all" });
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (tl.current) {
      if (isOpen) {
        tl.current.play();
        document.body.style.overflow = 'hidden';
      } else {
        tl.current.reverse();
        document.body.style.overflow = '';
      }
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const setLinkRef = (el, index) => {
    linksRef.current[index] = el;
  };

  return (
    <>
      <div className="navbar-backdrop" ref={backdropRef} onClick={() => setIsOpen(false)}></div>
      <nav className="navbar" ref={navRef}>
        <div className="navbar-logo">
          <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 24V14L10 0H20L10 24H0Z" fill="var(--color-orange)"/>
            <path d="M20 24V14L30 0H40L30 24H20Z" fill="var(--color-orange)"/>
          </svg>
          <h2>McLAREN</h2>
        </div>
        <div className={`navbar-menu`} ref={menuRef}>
          <a href="#models" ref={(el) => setLinkRef(el, 0)} onClick={() => setIsOpen(false)}>Models</a>
          <a href="#design" ref={(el) => setLinkRef(el, 1)} onClick={() => setIsOpen(false)}>Design</a>
          <a href="#tech" ref={(el) => setLinkRef(el, 2)} onClick={() => setIsOpen(false)}>Technology</a>
          <button className="inquire-btn" ref={(el) => setLinkRef(el, 3)}>INQUIRE</button>
        </div>
        <button 
          className={`menu-toggle ${isOpen ? 'open' : ''}`} 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>
    </>
  );
});

export default Navbar;
