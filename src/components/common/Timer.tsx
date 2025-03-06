import { useEffect } from "react";

interface TimerProps {
    remainingTime: number;
    setRemainingTime: React.Dispatch<React.SetStateAction<number>>;
}

function Timer({ remainingTime, setRemainingTime }: TimerProps) {
    useEffect(() => {
        if (remainingTime <= 0) return;

        const timer = setInterval(() => {
            setRemainingTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [remainingTime, setRemainingTime]);

    const formatTime = (timeInSeconds: number) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <h1 className="text-[13px] text-center">
            유효 시간<span className="text-red-500"> {formatTime(remainingTime)}</span>
        </h1>
    );
}

export default Timer;
