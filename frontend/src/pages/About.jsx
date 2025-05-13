import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="min-h-[80vh] px-6 md:px-20 py-12 bg-gradient-to-br from-pale to-light flex flex-col items-center justify-center space-y-8">

      {/* หัวข้อหลัก */}
      <motion.h1
        className="text-3xl md:text-5xl font-bold text-secondary text-center"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        เกี่ยวกับเรา
      </motion.h1>

      {/* คำอธิบายโครงการ */}
      <motion.div
        className="text-lg md:text-xl text-primary leading-relaxed max-w-4xl text-justify space-y-4 bg-white/80 p-6 rounded-xl shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <p>
          <b>ภาวะความจำเสื่อมและขี้หลงขี้ลืม</b> มักเกิดขึ้นในผู้สูงอายุ แต่ความจริงแล้วสมองของคนเราไม่จำเป็นต้องเสื่อมตามวัยเสมอไป หากมีการดูแลอย่างถูกต้อง เช่น การทำกิจกรรมที่ช่วยกระตุ้นสมอง พูดคุยกับผู้อื่น หรืออ่านหนังสือเป็นประจำ ก็สามารถช่วยยืดอายุสมองและชะลอความเสื่อมได้
        </p>

        <p>
          <b>ภาวะสมองเสื่อม</b> คือ ภาวะที่สมองถดถอยด้านการจำ การคิด และการประมวลผล โดยอาจเกิดจากหลายสาเหตุ เช่น ขาดการบริหารสมอง เลือดไปเลี้ยงสมองไม่พอ หรืออุบัติเหตุที่ทำให้สมองขาดออกซิเจน ไม่จำกัดเฉพาะผู้สูงอายุเท่านั้น
        </p>

        <p>
          <b>ด้วยเหตุนี้</b> คณะผู้จัดทำโครงการจึงพัฒนาแอปพลิเคชัน MoCA Check เพื่อช่วยประเมินความเสี่ยงภาวะสมองเสื่อม และส่งเสริมให้ทุกคนหันมาใส่ใจดูแลสมองของตนเองตั้งแต่เนิ่น ๆ เพื่อคุณภาพชีวิตที่ดีในระยะยาว
        </p>
      </motion.div>


      {/* ทีมพัฒนาโครงการ */}
      <motion.div
        className="bg-white rounded-xl shadow-lg p-8 max-w-4xl space-y-4"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
      >
        <h2 className="text-2xl font-semibold text-secondary">ทีมพัฒนาโครงการ</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>อาจารย์ที่ปรึกษา: รองศาสตราจารย์ ดร.ยุพิน สรรพคุณ</li>
          <li>อาจารย์ที่ปรึกษาร่วม: นายปราณีต เจริญยิ่ง (ผอ.รพ.สต.เนินหอม)</li>
          <p></p>
            ทีมออกแบบและพัฒนา:
            <span className="ml-4 block">
              <li>นายเศรษฐพงศ์ จังเลิศคณาพงศ์</li>
              <li>นายสุรเกียรติ สุนทราวิรัตน์</li>
              <span className="text-sm text-gray-600 mt-2 block">
                ภาควิชาเทคโนโลยีสารสนเทศ<br />
                คณะเทคโนโลยีและการจัดการอุตสาหกรรม<br />
                มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ วิทยาเขตปราจีนบุรี
              </span>
            </span>
        </ul>
      </motion.div>

    </div>
  );
};

export default About;
