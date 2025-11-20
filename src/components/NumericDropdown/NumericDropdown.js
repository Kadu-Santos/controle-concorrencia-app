import React, { useState, useRef, useEffect } from 'react';
import './NumericDropdown.css';

import downIcon from '../../assets/icons/down.png';
import upIcon from '../../assets/icons/up.png';

function NumericDropdown({
  options,
  onSelect,
  selectedValue,
  width = '120px',
  disabled = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClick = (value) => {
    onSelect(value);
    setMenuOpen(false);
  };

  return (
    <div className="numeric-dropdown" ref={dropdownRef} style={{ width }}>
      <div
        className={`nDropdown-display ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setMenuOpen((prev) => !prev)}
      >
        <span className={`dropdown-placeholder ${selectedValue ? 'active' : ''}`}>
          {selectedValue ? selectedValue : 'Selecione'}
        </span>


        <img
          src={menuOpen ? upIcon : downIcon}
          alt="Toggle menu"
          className="icon-arrow"
        />
      </div>

      {menuOpen && (
        <div className="nDropdown-menu">
          {options.map((opt, index) => {
            const numericValue = parseInt(opt, 10);
            return (
              <div
                key={index}
                className="nDropdown-item"
                onClick={() => handleClick(numericValue)}
              >
                {opt}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NumericDropdown;
