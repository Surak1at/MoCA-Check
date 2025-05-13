import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Volume2 } from 'lucide-react';
import wordMap from '../../data/wordMap.json';
import useTimeUpPopup from '../../hooks/useTimeUpPopup';
import useExitConfirm from '../../hooks/useExitConfirm';
import useGlobalAudioPlayer from '../../hooks/useGlobalAudioPlayer';

export default function WordTypingTest() {
    useExitConfirm();
    const navigate = useNavigate();
    const [currentWord, setCurrentWord] = useState(null);
    const [choices, setChoices] = useState([]);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isRunning, setIsRunning] = useState(false);
    const [correctCount, setCorrectCount] = useState(0); // ✅ นับจำนวนคำตอบถูก
    const showTimeUpPopup = useTimeUpPopup(() => {
        const score = correctCount >= 11 ? 1 : 0;
        localStorage.setItem('wordTypingTestResult', JSON.stringify({
            correctCount: correctCount,
            timestamp: new Date().toISOString()
        }));
        localStorage.setItem('wordTypingScore', score);
        navigate('/assessment/abstraction');
    });
    const { playAudio, isPlaying } = useGlobalAudioPlayer();

    const getRandomWord = () => {
        const words = Object.keys(wordMap);
        const randomWord = words[Math.floor(Math.random() * words.length)];
        setCurrentWord(randomWord);

        const correctAnswer = wordMap[randomWord][0];

        // ✅ สร้าง Set ของอักษรทั้งหมดที่ไม่ซ้ำ
        const allUniqueLetters = [...new Set(Object.values(wordMap).flat())];

        // ✅ ตัดตัวที่ซ้ำกับคำตอบออกก่อนสุ่ม distractors
        const distractors = allUniqueLetters.filter(letter => letter !== correctAnswer);

        // ✅ สุ่ม 3 distractors ไม่ซ้ำ
        const randomDistractors = distractors.sort(() => 0.5 - Math.random()).slice(0, 3);

        // ✅ รวมกับคำตอบและสุ่มสลับอีกครั้ง
        const allChoices = [...randomDistractors, correctAnswer].sort(() => 0.5 - Math.random());

        setChoices(allChoices);
    };

    useEffect(() => {
        if (!isRunning) return;
        if (timeLeft === 0) {
            setIsRunning(false);
            showTimeUpPopup();
            return;
        }
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, isRunning]);

    const handleStartTest = () => {
        setTimeLeft(60);          // ตั้งเวลา
        getRandomWord();          // สุ่มคำ
        setCorrectCount(0);       // รีเซ็ตคะแนน
        setIsRunning(false);      // ❌ อย่าเพิ่งเริ่มนับเวลา
    };

    const handleChoice = (choice) => {
        if (!isRunning) {
            setIsRunning(true); // เริ่มนับถอยหลัง
        }

        const correctLetter = wordMap[currentWord][0];
        if (choice === correctLetter) {
            setCorrectCount(prev => prev + 1);
        }

        getRandomWord();
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pale to-light p-6 space-y-6 text-center">

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 w-full max-w-4xl">
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                    <h2 className="text-3xl sm:text-3xl font-bold text-gray-800 leading-relaxed">
                        การทดสอบเลือกอักษรขึ้นต้นของคำศัพท์
                        <button
                            onClick={() => playAudio(`${import.meta.env.BASE_URL}audio/wordTypingInstruction.mp3`)}
                            disabled={isPlaying} // ✅ ป้องกันการกดระหว่างเสียงกำลังเล่น
                            className={`p-3 rounded-full transition shadow ${isPlaying ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'} ml-2`}
                            title="ฟังคำอธิบาย"
                        >
                            <Volume2 className="w-7 h-7 text-gray-700" />
                        </button>
                    </h2>
                    <p className="text-2xl text-center">
                        เลือกตัวอักษรขึ้นต้นของคำศัพท์ให้ถูกต้องให้มากที่สุดใน<span className='text-red-600 font-bold'> 1 นาที </span>
                    </p>
                </div>

                {isRunning && (
                    <p className="text-2xl font-semibold text-gray-700">
                        ⏳ เหลือเวลา: <span className={timeLeft <= 10 ? 'text-red-500' : 'text-gray-800'}>{timeLeft} วินาที</span>
                    </p>
                )}

                {currentWord && (
                    <motion.div
                        key={currentWord}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="bg-white px-6 py-4 sm:px-8 sm:py-6 shadow-lg border-4 border-gray-300 rounded-lg text-3xl font-bold text-blue-700 mt-6 sm:mt-8"
                    >
                        {currentWord}
                    </motion.div>
                )}

                {currentWord && choices.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6 w-full max-w-3xl mx-auto">
                        {choices.map((choice, index) => (
                            <button
                                key={index}
                                onClick={() => handleChoice(choice)}
                                className="bg-white text-gray-900 hover:bg-blue-400 text-2xl sm:text-2xl font-bold px-5 py-3 sm:px-6 sm:py-4 rounded-xl shadow-md transition-all duration-200 min-w-[100px]"
                            >
                                {choice}
                            </button>
                        ))}
                    </div>
                )}

                {!currentWord && (
                    <button
                        onClick={handleStartTest}
                        className="bg-blue-600 text-white px-6 py-3 sm:px-10 sm:py-4 rounded-xl shadow-lg text-lg font-semibold hover:bg-blue-700 transition mt-4"
                    >
                        เริ่มทดสอบ
                    </button>
                )}
            </motion.div>
        </div>
    );
}
