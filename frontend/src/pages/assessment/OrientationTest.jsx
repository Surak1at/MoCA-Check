import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import useExitConfirm from "../../hooks/useExitConfirm";
import useOrientationResultPopup from "../../hooks/useOrientationResultPopup";
import educationLevels from "../../data/educations.json";
import provinces from "../../data/provinces.json";
import useGlobalAudioPlayer from '../../hooks/useGlobalAudioPlayer';
import { useUser } from '../../context/UserContext';

export default function OrientationTest() {
  useExitConfirm();
  const navigate = useNavigate();
  const showResultPopup = useOrientationResultPopup();
  const user = useUser(); // ✅ ชื่อเปลี่ยนเป็น user เพื่อไม่ชนกับ useState
  const { playAudio, isPlaying } = useGlobalAudioPlayer();

  const [formData, setFormData] = useState({
    birthDate: "",
    birthMonth: "",
    currentDate: "",
    currentMonth: "",
    education: "",
    province: "",
  });

  const [score, setScore] = useState(0);
  const [inputStatus, setInputStatus] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const stored = localStorage.getItem("assessmentUserData");
    console.log("✅ ข้อมูลจาก localStorage.assessmentUserData:", stored);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log("✅ แปลงเป็น object แล้ว:", parsed);
      } catch (err) {
        console.error("❌ JSON parsing error:", err);
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { user: currentUser } = user; // ดึงข้อมูล user จาก context
    const localRegisterData = JSON.parse(localStorage.getItem("assessmentUserData")) || {};

    const isLoggedIn = !!currentUser?.birth_date;

    const birthDateRaw = isLoggedIn ? currentUser.birth_date : localRegisterData.birthDate;
    const educationRaw = isLoggedIn ? currentUser.education : localRegisterData.education;
    const provinceRaw = isLoggedIn ? currentUser.province : localRegisterData.province;

    let birthDateUser = null;
    if (birthDateRaw) {
      if (birthDateRaw.includes('/')) {
        // 📌 guest: dd/mm/yyyy (พ.ศ.)
        const [day, month, buddhistYear] = birthDateRaw.split('/').map(Number);
        const gregorianYear = buddhistYear - 543;
        birthDateUser = new Date(gregorianYear, month - 1, day);
      } else if (birthDateRaw.includes('-')) {
        // 📌 logged-in: yyyy-mm-dd (ค.ศ.)
        const [bYear, bMonth, bDay] = birthDateRaw.split('-').map(Number);
        birthDateUser = new Date(bYear, bMonth - 1, bDay);
      }
    }

    const today = new Date();

    const correctValues = {
      birthDate: birthDateUser?.getDate().toString() || '',
      birthMonth: birthDateUser?.toLocaleString("th-TH", { month: "long" }) || '',
      education: educationRaw?.trim() || '',
      province: provinceRaw?.trim() || '',
      currentDate: today.getDate().toString(),
      currentMonth: today.toLocaleString("th-TH", { month: "long" }),
    };

    let newScore = 0;
    let newInputStatus = {};

    console.log("=== START เปรียบเทียบแต่ละช่อง ===");

    Object.entries(correctValues).forEach(([key, correct]) => {
      const userInput = formData[key]?.trim() || '';
      const isCorrect = userInput === correct;

      console.log(`\n[${key}]`);
      console.log(`- กรอก:      "${userInput}"`);
      console.log(`- คำตอบที่ถูก: "${correct}"`);
      console.log(`=> ${isCorrect ? '✓ ตรงกัน' : '✗ ไม่ตรงกัน'}`);

      if (isCorrect) {
        newScore += 1;
        newInputStatus[key] = "correct";
      } else {
        newInputStatus[key] = "incorrect";
      }
    });

    console.log("\n=== สรุปคะแนน ===");
    console.log(`คะแนนที่ได้: ${newScore} / ${Object.keys(correctValues).length}`);
    console.log("สถานะการกรอก:", newInputStatus);

    console.log("\n=== Debug เฉพาะฟิลด์ที่มักมีปัญหา ===");
    console.log("birthDateRaw:", birthDateRaw);
    console.log("birthDateUser:", birthDateUser);
    console.log("formData.birthDate:", formData.birthDate);
    console.log("educationRaw:", `"${educationRaw}"`);
    console.log("formData.education:", `"${formData.education}"`);
    console.log("provinceRaw:", `"${provinceRaw}"`);
    console.log("formData.province:", `"${formData.province}"`);

    setScore(newScore);
    setInputStatus(newInputStatus);

    showResultPopup(() => {
      localStorage.setItem("orientationTestResult", JSON.stringify({ score: newScore }));
      navigate("/assessment/result");
    });
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pale to-light px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-xl w-full max-w-3xl space-y-6"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3 justify-center">
          การทดสอบการรับรู้และความจำ
          <button
            onClick={() => playAudio(`${import.meta.env.BASE_URL}audio/orientationInstruction.mp3`)}
            disabled={isPlaying}
            className={`p-2 rounded-full transition shadow ${isPlaying ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
            title="ฟังคำอธิบาย"
          >
            <Volume2 className="w-6 h-6 text-gray-700" />
          </button>
        </h2>

        <p className="text-xl text-center font-medium">กรอกข้อมูลให้ตรงกับที่ลงทะเบียนไว้</p>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {/* วันที่ปัจจุบัน */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">วันที่ปัจจุบัน</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select name="currentDate" className={`p-3 border rounded-lg w-full ${inputStatus.currentDate === "correct" ? "border-green-500" : inputStatus.currentDate === "incorrect" ? "border-red-500" : ""}`} onChange={handleChange}>
                <option value="">เลือกวันที่</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => <option key={day} value={day}>{day}</option>)}
              </select>
              <select name="currentMonth" className={`p-3 border rounded-lg w-full ${inputStatus.currentMonth === "correct" ? "border-green-500" : inputStatus.currentMonth === "incorrect" ? "border-red-500" : ""}`} onChange={handleChange}>
                <option value="">เลือกเดือน</option>
                {Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleString("th-TH", { month: "long" })).map(month => <option key={month} value={month}>{month}</option>)}
              </select>
            </div>
          </div>

          {/* วันเกิด */}
          <div>
            <label className="font-semibold text-gray-700 mb-1 block">วันเกิดของคุณ</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select name="birthDate" className={`p-3 border rounded-lg w-full ${inputStatus.birthDate === "correct" ? "border-green-500" : inputStatus.birthDate === "incorrect" ? "border-red-500" : ""}`} onChange={handleChange}>
                <option value="">เลือกวันที่</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => <option key={day} value={day}>{day}</option>)}
              </select>
              <select name="birthMonth" className={`p-3 border rounded-lg w-full ${inputStatus.birthMonth === "correct" ? "border-green-500" : inputStatus.birthMonth === "incorrect" ? "border-red-500" : ""}`} onChange={handleChange}>
                <option value="">เลือกเดือน</option>
                {Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleString("th-TH", { month: "long" })).map(month => <option key={month} value={month}>{month}</option>)}
              </select>
            </div>
          </div>

          {/* การศึกษา */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">ระดับการศึกษา</label>
            <select name="education" className={`p-3 border rounded-lg w-full ${inputStatus.education === "correct" ? "border-green-500" : inputStatus.education === "incorrect" ? "border-red-500" : ""}`} onChange={handleChange}>
              <option value="">เลือกระดับการศึกษา</option>
              {educationLevels.map((level) => (
                <option key={level.id} value={level.name}>{level.name}</option>
              ))}
            </select>
          </div>

          {/* จังหวัด */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">จังหวัดที่อยู่ปัจจุบัน</label>
            <select name="province" className={`p-3 border rounded-lg w-full ${inputStatus.province === "correct" ? "border-green-500" : inputStatus.province === "incorrect" ? "border-red-500" : ""}`} onChange={handleChange}>
              <option value="">เลือกจังหวัด</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.name_th}>{province.name_th}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold shadow-md transition">
            ยืนยันคำตอบ
          </button>
        </form>
      </motion.div>
    </div>
  );
}
