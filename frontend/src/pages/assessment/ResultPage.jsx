import React, { useEffect, useState, useRef } from 'react';
import Swal from '../../utils/SwalTheme';
import { motion } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import PDFReport from '../../components/PDF/PDFReport';
import PDFWrapper from '../../components/PDF/PDFWrapper';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResultPage = () => {
  const [misScore, setMisScore] = useState(0);
  const [eduBonus, setEduBonus] = useState(0);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [scoreDetails, setScoreDetails] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [totalFull, setTotalFull] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const pdfRef = useRef();
  const savingRef = useRef(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    console.log("🧠 useEffect ทำงาน");
    const getData = () => {
      const dot = parseInt(localStorage.getItem("dotConnectScore")) || 0;
      const geo = parseInt(localStorage.getItem("geometryScore")) || 0;
      const clock = parseInt(localStorage.getItem("clockRotationScore")) || 0;

      const sequence = parseInt(localStorage.getItem("numberSequenceScore")) || 0;
      const backward = parseInt(localStorage.getItem("backwardNumberScore")) || 0;
      const exclusion = parseInt(localStorage.getItem("numberExclusionScore")) || 0;
      const subtract = parseInt(localStorage.getItem("numberSubtractionScore")) || 0;

      const naming = JSON.parse(localStorage.getItem("namingTestResult"))?.correct || 0;
      const sentence = parseInt(localStorage.getItem("sentenceOrderingScore")) || 0;
      const typing = parseInt(localStorage.getItem("wordTypingScore")) || 0;
      const abstraction = JSON.parse(localStorage.getItem("abstractionTestResult"))?.score || 0;
      const orientation = JSON.parse(localStorage.getItem("orientationTestResult"))?.score || 0;

      const delayedScore = parseInt(localStorage.getItem("delayedRecallScore")) || 0;
      const delayedMis = parseInt(localStorage.getItem("delayedRecallMIS")) || 0;

      const userData = JSON.parse(localStorage.getItem("assessmentUserData"));
      const hasEduBonus = userData?.education?.includes("ประถม") || userData?.education?.includes("ต่ำกว่า") ? 1 : 0;

      setMisScore(delayedMis);
      setEduBonus(hasEduBonus);
      const scoreObj = {
        visuospatial: {
          total: dot + geo + clock,
          full: 5,
          breakdown: [
            { label: 'ลากเส้นประจุด', score: dot, full: 1 },
            { label: 'คัดลอกรูปภาพเรขาคณิต', score: geo, full: 1 },
            { label: 'วาดนาฬิกา', score: clock, full: 3 },
          ]
        },
        naming: { total: naming, full: 3 },
        memory: { total: null, full: 5 },
        attention: {
          total: sequence + backward + exclusion + subtract,
          full: 6,
          breakdown: [
            { label: 'อ่านชุดตัวเลข', score: sequence, full: 1 },
            { label: 'อ่านเลขย้อนกลับ', score: backward, full: 1 },
            { label: 'ยกเว้นเลข 1', score: exclusion, full: 1 },
            { label: 'ลบตัวเลข', score: subtract, full: 3 },
          ]
        },
        delayed: { total: delayedScore, full: 5 },
        language: {
          total: sentence + typing,
          full: 3,
          breakdown: [
            { label: 'เรียงประโยค', score: sentence, full: 2 },
            { label: 'พิมพ์คำศัพท์', score: typing, full: 1 },
          ]
        },
        abstraction: { total: abstraction, full: 2 },
        orientation: { total: orientation, full: 6 },
      };

      setScoreDetails(scoreObj);
      const scoreSum = Object.entries(scoreObj)
        .filter(([key, s]) => key !== 'memory')
        .reduce((acc, [_, s]) => acc + s.total, 0);
      const fullSum = Object.entries(scoreObj)
        .filter(([key, s]) => key !== 'memory')
        .reduce((acc, [_, s]) => acc + s.full, 0);
      setTotalScore(scoreSum + hasEduBonus);
      setTotalFull(fullSum);
    };
    getData();

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; // สำหรับ browser เช่น Chrome
    };

    const handleBackButton = (e) => {
      e.preventDefault();
      Swal.fire({
        icon: 'warning',
        title: 'ห้ามย้อนกลับ',
        text: 'ไม่สามารถย้อนกลับไปยังแบบทดสอบก่อนหน้าได้',
        confirmButtonText: 'ตกลง',
      }).then(() => {
        window.history.pushState(null, '', window.location.href); // ดัน URL ปัจจุบันกลับเข้า history อีกครั้ง
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload); // กัน refresh / ปิดหน้า
    window.addEventListener('popstate', handleBackButton); // กันกดย้อนหน้า

    // Push fake state เพื่อให้ popstate ทำงานแม้เป็นหน้าแรก
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleBackButton);
    };
  }, []);

  const handleDownloadPDF = async () => {
    if (isSubmitting || isSubmitted || savingRef.current) {
      console.warn('⛔ Blocked duplicate call');
      return;
    }

    console.trace("📍 handleDownloadPDF ถูกเรียกจากที่ไหน?");
    savingRef.current = true;
    setIsSubmitting(true);

    try {
      const element = document.getElementById('pdf-content');
      const opt = {
        margin: 0,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      const worker = html2pdf().set(opt).from(element);
      const pdfBlob = await worker.outputPdf('blob');

      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn("⛔ ไม่มี token — ข้ามการบันทึก ส่งเฉพาะ PDF download");
        html2pdf().set(opt).from(element).save();
        return;
      }

      const formData = new FormData();
      formData.append('pdf', pdfBlob, 'result.pdf');
      formData.append('total_score', totalScore);
      formData.append('mis_score', misScore);

      const res = await axios.post(`${API_BASE}submit-result/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setIsSubmitted(true);
      html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("❌ บันทึกล้มเหลว:", err);
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกผลได้', 'error');
    } finally {
      // 🔐 ปลดล็อกช้า เพื่อกัน spam click
      setTimeout(() => {
        savingRef.current = false;
        setIsSubmitting(false);
      }, 3000);
    }
  };

  const isNormal = totalScore >= 25;
  const isHighRisk = totalScore < 20 && misScore < 7;
  const isMidRisk = totalScore < 25 && misScore >= 7;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pale to-light px-4 py-10">
      <div className="max-w-6xl mx-auto bg-white/90 p-6 md:p-10 rounded-3xl shadow-xl space-y-6">
        <h2 className="text-3xl font-bold text-center text-secondary">ผลการประเมิน</h2>

        <div className="space-y-6">
          {Object.entries(scoreDetails).map(([key, group]) => (
            <div key={key} className="bg-gray-50 p-4 rounded-xl shadow">
              <h3 className="font-bold text-lg text-gray-700 mb-2">
                {key === 'visuospatial' && '🧠 Visuospatial/Executive'}
                {key === 'naming' && '🐾 Naming'}
                {key === 'memory' && '🗂️ Memory (ไม่มีการเก็บคะแนน แต่อยู่ในการประเมิน Delayed Recall และ MIS)'}
                {key === 'attention' && '🔢 Attention'}
                {key === 'delayed' && '⏳ Delayed Recall'}
                {key === 'language' && '📝 Language'}
                {key === 'abstraction' && '🧩 Abstraction'}
                {key === 'orientation' && '📍 Orientation'}
              </h3>
              {group.total !== null && (
                <p className="text-sm text-gray-500 mb-2">{group.total} / {group.full} คะแนน</p>
              )}
              {group.breakdown && (
                <ul className="text-sm space-y-1 ml-4 list-disc">
                  {group.breakdown.map((item, i) => (
                    <li key={i}>{item.label} — {item.score} / {item.full}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <h3 className="text-xl font-bold text-gray-700">คะแนนรวม {(totalScore / totalFull * 100).toFixed(2)}%</h3>
          <p className="text-sm text-gray-500">คุณได้ {totalScore} จาก {totalFull} คะแนน</p>
          {eduBonus > 0 && <p className="text-sm text-green-600 mt-1">+1 คะแนน (เพิ่มจากระดับการศึกษา ≤ ป.6)</p>}
          <p className="text-sm text-purple-700 mt-2">คะแนน MIS: {misScore} / 15</p>
          <button
            onClick={() =>
              Swal.fire({
                title: "📋 วิธีการประเมินผล",
                html: `
                <div style="text-align: left; font-size: 16px; line-height: 1.6;">
                  <p><strong>📊 การให้คะแนนแบบประเมิน MoCA</strong></p>
                  <ul style="padding-left: 1.2em; margin-top: 6px;">
                    <li>คะแนนเต็มทั้งหมด: <strong>30</strong></li>
                    <li>ระดับการศึกษา ≤ ประถมศึกษา: <strong>เพิ่ม +1 คะแนน</strong></li>
                    <li>คะแนนรวม < 25: <strong style="color: red;">ผิดปกติ</strong></li>
                    <li>คะแนนรวม ≥ 25: <strong style="color: green;">ปกติ</strong></li>
                  </ul>
          
                  <hr style="margin: 16px 0;" />
          
                  <p><strong>🧠 คะแนนความจำระยะสั้น (MIS)</strong></p>
                  <ul style="padding-left: 1.2em; margin-top: 6px;">
                    <li>วัดจากการจำคำใน Delayed Recall</li>
                    <li>คะแนนเต็ม: <strong>15</strong></li>
                    <li>ไม่ใช้คำใบ้เลย: <strong>x3</strong></li>
                    <li>ใช้คำใบ้ 1 ครั้ง: <strong>x2</strong></li>
                    <li>ใช้คำใบ้ 2 ครั้ง: <strong>x1</strong></li>
                  </ul>
          
                  <hr style="margin: 16px 0;" />
          
                  <p><strong>⚠️ ความเสี่ยงต่อโรคอัลไซเมอร์</strong></p>
                  <ul style="padding-left: 1.2em; margin-top: 6px;">
                    <li>คะแนนรวม < 20 (จาก 30) และ MIS < 7 (จาก 15)</li>
                    <li>ความเสี่ยงสูงถึง <strong>90%</strong> ในการพัฒนาเป็นอัลไซเมอร์ภายใน 18 เดือน</li>
                    <li>ควรเข้ารับการประเมินเพิ่มเติมกับแพทย์</li>
                  </ul>
                </div>
              `,
                confirmButtonText: "ปิด",
                width: 600,
                customClass: {
                  popup: "text-left text-gray-800 text-base leading-relaxed",
                  confirmButton: "bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2 rounded-lg",
                },
              })
            }
            className="mt-2 text-sm text-blue-600 underline hover:text-blue-800 transition"
          >
            📘 การแบ่งค่าระดับคะแนนการประเมิน
          </button>

        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6 mt-6">
          <h4 className="text-lg font-semibold text-blue-700 mb-2">📌 คำแนะนำเบื้องต้น</h4>
          <ul className="list-disc ml-6 text-gray-700 space-y-1 text-sm md:text-base">
            {isNormal && (
              <>
                <li><strong className="text-green-700">ผลลัพธ์ของคุณอยู่ในเกณฑ์ปกติ</strong> สุขภาพสมองของคุณดูดี</li>
                <li>แนะนำให้ทำแบบประเมินซ้ำทุก 6 เดือน</li>
              </>
            )}
            {isHighRisk && (
              <>
                <li><strong className="text-red-700">คะแนน MoCA และคะแนน MIS ของคุณอยู่ในระดับต่ำ</strong></li>
                <li>คุณมีโอกาสสูงถึง 90% ที่จะพัฒนาเป็นอัลไซเมอร์ภายใน 18 เดือนข้างหน้า</li>
                <li>ควรเข้ารับการประเมินเพิ่มเติมกับผู้เชี่ยวชาญ</li>
              </>
            )}
            {isMidRisk && (
              <>
                <li><strong className="text-orange-700">คะแนนรวมของคุณอยู่ในระดับที่ควรเฝ้าระวัง</strong> แต่คะแนน MIS ยังอยู่ในระดับที่ดี</li>
                <li>แนะนำให้ดูแลสุขภาพสมองอย่างใกล้ชิดและเข้ารับการติดตามผลเป็นระยะ</li>
              </>
            )}
            <li>คำแนะนำนี้จัดทำขึ้นเพื่อส่งเสริมสุขภาพสมองของคุณอย่างจริงจังและต่อเนื่อง</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
          {!isAcknowledged ? (
            <button
              onClick={() => setIsAcknowledged(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow"
            >
              รับทราบ
            </button>
          ) : (
            <>
              <motion.button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isSubmitting}
                className={`bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                ดาวน์โหลดผลประเมิน PDF
              </motion.button>
              <button
                onClick={() => navigate("/")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow"
              >
                กลับไปหน้าหลัก
              </button>
            </>
          )}
        </div>

        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <PDFWrapper>
            <PDFReport />
          </PDFWrapper>
        </div>
      </div>
    </div>);
};

export default ResultPage;
