"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./AnimatedBackground.module.css";

const AnimatedBackground: React.FC = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const backgroundRef = useRef<HTMLDivElement>(null);
    const waterRef = useRef<HTMLDivElement>(null);

    // Initialize the default position for background and water
    useEffect(() => {
        if (backgroundRef.current) {
            const baseScale = 1.15; // Increased scale to make sure the image covers the screen
            backgroundRef.current.style.transform = `translate3d(0px, 0px, 0) scale(${baseScale})`;
        }
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: e.clientX / window.innerWidth,
                y: e.clientY / window.innerHeight,
            });
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    useEffect(() => {
        if (backgroundRef.current) {
            // Use a larger base scale to ensure no edges are visible
            const baseScale = 1.15;

            // Increase maximum movement distance for more noticeable effect
            const maxMovement = 20;

            // Calculate movement with enhanced easing for more natural effect
            const easeOutQuad = (x: number) => x * (2 - x);

            // Center the parallax effect (subtract 0.5 to make the center position 0)
            const xOffset = (mousePosition.x - 0.5) * maxMovement;
            const yOffset = (mousePosition.y - 0.5) * maxMovement;

            // Apply the transform with more pronounced movement
            backgroundRef.current.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0) scale(${baseScale})`;
        }
    }, [mousePosition]);

    return (
        <div className={styles.backgroundContainer}>
            {/* Main background layer with parallax effect */}
            <div ref={backgroundRef} className={styles.background}></div>

            {/* Smoke layer with animation */}
            <div className={styles.smokeContainer}>
                <div className={styles.smokeElement1}></div>
                <div className={styles.smokeElement2}></div>
            </div>
        </div>
    );
};

export default AnimatedBackground;

