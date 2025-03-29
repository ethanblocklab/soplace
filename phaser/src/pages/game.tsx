import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import WalletStatus from "@/components/web3/WalletStatus";

const inter = Inter({ subsets: ["latin"] });

// Import App with dynamic import to prevent SSR
const AppWithoutSSR = dynamic(() => import("@/App"), { ssr: false });

export default function Game() {
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
        <>
            <Head>
                <title>Somnia SoPlace - Game</title>
                <meta
                    name="description"
                    content="Place items in a virtual world with Somnia SoPlace."
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <main className={`${styles.main} ${inter.className}`}>
                <WalletStatus />
                <AppWithoutSSR />
            </main>
        </>
    );
}

