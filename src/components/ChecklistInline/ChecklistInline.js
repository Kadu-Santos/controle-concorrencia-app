import { useState } from "react";
import "./ChecklistInline.css";

function ChecklistInline({ count, disabled = false, onChange }) {

    const safeCount = count > 0 ? count : 3;

    const [values, setValues] = useState(() => Array(safeCount).fill(true));

    const toggle = (index) => {
        if (disabled) return;

        const updated = [...values];
        updated[index] = !updated[index];
        setValues(updated);
        onChange && onChange(updated);
    };

    let displayedValues = values;

    if (values.length !== safeCount) {
        if (values.length < safeCount) {
            displayedValues = [...values, ...Array(safeCount - values.length).fill(false)];
        } else {
            displayedValues = values.slice(0, safeCount);
        }
    }

    return (
        <div className="checklist-inline">
            {displayedValues.map((val, idx) => (
                <div
                    key={idx}
                    className={`check-item-wrapper ${disabled ? "cl-disabled" : ""}`}
                    onClick={() => toggle(idx)}
                >
                    <span className="check-label">T{idx + 1}</span>

                    <div className={`check-box ${val ? "checked" : ""}`}>
                        {val && <span className="check-icon">✔</span>}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ChecklistInline;
