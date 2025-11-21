import React, { useState, useEffect, useRef } from 'react';
import './MultiLevelDropdown.css';
import downIcon from '../../assets/icons/down.png';
import threadIcon from '../../assets/icons/traco.png';
import rightIcon from '../../assets/icons/right.png';

const actions = ['R', 'W', 'RL', 'WL', 'U', 'Operação', 'Commit'];

function MultiLevelDropdown({ transactionCount, variableCount, onSelect, selectedValue, disabled = false }) {
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
    <div className="dropdown" ref={dropdownRef}>
      <div
        className={`dropdown__display ${disabled ? 'dropdown__display--disabled' : ''}`}
        onClick={() => !disabled && setMenuOpen((prev) => !prev)}
      >
        <span className={`dropdown__placeholder ${selectedValue ? 'dropdown__placeholder--active' : ''}`}>
          {selectedValue || 'Selecione'}
        </span>
        <img
          src={downIcon}
          alt="Toggle menu"
          className={`dropdown__arrow ${menuOpen ? 'dropdown__arrow--rotated' : ''}`}
        />
      </div>

      {menuOpen && (
        <div className="dropdown__menu">
          {transactions.map((tx) => {
            const isTransactionActive = submenuOpen.tx === tx;
            return (
              <div
                key={tx}
                className="dropdown__item"
                onMouseEnter={() => setSubmenuOpen({ tx, action: null })}
                onMouseLeave={() => setSubmenuOpen({ tx: null, action: null })}
              >
                <div className="dropdown__label">
                  <span>{tx}</span>
                  <img
                    src={isTransactionActive ? threadIcon : rightIcon}
                    alt="Submenu"
                    className={`dropdown__arrow ${isTransactionActive ? 'dropdown__arrow--fade-in' : 'dropdown__arrow--fade-out'}`}
                  />
                </div>

                {isTransactionActive && (
                  <div className="dropdown__submenu">
                    {actions.map((a) => {
                      const isActionActive = submenuOpen.tx === tx && submenuOpen.action === a;
                      return (
                        <div key={a} className="dropdown__item">
                          <div
                            className="dropdown__action"
                            onMouseEnter={() => setSubmenuOpen({ tx, action: a })}
                            onClick={a === 'Commit' ? () => handleClick(tx, a) : undefined}
                          >
                            <span>{a}</span>
                            {a !== 'Commit' && (
                              <img
                                src={isActionActive ? threadIcon : rightIcon}
                                alt="Submenu"
                                className={`dropdown__arrow ${isTransactionActive ? 'dropdown__arrow--fade-in' : 'dropdown__arrow--fade-out'}`}
                              />
                            )}
                          </div>

                          {a !== 'Commit' && isActionActive && (
                            <div className="dropdown__submenu">
                              {variables.map((v) => (
                                <div
                                  key={v}
                                  className="dropdown__item dropdown__item--last"
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
