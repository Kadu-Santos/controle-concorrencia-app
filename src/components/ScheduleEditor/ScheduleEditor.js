import { useEffect, useState, useCallback, useRef } from "react";
import ScheduleRow from "../ScheduleRow/ScheduleRow";
import "./ScheduleEditor.css";

/**
 * - operacoes: string[] (ex: ["T1:R:x", ...])
 * - expressoes: { [index]: string } (ex: {0: "x+1"})
 * - onChangeOperacoes: (nextOperacoes: string[]) => void
 * - onChangeExpressoes: (nextExpressoes: { [index]: string }) => void
 * - numTransacoes, numVariaveis, executando, valor, valoresVariaveis
 */
export default function ScheduleEditor({
    operacoes = [],
    expressoes = {},
    onChangeOperacoes,
    onChangeExpressoes,
    numTransacoes,
    numVariaveis,
    disable,
}) {
    // id generator (simples e deterministicamente único por instância)
    const idCounter = useRef(0);
    const genId = useCallback(() => `op_${Date.now().toString(36)}_${idCounter.current++}`, []);

    // Internal representation: [{ id, opStr, expressao }]
    const [items, setItems] = useState([]);

    // Initialize internal items from props (only when props change)
    useEffect(() => {
        // If lengths differ or content differs, rebuild preserving internal ids where possible
        setItems(prev => {
            // attempt to reuse ids by matching opStr + expressao
            const pool = [...prev]; // existing internal items with ids
            const next = operacoes.map((opStr, idx) => {
                const expr = expressoes?.[idx] ?? "";
                // try find a pool item with same opStr and expr
                const foundIndex = pool.findIndex(p => p.opStr === opStr && (p.expressao || "") === expr);
                if (foundIndex !== -1) {
                    const found = pool.splice(foundIndex, 1)[0];
                    return { ...found, opStr, expressao: expr };
                }
                // else new item with fresh id
                return { id: genId(), opStr, expressao: expr };
            });
            return next;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [operacoes, JSON.stringify(expressoes)]); // stringify expressoes to detect changes

    // Helper: push external updates (convert internal items -> external structures)
    const pushExternal = useCallback((nextItems) => {
        const nextOperacoes = nextItems.map(it => it.opStr);
        const nextExpressoesObj = nextItems.reduce((acc, it, i) => {
            if (it.expressao && it.expressao.trim() !== "") acc[i] = it.expressao;
            return acc;
        }, {});
        onChangeOperacoes?.(nextOperacoes);
        onChangeExpressoes?.(nextExpressoesObj);
    }, [onChangeOperacoes, onChangeExpressoes]);

    // Update item by id (opStr or expressao)
    const updateItem = (id, patch) => {
        setItems(prev => {
            const next = prev.map(it => it.id === id ? { ...it, ...patch } : it);
            pushExternal(next);
            return next;
        });
    };

    // Insert new item after given id (if id === null => push at end)
    const insertAfter = (id = null) => {
        setItems(prev => {
            const nova = { id: genId(), opStr: "", expressao: "" };
            let next;
            if (id === null) next = [...prev, nova];
            else {
                const idx = prev.findIndex(it => it.id === id);
                if (idx === -1) next = [...prev, nova];
                else next = [...prev.slice(0, idx + 1), nova, ...prev.slice(idx + 1)];
            }
            pushExternal(next);
            return next;
        });
    };

    // Remove by id
    const removeById = (id) => {
        setItems(prev => {
            const next = prev.filter(it => it.id !== id);
            pushExternal(next);
            return next;
        });
    };

    // Replace opStr at id (used by dropdown)
    const setOpStr = (id, opStr) => updateItem(id, { opStr });

    // Replace expressao at id (used by Operation component)
    const setExpressao = (id, expressao) => updateItem(id, { expressao });

    return (
        <div className="dropdownsBox">
            <p>S1:</p>

            {items.map((it, index) => (
                <div key={it.id} className="dropdown-item" id={`dropdown-${index}`}>
                    <ScheduleRow
                        id={it.id}
                        index={index}
                        opStr={it.opStr}
                        expressao={it.expressao}
                        numTransacoes={numTransacoes}
                        numVariaveis={numVariaveis}
                        disable={disable}
                        onChangeOpStr={(v) => setOpStr(it.id, v)}
                        onChangeExpressao={(v) => setExpressao(it.id, v)}
                        onAddAfter={() => insertAfter(it.id)}
                        onRemove={() => removeById(it.id)}
                        isLast={index === items.length - 1}
                        canRemove={operacoes.length > 1}
                    />
                </div>
            ))}
        </div>
    );
}
