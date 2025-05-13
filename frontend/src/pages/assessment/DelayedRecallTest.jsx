import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import useExitConfirm from "../../hooks/useExitConfirm";
import useGlobalAudioPlayer from '../../hooks/useGlobalAudioPlayer';
import Swal from '../../utils/SwalTheme';

export default function DelayedRecallTest() {
  useExitConfirm();
  const navigate = useNavigate();
  const [selectedSet, setSelectedSet] = useState([]);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [misScore, setMisScore] = useState(0);
  const [lockedWords, setLockedWords] = useState([]);
  const [hint, setHint] = useState("");
  const { playAudio, isPlaying } = useGlobalAudioPlayer();

  useEffect(() => {
    const storedSet = JSON.parse(localStorage.getItem("memorySelectedSet")) || [];
    if (storedSet.length === 0) {
      navigate("/assessment/memory-test");
    } else {
      setSelectedSet(storedSet);
      setShuffledWords([...storedSet].sort(() => Math.random() - 0.5));
    }
  }, [navigate]);

  const handleSelectWord = (word) => {
    if (lockedWords.includes(word)) return;
  
    const correctWord = selectedSet[currentWordIndex];
  
    if (word === correctWord) {
      // ✅ ตอบถูก
      const newLocked = [...lockedWords, word];
      const nextIndex = currentWordIndex + 1;
  
      // ✅ คำนวณคะแนน MIS + Recall
      const misPoints = attempts === 0 ? 3 : attempts === 1 ? 2 : 1;
      const newScore = attempts === 0 ? score + 1 : score; // ได้ 1 คะแนนเฉพาะกรณีไม่ใช้ตัวช่วย
      const newMisScore = misScore + misPoints;
  
      // ✅ อัปเดตสถานะ
      setLockedWords(newLocked);
      setCurrentWordIndex(nextIndex);
      setAttempts(0);
      setHint("");
      setScore(newScore);
      setMisScore(newMisScore);
  
      // ✅ บันทึกผลเมื่อทำครบ
      if (nextIndex === selectedSet.length) {
        const result = {
          correctWords: selectedSet,
          recallScore: newScore,       // ได้โดยไม่ใช้ตัวช่วย
          misScore: newMisScore,       // รวมคะแนน MIS
          timestamp: new Date().toISOString()
        };
  
        localStorage.setItem("delayedRecallResult", JSON.stringify(result));     // 🔍 raw result
        localStorage.setItem("delayedRecallScore", newScore);                    // ✅ สำหรับ ResultPage
        localStorage.setItem("delayedRecallMIS", newMisScore);                   // ✅ MIS แยกไว้ถ้าต้องการ
        navigate("/assessment/sentence-ordering");
      }
    } else {
      // ❌ ตอบผิด → ให้ตัวช่วย
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
  
      if (newAttempts === 1) {
        const hintText = "💡 คำใบ้: " + getCategoryHint(correctWord);
        setHint(hintText);
        Swal.fire({ title: 'คำใบ้', text: hintText, icon: 'info' });
      } else if (newAttempts === 2) {
        const hintText = "📌 ตัวเลือกที่เกี่ยวข้อง: " + getMultipleChoiceHint(correctWord);
        setHint(hintText);
        Swal.fire({ title: 'คำใบ้เพิ่มเติม', text: hintText, icon: 'info' });
      } else {
        // const hintText = "✅ คำตอบที่ถูกต้อง: " + correctWord;
        // setHint(hintText);
        // Swal.fire({ title: 'เฉลย', text: hintText, icon: 'success' });
        setLockedWords([...lockedWords, correctWord]);
        setCurrentWordIndex(currentWordIndex + 1);
        setAttempts(0);
      }      
    }
  };
  

  const getCategoryHint = (word) => {
    const categories = {
      "หน้า": "ร่างกาย",
      "ผ้าไหม": "สิ่งของ/เสื้อผ้า",
      "วัด": "สถานที่",
      "มะลิ": "ดอกไม้",
      "สีแดง": "สี",
      "บ้าน": "สถานที่",
      "ตา": "ร่างกาย",
      "เสือ": "สัตว์",
      "วิทยุ": "เครื่องใช้ไฟฟ้า",
      "สีเหลือง": "สี",
      "หนังสือ": "สิ่งของ",
      "ทีวี": "เครื่องใช้ไฟฟ้า"
    };
    return categories[word] || "ไม่ทราบหมวดหมู่";
  };

  const getMultipleChoiceHint = (word) => {
    const choices = {
      "หน้า": ["ตา", "ปาก", "จมูก", "หู", "คิ้ว"],
      "ผ้าไหม": ["เสื้อ", "กางเกง", "กระโปรง", "หมวก", "ผ้าไหม"],
      "วัด": ["โบสถ์", "โรงเรียน", "พิพิธภัณฑ์", "หอประชุม", "วัด"],
      "มะลิ": ["กุหลาบ", "กล้วยไม้", "ทิวลิป", "บัว", "มะลิ"],
      "สีแดง": ["สีเหลือง", "สีเขียว", "สีดำ", "สีฟ้า", "สีแดง"],
      "บ้าน": ["บ้าน", "คอนโด", "หอพัก", "แฟลต", "กระท่อม"],
      "ตา": ["ตา", "จมูก", "หู", "ปาก", "คิ้ว"],
      "เสือ": ["เสือ", "สิงโต", "เสือดาว", "เสือชีต้า", "เสือขาว"],
      "วิทยุ": ["วิทยุ", "ทีวี", "โทรศัพท์", "ลำโพง", "นาฬิกา"],
      "สีเหลือง": ["สีแดง", "สีฟ้า", "สีเขียว", "สีขาว", "สีเหลือง"],
      "หนังสือ": ["หนังสือ", "สมุด", "ดินสอ", "ปากกา", "กระดาษ"],
      "ทีวี": ["ทีวี", "วิทยุ", "รีโมท", "ลำโพง", "โปรเจคเตอร์"]
    };
    return choices[word]?.join(", ") || "ไม่มีตัวเลือก";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pale to-light p-4 space-y-6 w-full">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 w-full max-w-6xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
          การทดสอบทบทวนคำศัพท์
          <button
            onClick={() => playAudio(`${import.meta.env.BASE_URL}audio/delayedRecallInstruction.mp3`)}
            disabled={isPlaying} // ✅ ป้องกันการกดระหว่างเสียงกำลังเล่น
            className={`p-3 rounded-full transition shadow ${isPlaying ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
            title="ฟังคำอธิบาย"
          >
            <Volume2 className="w-7 h-7 text-gray-700" />
          </button>
        </h2>
        <p className="text-xl text-center font-medium">ให้ทวนคำศัพท์ที่จำไว้ก่อนหน้านี้ และเรียงคำให้ถูกต้อง</p>

        <div className="flex flex-col lg:flex-row flex-wrap lg:flex-nowrap justify-center items-center gap-4 mt-4 w-full">
          {shuffledWords.map((word, index) => (
            <button
              key={index}
              onClick={() => handleSelectWord(word)}
              className={`px-6 py-3 rounded-xl font-semibold min-w-[110px] whitespace-nowrap rounded-xl shadow text-base lg:text-lg font-semibold transition
        ${lockedWords.includes(word)
                  ? "bg-gray-500 text-white cursor-not-allowed"
                  : "bg-white text-gray-900 hover:bg-blue-400"
                }`}
              disabled={lockedWords.includes(word)}
            >
              {word}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
