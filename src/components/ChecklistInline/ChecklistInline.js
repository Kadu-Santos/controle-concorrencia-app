import "./ChecklistInline.css";

function ChecklistInline({ count, disabled = false, value = [], onChange }) {
    
    const safeCount = count > 0 ? count : 3;

    // Garante que sempre temos o array no tamanho correto
    const normalizedValues =
        value.length === safeCount
            ? value
            : [
                ...value,
                ...Array(Math.max(0, safeCount - value.length)).fill(true)
              ].slice(0, safeCount);

    const toggle = (index) => {
        if (disabled) return;

        const updated = [...normalizedValues];
        updated[index] = !updated[index];

        onChange && onChange(updated);
    };

    return (
        <div className="checklist-inline">
            {normalizedValues.map((val, idx) => (
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
