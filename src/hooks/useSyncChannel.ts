import { useEffect, useRef, useCallback } from "react";

export interface SyncMessage {
  type: "MINT_SUCCESS" | "VOUCHER_CREATED" | "CLAIM_SUCCESS";
  address: string;
  chainId?: number;
  [key: string]: unknown;
}

type SyncHandler = (msg: SyncMessage) => void;

const BC_NAME = "qryptum-sync";

function getWssUrl(): string | null {
  const base =
    (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/api$/, "") ??
    (import.meta.env.VITE_API_URL as string | undefined) ??
    "";
  if (!base) return null;
  return base.replace(/^http/, "ws") + "/sync";
}

export function useSyncChannel(
  address: string | undefined,
  onMessage: SyncHandler,
) {
  const handlerRef = useRef<SyncHandler>(onMessage);
  handlerRef.current = onMessage;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addressRef = useRef<string | undefined>(address);
  addressRef.current = address;

  useEffect(() => {
    if (!address) return;
    const addr = address.toLowerCase();

    // BroadcastChannel for same-browser, same-device sync
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(BC_NAME);
      bc.onmessage = (e) => {
        const msg = e.data as SyncMessage;
        if (!msg?.type || msg.address !== addr) return;
        handlerRef.current(msg);
      };
    } catch {}

    // WebSocket for cross-device, cross-browser sync
    const wssBase = getWssUrl();
    let destroyed = false;

    function connect() {
      if (destroyed || !wssBase) return;
      const url = `${wssBase}?address=${addr}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data) as SyncMessage;
          if (!msg?.type) return;
          handlerRef.current(msg);
        } catch {}
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (!destroyed) {
          reconnectTimer.current = setTimeout(connect, 3_000);
        }
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      destroyed = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      try { bc?.close(); } catch {}
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [address]);

  const broadcast = useCallback(
    (msg: Omit<SyncMessage, "address">) => {
      const addr = addressRef.current?.toLowerCase();
      if (!addr) return;
      const full: SyncMessage = { ...msg, address: addr } as SyncMessage;

      // BroadcastChannel (same device)
      try {
        const bc = new BroadcastChannel(BC_NAME);
        bc.postMessage(full);
        bc.close();
      } catch {}

      // WebSocket (cross-device)
      try {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify(full));
        }
      } catch {}
    },
    [],
  );

  return { broadcast };
}
