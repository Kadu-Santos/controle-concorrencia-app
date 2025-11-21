import React, { useState, useEffect, useRef } from 'react';
import './MultiLevelDropdown.css';

import downIcon from '../../assets/icons/down.png';
import threadIcon from '../../assets/icons/traco.png';
import rightIcon from '../../assets/icons/right.png';

// Actions (mantém "Operação" em português porque é texto exibido)
const actions = ['R', 'W', 'RL', 'WL', 'U', 'Operação', 'Commit'];

function MultiLevelDropdown({
  transactionCount,
  variableCount,
  onSelect,
  selectedValue,
  disabled = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState({ tx: null, action: null });
  const dropdownRef = useRef(null);

  const transactions = Array.from({ length: transactionCount }, (_, i) => `T${i + 1}`);
  const variables = ['X', 'Y', 'Z', 'W'].slice(0, variableCount);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
        setSubmenuOpen({ tx: null, action: null });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClick = (transaction, action, variable = null) => {
    let result;
    if (action === 'Operação' && variable) {
      result = `${transaction}:${variable}`;
    } else if (variable) {
      result = `${transaction}:${action}:${variable}`;
    } else {
      result = `${transaction}:${action}`;
    }
    onSelect(result);
    setMenuOpen(false);
    setSubmenuOpen({ tx: null, action: null });
  };

  return (
    <div className="multi-dropdown" ref={dropdownRef}>
      <div
        className={`dropdown-display ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setMenuOpen((prev) => !prev)}
      >
        <span className={`dropdown-placeholder ${selectedValue ? 'active' : ''}`}>
          {selectedValue || 'Selecione'}
        </span>
        <img
          src={downIcon}
          alt="Toggle menu"
          className={`icon-arrow ${menuOpen ? "rotated" : ""}`}
        />
      </div>

      {menuOpen && (
        <div className="dropdown-menu">
          {transactions.map((tx) => {
            const isTransactionActive = submenuOpen.tx === tx;

            return (
              <div
                key={tx}
                className="dropdown-item relative"
                onMouseEnter={() => setSubmenuOpen({ tx, action: null })}
                onMouseLeave={() => setSubmenuOpen({ tx: null, action: null })}
              >
                <div className="tx-label">
                  <span>{tx}</span>
                  <img
                    src={isTransactionActive ? threadIcon : rightIcon}
                    alt="Submenu"
                    className={`icon-arrow ${isTransactionActive ? "fade-in" : "fade-out"}`}
                  />
                </div>

                {isTransactionActive && (
                  <div className="submenu">
                    {actions.map((a) => {
                      const isActionActive = submenuOpen.tx === tx && submenuOpen.action === a;

                      return (
                        <div
                          key={a}
                          className={`dropdown-item ${a !== 'Commit' ? 'relative' : 'commit'}`}
                        >
                          <div
                            className="action-item"
                            onMouseEnter={() => setSubmenuOpen({ tx, action: a })}
                            onClick={a === 'Commit' ? () => handleClick(tx, a) : undefined}
                          >
                            <span>{a}</span>
                            {a !== 'Commit' && (
                              <img
                                src={isActionActive ? threadIcon : rightIcon}
                                alt="Submenu"
                                className={`icon-arrow ${isTransactionActive ? "fade-in" : "fade-out"}`}
                              />
                            )}
                          </div>

                          {a !== 'Commit' && isActionActive && (
                            <div className="submenu">
                              {variables.map((v) => (
                                <div
                                  key={v}
                                  className="dropdown-item"
                                  onClick={() => handleClick(tx, a, v)}
                                >
                                  {v}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MultiLevelDropdown;
