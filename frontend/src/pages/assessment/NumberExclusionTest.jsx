import { useState, useEffect, useRef } from 'react';
import { Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useTimeUpPopup from '../../hooks/useTimeUpPopup';
import useExitConfirm from '../../hooks/useExitConfirm';
import useGlobalAudioPlayer from '../../hooks/useGlobalAudioPlayer';

export default function NumberExclusionTest() {
  useExitConfirm();
  const navigate = useNavigate();
  const { playAudio, isPlaying, preloadAudio, stopAudio } = useGlobalAudioPlayer();

  const [targetNumber] = useState(1);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [previousNumber, setPreviousNumber] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [pressedThisRound, setPressedThisRound] = useState(false);
  const [effectColor, setEffectColor] = useState(null);

  const pressedThisRoundRef = useRef(false);
  const loopRunningRef = useRef(false);
  const isComponentMountedRef = useRef(true);
  const shuffledQueueRef = useRef([]);

  const showTimeUpPopup = useTimeUpPopup(() => {
    setIsRunning(false);   // ✅ หยุด loop
    stopAudio();           // ✅ หยุดเสียงทันที
    const score = mistakes >= 3 ? 0 : 1;
    localStorage.setItem('numberExclusionScore', score);
    navigate('/assessment/number-subtraction');
  });

  const handleMissedPress = (number) => {
    if (number === targetNumber) {
      setTimeout(() => {
        if (!pressedThisRoundRef.current) {
          setMistakes((prev) => prev + 1);
        }
      }, 2000);
    }
  };

  const handleStartTest = () => {
    setIsRunning(true);
    setMistakes(0);
    setTimeLeft(60);
  };

  const handlePress = () => {
    if (!pressedThisRound) {
      setPressedThisRound(true);
      pressedThisRoundRef.current = true;

      setEffectColor('blue');
      if (currentNumber !== targetNumber) {
        setMistakes((prev) => prev + 1);
      }

      setTimeout(() => setEffectColor(null), 300);
    }
  };

  const preloadNumberSounds = () => {
    for (let i = 0; i <= 9; i++) {
      const url = `${import.meta.env.BASE_URL}audio/number/${i}.mp3`;
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.load();
    }
  };

  const refillShuffledQueue = () => {
    const queue = [...Array(10).keys()].sort(() => Math.random() - 0.5);
    shuffledQueueRef.current = queue;
  };

  const pickNewNumber = () => {
    if (shuffledQueueRef.current.length === 0) {
      refillShuffledQueue();
    }

    let next = shuffledQueueRef.current.shift();

    if (Math.random() < 0.3 && previousNumber !== targetNumber) {
      next = targetNumber;
    }

    if (next === previousNumber) {
      return pickNewNumber();
    }

    return next;
  };

  const playWithTimeout = (src, timeout = 5000) => {
    if (!isRunning || !isComponentMountedRef.current) return Promise.resolve();

    return Promise.race([
      playAudio(src),
      new Promise((resolve) => {
        setTimeout(() => {
          console.warn(`⏱️ playAudio timeout fallback: ${src}`);
          resolve();
        }, timeout);
      }),
    ]);
  };

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const runNumberLoop = async () => {
    if (loopRunningRef.current) return;
    loopRunningRef.current = true;

    let loopCount = 0;
    const maxLoop = 200;

    while (isComponentMountedRef.current && isRunning && loopCount < maxLoop) {
      if (!isRunning || timeLeft <= 0 || !isComponentMountedRef.current) break;

      loopCount++;

      const newNumber = pickNewNumber();
      setPressedThisRound(false);
      pressedThisRoundRef.current = false;
      setPreviousNumber(newNumber);
      setCurrentNumber(newNumber);
      handleMissedPress(newNumber);

      if (!isRunning || timeLeft <= 0 || !isComponentMountedRef.current) break;

      try {
        const audioPath = `${import.meta.env.BASE_URL}audio/number/${newNumber}.mp3`;
        await playWithTimeout(audioPath);
        await delay(1000); // ✅ ค้างเลข 1 วินาทีหลังเสียง
      } catch (err) {
        console.error('เสียงเล่นไม่สำเร็จ', err);
        await delay(1000);
      }
    }

    loopRunningRef.current = false;
    console.warn('🛑 loop หยุดทำงานแล้ว');
  };

  useEffect(() => {
    preloadNumberSounds();
    refillShuffledQueue();
    isComponentMountedRef.current = true;

    return () => {
      isComponentMountedRef.current = false;
      stopAudio(); // ✅ หยุดเสียงตอนออกจากหน้า
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      runNumberLoop();
    }
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    if (timeLeft === 0) {
      setIsRunning(false);
      showTimeUpPopup();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isRunning]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pale to-light p-6 space-y-6 text-center">
      <h2 className="text-3xl font-bold text-gray-800">
        การทดสอบเลขที่ต้องยกเว้น
        <button
          onClick={() => playAudio(`${import.meta.env.BASE_URL}audio/exclusionInstruction.mp3`)}
          disabled={isPlaying}
          className={`p-2 rounded-full transition shadow ${isPlaying ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'} ml-2`}
          title="ฟังคำอธิบาย"
        >
          <Volume2 className="w-6 h-6 text-gray-700" />
        </button>
      </h2>

      {isRunning && (
        <p className="text-xl font-semibold text-gray-700">
          ⏳ เหลือเวลา: <span className={timeLeft <= 10 ? 'text-red-500' : 'text-gray-800'}>{timeLeft} วินาที</span>
        </p>
      )}

      <p className="text-xl text-gray-600 mb-2">
        หากเห็นเลขตรงกับ<span className="font-semibold text-red-600"> {targetNumber} </span>
        ใน<span className="font-semibold text-red-600">กรอบสีแดง</span> ให้กด <span className="font-semibold text-purple-600">ตกลง</span>
      </p>

      <div className="text-center mt-4">
        <div className="bg-white px-6 py-4 shadow-lg border-4 border-red-500 rounded-lg mb-2">
          <span className="text-5xl font-bold text-red-600">{targetNumber}</span>
        </div>
      </div>

      {isRunning && (
        <motion.div
          key={currentNumber}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className={`text-6xl font-bold mt-6 transition-all ${
            effectColor === 'blue'
              ? 'text-blue-700 ring-4 ring-blue-300 rounded-full px-6 scale-110'
              : 'text-blue-700'
          }`}
        >
          {currentNumber}
        </motion.div>
      )}

      {!isRunning && timeLeft === 60 && (
        <button
          onClick={handleStartTest}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg text-lg font-semibold hover:bg-blue-700 transition mt-4"
        >
          เริ่มทดสอบ
        </button>
      )}

      {isRunning && (
        <button
          onClick={handlePress}
          className="bg-purple-500 text-white text-lg font-semibold px-10 py-4 rounded-lg shadow-lg hover:bg-purple-600 transition mt-5"
        >
          ตกลง
        </button>
      )}
    </div>
  );
}
