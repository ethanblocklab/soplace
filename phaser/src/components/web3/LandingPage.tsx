import { useEffect } from "react";
import { useRouter } from "next/router";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import styles from "./LandingPage.module.css";

export const LandingPage = () => {
    const router = useRouter();
    const { isConnected } = useAccount();

    // Redirect to game if already connected
    useEffect(() => {
        if (isConnected) {
            router.push("/game");
        }
    }, [isConnected, router]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Somnia SoPlace</h1>
                <p className={styles.description}>
                    Connect your wallet to start placing items in the virtual
                    world
                </p>

                <div className={styles.connectButton}>
                    <ConnectKitButton />
                </div>
            </div>
        </div>
    );
};

export default LandingPage;

