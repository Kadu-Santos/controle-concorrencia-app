import { useState, useRef } from "react";
import "./ExampleDropdown.css";
import downIcon from "../../assets/icons/down.png";

function ExampleDropdown({ examples, onSelect, disabled = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null); // estado interno
  const dropdownRef = useRef(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setMenuOpen(false);
      document.removeEventListener("mousedown", handleClickOutside);
    }
  };

  const toggleMenu = () => {
    if (disabled) return;

    setMenuOpen((prev) => {
      const next = !prev;
      if (next) {
        document.addEventListener("mousedown", handleClickOutside);
      } else {
        document.removeEventListener("mousedown", handleClickOutside);
      }
      return next;
    });
  };

  const handleSelect = (index) => {
    setSelectedIndex(index);   // guarda seleção interna
    onSelect(index);           // avisa o pai
    setMenuOpen(false);
    document.removeEventListener("mousedown", handleClickOutside);
  };

  return (
    <div className="example-dropdown" ref={dropdownRef}>
      <div
        className={`example-dropdown__display ${
          disabled ? "example-dropdown__display--disabled" : ""
        }`}
        onClick={toggleMenu}
      >
        <span
          className={
            selectedIndex == null
              ? "example-dropdown__placeholder"
              : "example-dropdown__text"
          }
        >
          {selectedIndex == null ? "Selecione exemplo" : examples[selectedIndex]}
        </span>

        <img
          src={downIcon}
          alt="Toggle menu"
          className={`example-dropdown__arrow ${
            menuOpen ? "example-dropdown__arrow--rotated" : ""
          }`}
        />
      </div>

      {menuOpen && (
        <div className="example-dropdown__menu">
          {examples.map((ex, idx) => (
            <div
              key={idx}
              className="example-dropdown__item"
              onClick={() => handleSelect(idx)}
            >
              {ex}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExampleDropdown;
