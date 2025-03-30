import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Web3Provider } from "@/components/web3/Web3Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Somnia SoPlace",
    description: "Place items in a virtual world with Somnia SoPlace.",
    icons: {
        icon: "/favicon.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Web3Provider>{children}</Web3Provider>
            </body>
        </html>
    );
}

