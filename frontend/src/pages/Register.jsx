import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from '../utils/SwalTheme';
import axios from 'axios';
import provinces from '../data/provinces.json';
import amphures from '../data/amphure.json';
import tambons from '../data/tambon.json';
import educationList from '../data/educations.json';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import th from 'date-fns/locale/th';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [subdistrictId, setSubdistrictId] = useState('');
  const [education, setEducation] = useState('');;
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [dateOpen, setDateOpen] = useState(false);
  const inputRef = useRef();
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const filteredAmphures = amphures.filter((a) => a.province_id === parseInt(provinceId));
  const filteredTambons = tambons.filter((t) => t.amphure_id === parseInt(districtId));

  const selectedProvince = provinces.find(p => p.id === parseInt(provinceId))?.name_th || '';
  const selectedDistrict = amphures.find(a => a.id === parseInt(districtId))?.name_th || '';
  const selectedSubdistrict = tambons.find(t => t.id === parseInt(subdistrictId))?.name_th || '';

  const handleDateChange = (date) => {
    const year = date.getFullYear();
    const realYear = year > 2500 ? year - 543 : year; // ✅ แปลงหากปีเป็น พ.ศ.
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    setBirthDate(`${realYear}-${month}-${day}`); // ส่งแบบ ISO ให้ backend
    setDateOpen(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword || !education || !gender || !birthDate || !provinceId || !districtId || !subdistrictId) {
      Swal.fire('กรอกข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลให้ครบทุกช่อง', 'warning');
      return;
    }

    if (password.length < 3) {
      Swal.fire('รหัสผ่านสั้นเกินไป', 'กรุณาตั้งรหัสผ่านอย่างน้อย 3 ตัวอักษร', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire('รหัสผ่านไม่ตรงกัน', 'กรุณาตรวจสอบรหัสผ่านทั้งสองช่อง', 'error');
      return;
    }

    // เงื่อนไขที่ยอมรับ
    // ✅ อนุญาตเฉพาะโดเมนที่ลงท้ายด้วย .com, .ac.th, .co.th, .org
    const allowedTlds = ['.com', '.ac.th', '.co.th', '.org'];
    const emailDomain = email.split('@')[1]; // ตัวอย่าง: "email.kmutnb.ac.th"
    const isAllowed = allowedTlds.some(tld => emailDomain.endsWith(tld));

    if (!isAllowed) {
      Swal.fire(
        'ไม่รองรับอีเมลนี้',
        'ระบบรองรับเฉพาะอีเมลจาก Google, Microsoft หรือหน่วยงาน เช่น .com, .ac.th, .co.th, .org',
        'error'
      );
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}register/`, {
        full_name: name,
        email,
        password,
        confirm_password: confirmPassword,
        education,
        gender,
        birth_date: birthDate,
        province: selectedProvince,
        district: selectedDistrict,
        subdistrict: selectedSubdistrict,
      });

      const msg = res.data.message || 'สมัครสมาชิกสำเร็จ';

      Swal.fire({
        icon: 'success',
        title: 'สมัครสมาชิกสำเร็จ!',
        html: `${msg}`,
        confirmButtonText: 'ตกลง'
      }).then(() => navigate('/login'));

    } catch (err) {
      let errMsg =
        err.response?.data?.email?.[0] ||
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.message ||
        'เกิดข้อผิดพลาดในการสมัครสมาชิก';

      Swal.fire('ไม่สำเร็จ', errMsg, 'error');
    }
  };

  return (
    <motion.div
      className="min-h-[85vh] px-4 md:px-20 py-12 bg-gradient-to-br from-pale to-light flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full space-y-6">
        <h2 className="text-3xl font-bold text-center text-secondary">สมัครสมาชิก</h2>

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
          {/* ชื่อ-นามสกุล */}
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium text-gray-700">ชื่อ-นามสกุล</label>
            <input type="text" className="w-full p-3 border rounded-lg" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          {/* อีเมล */}
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium text-gray-700">อีเมล</label>
            <input type="email" className="w-full p-3 border rounded-lg" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          {/* รหัสผ่าน */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">รหัสผ่าน</label>
            <input type="password" className="w-full p-3 border rounded-lg" placeholder="อย่างน้อย 3 ตัว" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {/* ยืนยันรหัสผ่าน */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">ยืนยันรหัสผ่าน</label>
            <input type="password" className="w-full p-3 border rounded-lg" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>

          {/* ระดับการศึกษา */}
          <select
            className="w-full p-3 border rounded-lg"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            required
          >
            <option value="">-- เลือกระดับการศึกษา --</option>
            {educationList.map((edu) => (
              <option key={edu.id} value={edu.name}>{edu.name}</option>
            ))}
          </select>

          {/* เพศ */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">เพศ</label>
            <select className="w-full p-3 border rounded-lg" value={gender} onChange={(e) => setGender(e.target.value)} required>
              <option value="">-- เลือกเพศ --</option>
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
              <option value="อื่น ๆ">อื่น ๆ</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block mb-1 font-semibold text-primary">วัน เดือน ปีเกิด</label>
            <div className="relative">
              <input
                type="text"
                ref={inputRef}
                readOnly
                onClick={() => setDateOpen(true)}
                value={
                  birthDate
                    ? (() => {
                      const [year, month, day] = birthDate.split('-');
                      const buddhistYear = parseInt(year) + 543;
                      return `${day}/${month}/${buddhistYear}`;
                    })()
                    : ''
                }
                placeholder="เลือกวันเกิด (พ.ศ.)"
                className="w-full p-3 pr-10 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              />
              {dateOpen && (
                <div className="absolute z-10 mt-2">
                  <DatePicker
                    selected={
                      birthDate
                        ? (() => {
                          const [year, month, day] = birthDate.split('-').map(Number);
                          return new Date(year - 543, month - 1, day); // ✅ ใช้ ค.ศ.
                        })()
                        : null
                    }
                    onChange={handleDateChange}
                    onClickOutside={() => setDateOpen(false)}
                    open={dateOpen}
                    inline
                    locale={th}
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

          {/* จังหวัด */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">จังหวัดที่อยู่ปัจจุบัน</label>
            <select className="w-full p-3 border rounded-lg" value={provinceId} onChange={(e) => {
              setProvinceId(e.target.value);
              setDistrictId('');
              setSubdistrictId('');
            }} required>
              <option value="">-- เลือกจังหวัด --</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>{p.name_th}</option>
              ))}
            </select>
          </div>

          {/* อำเภอ */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">อำเภอ</label>
            <select className="w-full p-3 border rounded-lg" value={districtId} onChange={(e) => {
              setDistrictId(e.target.value);
              setSubdistrictId('');
            }} required disabled={!provinceId}>
              <option value="">-- เลือกอำเภอ --</option>
              {filteredAmphures.map((a) => (
                <option key={a.id} value={a.id}>{a.name_th}</option>
              ))}
            </select>
          </div>

          {/* ตำบล */}
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium text-gray-700">ตำบล</label>
            <select className="w-full p-3 border rounded-lg" value={subdistrictId} onChange={(e) => setSubdistrictId(e.target.value)} required disabled={!districtId}>
              <option value="">-- เลือกตำบล --</option>
              {filteredTambons.map((t) => (
                <option key={t.id} value={t.id}>{t.name_th}</option>
              ))}
            </select>
          </div>

          {/* ปุ่มสมัคร */}
          <div className="md:col-span-2">
            <button type="submit" className="bg-primary text-white w-full py-3 rounded-lg hover:bg-secondary transition">
              สมัครสมาชิก
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default Register;
