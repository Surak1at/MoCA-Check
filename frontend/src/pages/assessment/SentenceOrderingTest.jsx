import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Volume2 } from "lucide-react";
import sentenceData from "../../data/sentences.json";
import useExitConfirm from "../../hooks/useExitConfirm";
import useGlobalAudioPlayer from '../../hooks/useGlobalAudioPlayer';

const getRandomSentence = (usedAudios = []) => {
  const filtered = sentenceData.filter((s) => !usedAudios.includes(s.audio));
  const availableSentences = filtered.length > 0 ? filtered : sentenceData;
  const randomIndex = Math.floor(Math.random() * availableSentences.length);
  return availableSentences[randomIndex];
};

export default function SentenceOrderingTest() {
  useExitConfirm();
  const [round, setRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [usedAudios, setUsedAudios] = useState([]);
  const [sentence, setSentence] = useState(getRandomSentence());
  const [words, setWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [lockedWords, setLockedWords] = useState([]);
  const [playCount, setPlayCount] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isAudioFinished, setIsAudioFinished] = useState(false);
  const [isSentencePlaying, setIsSentencePlaying] = useState(false);
  const navigate = useNavigate();
  const { playAudio, isPlaying } = useGlobalAudioPlayer();
  const [firstSentence, setFirstSentence] = useState(null);
  const [secondSentence, setSecondSentence] = useState(null);
  const [correctFlags, setCorrectFlags] = useState([]);


  useEffect(() => {
    setWords([...sentence.words].sort(() => Math.random() - 0.5));
  }, [sentence]);

  const handlePlayInstruction = () => {
    if (!isPlaying && !isSentencePlaying) {
      playAudio(`${import.meta.env.BASE_URL}audio/sentenceOrderInstruction.mp3`);
    }
  };

  const handlePlaySentence = async () => {
    if (playCount >= 2 || isPlaying || isSentencePlaying) return;

    setIsSentencePlaying(true);
    setIsAudioFinished(false);

    const filename = sentence.audio.endsWith('.mp3') ? sentence.audio : `${sentence.audio}.mp3`;
    await playAudio(`${import.meta.env.BASE_URL}audio/sentences/${filename}`);

    const updated = playCount + 1;
    setPlayCount(updated);
    if (updated === 2) setIsAudioFinished(true);

    setIsSentencePlaying(false);
  };

  const handleSelectWord = (word) => {
    if (selectedWords.includes(word) || isDisabled || !isAudioFinished) return;

    const newSelectedWords = [...selectedWords, word];
    const newLockedWords = [...lockedWords, word];

    setSelectedWords(newSelectedWords);
    setLockedWords(newLockedWords);

    if (newSelectedWords.length === sentence.words.length) {
      setIsDisabled(true);

      const updatedUsed = [...usedAudios, sentence.audio];
      const isCorrect = newSelectedWords.every((w, i) => w === sentence.words[i]);
      const updatedScore = isCorrect ? totalScore + 1 : totalScore;

      setTimeout(() => {
        if (round === 1) {
          // รอบแรก: เก็บประโยคไว้ใน sessionStorage เพื่อใช้ตอนรอบ 2
          sessionStorage.setItem("sentence1", JSON.stringify(sentence));
          sessionStorage.setItem("correctFlags", JSON.stringify([isCorrect]));

          setRound(2);
          setUsedAudios(updatedUsed);
          setSentence(getRandomSentence(updatedUsed));
          setSelectedWords([]);
          setLockedWords([]);
          setPlayCount(0);
          setIsAudioFinished(false);
          setIsDisabled(false);
          setTotalScore(updatedScore);
        } else {
          // รอบสอง: ดึงประโยครอบแรกกลับมา และรวมผล
          const sentence1 = JSON.parse(sessionStorage.getItem("sentence1"));
          const flags = JSON.parse(sessionStorage.getItem("correctFlags"));

          localStorage.setItem("sentenceOrderingScore", updatedScore);
          localStorage.setItem("sentenceOrderingResult", JSON.stringify({
            repeatSentences: [
              { audio: sentence1.audio, words: sentence1.words },
              { audio: sentence.audio, words: sentence.words }
            ],
            correctFlags: [...flags, isCorrect],
            totalScore: updatedScore
          }));

          navigate("/assessment/word-typing");
        }
      }, 800);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pale to-light p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
          การทดสอบเรียงประโยคจากเสียง
          <button
            onClick={handlePlayInstruction}
            disabled={isPlaying || isSentencePlaying}
            className={`p-3 rounded-full transition shadow ${isPlaying || isSentencePlaying ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
            title="ฟังคำอธิบาย"
          >
            <Volume2 className="w-7 h-7 text-gray-700" />
          </button>
        </h2>
        <p className="text-xl text-center font-medium ">ฟังประโยค แล้วเรียงคำให้ถูกต้องตามลำดับ</p>

        <button
          onClick={handlePlaySentence}
          disabled={playCount >= 2 || isPlaying || isSentencePlaying}
          className={`px-6 py-3 rounded-xl font-semibold shadow-lg text-white font-semibold transition 
            ${playCount < 2 && !isPlaying && !isSentencePlaying ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
        >
          <Volume2 className="w-6 h-6 inline-block mr-2" />
          {playCount === 0 ? "ฟังครั้งแรก" : playCount === 1 ? "ฟังครั้งสุดท้าย" : "ฟังครบแล้ว"}
        </button>

        {isAudioFinished && (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 mt-4 w-full">
            {words.map((word, index) => {
              const isSelected = selectedWords.includes(word);
              const isLocked = lockedWords.includes(word);

              let buttonClass = "px-6 py-3 rounded-xl font-semibold sm:px-6 sm:py-3  shadow transition text-base sm:text-lg ";
              if (isLocked) {
                buttonClass += "bg-gray-300 text-gray-600 cursor-not-allowed";
              } else {
                buttonClass += "bg-white text-gray-900 hover:bg-blue-400 border";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelectWord(word)}
                  className={buttonClass}
                  disabled={isLocked || isDisabled}
                >
                  {word}
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
