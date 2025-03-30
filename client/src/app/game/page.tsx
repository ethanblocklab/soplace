"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import styles from "@/styles/Home.module.css";
import WalletStatus from "@/components/web3/WalletStatus";
import dynamic from "next/dynamic";

// Import App with dynamic import to prevent hydration issues
const GameApp = dynamic(() => import("@/components/game/GameApp"), {
    ssr: false,
});

export default function GamePage() {
    const router = useRouter();
    const { isConnected } = useAccount();

    // Redirect to home if not connected
    useEffect(() => {
        if (!isConnected) {
            router.push("/");
        }
    }, [isConnected, router]);

    // Show loading until account check completes
    if (!isConnected) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <main className={styles.main}>
            <WalletStatus />
            <GameApp />
        </main>
    );
}

