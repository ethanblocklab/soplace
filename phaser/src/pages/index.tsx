import Head from "next/head";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";

const inter = Inter({ subsets: ["latin"] });

// Import LandingPage with dynamic import to prevent SSR issues with wallet connection
const LandingPageWithoutSSR = dynamic(
    () => import("@/components/web3/LandingPage"),
    { ssr: false }
);

export default function Home() {
    return (
        <>
            <Head>
                <title>Somnia SoPlace</title>
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
            <LandingPageWithoutSSR />
        </>
    );
}

