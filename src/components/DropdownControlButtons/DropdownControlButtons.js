import React from 'react';
import './DropdownControlButtons.css';

function DropdownControlButtons({ onAdd, onRemove, podeAdicionar, podeRemover }) {
    return (
        <div className="control-buttons">
            <button
                onClick={onAdd}
                className={`btn btn-add ${podeAdicionar ? 'enabled' : 'disabled'}`}
                disabled={!podeAdicionar}
            >
                +
            </button>
            <button
                onClick={onRemove}
                className={`btn btn-remove ${podeRemover ? 'enabled' : 'disabled'}`}
                disabled={!podeRemover}
            >
                -
            </button>
        </div>
    );
}

export default DropdownControlButtons;
