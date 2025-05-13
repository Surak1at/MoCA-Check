import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useExitConfirm from '../../hooks/useExitConfirm';
import { Volume2 } from 'lucide-react';
import useGlobalAudioPlayer from '../../hooks/useGlobalAudioPlayer';
import axios from 'axios';
import Swal from '../../utils/SwalTheme';

const geometryShapes = [
  `${import.meta.env.BASE_URL}images/shape/cone.png`,
  `${import.meta.env.BASE_URL}images/shape/cube.png`,
  `${import.meta.env.BASE_URL}images/shape/cylindrical.png`,
  `${import.meta.env.BASE_URL}images/shape/squarepyramid.png`,
  `${import.meta.env.BASE_URL}images/shape/triangularpyramid.png`,
];

const getShapeNameFromPath = (path) => {
  const filename = path.split('/').pop().replace('.png', '');
  return filename.toLowerCase();
};

const GeometryCopyTest = () => {
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedShape, setSelectedShape] = useState('');
  const [canvasSize, setCanvasSize] = useState({ width: 320, height: 240 });
  const stageRef = useRef(null);
  const navigate = useNavigate();
  const { playAudio, isPlaying } = useGlobalAudioPlayer();
  const AI_BASE = import.meta.env.VITE_AI_BASE_URL;
  useExitConfirm();

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * geometryShapes.length);
    setSelectedShape(geometryShapes[randomIndex]);

    const updateSize = () => {
      let maxWidth = 320;
      if (window.innerWidth >= 1440) maxWidth = 500;
      else if (window.innerWidth >= 1024) maxWidth = 450;
      else if (window.innerWidth >= 768) maxWidth = 400;
      setCanvasSize({ width: maxWidth, height: (maxWidth * 3) / 4 });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleMouseDown = (e) => {
    e.evt.preventDefault();
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e) => {
    e.evt.preventDefault();
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines([...lines]);
  };

  const handleMouseUp = (e) => {
    e.evt.preventDefault();
    setIsDrawing(false);
  };

  const handleUndo = () => setLines(lines.slice(0, -1));
  const handleClear = () => setLines([]);

  const handleNext = async () => {
    if (lines.length === 0) {
      return Swal.fire({
        icon: 'warning',
        title: 'ยังไม่ได้วาด!',
        text: 'กรุณาวาดภาพก่อนจึงจะสามารถประเมินได้',
        confirmButtonText: 'ตกลง'
      });
    }
  
    Swal.fire({
      title: 'กำลังประมวลผล...',
      text: 'ระบบกำลังส่งภาพให้ AI ตรวจสอบความถูกต้อง อาจใช้เวลาสักครู่',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    try {
      const stage = stageRef.current;
      const finalDataURL = stage.toDataURL({ pixelRatio: 1, mimeType: 'image/png' });
      
      const res = await axios.post(`${AI_BASE}geometry-check/`, {
        image: finalDataURL,
      });
  
      const { prediction, confidence } = res.data;
      const expectedShape = getShapeNameFromPath(selectedShape);
      const isCorrect = prediction === expectedShape;
      const score = isCorrect ? 1 : 0;
  
      // ✅ เก็บข้อมูลลง localStorage
      const resultPayload = {
        lines,
        shape: selectedShape,                         // full image path
        shapeName: expectedShape,                     // ex: "cube"
        prediction,
        confidence,
        score,
        imageData: finalDataURL,                      // 🔹 เก็บภาพไว้ใช้ใน ReportPdf
        timestamp: new Date().toISOString()
      };
  
      localStorage.setItem('geometryScore', score);
      localStorage.setItem('geometryCopy', JSON.stringify(resultPayload));
      localStorage.setItem('geometryDrawing', finalDataURL); // optional: ซ้ำกันแต่เรียกง่าย
  
      Swal.close();
      navigate('/assessment/clock-rotation');
  
    } catch (error) {
      console.error(error);
      Swal.close();
  
      Swal.fire({
        title: 'ไม่สามารถเชื่อมต่อกับระบบวิเคราะห์',
        text: 'ระบบจะดำเนินการไปยังข้อถัดไปโดยไม่ประเมินคะแนน',
        icon: 'warning',
        confirmButtonText: 'ไปต่อ',
        allowOutsideClick: false,
      }).then(() => {
        const expectedShape = getShapeNameFromPath(selectedShape);
  
        const resultPayload = {
          lines,
          shape: selectedShape,
          shapeName: expectedShape,
          prediction: null,
          confidence: null,
          score: 1,
          imageData: stageRef.current.toDataURL({ pixelRatio: 1, mimeType: 'image/png' }),
          timestamp: new Date().toISOString()
        };
  
        localStorage.setItem('geometryScore', 1);
        localStorage.setItem('geometryCopy', JSON.stringify(resultPayload));
        navigate('/assessment/clock-rotation');
      });
    }
  };  

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-pale to-light"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="min-h-screen flex flex-col items-center justify-center px-2 py-12 bg-gradient-to-br from-pale to-light space-y-6">
        <h2 className="text-xl md:text-2xl font-bold text-center leading-relaxed text-gray-800 max-w-2xl">
          วาดภาพเรขาคณิตในกรอบ{' '}
          <span className="text-red-500 font-semibold">ให้เหมือนต้นแบบมากที่สุด</span>

          <button
            onClick={() => playAudio(`${import.meta.env.BASE_URL}audio/geometryCopy.mp3`)}
            disabled={isPlaying}
            className={`p-3 rounded-full transition shadow ${isPlaying ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'} ml-2`}
            title="ฟังคำอธิบาย"
          >
            <Volume2 className="w-7 h-7 text-gray-700" />
          </button>

        </h2>
        <p class="text-xl text-center font-medium"><span className="text-blue-700 font-semibold">คำแนะนำ:</span> กรุณาวาดอย่างบรรจง เพื่อตรวจสอบความถูกต้องได้แม่นยำ</p>

        <div className="flex justify-center w-full max-w-3xl mt-4 px-2 flex-wrap sm:flex-nowrap gap-1 sm:gap-0">
          <button
            onClick={handleUndo}
            className="bg-yellow-500 text-white px-6 py-3 sm:px-6 sm:py-3 rounded-xl font-semibold shadow hover:bg-yellow-600 transition text-sm sm:text-base border-r sm:border-r border-white"
          >
            ลบทีละเส้น
          </button>
          <button
            onClick={handleClear}
            className="bg-red-500 text-white px-6 py-3 sm:px-6 sm:py-3 rounded-xl font-semibold shadow hover:bg-red-600 transition text-sm sm:text-base border-r sm:border-r border-white"
          >
            ลบภาพวาด
          </button>
          <button
            onClick={handleNext}
            className="bg-green-500 text-white px-6 py-3 sm:px-6 sm:py-3 rounded-xl font-semibold shadow hover:bg-green-600 transition text-sm sm:text-base"
          >
            ข้อถัดไป
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 p-4 sm:p-6 bg-white rounded-2xl shadow-xl border-4 border-primary/30 w-full max-w-5xl items-center justify-center">
          <div className="flex justify-center items-center w-full max-w-[200px] sm:max-w-[200px]">
            <img
              src={selectedShape}
              alt="รูปตัวอย่าง"
              className="w-full h-auto object-contain border border-gray-300 rounded-lg shadow"
            />
          </div>

          <div className="w-full flex justify-center">
            <Stage
              width={canvasSize.width}
              height={canvasSize.height}
              ref={stageRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
              className="border-4 border-gray-400 rounded-lg bg-white mx-auto"
              style={{ touchAction: 'none', maxWidth: '100%' }}
            >
              <Layer>
                <Rect x={0} y={0} width={canvasSize.width} height={canvasSize.height} fill="#fff" />
                {lines.map((line, i) => (
                  <Line
                    key={i}
                    points={line.points}
                    stroke="black"
                    strokeWidth={4}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                  />
                ))}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GeometryCopyTest;
