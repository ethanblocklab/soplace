"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import AnimatedBackground from "../components/AnimatedBackground";
import styles from "./page.module.css";

export default function Home() {
    const router = useRouter();
    const { isConnected } = useAccount();

    return (
        <main className={styles.mainContainer}>
            <AnimatedBackground />
            <div className={styles.contentOverlay}>
                <div className={styles.heroContent}>
                    <h1 className={styles.title}>Welcome to SoPlace</h1>
                    <p className={styles.subtitle}>
                        Explore the cozy virtual world
                    </p>
                    <div className={styles.buttonGroup}>
                        <ConnectKitButton.Custom>
                            {({ isConnected, show }) => {
                                return (
                                    <button
                                        onClick={
                                            isConnected
                                                ? () => router.push("/game")
                                                : show
                                        }
                                        className={
                                            isConnected
                                                ? styles.connectedButton
                                                : styles.primaryButton
                                        }
                                    >
                                        {isConnected
                                            ? "Start Game"
                                            : "Connect Wallet"}
                                    </button>
                                );
                            }}
                        </ConnectKitButton.Custom>
                        <button className={styles.secondaryButton}>
                            Learn More
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

