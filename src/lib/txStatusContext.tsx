import { createContext, useContext, useCallback, useState, ReactNode } from "react";

export type TxEntry = {
    hash: `0x${string}`;
    label: string;
    id: number;
};

type TxStatusCtx = {
    pushTx: (hash: `0x${string}`, label: string) => void;
    entries: TxEntry[];
    dismissEntry: (id: number) => void;
};

const TxStatusContext = createContext<TxStatusCtx>({
    pushTx: () => {},
    entries: [],
    dismissEntry: () => {},
});

let _idCounter = 0;

export function TxStatusProvider({ children }: { children: ReactNode }) {
    const [entries, setEntries] = useState<TxEntry[]>([]);

    const pushTx = useCallback((hash: `0x${string}`, label: string) => {
        const id = ++_idCounter;
        setEntries(prev => [...prev, { hash, label, id }]);
    }, []);

    const dismissEntry = useCallback((id: number) => {
        setEntries(prev => prev.filter(e => e.id !== id));
    }, []);

    return (
        <TxStatusContext.Provider value={{ pushTx, entries, dismissEntry }}>
            {children}
        </TxStatusContext.Provider>
    );
}

export function useTxStatus() {
    return useContext(TxStatusContext);
}
