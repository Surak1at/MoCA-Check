import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from '../../utils/SwalTheme';
import th from 'date-fns/locale/th';
import useAudioNotice from '../../hooks/useAudioNotice';
import educationLevels from '../../data/educations.json';
import provinces from '../../data/provinces.json';

registerLocale('th', th);

const AssessmentRegister = () => {
  const navigate = useNavigate();
  const { showAudioNotice } = useAudioNotice();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    education: '',
    gender: '',
    birthDate: '',
    province: '',
  });

  const [allowAnonymous, setAllowAnonymous] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [dateOpen, setDateOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    // 🔹 ถ้ามี token → ถอด JWT แล้วไปต่อ
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setFormData({
          name: decoded.full_name || '',
          education: decoded.education || '',
          gender: decoded.gender || '',
          birthDate: decoded.birth_date || '',
          province: decoded.province || ''
        });

        // ✅ ไปหน้าทดสอบทันที ถ้ามี token
        navigate('/assessment/dot-connect');
        return; // ⛔ หยุดที่นี่ ไม่ต้องทำ checkIntent ด้านล่าง
      } catch (err) {
        console.error("Token decode error:", err);
      }
    }

    // 🔸 เงื่อนไขเฉพาะสำหรับ /assessment/register
    if (location.pathname !== '/assessment/register') return;

    let isMounted = true;

    const checkIntent = async () => {
      const result = await Swal.fire({
        title: 'ต้องการบันทึกผลหรือไม่?',
        text: 'คุณต้องการบันทึกผลนี้เพื่อดูย้อนหลัง หรือจะทำแบบประเมินเลยโดยไม่บันทึก?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'บันทึกผล (เข้าสู่ระบบ)',
        cancelButtonText: 'ทำแบบประเมินเลย',
        reverseButtons: true,
      });

      if (!isMounted) return;

      if (result.isConfirmed) {
        localStorage.setItem('redirectTo', '/assessment/register');
        navigate('/login');
      } else {
        setAllowAnonymous(true);
      }
      setIsChecking(false);
    };

    checkIntent();

    return () => {
      isMounted = false;
    };
  }, [navigate, location.pathname]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    localStorage.setItem('assessmentUserData', JSON.stringify(formData));
    await showAudioNotice();
    navigate('/assessment/dot-connect');
  };

  const handleDateChange = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const buddhistYear = date.getFullYear() + 543;
    const formatted = `${day}/${month}/${buddhistYear}`;
    setFormData({ ...formData, birthDate: formatted });
    if (inputRef.current) {
      inputRef.current.value = `${day}/${month}/${buddhistYear}`;
    }
    setDateOpen(false);
  };

  return (
    <motion.div
      className="min-h-[90vh] flex items-center justify-center px-4 sm:px-6 md:px-20 py-12 bg-gradient-to-br from-pale to-light overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl w-full max-w-2xl space-y-6">
        <h2 className="text-2xl font-bold text-center text-secondary">ลงทะเบียนก่อนทำแบบประเมิน</h2>

        {isChecking ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">กำลังโหลด...</p>
          </div>
        ) : (
          allowAnonymous && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold text-primary">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  name="name"
                  placeholder="กรอกชื่อ-นามสกุล"
                  className="w-full p-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-primary">ระดับการศึกษา</label>
                <select
                  name="education"
                  className="w-full p-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.education}
                  onChange={handleChange}
                  required
                >
                  <option value="">เลือกระดับการศึกษา</option>
                  {educationLevels.map((level) => (
                    <option key={level.id} value={level.name}>{level.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-primary">เพศ</label>
                <div className="flex flex-wrap gap-4">
                  {['ชาย', 'หญิง', 'ไม่ระบุ'].map((gender) => (
                    <label key={gender} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={formData.gender === gender}
                        onChange={handleChange}
                        required
                      />
                      {gender}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-primary">วัน เดือน ปีเกิด</label>
                <div className="relative">
                  <input
                    type="text"
                    ref={inputRef}
                    readOnly
                    onClick={() => setDateOpen(true)}
                    value={formData.birthDate}
                    placeholder="เลือกวันเกิด (พ.ศ.)"
                    className="w-full p-3 pr-10 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  />
                  {dateOpen && (
                    <div className="absolute z-10 mt-2">
                      <DatePicker
                        selected={formData.birthDate ? (() => {
                          const [day, month, buddhistYear] = formData.birthDate.split('/').map(Number);
                          const gregorianYear = buddhistYear - 543;
                          return new Date(gregorianYear, month - 1, day);
                        })() : null}                        
                        onChange={handleDateChange}
                        onClickOutside={() => setDateOpen(false)}
                        open={dateOpen}
                        inline
                        locale="th"
                        maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 3))}
                        minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 120))}
                        renderCustomHeader={({ date, changeYear, changeMonth }) => (
                          <div className="flex justify-between mb-2 px-2">
                            <select
                              value={date.getFullYear()}
                              onChange={({ target: { value } }) => changeYear(Number(value))}
                              className="mr-2 border p-1 rounded"
                            >
                              {Array.from({ length: 120 }, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return <option key={year} value={year}>{year + 543}</option>;
                              })}
                            </select>
                            <select
                              value={date.getMonth()}
                              onChange={({ target: { value } }) => changeMonth(Number(value))}
                              className="border p-1 rounded"
                            >
                              {Array.from({ length: 12 }, (_, i) =>
                                new Date(2000, i).toLocaleString('th-TH', { month: 'long' })
                              ).map((month, index) => (
                                <option key={index} value={index}>{month}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      />
                    </div>
                  )}
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  กรุณากรอกวันเดือนปีเกิดตามบัตรประชาชน (ต้องมีอายุมากกว่า 3 ปี)
                </p>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-primary">จังหวัดที่อยู่ปัจจุบัน</label>
                <select
                  name="province"
                  className="w-full p-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.province}
                  onChange={handleChange}
                  required
                >
                  <option value="">เลือกจังหวัดที่อยู่ปัจจุบัน</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.name_th}>{province.name_th}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="bg-primary text-white w-full py-3 rounded-lg hover:bg-secondary transition"
              >
                เริ่มทำแบบประเมิน
              </button>
            </form>
          )
        )}
      </div>
    </motion.div>
  );
};

export default AssessmentRegister;
