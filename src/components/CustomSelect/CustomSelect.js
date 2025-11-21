import React, { useState, useRef, useEffect } from "react";
import "./CustomSelect.css";
import downIcon from "../../assets/icons/down.png";

export default function CustomSelect({
  value,
  options = [],
  onChange,
  disabled = false,
  placeholder = "Selecione"
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div
      className={`cs-wrapper ${disabled ? "cs-disabled" : ""}`}
      ref={wrapperRef}
    >
      <div
        className="cs-selected"
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        <span>{value || placeholder}</span>
        <img
          src={downIcon}
          alt="Toggle menu"
          className={`cs-arrow ${open ? "up" : "down"}`}
        />
      </div>

      {open && (
        <div className="cs-options">
          {options.map((opt) => (
            <div
              key={opt}
              className="cs-option"
              onClick={() => {
                if (!disabled) {
                  onChange(opt);
                  setOpen(false);
                }
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
