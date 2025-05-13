import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from '../../utils/SwalTheme';
import patterns from '../../data/patterns';
import { motion } from 'framer-motion';
import useIncompleteAlert from '../../hooks/useIncompleteAlert';
import useExitConfirm from '../../hooks/useExitConfirm';
import { Volume2 } from 'lucide-react';
import useGlobalAudioPlayer from '../../hooks/useGlobalAudioPlayer';
import { Canvg } from 'canvg';
import html2canvas from 'html2canvas';

const getRandomPattern = () => {
  const randomIndex = Math.floor(Math.random() * patterns.length);
  return patterns[randomIndex];
};

const DotConnectTest = () => {
  const [points] = useState(() => getRandomPattern());
  const [lines, setLines] = useState([]);
  const [lastPoint, setLastPoint] = useState(null);
  const navigate = useNavigate();
  const showIncompleteAlert = useIncompleteAlert();
  const [activeLabel, setActiveLabel] = useState(null);
  const { playAudio, isPlaying } = useGlobalAudioPlayer();
  useExitConfirm();

  useEffect(() => {
    const start = points.find(p => p.label === '1');
    const mid = points.find(p => p.label === 'ก');
    const next = points.find(p => p.label === '2');
    if (start && mid && next) {
      setLines([
        { from: start, to: mid, arrow: true, locked: true },
        { from: mid, to: next, arrow: true, locked: true }
      ]);
      setLastPoint(next);
    }
  }, [points]);

  const handlePointClick = (label, x, y) => {
    setActiveLabel(label); // ตั้งจุดที่กด
    if (lines.length >= 9) return;
    if (!lastPoint && label !== '1') {
      Swal.fire('กรุณาเริ่มจากจุด 1 เท่านั้น!', '', 'warning');
      return;
    }
    if (lastPoint && lastPoint.label === label) {
      Swal.fire('ห้ามลากไปหาตัวเอง!', '', 'warning');
      return;
    }
    const exists = lines.some(line =>
      (line.from.label === lastPoint?.label && line.to.label === label) ||
      (line.from.label === label && line.to.label === lastPoint?.label)
    );
    if (exists) {
      Swal.fire('ห้ามลากเส้นซ้ำ!', '', 'warning');
      return;
    }
    if (lastPoint) {
      setLines([
        ...lines,
        { from: lastPoint, to: { label, x, y }, arrow: true } // ✅ เพิ่ม arrow: true
      ]);
    }
    setLastPoint({ label, x, y });
  };

  const handleUndo = () => {
    if (lines.length > 2) { // ล็อก 2 เส้นแรก
      const lastLine = lines[lines.length - 1];
      if (lastLine.locked) return; // ห้ามลบ
      const updatedLines = lines.slice(0, -1);
      setLines(updatedLines);
      setLastPoint(updatedLines[updatedLines.length - 1]?.to || null);
    }
  };

  const handleNext = async () => {
    if (lines.length < 9) {
      showIncompleteAlert();
      return;
    }

    const correctSequence = ['1', 'ก', '2', 'ข', '3', 'ค', '4', 'ง', '5', 'จ'];
    const userSequence = [lines[0]?.from.label, ...lines.map(line => line.to.label)];
    const isCorrect = JSON.stringify(userSequence) === JSON.stringify(correctSequence);

    // 🎯 จับภาพ DOM ที่แสดงจริง
    const container = document.getElementById('drawingContainer');
    const canvas = await html2canvas(container, { backgroundColor: null });
    const base64 = canvas.toDataURL('image/png');

    // ✅ เก็บข้อมูลลง localStorage สำหรับ ReportPdf.jsx
    localStorage.setItem('dotConnectDrawing', base64);
    localStorage.setItem('dotConnectScore', isCorrect ? 1 : 0);
    localStorage.setItem('dotConnectResult', JSON.stringify(lines));

    // ✅ ไปหน้าถัดไป
    navigate('/assessment/geometry-copy');
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-8 bg-gradient-to-br from-pale to-light"
      // className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-gradient-to-br from-[#f0fdfa] to-[#e0f7fa]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative flex flex-col bg-gradient-to-br from-[#f0fdfa] to-[#e0f7fa] px-6 md:px-12 py-12">
        {/* หัวข้อ + ปุ่มฟังเสียง */}
        <div className="mb-6 flex flex-col items-center">
          <h2 className="text-xl md:text-2xl font-bold text-center leading-relaxed text-gray-800 max-w-2xl">
            เชื่อมโยงลำดับ
            <button
              onClick={() => playAudio(`${import.meta.env.BASE_URL}audio/dotConnect.mp3`)}
              disabled={isPlaying} // ✅ ป้องกันการกดระหว่างเสียงกำลังเล่น
              className={`p-3 rounded-full transition shadow ${isPlaying ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'} ml-2`}
              title="ฟังคำอธิบาย"
            >
              <Volume2 className="w-7 h-7 text-gray-700" />
            </button>
          </h2>
          <p class="my-1 text-xl text-center font-medium">สามารถกดที่จุดต่อไปได้เลย ไม่ต้องลากเส้น</p>
        </div>

        {/* กล่องลากเส้น */}
        <div className="relative w-100 max-w-[1200px] mx-auto">

          {/* ปุ่มลบซ้าย - ปุ่มไปต่อขวา */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handleUndo}
              className="bg-yellow-500 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-yellow-600 transition"
            >
              ลบเส้นล่าสุด
            </button>

            <button
              onClick={handleNext}
              className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-green-600 transition"
            >
              ข้อถัดไป
            </button>
          </div>

          <div id="drawingContainer" className="h-[520px] sm:h-[450px] md:h-[500px] bg-white rounded-lg shadow-lg">
            <svg
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 500 500"
            >
              <defs>
                <marker
                  id="dotArrow"
                  viewBox="0 0 10 10"
                  refX="21"         // ✅ ตำแหน่งดี
                  refY="5"
                  markerWidth="6"
                  markerHeight="5"
                  orient="auto"
                >
                  <path d="M 0 0 L 10 5 L 0 10 Z" fill="blue" />
                </marker>

              </defs>

              {lines.map((line, idx) => (
                <line
                  key={idx}
                  x1={`${line.from.x}%`}
                  y1={`${line.from.y}%`}
                  x2={`${line.to.x}%`}
                  y2={`${line.to.y}%`}
                  stroke="blue"
                  strokeWidth="3"
                  strokeLinecap="round"
                  markerEnd={line.arrow ? "url(#dotArrow)" : undefined}
                />
              ))}

              {points.map((p, idx) => (
                <g
                  key={idx}
                  onClick={() => handlePointClick(p.label, p.x, p.y)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={`${p.x}%`}
                    cy={`${p.y}%`}
                    r="20"
                    fill="white"
                    stroke="black"
                    strokeWidth="2"
                    className={`transition duration-200 ${activeLabel === p.label ? 'fill-yellow-200 stroke-primary' : ''
                      } hover:fill-yellow-100 hover:stroke-primary`}
                  />
                  <text x={`${p.x}%`} y={`${p.y}%`} textAnchor="middle" dy="5" fontWeight="bold">
                    {p.label}
                  </text>
                  {p.label === '1' && (
                    <text
                      x={`${p.x}%`}
                      y={`${p.y + 3}%`}
                      textAnchor="middle"
                      dy="30"
                      fontSize="12"
                      className="fill-gray-800"
                    >
                      จุดเริ่มต้น
                    </text>
                  )}
                  {p.label === 'จ' && (
                    <text
                      x={`${p.x}%`}
                      y={`${p.y + 3}%`}
                      textAnchor="middle"
                      dy="30"
                      fontSize="12"
                      className="fill-gray-800"
                    >
                      จุดสิ้นสุด
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </motion.div >
  );
};

export default DotConnectTest;
