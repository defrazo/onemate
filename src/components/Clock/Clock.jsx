import React, { useEffect, useState } from 'react';
import css from './Clock.module.css';
import Preloader from '../UI/preloader/Preloader';

const Clock = () => {
    const [time, setTime] = useState(new Date());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setLoading(false);
        }, 1200);

        const intervalId = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
        };
    }, []);

    const getRotationStyle = (unit, max) => {
        const value = time[`get${unit}`]() * (360 / max);

        return { transform: `rotateZ(${value}deg)` };
    };

    return (
        <div className={css['clock-container']}>
            {loading ? (
                <Preloader />
            ) : (
                <div className={css['clock-container__analog-clock']}>
                    <div className={css['clock-container__analog-clock__hands']} style={getRotationStyle('Hours', 12)}>
                        <div className={css['clock-container__analog-clock__hands__hour']} id="hr"></div>
                    </div>
                    <div className={css['clock-container__analog-clock__hands']} style={getRotationStyle('Minutes', 60)}>
                        <div className={css['clock-container__analog-clock__hands__min']} id="mn"></div>
                    </div>
                    <div className={css['clock-container__analog-clock__hands']} style={getRotationStyle('Seconds', 60)}>
                        <div className={css['clock-container__analog-clock__hands__sec']} id="sc"></div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default Clock;