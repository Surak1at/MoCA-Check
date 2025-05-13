import { Link } from 'react-router-dom';
import ElderlyImage from '../assets/images/raw.png';
import { Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleStartAssessment = () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      navigate('/assessment/dot-connect'); // ✅ ข้าม register ได้เลย
    } else {
      navigate('/assessment/register');    // ❌ ยังไม่ได้ login
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col-reverse md:flex-row items-center justify-center px-6 md:px-20 py-12 bg-gradient-to-br from-light to-pale relative overflow-hidden gap-10 md:gap-20">

      {/* Content ด้านซ้าย */}
      <motion.div
        className="text-center md:text-left space-y-6 max-w-lg z-10"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        {/* Icon + ชื่อแอป */}
        <div className="flex items-center justify-center md:justify-start gap-3">
          <Brain size={50} className="text-primary" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-secondary leading-tight">
            MoCA Check
          </h1>
        </div>

        {/* คำอธิบาย */}
        <p className="text-lg md:text-xl text-primary leading-relaxed">
          ประเมินความเสี่ยงโรคสมองเสื่อม <br /> ง่าย รวดเร็ว และฟรี!
        </p>

        {/* ปุ่ม */}
        <div className="flex justify-center md:justify-start w-full">
          <button
            onClick={handleStartAssessment}
            className="bg-primary text-white px-10 py-4 rounded-lg shadow-lg hover:bg-secondary transition w-full block text-center text-lg font-semibold"
          >
            เริ่มทำแบบประเมิน
          </button>
        </div>
      </motion.div>

      {/* รูปภาพ ด้านขวา */}
      <motion.div
        className="w-full md:w-[60%] lg:w-[50%] flex justify-center z-10"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <img
          src={ElderlyImage}
          alt="Elderly Couple"
          className="rounded-3xl shadow-2xl border-4 border-soft max-w-xs md:max-w-lg lg:max-w-xl w-full object-cover"
        />
      </motion.div>

      {/* ลายพื้นหลัง */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/30 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/30 rounded-full blur-3xl opacity-30"></div>
    </div>
  );
};

export default Home;
