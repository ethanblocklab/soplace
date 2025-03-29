import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Web3Provider } from "@/components/web3/Web3Provider";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <Web3Provider>
            <Component {...pageProps} />
        </Web3Provider>
    );
}

