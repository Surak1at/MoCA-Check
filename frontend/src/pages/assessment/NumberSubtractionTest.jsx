import { useState, useRef } from 'react';
import { Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useExitConfirm from '../../hooks/useExitConfirm';
import useGlobalAudioPlayer from '../../hooks/useGlobalAudioPlayer';

const generateSubtractionSequence = () => {
  const startNumber = Math.floor(Math.random() * (99 - 50 + 1)) + 50;
  const subtractValue = Math.floor(Math.random() * (9 - 3 + 1)) + 3;
  return {
    startNumber,
    subtractValue,
    sequence: Array.from({ length: 5 }, (_, i) => startNumber - subtractValue * i),
  };
};

export default function NumberSubtractionTest() {
  useExitConfirm();
  const [subtractionData, setSubtractionData] = useState(generateSubtractionSequence());
  const [userAnswers, setUserAnswers] = useState(Array(5).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const { playAudio, isPlaying } = useGlobalAudioPlayer();
  const inputRefs = useRef([]);

  const handleInputChange = (index, value) => {
    if (/^\d*$/.test(value) && value.length <= 2) {
      const newAnswers = [...userAnswers];
      newAnswers[index] = value;
      setUserAnswers(newAnswers);
  
      if (value.length === 2 && userAnswers[index + 1] === '') {
        setActiveIndex(index + 1);
        inputRefs.current[index + 1]?.focus();
      }
    }
  };  

  const handleSubmit = () => {
    const correctSequence = subtractionData.sequence.slice(1);
    const correctCount = userAnswers.reduce((count, ans, i) => {
      return parseInt(ans.trim()) === correctSequence[i] ? count + 1 : count;
    }, 0);

    let score = 0;
    if (correctCount >= 4) score = 3;
    else if (correctCount >= 2) score = 2;
    else if (correctCount === 1) score = 1;

    const result = {
      startNumber: subtractionData.startNumber,
      subtractValue: subtractionData.subtractValue,
      correctSequence,
      userAnswers,
      correctCount,
      score,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('number_subtraction_test', JSON.stringify(result));
    localStorage.setItem('numberSubtractionScore', score);
    localStorage.setItem('numberSubtractionDetails', JSON.stringify({
      questions: correctSequence,
      answers: userAnswers,
      start: subtractionData.startNumber,
      step: subtractionData.subtractValue
    }));    
    navigate('/assessment/delay-recall');
  };

  const handleReset = () => {
    setUserAnswers(Array(5).fill(''));
    setActiveIndex(0);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pale to-light px-6 py-12 space-y-6 sm:space-y-8 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 sm:space-y-6 w-full max-w-md sm:max-w-lg md:max-w-xl bg-white p-6 rounded-2xl shadow-xl border-4 border-primary/30"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
          การทดสอบลบตัวเลข
          <button
            onClick={() => playAudio(`${import.meta.env.BASE_URL}audio/subtractionInstruction.mp3`)}
            disabled={isPlaying}
            className={`p-3 rounded-full transition shadow ${isPlaying ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
            title="ฟังคำอธิบาย"
          >
            <Volume2 className="w-7 h-7 text-gray-700" />
          </button>
        </h2>

        <p className="text-xl text-center font-medium ">
          จากตัวตั้ง <span className="font-bold text-blue-600">{subtractionData.startNumber}</span> ลบไปเรื่อย ๆ ทีละ <span className="font-bold text-red-600">{subtractionData.subtractValue}</span> 
        </p>

        <div className="flex justify-center items-center gap-2 sm:gap-3 text-lg sm:text-2xl font-semibold flex-nowrap overflow-x-auto">
          {userAnswers.map((answer, index) => (
            <input
              key={index}
              type="tel"
              value={answer}
              onChange={(e) => handleInputChange(index, e.target.value)}
              disabled={
                userAnswers.includes('') &&
                index > userAnswers.findIndex(ans => ans === '')
              }              
              ref={(el) => (inputRefs.current[index] = el)}
              className={`w-12 h-12 sm:w-16 sm:h-16 text-center border-2 rounded-lg text-md sm:text-lg font-semibold ${index === activeIndex ? 'border-blue-500' : 'border-gray-400'}`}
              maxLength="2"
            />
          ))}
        </div>

        {userAnswers.every(val => val !== '') && (
          <div className="flex justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
            <button
              onClick={handleReset}
              className="bg-red-500 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg shadow hover:bg-red-600 transition"
            >
              ล้างคำตอบ
            </button>

            <button
              onClick={handleSubmit}
              className="bg-green-500 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg shadow hover:bg-green-600 transition"
            >
              ข้อถัดไป
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}