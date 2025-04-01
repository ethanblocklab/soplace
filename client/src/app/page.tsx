import AnimatedBackground from "../components/AnimatedBackground";
import styles from "./page.module.css";

export default function Home() {
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
                        <button className={styles.primaryButton}>
                            Get Started
                        </button>
                        <button className={styles.secondaryButton}>
                            Learn More
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

