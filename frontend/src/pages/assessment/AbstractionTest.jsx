import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import abstractionWords from '../../data/abstractionWords.json';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import useExitConfirm from '../../hooks/useExitConfirm';
import useGlobalAudioPlayer from '../../hooks/useGlobalAudioPlayer';

export default function AbstractionTest() {
  useExitConfirm();
  const navigate = useNavigate();
  const [questionWords, setQuestionWords] = useState([]);
  const [answerCategory, setAnswerCategory] = useState('');
  const [selected, setSelected] = useState('');
  const [locked, setLocked] = useState(false);
  const [round, setRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const { playAudio, isPlaying } = useGlobalAudioPlayer();

  const generateQuestion = () => {
    const categories = Object.keys(abstractionWords);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const words = abstractionWords[randomCategory];
    const [w1, w2] = words.sort(() => 0.5 - Math.random()).slice(0, 2);

    setQuestionWords([w1, w2]);
    setAnswerCategory(randomCategory);
    setSelected('');
    setLocked(false);
  };

  const handleSelect = (category) => {
    if (locked) return;
    setSelected(category);
    setLocked(true);

    const isCorrect = category === answerCategory;
    const updatedScore = isCorrect ? totalScore + 1 : totalScore;
    setTotalScore(updatedScore);

    setTimeout(() => {
      if (round === 2) {
        localStorage.setItem('abstractionScore', updatedScore);
        localStorage.setItem('abstractionTestResult', JSON.stringify({
          score: updatedScore,
          timestamp: new Date().toISOString()
        }));
        navigate('/assessment/orientation');
      } else {
        setRound(prev => prev + 1);
        generateQuestion();
      }
    }, 800);
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pale to-light p-6 space-y-6 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 w-full max-w-3xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
          การทดสอบการเชื่อมโยงคำ
          <button
            onClick={() => playAudio(`${import.meta.env.BASE_URL}audio/abstractionInstruction.mp3`)}
            disabled={isPlaying}
            className={`p-3 rounded-full transition shadow ${isPlaying ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
            title="ฟังคำอธิบาย"
          >
            <Volume2 className="w-7 h-7 text-gray-700" />
          </button>
        </h2>

        <p className="text-xl text-center font-medium">คำศัพท์ทั้งสองคำอยู่ในหมวดหมู่ใด? อ่านโจทย์แล้วเลือกหมวดหมู่ให้ถูกต้อง</p>

        <div className="bg-white rounded-xl shadow px-8 py-4 text-2xl font-semibold text-blue-600">
          {questionWords.join(' และ ')}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 w-full justify-center">
          {Object.keys(abstractionWords).map((category) => {
            let className = "px-6 py-3 rounded-xl text-lg font-semibold text-gray-950 transition shadow ";

            if (selected === category) {
              className += "bg-blue-400";
            } else {
              className += "bg-white hover:bg-blue-100";
            }

            return (
              <button
                key={category}
                onClick={() => handleSelect(category)}
                disabled={locked}
                className={className}
              >
                {category}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
