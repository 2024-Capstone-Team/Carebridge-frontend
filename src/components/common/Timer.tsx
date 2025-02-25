import { useState, useEffect } from 'react';

function Timer() {
    const initialTime = 180;
    const [remainingTime, setRemainingTime] = useState(initialTime);

    useEffect(() => {
        const timer = setInterval(() => {
            if (remainingTime > 0) {
                setRemainingTime((prevTime) => prevTime - 1);
            } else {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [remainingTime]);

    const formatTime = (timeInSeconds: number) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <div>
            <h1 className="text-[13px] text-center">유효 시간<span className=' text-red-500'> {formatTime(remainingTime)}</span></h1>
        </div>
    );
}

export default Timer;
