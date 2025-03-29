import { ConnectKitButton } from "connectkit";
import { useAccount, useBalance } from "wagmi";
import styles from "./WalletStatus.module.css";

export const WalletStatus = () => {
    const { address } = useAccount();
    const { data: balanceData } = useBalance({
        address,
    });

    const formatAddress = (addr: string | undefined) => {
        if (!addr) return "";
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    return (
        <div className={styles.walletStatus}>
            <div className={styles.info}>
                {address && (
                    <>
                        <span className={styles.address}>
                            {formatAddress(address)}
                        </span>
                        {balanceData && (
                            <span className={styles.balance}>
                                {parseFloat(balanceData.formatted).toFixed(4)}{" "}
                                {balanceData.symbol}
                            </span>
                        )}
                    </>
                )}
            </div>
            <ConnectKitButton />
        </div>
    );
};

export default WalletStatus;

