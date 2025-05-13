import { useState, useEffect, useRef } from 'react';
import { Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useExitConfirm from '../../hooks/useExitConfirm';
import useGlobalAudioPlayer from '../../hooks/useGlobalAudioPlayer';

const generateUniqueNumbers = (count, max) => {
  const numbers = new Set();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * (max + 1)));
  }
  return Array.from(numbers);
};

export default function BackwardNumberTest() {
  useExitConfirm();
  const navigate = useNavigate();
  const { playAudio, isPlaying } = useGlobalAudioPlayer();
  const [numberSequence, setNumberSequence] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [playCount, setPlayCount] = useState(0);
  const [canSelect, setCanSelect] = useState(false);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);

  useEffect(() => {
    const numbers = generateUniqueNumbers(3, 9);
    setNumberSequence(numbers);
    setSelectedNumbers([]);
  }, []);

  const handlePlayInstruction = () => {
    if (!isPlaying && !isSequencePlaying) {
      playAudio(`${import.meta.env.BASE_URL}audio/backwardInstruction.mp3`);
    }
  };

  const handlePlayNumberAudio = async () => {
    if (isPlaying || isSequencePlaying || playCount >= 2) return;

    setIsSequencePlaying(true);
    setCanSelect(false);

    for (const num of numberSequence) {
      await playAudio(`${import.meta.env.BASE_URL}audio/number/${num}.mp3`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const newCount = playCount + 1;
    setPlayCount(newCount);
    if (newCount === 2) setCanSelect(true);
    setIsSequencePlaying(false);
  };

  const handleSelectNumber = (num) => {
    if (canSelect && selectedNumbers.length < 3 && !selectedNumbers.includes(num)) {
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  const handleSubmit = () => {
    const reversed = [...numberSequence].reverse();
    const isCorrect = JSON.stringify(selectedNumbers) === JSON.stringify(reversed);
    const score = isCorrect ? 1 : 0;

    const result = {
      score,
      sequence: numberSequence,
      reversedExpected: reversed,
      answer: selectedNumbers,
      isCorrect,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('backwardNumberSet', JSON.stringify(reversed)); // ใช้ใน PDF
    localStorage.setItem('attention_backward_number', JSON.stringify(result));
    localStorage.setItem('backwardNumberScore', score);
    navigate('/assessment/number-exclusion');
  };

  const handleReset = () => setSelectedNumbers([]);
  const handleUndo = () => setSelectedNumbers((prev) => prev.slice(0, -1));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pale to-light px-6 py-12 space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
          การทดสอบความจำตัวเลข (ย้อนกลับ)
          <button
            onClick={handlePlayInstruction}
            disabled={isPlaying || isSequencePlaying}
            className={`p-3 rounded-full transition shadow ${isPlaying || isSequencePlaying ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
            title="ฟังคำอธิบาย"
          >
            <Volume2 className="w-7 h-7 text-gray-700"/>
          </button>
        </h2>
        <p className="text-xl text-center font-medium ">
          ฟังตัวเลข แล้วเลือก <span className="font-semibold text-red-500">เรียงลำดับย้อนกลับ </span>ให้ถูกต้อง
        </p>

        <button
          onClick={handlePlayNumberAudio}
          disabled={playCount >= 2 || isPlaying || isSequencePlaying}
          className={`mt-4 px-6 py-3 rounded-xl font=semibold shadow-lg text-white font-semibold transition ${playCount < 2 && !isPlaying && !isSequencePlaying ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          {playCount === 0
            ? 'ฟังครั้งแรก'
            : playCount === 1
              ? 'ฟังครั้งสุดท้าย'
              : 'ฟังครบแล้ว'}
        </button>
      </motion.div>

      {playCount === 2 && (
        <>
          <div className="flex justify-center gap-3 sm:gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-dashed rounded-lg flex items-center justify-center text-xl font-semibold bg-white">
                {selectedNumbers[index] !== undefined ? selectedNumbers[index] : ''}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4 max-w-xs sm:max-w-md mx-auto">
            {Array.from({ length: 10 }, (_, i) => (
              <button
                key={i}
                onClick={() => handleSelectNumber(i)}
                disabled={selectedNumbers.includes(i) || isSequencePlaying}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full text-lg sm:text-xl font-bold border-2 shadow flex items-center justify-center transition-all duration-200
                  ${selectedNumbers.includes(i)
                    ? 'bg-gray-500 text-white'
                    : 'bg-white hover:bg-blue-300'}`}
              >
                {i}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-4 sm:gap-6 mt-6">
            <button
              onClick={handleUndo}
              disabled={selectedNumbers.length === 0}
              className="bg-yellow-500 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-yellow-600 transition"
            >
              ลบตัวเลขล่าสุด
            </button>

            <button
              onClick={handleReset}
              className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-red-600 transition"
            >
              ล้างคำตอบ
            </button>

            {selectedNumbers.length === 3 && (
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-green-700 transition"
              >
                ข้อถัดไป
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}