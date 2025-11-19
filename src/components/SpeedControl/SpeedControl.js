import "./SpeedControl.css";

export default function SpeedControl({ speedMs, onSpeedChange }) {

    const handleChange = (e) => {
        const sliderVal = Number(e.target.value);
        const converted = 3000 - (sliderVal - 100);
        onSpeedChange(converted);
    };

    return (
        <div className="speed-control">
            <p className='titleDivider'>Velocidade da execução:</p>

            <div className="speed-row">
                <span>Lento</span>

                <input
                    type="range"
                    min={100}
                    max={3000}
                    step={50}
                    value={3000 - (speedMs - 100)}
                    onChange={handleChange}
                />

                <span>Rápido</span>
            </div>
        </div>
    );
}
