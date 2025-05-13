import React, { useEffect, useState } from "react";
import axios from 'axios'; // อย่าลืม import axios

// Helper function to safely parse localStorage data
const getLocalStorage = (key, defaultValue) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Reusable sub-components
function Section({ title, score, children }) {
  return (
    <div className="flex border-b border-back">
      <div className="bg-[#2f2a2b] text-white p-1 w-1/4 font-bold text-md">{title}</div>
      <div className="flex p-1 w-3/4 space-x-2">{children}</div>
      <div className="w-12 flex flex-col justify-center items-center border-l border-black">
        <span className="font-bold text-md">{score?.total ?? 0}</span>
        <small className="text-md">/{score?.full}</small>
      </div>
    </div>
  );
}

function Item({ label, image, isCorrect }) {
  return (
    <div className="flex flex-col items-center">
      {label && <p className="text-[14px] mb-0.5">{label}</p>}
      <img
        src={image || `${import.meta.env.BASE_URL}images/placeholder.png`}
        alt={label || "Test image"}
        className="w-16 h-16 object-contain border border-back"
      />
      {typeof isCorrect === "boolean" && (
        <p className="text-[14px] mt-0.5"></p>
      )}
    </div>
  );
}

function DetailMemory({ words, repeat1, repeat2, score }) {
  return (
    <div className="flex border-b border-black">
      <div className="bg-[#2f2a2b] text-white p-1 w-1/4 font-bold text-md">MEMORY</div>
      <div className="p-1 w-3/4">
        <table className="table-auto w-full border text-sm border-black">
          <thead>
            <tr>
              <th className="border border-black px-1 text-[10px] whitespace-nowrap text-center">รอบ</th>
              {words.map((word, index) => (
                <th
                  key={index}
                  className="border border-black px-1 text-[10px] whitespace-nowrap text-center"
                >
                  {word}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black px-1 text-[10px] text-center">ทวนครั้งที่ 1</td>
              {words.map((word, index) => (
                <td key={index} className="border border-black px-1 text-[10px] text-center">
                </td>
              ))}
            </tr>
            <tr>
              <td className="border border-black px-1 text-[10px] text-center">ทวนครั้งที่ 2</td>
              {words.map((word, index) => (
                <td key={index} className="border border-black px-1 text-[10px] text-center">
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="w-12 flex flex-col justify-center items-center border-l border-black">
        {/* <span className="font-bold text-xs">{score?.total ?? 0}</span>
        <small className="text-xs">/{score?.full}</small> */}
      </div>
    </div>
  );
}

export default function PDFReport() {
  const [userData, setUserData] = useState({});
  const [testDate, setTestDate] = useState("");
  const [eduBonus, setEduBonus] = useState(0);

  // Visuospatial
  const [dot, setDot] = useState(0);
  const [geoScore, setGeoScore] = useState(0);
  const [clock, setClock] = useState(0);
  const [dotImage, setDotImage] = useState("");
  const [geoImage, setGeoImage] = useState("");
  const [shapeName, setShapeName] = useState("unknown");
  const [clockImage1, setClockImage1] = useState("");
  const [clockImage2, setClockImage2] = useState("");
  const [clockImage3, setClockImage3] = useState("");
  const [clockParts, setClockParts] = useState({ shape: false, number: false, hand: false });
  const [targetTime, setTargetTime] = useState({ hour: 11, minute: 10 });

  // Naming
  const [namingImages, setNamingImages] = useState([]);
  const [namingScore, setNamingScore] = useState(0);

  // Memory
  const [memorySet, setMemorySet] = useState([]);
  const [memoryRepeat1, setMemoryRepeat1] = useState([]);
  const [memoryRepeat2, setMemoryRepeat2] = useState([]);

  // Attention
  const [sequence, setSequence] = useState(0);
  const [backward, setBackward] = useState(0);
  const [exclusion, setExclusion] = useState(0);
  const [subtract, setSubtract] = useState(0);
  const [numberSequenceSet, setNumberSequenceSet] = useState([]);
  const [backwardNumberSet, setBackwardNumberSet] = useState([]);

  // Language
  const [sentenceRepeat, setSentenceRepeat] = useState({ repeatSentences: [], correctFlags: [] });
  const [typing, setTyping] = useState(0);
  const [sentenceScore, setSentenceScore] = useState(0);
  const [typingScore, setTypingScore] = useState(0);

  // Abstraction
  const [abstraction, setAbstraction] = useState({ questions: [], flags: [] });

  // Delayed recall
  const [delayedScore, setDelayedScore] = useState(0);
  const [delayedMis, setDelayedMis] = useState(0);
  const [delayedDetails, setDelayedDetails] = useState({ categoryCue: [], multipleChoice: [] });

  // Orientation
  const [orientation, setOrientation] = useState({ score: 0, flags: {} });

  // Aggregated scores
  const [scoreDetails, setScoreDetails] = useState({});
  const [totalScore, setTotalScore] = useState(null);
  const [totalFull, setTotalFull] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Load user data
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      // ✅ ถ้ามี token แสดงว่าเป็นผู้ใช้ที่ล็อกอิน
      axios.get(`${API_BASE}user/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          const data = res.data;
          setUserData({
            name: data.full_name,
            birthDate: data.birth_date,
            gender: data.gender,
            education: data.education
          });

          // คำนวณโบนัสตามระดับการศึกษา
          const bonus = data.education.includes("ประถม") || data.education.includes("ต่ำกว่า") ? 1 : 0;
          setEduBonus(bonus);
        })
        .catch(err => {
          console.warn("⚠️ ดึงข้อมูลผู้ใช้จาก backend ไม่สำเร็จ:", err);
          fallbackToLocalStorage(); // ถ้า fail fallback ไปใช้ localStorage
        });
    } else {
      fallbackToLocalStorage();
    }

    setTestDate(new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }));

  }, []);

  const fallbackToLocalStorage = () => {
    const user = getLocalStorage("assessmentUserData", {});
    setUserData(user);
    const bonus = user.education?.includes("ประถม") || user.education?.includes("ต่ำกว่า") ? 1 : 0;
    setEduBonus(bonus);
  };

  // Load visuospatial data
  useEffect(() => {
    try {
      // Dot connect
      const rDot = +localStorage.getItem("dotConnectScore") || 0;
      setDot(rDot);
      setDotImage(localStorage.getItem("dotConnectDrawing") || "");

      // Geometry copy
      const rGeo = +localStorage.getItem("geometryScore") || 0;
      setGeoScore(rGeo);
      const geoRaw = getLocalStorage("geometryCopy", {});
      setGeoImage(geoRaw.imageData || "");
      setShapeName(geoRaw.shapeName || "unknown");

      // Clock drawing
      const rClock = +localStorage.getItem("clockRotationScore") || 0;
      setClock(rClock);
      const clockRaw = getLocalStorage("clock_rotation_test", {});
      setClockImage1(clockRaw.shapeImage || "");
      setClockImage2(clockRaw.step2Image || "");
      setClockImage3(clockRaw.step3Image || "");
      setTargetTime(clockRaw.targetTime || { hour: 11, minute: 10 });
      setClockParts(getLocalStorage("clockResult", { shape: false, number: false, hand: false }));
    } catch (error) {
      console.error("Error loading visuospatial data:", error);
    }
  }, []);

  // Other useEffects remain the same
  useEffect(() => {
    try {
      // Naming
      const nameRaw = JSON.parse(localStorage.getItem("namingTestResult") || "{}");
      const score = +localStorage.getItem("namingScore") || 0;
      setNamingScore(score);
      setNamingImages((nameRaw.details || []).slice(0, 3));


      // Memory
      const memSet = getLocalStorage("memorySelectedSet", []);
      const mem1 = getLocalStorage("memoryRepeat1", []);
      const mem2 = getLocalStorage("memoryRepeat2", []);
      setMemorySet(memSet);
      setMemoryRepeat1(mem1);
      setMemoryRepeat2(mem2);

      // Attention
      const rSeq = +localStorage.getItem("numberSequenceScore") || 0;
      const rBack = +localStorage.getItem("backwardNumberScore") || 0;
      setSequence(rSeq);
      setBackward(rBack);
      setExclusion(+localStorage.getItem("numberExclusionScore") || 0);
      setSubtract(+localStorage.getItem("numberSubtractionScore") || 0);
      setNumberSequenceSet(getLocalStorage("numberSequenceSet", []));
      setBackwardNumberSet(getLocalStorage("backwardNumberSet", []));

      // Language
      const sentRaw = getLocalStorage("sentenceOrderingResult", { repeatSentences: [], correctFlags: [], correct: 0 });
      setSentenceRepeat(sentRaw);
      const wordTypingRaw = getLocalStorage("wordTypingTestResult", { correctCount: 0 });
      setTyping(wordTypingRaw.correctCount);
      const sentenceScoreRaw = +localStorage.getItem("sentenceOrderingScore") || 0;
      setSentenceScore(sentenceScoreRaw);
      const typingScoreRaw = +localStorage.getItem("wordTypingScore") || 0;
      setTypingScore(typingScoreRaw);

      // Abstraction
      const absRaw = getLocalStorage("abstractionTestResult", { questions: [], flags: [], score: 0 });
      setAbstraction(absRaw);

      // Delayed recall
      setDelayedScore(+localStorage.getItem("delayedRecallScore") || 0);
      setDelayedMis(+localStorage.getItem("delayedRecallMIS") || 0);
      const delRaw = getLocalStorage("delayedRecallDetails", { categoryCue: [], multipleChoice: [] });
      setDelayedDetails(delRaw);

      // Orientation
      const oriRaw = getLocalStorage("orientationTestResult", { score: 0, flags: {} });
      setOrientation(oriRaw);
    } catch (error) {
      console.error("Error loading test data:", error);
    }
  }, []);

  // Calculate scores
  useEffect(() => {
    try {
      const memCorrect = memorySet.filter(w => memoryRepeat2.includes(w)).length;

      const obj = {
        visuospatial: { total: dot + geoScore + clock, full: 5 },
        naming: { total: namingScore, full: 3 },
        //memory: { total: memCorrect, full: 0 },  // 👈 ไม่รวมใน full
        attention: { total: sequence + backward + exclusion + subtract, full: 6 },
        delayed: { total: delayedScore, full: 5 },
        language: { total: sentenceScore + typingScore, full: 3 },
        abstraction: { total: abstraction.score || 0, full: 2 },
        orientation: { total: orientation.score || 0, full: 6 }
      };

      const sumT = Object.values(obj).reduce((a, s) => a + s.total, 0);
      const sumF = Object.values(obj).reduce((a, s) => a + s.full, 0);

      setScoreDetails(obj);
      setTotalScore(sumT + eduBonus);
      setTotalFull(sumF);

      // 🔍 Debug log
      console.log("🔍 คะแนนรายหมวด:", obj);
      console.log("✅ รวมคะแนน:", sumT, "+ bonus =", sumT + eduBonus);
      console.log("🎯 คะแนนเต็มรวม:", sumF);

    } catch (error) {
      console.error("❌ Error calculating scores:", error);
    }
  }, [
    dot, geoScore, clock, namingImages, memorySet, memoryRepeat2,
    sequence, backward, exclusion, subtract, delayedScore,
    sentenceRepeat, typing, abstraction, orientation, eduBonus
  ]);

  return (
    <div className="flex flex-col justify-center mx-auto p-1 bg-white text-[18px]" style={{ width: "100%" }}>
      {/* Header */}
      <div className="flex justify-center items-center mb-1">
        <p className="text-sm font-bold">
          แบบทดสอบ Montreal Cognitive Assessment (MOCA)
        </p>
      </div>

      <div className="mb-2 grid grid-cols-3 text-[14px]">
        <p><strong>ชื่อ:</strong> {userData.name || "-"}</p>
        <p><strong>วันที่ทดสอบ:</strong> {testDate}</p>
        <p><strong>เพศ:</strong> {userData.gender || "-"}</p>
        <p><strong>ระดับการศึกษา:</strong> {userData.education || "-"}</p>
        <p><strong>วันเดือนปีเกิด:</strong>
          {userData.birthDate
            ? (() => {
              const raw = new Date(userData.birthDate);
              const birthYear = raw.getFullYear();
              const adjusted = birthYear > 2500 ? new Date(birthYear - 543, raw.getMonth(), raw.getDate()) : raw;
              return adjusted.toLocaleDateString("th-TH", { year: 'numeric', month: 'long', day: 'numeric' });
            })()
            : "-"}
        </p>

        <p><strong>อายุ:</strong>
          {userData.birthDate
            ? (() => {
              const raw = new Date(userData.birthDate);
              const birthYear = raw.getFullYear();
              const birthDate = birthYear > 2500 ? new Date(birthYear - 543, raw.getMonth(), raw.getDate()) : raw;
              const today = new Date();
              let age = today.getFullYear() - birthDate.getFullYear();
              const m = today.getMonth() - birthDate.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
              return age;
            })()
            : "-"} ปี
        </p>

      </div>

      {/* Sections */}
      <div className="border-2 border-back flex flex-col rounded-xl">
        {/* VISUOSPATIAL / EXECUTIVE */}
        <Section title="VISUOSPATIAL / EXECUTIVE" score={scoreDetails.visuospatial}>
          <Item label="ลากเส้นประจุด" image={dotImage} isCorrect={dot === 1} />
          <Item
            label="ภาพโจทย์เรขาคณิต"
            image={`${import.meta.env.BASE_URL}images/shape/${shapeName}.png`}
          />
          <Item label="ภาพที่ผู้ใช้วาด" image={geoImage} isCorrect={geoScore === 1} />
        </Section>

        {/* Clock Drawing */}
        <div className="flex border-b border-back">
          <div className="bg-[#2f2a2b] text-white p-1 w-1/4 font-bold text-md">
            วาดหน้าปัดนาฬิกา
          </div>
          <div className="p-1 w-3/4">
            <p className="font-bold mb-1 text-[14px]">
              วาดหน้าปัดนาฬิกาที่ {targetTime.hour}:{targetTime.minute.toString().padStart(2, '0')} น. (3 คะแนน)
            </p>
            <div className="flex justify-center gap-2">
              <Item label="รูปร่าง" image={clockImage1} isCorrect={clockParts.shape} />
              <Item label="ตัวเลข" image={clockImage2} isCorrect={clockParts.number} />
              <Item label="เข็ม" image={clockImage3} isCorrect={clockParts.hand} />
            </div>
          </div>
          <div className="w-12 flex flex-col justify-center items-center border-l border-black">
            {/* <span className="font-bold text-xs">{clock}</span>
            <small className="text-xs">/3</small> */}
          </div>
        </div>

        {/* NAMING */}
        <Section title="NAMING" score={scoreDetails.naming}>
          {namingImages.length > 0 ? (
            namingImages.map((item, idx) => (
              <Item key={idx} image={item.image} isCorrect={item.isCorrect} />
            ))
          ) : (
            <p className="text-md">ไม่พบภาพ</p>
          )}
        </Section>

        {/* MEMORY */}
        <DetailMemory
          words={memorySet}
          repeat1={memoryRepeat1}
          repeat2={memoryRepeat2}
        // score={scoreDetails.memory}
        />

        {/* ATTENTION */}
        <Section title="ATTENTION" score={scoreDetails.attention}>
          <div className="flex flex-col gap-0.5 w-full text-[14px]">
            <p>ลำดับตัวเลข, ย้อนกลับ, กดเลข 1, ลบเลข</p>
          </div>
        </Section>

        {/* LANGUAGE */}
        <Section title="LANGUAGE" score={{ total: sentenceScore + typingScore, full: 3 }}>
          <div className="flex flex-col gap-0.5 w-full text-[14px]">
            <p>ทวนประโยค, เลือกคำศัพท์</p>
          </div>
        </Section>

        {/* ABSTRACTION */}
        <Section title="ABSTRACTION" score={scoreDetails.abstraction}>
          <div className="w-full text-[14px]">
            {abstraction.questions?.map((pair, idx) => (
              <p key={idx}>
                [{abstraction.flags[idx] ? "✓" : "✗"}] {pair[0]} - {pair[1]}
              </p>
            ))}
          </div>
        </Section>

        {/* DELAYED RECALL */}
        <Section title="DELAYED RECALL" score={scoreDetails.delayed}>
          <table className="table-auto w-full text-[10px] border border-black">
            <thead>
              <tr>
                <th className="border border-black px-1 py-1 text-center whitespace-nowrap">Cue Type</th>
                {memorySet.map((word, idx) => (
                  <th
                    key={idx}
                    className="border border-black px-1 py-1 text-center whitespace-nowrap"
                  >
                    {word}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black px-1 py-1 text-center whitespace-nowrap">
                  Category Cue
                </td>
                {memorySet.map((word, idx) => (
                  <td
                    key={idx}
                    className="border border-black px-1 py-1 text-center whitespace-nowrap"
                  >
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-black px-1 py-1 text-center whitespace-nowrap">
                  Multiple Choice
                </td>
                {memorySet.map((word, idx) => (
                  <td
                    key={idx}
                    className="border border-black px-1 py-1 text-center whitespace-nowrap"
                  >
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </Section>

        {/* ORIENTATION */}
        <Section title="ORIENTATION" score={scoreDetails.orientation}>
          <div className="flex flex-wrap gap-1 w-full text-[14px]">
            <p>วันที่</p>
            <p>เดือน</p>
            <p>ปี</p>
            <p>วัน</p>
            <p>สถานที่</p>
            <p>จังหวัด</p>
          </div>
        </Section>
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-2 text-[9px]">
        <div className="px-2">
          Translated by Solaphat Hemrungrojn MD<br />
          Trial version 01 Updated August 31, 2011<br />
          @Z Nasredine MD<br />
          <b>www.mocatest.org</b>
        </div>
        <div className="px-2">ค่าปกติ {">="} 25 / 30</div>
        <div className="border-2 border-back border-t-0 p-1 px-2 rounded-b-2xl w-[30%]">
          <div className="flex justify-between font-bold text-[14px]">
            {totalScore !== null && totalFull !== null && (
              <div>
                <p>คะแนนรวม</p>
                <p>{totalScore} / {totalFull}</p>
              </div>
            )}
          </div>
          <p className="text-[9px]">เพิ่ม 1 คะแนน ถ้าจำนวนปีการศึกษา {"<= 6"}{eduBonus ? " ✓" : ""}</p>
        </div>
      </div>
    </div>
  );
}
