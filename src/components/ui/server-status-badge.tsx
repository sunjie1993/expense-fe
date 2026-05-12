"use client";

import {useCallback, useEffect, useState} from "react";
import {RotateCcw} from "lucide-react";
import {cn} from "@/lib/utils";
import {API_BASE_URL} from "@/lib/api";

type HealthStatus = "checking" | "online" | "offline";

const STATUS_CONFIG: Record<HealthStatus, {dot: string; label: string; ping: boolean}> = {
    checking: {dot: "bg-amber-400",   label: "Connecting…",    ping: true},
    online:   {dot: "bg-emerald-400", label: "Server online",  ping: true},
    offline:  {dot: "bg-red-400",     label: "Server offline", ping: false},
};

function useHealthCheck() {
    const [status, setStatus] = useState<HealthStatus>("checking");

    const fetchStatus = useCallback(() => {
        fetch(`${API_BASE_URL}/`, {signal: AbortSignal.timeout(5000)})
            .then(r => r.json())
            .then((d: {status?: string}) => setStatus(d.status === "healthy" ? "online" : "offline"))
            .catch(() => setStatus("offline"));
    }, []);

    useEffect(() => { fetchStatus(); }, [fetchStatus]);

    const check = useCallback(() => {
        setStatus("checking");
        fetchStatus();
    }, [fetchStatus]);

    return {status, check};
}

export function ServerStatusBadge() {
    const {status, check} = useHealthCheck();
    const cfg = STATUS_CONFIG[status];
    return (
        <button
            type="button"
            onClick={check}
            title="Click to re-check"
            className="group flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto select-none"
        >
            <span className="relative flex h-2 w-2 shrink-0">
                {cfg.ping && (
                    <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-60", cfg.dot)}/>
                )}
                <span className={cn("relative inline-flex h-2 w-2 rounded-full", cfg.dot)}/>
            </span>
            <span className={cn("transition-opacity", status === "checking" && "animate-pulse")}>
                {cfg.label}
            </span>
            <RotateCcw className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity"/>
        </button>
    );
}
