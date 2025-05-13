import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useExitConfirm from '../../hooks/useExitConfirm';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import useGlobalAudioPlayer from '../../hooks/useGlobalAudioPlayer';

const animalFiles = [
    `${import.meta.env.BASE_URL}images/animals/bear.jpg`,
    `${import.meta.env.BASE_URL}images/animals/camel.jpg`,
    `${import.meta.env.BASE_URL}images/animals/cheetah.jpg`,
    `${import.meta.env.BASE_URL}images/animals/chicken.jpg`,
    `${import.meta.env.BASE_URL}images/animals/cow.jpg`,
    `${import.meta.env.BASE_URL}images/animals/deer.jpg`,
    `${import.meta.env.BASE_URL}images/animals/dog.jpg`,
    `${import.meta.env.BASE_URL}images/animals/fox.jpg`,
    `${import.meta.env.BASE_URL}images/animals/horse.jpg`,
    `${import.meta.env.BASE_URL}images/animals/lion.jpg`,
];

const correctAnswers = ['หมี', 'อูฐ', 'เสือชีต้า', 'ไก่', 'วัว', 'กวาง', 'สุนัข', 'สุนัขจิ้งจอก', 'ม้า', 'สิงโต'];
const animalChoices = ['หมี', 'อูฐ', 'เสือชีต้า', 'ไก่', 'วัว', 'กวาง', 'สุนัข', 'สุนัขจิ้งจอก', 'ม้า', 'สิงโต'];

const NamingTest = () => {
    useExitConfirm();
    const [round, setRound] = useState(0);
    const [currentImage, setCurrentImage] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [correctCount, setCorrectCount] = useState(0);
    const [usedIndexes, setUsedIndexes] = useState([]);
    const { playAudio, isPlaying } = useGlobalAudioPlayer();
    const navigate = useNavigate();

    const getRandomImage = () => {
        let idx;
        do {
            idx = Math.floor(Math.random() * animalFiles.length);
        } while (usedIndexes.includes(idx));
        setUsedIndexes([...usedIndexes, idx]);
        setCurrentImage({ index: idx, url: animalFiles[idx] });
    };

    useEffect(() => {
        getRandomImage();
    }, []);

    const handleAnswer = (choice) => {
        setSelectedAnswer(choice);
        const correct = correctAnswers[currentImage.index];
        const isCorrect = choice === correct;

        if (isCorrect) {
            setCorrectCount((prev) => prev + 1);
        }

        // ✅ อัปเดต usedIndexes แบบไม่มีซ้ำ
        setUsedIndexes((prev) => {
            const updated = [...prev];
            if (!updated.includes(currentImage.index)) {
                updated.push(currentImage.index);
            }
            return updated;
        });

        setTimeout(() => {
            if (round < 2) {
                setRound((prev) => prev + 1);
                getRandomImage();
                setSelectedAnswer('');
            } else {
                const finalScore = correctCount + (isCorrect ? 1 : 0);

                const result = {
                    correct: finalScore,
                    total: 3,
                    details: usedIndexes.map((index) => ({
                        image: animalFiles[index],
                        correctAnswer: correctAnswers[index],
                    })),
                    timestamp: new Date().toISOString(),
                };

                // ✅ เก็บผลลง localStorage
                localStorage.setItem('namingScore', finalScore); // สำหรับ ResultPage
                localStorage.setItem('namingTestResult', JSON.stringify(result)); // raw result

                navigate('/assessment/memory');
            }
        }, 800);
    };

    return (
        <motion.div
            className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-pale to-light space-y-6 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pale to-light px-6 py-12 space-y-6">

                {/* โจทย์ */}
                <h2 className="text-xl md:text-2xl font-bold text-center leading-relaxed text-gray-800 max-w-2xl">
                    <span className="text-primary font-semibold">(ข้อ {round + 1}/3)</span> ดูภาพสัตว์ แล้วเลือกชื่อที่ตรงกับภาพ
                    {/* ปุ่มฟังเสียง */}
                    <button
                        onClick={() => playAudio(`${import.meta.env.BASE_URL}audio/namingTest.mp3`)}
                        disabled={isPlaying} // ✅ ป้องกันการกดระหว่างเสียงกำลังเล่น
                        className={`p-3 rounded-full transition shadow ${isPlaying ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'} ml-2`}
                        title="ฟังคำอธิบาย"
                    >
                        <Volume2 className="w-7 h-7 text-gray-700" />
                    </button>
                </h2>

                {/* รูปภาพสัตว์ */}
                {currentImage && (
                    <div className="w-full max-w-[140px] md:max-w-[300px] lg:max-w-[360px]">
                        <img
                            src={currentImage.url}
                            alt="animal"
                            className="w-full h-auto object-contain border-2 border-gray-300 rounded-lg shadow-lg"
                        />
                    </div>
                )}

                {/* ตัวเลือก */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-4xl w-full mt-6 px-4">
                    {animalChoices.map((choice, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(choice)}
                            disabled={!!selectedAnswer}
                            className={`px-4 py-2 rounded-xl font-semibold shadow-md text-sm sm:text-base md:text-lg transition w-full
                          ${selectedAnswer === choice
                                    ? choice === correctAnswers[currentImage?.index]
                                        ? 'bg-white text-gray-900'
                                        : 'bg-white text-gray-900'
                                    : 'bg-white text-gray-900 hover:bg-blue-400'
                                }`}
                        >
                            {choice}
                        </button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default NamingTest;
