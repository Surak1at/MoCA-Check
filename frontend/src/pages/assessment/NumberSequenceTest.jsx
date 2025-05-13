import { useState, useEffect } from 'react';
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

export default function NumberSequenceTest() {
  useExitConfirm();
  const { playAudio, isPlaying } = useGlobalAudioPlayer();
  const [numberSequence, setNumberSequence] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [playCount, setPlayCount] = useState(0);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const numbers = generateUniqueNumbers(5, 9);
    setNumberSequence(numbers);
    setSelectedNumbers([]);
  }, []);

  const handlePlayInstruction = () => {
    if (!isPlaying) {
      playAudio(`${import.meta.env.BASE_URL}audio/numberInstruction.mp3`);
    }
  };

  const handlePlayNumberAudio = async () => {
    if (isPlaying || isSequencePlaying || playCount >= 2) return;

    setIsSequencePlaying(true);
    for (const num of numberSequence) {
      await playAudio(`${import.meta.env.BASE_URL}audio/number/${num}.mp3`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    setPlayCount((prev) => prev + 1);
    setIsSequencePlaying(false);
  };

  const handleSelectNumber = (num) => {
    if (selectedNumbers.length < 5 && !selectedNumbers.includes(num)) {
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  const handleSubmit = () => {
    const isCorrect = JSON.stringify(selectedNumbers) === JSON.stringify(numberSequence);
    const score = isCorrect ? 1 : 0;
    const result = {
      score,
      sequence: numberSequence,
      answer: selectedNumbers,
      isCorrect,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('attention_number_sequence', JSON.stringify(result));
    localStorage.setItem('numberSequenceScore', score);
    localStorage.setItem('numberSequenceSet', JSON.stringify(numberSequence));
    navigate('/assessment/number-backward');
  };

  const handleReset = () => setSelectedNumbers([]);
  const handleUndo = () => setSelectedNumbers((prev) => prev.slice(0, -1));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pale to-light px-6 py-12 space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
          การทดสอบความจำตัวเลข
          <button
            onClick={handlePlayInstruction}
            disabled={isPlaying || isSequencePlaying}
            className={`p-3 rounded-full transition shadow ${!isPlaying && !isSequencePlaying ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-300 cursor-not-allowed'}`}
            title="ฟังคำอธิบาย"
          >
            <Volume2 className="w-7 h-7 text-gray-700" />
          </button>
        </h2>
        <p className="text-xl text-center font-medium">
          ฟังชุดตัวเลข แล้วเลือกเรียงตามลำดับที่ได้ยิน
        </p>
        <button
          onClick={handlePlayNumberAudio}
          disabled={playCount >= 2 || isPlaying || isSequencePlaying}
          className={`mt-4 px-6 py-3 rounded-xl font-semibold shadow-lg text-white font-semibold transition ${playCount < 2 && !isPlaying && !isSequencePlaying ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          {playCount === 0 ? 'ฟังครั้งแรก' : playCount === 1 ? 'ฟังครั้งสุดท้าย' : 'ฟังครบแล้ว'}
        </button>
      </motion.div>

      {playCount === 2 && (
        <>
          <div className="flex justify-center gap-2 md:gap-4 lg:gap-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 border-2 border-dashed rounded flex items-center justify-center text-lg md:text-xl lg:text-2xl font-semibold bg-white"
              >
                {selectedNumbers[index] !== undefined ? selectedNumbers[index] : ''}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-2 md:gap-4 lg:gap-6 max-w-xs md:max-w-md lg:max-w-lg mx-auto">
            {Array.from({ length: 10 }, (_, i) => (
              <button
                key={i}
                onClick={() => handleSelectNumber(i)}
                disabled={selectedNumbers.includes(i) || isSequencePlaying}
                className={`w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full text-lg md:text-xl lg:text-2xl font-bold border shadow flex items-center justify-center transition-all duration-200 ${
                  selectedNumbers.includes(i)
                    ? 'bg-gray-400 text-white'
                    : 'bg-white hover:bg-blue-200'
                }`}
              >
                {i}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-4 lg:gap-6 mt-6">
            <button
              onClick={handleUndo}
              disabled={selectedNumbers.length === 0}
              className="bg-yellow-500 text-white px-6 py-3 rounded-xl font-semibold  shadow hover:bg-yellow-600 transition"
            >
              ลบตัวเลขล่าสุด
            </button>

            <button
              onClick={handleReset}
              className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold  shadow hover:bg-red-600 transition"
            >
              ล้างคำตอบ
            </button>

            {selectedNumbers.length === 5 && (
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
