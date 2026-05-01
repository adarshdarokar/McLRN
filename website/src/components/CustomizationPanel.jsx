import React, { useState, memo, useCallback } from 'react';
import './CustomizationPanel.css';

const colors = [
  { name: 'McLaren Orange', hex: '#FF8B66', filter: 'hue-rotate(0deg) saturate(1)' },
  { name: 'Onyx Black', hex: '#1E1F22', filter: 'hue-rotate(0deg) saturate(0) brightness(0.2)' },
  { name: 'Aurora Blue', hex: '#3B82F6', filter: 'hue-rotate(200deg) saturate(1.5)' },
  { name: 'Vermillion Red', hex: '#EF4444', filter: 'hue-rotate(-40deg) saturate(1.2)' },
  { name: 'Silica White', hex: '#F9FAFB', filter: 'hue-rotate(0deg) saturate(0) brightness(2)' }
];

const CustomizationPanel = memo(() => {
  const [activeColor, setActiveColor] = useState(colors[0]);

  const handleColorChange = useCallback((color) => {
    setActiveColor(color);
  }, []);

  return (
    <section className="customization-panel" id="customization">
      <div className="customization-header">
        <h2>MAKE IT YOURS</h2>
        <p>Select your signature finish.</p>
      </div>

      <div className="customization-content">
        <div className="car-preview">
          {/* We use a tinted overlay or filter trick to simulate car color changing */}
          <img 
            src="/images/aero.png" 
            alt="Customizable McLaren" 
            className="base-car"
            style={{ filter: activeColor.filter }}
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="color-picker">
          <div className="active-color-name">
            <h3>{activeColor.name}</h3>
          </div>
          <div className="swatches">
            {colors.map((color) => (
              <button
                key={color.name}
                className={`swatch ${activeColor.name === color.name ? 'active' : ''}`}
                style={{ backgroundColor: color.hex }}
                onClick={() => handleColorChange(color)}
                aria-label={`Select ${color.name}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

export default CustomizationPanel;
