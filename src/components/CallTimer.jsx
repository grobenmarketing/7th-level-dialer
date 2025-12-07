import { useState, useEffect, useRef } from 'react';

function CallTimer({ isActive, onTimeUpdate }) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);

  // Start/resume timer when active
  useEffect(() => {
    if (isActive && !isPaused) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      intervalRef.current = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = Math.floor((currentTime - startTimeRef.current - pausedTimeRef.current) / 1000);
        setElapsedTime(elapsed);

        // Update parent component with current duration
        if (onTimeUpdate) {
          onTimeUpdate(elapsed);
        }
      }, 100); // Update every 100ms for smooth display

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [isActive, isPaused, onTimeUpdate]);

  // Reset timer when component unmounts or contact changes
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setElapsedTime(0);
      startTimeRef.current = null;
      pausedTimeRef.current = 0;
    };
  }, []);

  const togglePause = () => {
    if (isPaused) {
      // Resuming - add the paused duration
      const pauseDuration = Date.now() - pausedTimeRef.current;
      pausedTimeRef.current = pauseDuration;
      setIsPaused(false);
    } else {
      // Pausing - record when we paused
      pausedTimeRef.current = Date.now();
      setIsPaused(true);
    }
  };

  const reset = () => {
    setElapsedTime(0);
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    setIsPaused(false);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card bg-gradient-to-br from-r7-blue to-r7-dark text-white">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-2xl">⏱️</span>
          <h3 className="text-lg font-bold">Call Timer</h3>
        </div>

        <div className="mb-4">
          <div className={`text-5xl font-bold font-mono transition-all ${isPaused ? 'opacity-50' : ''}`}>
            {formatTime(elapsedTime)}
          </div>
          {isPaused && (
            <div className="text-sm opacity-75 mt-1">⏸️ Paused</div>
          )}
        </div>

        <div className="flex gap-2 justify-center">
          <button
            onClick={togglePause}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all backdrop-blur-sm"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all backdrop-blur-sm"
            title="Reset timer"
          >
            🔄 Reset
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-white/20 text-sm opacity-75">
          <div className="flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-400' : 'bg-green-400 animate-pulse'}`}></div>
            <span>{isPaused ? 'Timer Paused' : 'Timer Running'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CallTimer;
