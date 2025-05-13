import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import useExitConfirm from '../../hooks/useExitConfirm';
import useMemorySubmitConfirm from '../../hooks/useMemorySubmitConfirm';
import memoryWords from '../../data/memoryWords.json';
import useGlobalAudioPlayer from '../../hooks/useGlobalAudioPlayer';

const MemoryTest = () => {
  useExitConfirm();
  const [selectedSet, setSelectedSet] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [playCount, setPlayCount] = useState(0);
  const [usedSetIndexes, setUsedSetIndexes] = useState([]);
  const [canSelectWords, setCanSelectWords] = useState(false);
  const [showStartButton, setShowStartButton] = useState(true);
  const [showNextPlayButton, setShowNextPlayButton] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const navigate = useNavigate();
  const handleSubmitWithConfirm = useMemorySubmitConfirm();
  const { playAudio, isPlaying } = useGlobalAudioPlayer();

  const allWords = memoryWords.allWords;
  const wordSets = memoryWords.wordSets;

  const handleStartTest = () => {
    if (isPlaying || playCount >= 2) return;

    let currentSet = selectedSet;
    if (selectedSet.length === 0) {
      let availableIndexes = wordSets.map((_, i) => i).filter(i => !usedSetIndexes.includes(i));
      if (availableIndexes.length === 0) {
        availableIndexes = wordSets.map((_, i) => i);
        setUsedSetIndexes([]);
      }
      const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
      currentSet = wordSets[randomIndex];
      setSelectedSet(currentSet);
      setUsedSetIndexes(prev => [...prev, randomIndex]);
      localStorage.setItem('memorySelectedSet', JSON.stringify(currentSet));
    }

    playWordSet(currentSet);
  };

  const playWordSet = async (words) => {
    if (isPlaying || playCount >= 2) return;
    setShowStartButton(false);
    setSelectedOrder([]);
    setCanSelectWords(false);

    for (const word of words) {
      const slug = allWords.find((w) => w.word === word)?.slug;
      if (slug) {
        await playAudio(`${import.meta.env.BASE_URL}audio/memoryWord/${slug}.mp3`);
      }
    }

    setPlayCount(prev => prev + 1);
    setCanSelectWords(true);
  };

  const handleSelectWord = (word) => {
    if (selectedOrder.find((item) => item.word === word) || selectedOrder.length >= 5) return;
    const obj = allWords.find((w) => w.word === word);
    const updatedOrder = [...selectedOrder, obj];
    setSelectedOrder(updatedOrder);

    if (updatedOrder.length === 5) {
      if (playCount === 1) {
        setShowNextPlayButton(true);
      } else if (playCount === 2) {
        setShowNextButton(true);
      }
    }
  };

  useEffect(() => {
    if (playCount === 1 && selectedOrder.length === 5) {
      localStorage.setItem("memoryRepeat1", JSON.stringify(selectedOrder.map(w => w.word)));
    } else if (playCount === 2 && selectedOrder.length === 5) {
      localStorage.setItem("memoryRepeat2", JSON.stringify(selectedOrder.map(w => w.word)));
    }
  }, [selectedOrder]);  

  const handleSubmit = () => {
    if (selectedOrder.length === 5) {
      handleSubmitWithConfirm(() => {
        const correctCount = selectedOrder.reduce((count, wordObj, index) => {
          return wordObj.word === selectedSet[index] ? count + 1 : count;
        }, 0);

        const result = {
          answer: selectedOrder.map(w => w.word),
          correct: selectedSet,
          correctCount,
          percentage: ((correctCount / 5) * 100).toFixed(2),
          timestamp: new Date().toISOString()
        };

        localStorage.setItem('memoryTestResult', JSON.stringify(result));
        navigate('/assessment/number-sequence');
      });
    }
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-pale to-light space-y-6 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pale to-light px-6 py-12 space-y-6">

        <h2 className="text-xl md:text-2xl font-bold text-center leading-relaxed text-gray-800 max-w-2xl">
          <span className="font-semibold text-blue-600">ฟังคำศัพท์ </span>
          <span className="font-semibold text-purple-600">แล้วเลือกเรียงลำดับ </span>ให้ถูกต้อง
          <button
            onClick={() => playAudio(`${import.meta.env.BASE_URL}audio/memoryInstruction.mp3`)}
            disabled={isPlaying}
            className={`p-3 rounded-full ml-1 transition shadow ${isPlaying ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
            title="ฟังคำอธิบาย"
          >
            <Volume2 className=" w-7 h-7 text-gray-700" />
          </button>
        </h2>

        {showStartButton && playCount < 2 && (
          <button
            onClick={handleStartTest}
            disabled={isPlaying}
            className="px-6 py-3 rounded-xl font-semibold shadow-lg text-white font-semibold bg-blue-600 hover:bg-blue-700"
          >
            {playCount === 0 ? 'เริ่มทำแบบทดสอบ' : 'ทวนซ้ำอีกครั้ง'}
          </button>
        )}

        {showNextPlayButton && playCount === 1 && (
          <button
            onClick={handleStartTest}
            disabled={isPlaying}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-blue-600 mt-4"
          >
            ทวนซ้ำครั้งที่ 2
          </button>
        )}

        {canSelectWords && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-5xl w-full">
            {allWords.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectWord(item.word)}
                disabled={
                  selectedOrder.some((w) => w.word === item.word) || selectedOrder.length >= 5
                }
                className={`px-6 py-4 text-lg rounded-xl shadow font-medium transition text-gray-950
              ${selectedOrder.some((w) => w.word === item.word)
                    ? 'bg-gray-400'
                    : 'bg-white text-gray-950 hover:bg-blue-400'}`}
              >
                {item.word}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 max-w-md w-full mt-6">
          {selectedOrder.map((item, idx) => (
            <div key={item.slug} className="flex justify-between items-center bg-white border px-4 py-2 rounded-lg shadow">
              <span>{idx + 1}. {item.word}</span>
              <button
                onClick={() => {
                  const updated = selectedOrder.filter((w) => w.slug !== item.slug);
                  setSelectedOrder(updated);
                  setShowNextPlayButton(false);
                  setShowNextButton(false);
                }}
                className="text-sm text-red-600 hover:underline"
              >
                ลบ
              </button>
            </div>
          ))}
        </div>

        {showNextButton && playCount === 2 && (
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:bg-green-700 transition mt-6"
          >
            ข้อถัดไป
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default MemoryTest;
