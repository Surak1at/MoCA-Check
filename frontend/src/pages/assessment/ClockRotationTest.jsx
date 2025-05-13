import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Line, Circle, Text, Rect } from 'react-konva';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useExitConfirm from '../../hooks/useExitConfirm';
import useGlobalAudioPlayer from '../../hooks/useGlobalAudioPlayer';
import html2canvas from 'html2canvas';

const generateRandomTime = () => {
  const randomHour = Math.floor(Math.random() * 12) + 1;
  const minuteSteps = Array.from({ length: 12 }, (_, i) => i * 5); // [0, 5, ..., 55]
  const randomMinute = minuteSteps[Math.floor(Math.random() * minuteSteps.length)];
  return { hour: randomHour, minute: randomMinute };
};

export default function ClockRotationTest() {
  useExitConfirm();
  const [step, setStep] = useState(1);
  const [score, setScore] = useState(0);
  const [selectedShape, setSelectedShape] = useState(null);
  const [shapeAnswer, setShapeAnswer] = useState(null);
  const [targetTime, setTargetTime] = useState(generateRandomTime());
  const [currentHour, setCurrentHour] = useState(12);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [inputHour, setInputHour] = useState('');
  const [inputMinute, setInputMinute] = useState('');
  const [step1Score, setStep1Score] = useState(0);
  const [step2Score, setStep2Score] = useState(0);
  const [step3Score, setStep3Score] = useState(0);

  const navigate = useNavigate();
  const { playAudio, isPlaying } = useGlobalAudioPlayer();

  const clockRadius = 100;
  const centerX = 150;
  const centerY = 150;

  const shapeRef = useRef(null);
  const shapeHiddenRef = useRef(null);
  const hiddenStage2Ref = useRef(null);
  const hiddenStage3Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);

  const rotateHour = () => {
    setCurrentHour((prevHour) => (prevHour % 12) + 1);
  };

  const rotateMinute = () => {
    const newMinute = (currentMinute + 5) % 60;
    setCurrentMinute(newMinute);

    // เพิ่ม fractional hour อย่างต่อเนื่อง
    const addedFraction = newMinute === 0 ? 0 : 1 / 12; // 5 นาที = 1/12 ชม.
    setCurrentHour(prev => (prev + addedFraction) % 12);
  };

  const handleShapeAnswer = (answer) => {
    const isCorrect = selectedShape === answer;
    setStep1Score(isCorrect ? 1 : 0);
    setShapeAnswer(answer);
    // const newTime = generateRandomTime();
    // console.log('🕒 Step 2 Target Time:', newTime); // ✅ log ตรงนี้
    // setTargetTime(newTime);
    setStep(2);
  };

  const handleTextInputSubmit = () => {
    const hour = parseInt(inputHour);
    const minute = parseInt(inputMinute);
    let score = 0;
    if (hour === targetTime.hour) score += 0.5;
    if (minute === targetTime.minute) score += 0.5;
    setStep2Score(score);
    setStep(3);
  };

  const isClockTimeCorrect = (currentHour, currentMinute, targetHour, targetMinute) => {
    const normalize = (hour, minute) => {
      let hourFraction = 0;
      if (minute < 15) hourFraction = 0.25;
      else if (minute < 30) hourFraction = 0.5;
      else if (minute < 45) hourFraction = 0.75;
      else hourFraction = 1.0;
      return (hour % 12) + hourFraction;
    };

    const currentH = normalize(currentHour, currentMinute);
    const targetH = normalize(targetHour, targetMinute);

    const hourMatch = Math.abs(currentH - targetH) < 0.1; // ≤ 6 องศา
    const minuteMatch = currentMinute === targetMinute;

    return hourMatch && minuteMatch;
  };

  const handleNext = async () => {
    const normalizeHour = (h) => (Math.round(h) % 12 === 0 ? 12 : Math.round(h) % 12);
    const finalHour = normalizeHour(currentHour);
    const correctHour = normalizeHour(targetTime.hour);
  
    // ✅ คำนวณคะแนนแยกทีละข้อ
    const step1Score = shapeAnswer === selectedShape ? 1 : 0;
    const step2HourScore = parseInt(inputHour) === targetTime.hour ? 0.5 : 0;
    const step2MinuteScore = parseInt(inputMinute) === targetTime.minute ? 0.5 : 0;
    const step3Score = finalHour === correctHour && currentMinute === targetTime.minute ? 1 : 0;
    const totalScore = step1Score + step2HourScore + step2MinuteScore + step3Score;
  
    // // 🧪 Debug: log ค่าที่ใช้เปรียบเทียบ
    // console.log("🕒 ตรวจสอบเวลาที่หมุน:");
    // console.log("⇒ ผู้ใช้:", finalHour, currentMinute);
    // console.log("⇒ เป้าหมาย:", correctHour, targetTime.minute);
  
    // // 🧪 Debug: log คะแนนรวม
    // console.log("📘 Clock Test คะแนนแบบละเอียด:");
    // console.log("1️⃣ รูปร่าง:", step1Score);
    // console.log("2️⃣ เวลาที่พิมพ์:", step2HourScore + step2MinuteScore, `(ชั่วโมง: ${step2HourScore}, นาที: ${step2MinuteScore})`);
    // console.log("3️⃣ การหมุนเข็ม:", step3Score);
    // console.log("🎯 รวมทั้งหมด:", totalScore);
  
    try {
      const shapeCanvas = await html2canvas(shapeHiddenRef.current);
      const shapeImage = shapeCanvas.toDataURL('image/png');
  
      const step2Image = hiddenStage2Ref.current.toDataURL({ mimeType: 'image/png' });
      const step3Image = hiddenStage3Ref.current.toDataURL({ mimeType: 'image/png' });
  
      localStorage.setItem('clockResult', JSON.stringify({
        shape: true,
        number: true,
        hand: false
      }));      
      localStorage.setItem('clockRotationScore', totalScore);
      localStorage.setItem('clock_rotation_test', JSON.stringify({
        shapeAnswer,
        step2Answer: { hour: inputHour, minute: inputMinute },
        step3Answer: { hour: finalHour, minute: currentMinute },
        targetTime,
        totalScore,
        timestamp: new Date().toISOString(),
        shapeImage,
        step2Image,
        step3Image
      }));
  
      navigate('/assessment/naming');
    } catch (error) {
      console.error('เกิดข้อผิดพลาดระหว่างบันทึกรูปภาพ:', error);
    }
  };  

  useEffect(() => {
    const shapes = ['circle', 'square'];
    const randShape = shapes[Math.floor(Math.random() * shapes.length)];
    setSelectedShape(randShape);
  }, []);

  const shapeToUse = shapeAnswer || selectedShape;
  const hourAngle = (currentHour % 12) * 30 - 90;
  const minuteAngle = currentMinute * 6 - 90;
  const baseHour = targetTime.hour % 12; // เช่น 6
  let hourFraction = 0;

  // ขยับตามช่วงนาที
  if (targetTime.minute < 15) hourFraction = 1 / 4;
  else if (targetTime.minute < 30) hourFraction = 2 / 4;
  else if (targetTime.minute < 45) hourFraction = 3 / 4;
  else hourFraction = 4 / 4;

  const targetHourAngle = ((baseHour + hourFraction) % 12) * 30 - 90;

  const targetMinuteAngle = targetTime.minute * 6 - 90;

  return (
    <motion.div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-pale to-light space-y-6 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}>

      <div className="max-w-xl w-full bg-white shadow-lg rounded-xl p-6 space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center flex items-center justify-center gap-2">
          การทดสอบหมุนเข็มนาฬิกา
        </h2>

        {step === 1 && (
          <div className="text-center space-y-4">
            <p className="text-xl text-center font-medium">รูปร่างนี้คืออะไร?
              <button
                onClick={() => playAudio(`${import.meta.env.BASE_URL}audio/clock/clock_step1.mp3`)}
                disabled={isPlaying}
                className={`ml-3 p-3 rounded-full transition shadow ${isPlaying ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
                title="ฟังคำสั่ง Step 1"
              >
                <Volume2 className="w-7 h-7 text-gray-700" />
              </button>
            </p>
            {/* ✅ ต้องมี div ที่แน่ใจว่าเป็น HTMLElement จริง และแสดงอยู่ตอน step 3 ด้วย */}
            <div
              ref={shapeRef}
              style={{ width: '192px', height: '192px' }} // ป้องกัน html2canvas จับ div ว่างเปล่า
              className="shape-preview mx-auto"
            >
              {selectedShape === 'circle' ? (
                <div className="w-full h-full rounded-full bg-blue-300" />
              ) : (
                <div className="w-full h-full bg-blue-300" />
              )}
            </div>
            <div className="flex justify-center gap-4">
              <button onClick={() => handleShapeAnswer('circle')} className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold text-lg shadow hover:bg-blue-600">วงกลม</button>
              <button onClick={() => handleShapeAnswer('square')} className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold shadow hover:bg-blue-600">สี่เหลี่ยม</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 text-center">
            <p className="text-xl text-center font-medium">
              โปรดพิมพ์เวลาที่คุณเห็น ในรูปแบบ 12 ชั่วโมง
              <button
                onClick={() => playAudio(`${import.meta.env.BASE_URL}audio/clock/clock_step2.mp3`)}
                disabled={isPlaying}
                className={`ml-3 p-3 rounded-full transition shadow ${isPlaying ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
                title="ฟังคำสั่ง Step 2"
              >
                <Volume2 className="w-7 h-7 text-gray-700" />
              </button>
            </p>
            <span class="text-md text-center">หมายเหตุ: เข็มนาทีให้เติมลงท้ายแค่เลข 5 กับเลข 0 เช่น 30 45 20 เป็นต้น</span>
            <div className="flex justify-center step2-clock">
              <Stage width={280} height={280} ref={step2Ref}>
                <Layer>
                  {shapeToUse === 'circle' ? (
                    <>
                      <Circle x={140} y={140} radius={100} fill="#bfdbfe" />
                      {[...Array(12)].map((_, i) => {
                        const angle = (i + 1) * 30 - 90;
                        const x = 140 + Math.cos((angle * Math.PI) / 180) * 80;
                        const y = 140 + Math.sin((angle * Math.PI) / 180) * 80;
                        return (
                          <Text key={i} x={x - 6} y={y - 10} text={String(i + 1)} fontSize={16} fill="black" />
                        );
                      })}
                    </>
                  ) : (
                    <>
                      <Rect x={40} y={40} width={200} height={200} fill="#bfdbfe" />
                      {[...Array(12)].map((_, i) => {
                        const angle = (i + 1) * 30 - 90;
                        const x = 140 + Math.cos((angle * Math.PI) / 180) * 80;
                        const y = 140 + Math.sin((angle * Math.PI) / 180) * 80;
                        return (
                          <Text key={i} x={x - 6} y={y - 10} text={String(i + 1)} fontSize={16} fill="black" />
                        );
                      })}
                    </>
                  )}
                  <Line points={[140, 140, 140 + Math.cos((targetHourAngle * Math.PI) / 180) * 50, 140 + Math.sin((targetHourAngle * Math.PI) / 180) * 50]} stroke="black" strokeWidth={5} lineCap="round" />
                  <Line points={[140, 140, 140 + Math.cos((targetMinuteAngle * Math.PI) / 180) * 70, 140 + Math.sin((targetMinuteAngle * Math.PI) / 180) * 70]} stroke="black" strokeWidth={3} lineCap="round" />
                  <Circle x={140} y={140} radius={4} fill="black" />
                </Layer>
              </Stage>
            </div>
            <div className="flex justify-center gap-2">
              <input
                type="number"
                min="0" // ✅ ไม่ให้ติดลบ
                placeholder="ชั่วโมง"
                value={inputHour}
                onChange={e => setInputHour(e.target.value)}
                className="border p-3 rounded w-24 text-center text-lg"
              />
              <span className="text-xl font-bold">:</span>
              <input
                type="number"
                min="0" // ✅ ไม่ให้ติดลบ
                placeholder="นาที"
                value={inputMinute}
                onChange={e => setInputMinute(e.target.value)}
                className="border p-3 rounded w-24 text-center text-lg"
              />
            </div>

            <button onClick={handleTextInputSubmit} className="mt-3 px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 text-lg">ถัดไป</button>
          </div>
        )}

        {step === 3 && (
          <>
            <p className="text-xl text-center font-medium">
              ปรับนาฬิกาให้ตรงกับเวลา
              <button
                onClick={() => playAudio(`${import.meta.env.BASE_URL}audio/clock/clock_step3.mp3`)}
                disabled={isPlaying}
                className={`ml-3 p-3 rounded-full transition shadow ${isPlaying ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
                title="ฟังคำสั่ง Step 3"
              >
                <Volume2 className="w-7 h-7 text-gray-700" />
              </button>
              <br /><span className="font-bold text-3xl text-blue-700">{targetTime.hour}:{targetTime.minute.toString().padStart(2, '0')}</span>
            </p>

            <div className="flex justify-center step3-clock">
              <Stage width={320} height={320} ref={step3Ref}>
                <Layer>
                  {shapeToUse === 'circle' ? (
                    <Circle x={centerX} y={centerY} radius={clockRadius} stroke="black" strokeWidth={3} />
                  ) : (
                    <Rect x={centerX - clockRadius} y={centerY - clockRadius} width={clockRadius * 2} height={clockRadius * 2} stroke="black" strokeWidth={3} />
                  )}

                  {[...Array(12)].map((_, i) => {
                    const angle = (i + 1) * 30 - 90;
                    const x = centerX + Math.cos((angle * Math.PI) / 180) * (clockRadius - 20);
                    const y = centerY + Math.sin((angle * Math.PI) / 180) * (clockRadius - 20);
                    return (
                      <Text key={i} x={x - 10} y={y - 10} text={i + 1} fontSize={18} fontStyle="bold" fill="black" />
                    );
                  })}

                  <Line points={[centerX, centerY, centerX + Math.cos((hourAngle * Math.PI) / 180) * (clockRadius * 0.5), centerY + Math.sin((hourAngle * Math.PI) / 180) * (clockRadius * 0.5)]} stroke="black" strokeWidth={6} lineCap="round" />
                  <Line points={[centerX, centerY, centerX + Math.cos((minuteAngle * Math.PI) / 180) * (clockRadius * 0.7), centerY + Math.sin((minuteAngle * Math.PI) / 180) * (clockRadius * 0.7)]} stroke="black" strokeWidth={4} lineCap="round" />
                  <Circle x={centerX} y={centerY} radius={7} fill="black" />
                </Layer>
              </Stage>
            </div>

            <div className="flex justify-center gap-4 mt-4">
              <button onClick={rotateHour} className="px-6 py-3 bg-blue-500 text-white text-lg rounded-lg shadow hover:bg-blue-600">หมุนเข็มชั่วโมง</button>
              <button onClick={rotateMinute} className="px-6 py-3 bg-purple-500 text-white text-lg rounded-lg shadow hover:bg-purple-600">หมุนเข็มนาที</button>
            </div>

            <div className="flex justify-center mt-6">
              <button onClick={handleNext} className="px-6 py-3 bg-green-600 text-white text-lg rounded-lg shadow hover:bg-green-700">ข้อถัดไป</button>
            </div>
          </>
        )}
      </div>
      {/* ติดไว้ที่ด้านล่างสุดของ return (ไม่ต้อง render ต่อผู้ใช้) */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        {/* Shape hidden preview */}
        <div ref={shapeHiddenRef} style={{ width: 192, height: 192 }}>
          {selectedShape === 'circle' ? (
            <div className="w-full h-full rounded-full bg-blue-300" />
          ) : (
            <div className="w-full h-full bg-blue-300" />
          )}
        </div>

        {/* Step 2 - target clock preview */}
        <Stage width={280} height={280} ref={hiddenStage2Ref}>
          <Layer>
            {shapeToUse === 'circle' ? (
              <Circle x={140} y={140} radius={100} fill="#bfdbfe" />
            ) : (
              <Rect x={40} y={40} width={200} height={200} fill="#bfdbfe" />
            )}
            {/* ⏰ ตัวเลข */}
            {[...Array(12)].map((_, i) => {
              const angle = (i + 1) * 30 - 90;
              const x = 140 + Math.cos((angle * Math.PI) / 180) * 80;
              const y = 140 + Math.sin((angle * Math.PI) / 180) * 80;
              return <Text key={i} x={x - 6} y={y - 10} text={String(i + 1)} fontSize={16} fill="black" />;
            })}
            {/* ⏰ เข็ม */}
            <Line points={[140, 140, 140 + Math.cos((targetHourAngle * Math.PI) / 180) * 50, 140 + Math.sin((targetHourAngle * Math.PI) / 180) * 50]} stroke="black" strokeWidth={5} />
            <Line points={[140, 140, 140 + Math.cos((targetMinuteAngle * Math.PI) / 180) * 70, 140 + Math.sin((targetMinuteAngle * Math.PI) / 180) * 70]} stroke="black" strokeWidth={3} />
            <Circle x={140} y={140} radius={4} fill="black" />
          </Layer>
        </Stage>

        {/* Step 3 - user adjusted clock preview */}
        <Stage width={320} height={320} ref={hiddenStage3Ref}>
          <Layer>
            {shapeToUse === 'circle' ? (
              <Circle x={centerX} y={centerY} radius={clockRadius} stroke="black" strokeWidth={3} />
            ) : (
              <Rect x={centerX - clockRadius} y={centerY - clockRadius} width={clockRadius * 2} height={clockRadius * 2} stroke="black" strokeWidth={3} />
            )}
            {[...Array(12)].map((_, i) => {
              const angle = (i + 1) * 30 - 90;
              const x = centerX + Math.cos((angle * Math.PI) / 180) * (clockRadius - 20);
              const y = centerY + Math.sin((angle * Math.PI) / 180) * (clockRadius - 20);
              return <Text key={i} x={x - 10} y={y - 10} text={i + 1} fontSize={18} fill="black" />;
            })}
            <Line points={[centerX, centerY, centerX + Math.cos((hourAngle * Math.PI) / 180) * (clockRadius * 0.5), centerY + Math.sin((hourAngle * Math.PI) / 180) * (clockRadius * 0.5)]} stroke="black" strokeWidth={6} />
            <Line points={[centerX, centerY, centerX + Math.cos((minuteAngle * Math.PI) / 180) * (clockRadius * 0.7), centerY + Math.sin((minuteAngle * Math.PI) / 180) * (clockRadius * 0.7)]} stroke="black" strokeWidth={4} />
            <Circle x={centerX} y={centerY} radius={7} fill="black" />
          </Layer>
        </Stage>
      </div>
    </motion.div>
  );
}
