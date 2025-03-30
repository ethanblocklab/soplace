"use client";

import { ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { somniaTestnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

/**
 * Create a Wagmi config with ConnectKit
 */
const config = createConfig(
    getDefaultConfig({
        chains: [somniaTestnet],
        transports: {
            [somniaTestnet.id]: http(`https://dream-rpc.somnia.network/`),
        },

        // Required API Keys
        walletConnectProjectId:
            process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",

        // Required App Info
        appName: "Somnia SoPlace",

        // Optional App Info
        appDescription: "Somnia SoPlace - Place items in a virtual world",
        appUrl: "https://app.soplace.xyz",
        appIcon: "/favicon.png",
    })
);

// Create a query client
const queryClient = new QueryClient();

interface Web3ProviderProps {
    children: ReactNode;
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ConnectKitProvider>{children}</ConnectKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};

export default Web3Provider;

