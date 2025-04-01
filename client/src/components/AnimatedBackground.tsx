"use client";

import React, { useState, useEffect } from "react";
import styles from "./AnimatedBackground.module.css";

const AnimatedBackground: React.FC = () => {
    return (
        <div className={styles.backgroundContainer}>
            <div className={styles.background}></div>
        </div>
    );
};

export default AnimatedBackground;

