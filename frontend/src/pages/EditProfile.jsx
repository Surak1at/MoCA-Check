import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from '../utils/SwalTheme';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import educationList from '../data/educations.json';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import th from 'date-fns/locale/th';
import { format } from 'date-fns';
import provinces from '../data/provinces.json';
import amphures from '../data/amphure.json';
import tambons from '../data/tambon.json';

export default function EditProfile() {
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken');

    const [formData, setFormData] = useState({
        full_name: '',
        gender: '',
        education: '',
        address: '',
        new_password: ''
    });

    const [province, setProvince] = useState('');
    const [district, setDistrict] = useState('');
    const [subdistrict, setSubdistrict] = useState('');

    const [birthDate, setBirthDate] = useState('');
    const [dateOpen, setDateOpen] = useState(false);
    const inputRef = useRef(null);
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    // ดึงข้อมูลจาก token
    useEffect(() => {
        if (token) {
            const decoded = jwtDecode(token);
            setFormData(prev => ({
                ...prev,
                full_name: decoded.full_name || '',
                gender: decoded.gender || '',
                education: decoded.education || '',
                address: decoded.address || ''
            }));
            setBirthDate(decoded.birth_date || '');
            setProvince(decoded.province || '');
            setDistrict(decoded.district || '');
            setSubdistrict(decoded.subdistrict || '');
        }
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date) => {
        const year = date.getFullYear();
        const realYear = year > 2500 ? year - 543 : year; // ✅ แก้ตรงนี้
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        setBirthDate(`${realYear}-${month}-${day}`);
        setDateOpen(false);
    };    

    const formatThaiDate = (isoDateStr) => {
        if (!isoDateStr) return '';
        const date = new Date(isoDateStr);
        if (isNaN(date.getTime())) return ''; // ป้องกัน date ผิด
        const day = date.getDate();
        const month = date.toLocaleString("th-TH", { month: "short" });
        const year = date.getFullYear() < 2500 ? date.getFullYear() + 543 : date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await Swal.fire({
            title: 'ยืนยันการแก้ไขข้อมูล?',
            text: 'คุณต้องการบันทึกข้อมูลที่แก้ไขหรือไม่',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก'
        });

        if (!result.isConfirmed) return;

        try {
            await axios.patch(`${API_BASE}update-profile/`, {
                ...formData,
                birth_date: birthDate,
                province,
                district,
                subdistrict
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Swal.fire('สำเร็จ', 'อัปเดตข้อมูลเรียบร้อยแล้ว', 'success');
            navigate('/');
        } catch (err) {
            Swal.fire('ผิดพลาด', 'ไม่สามารถอัปเดตข้อมูลได้', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-pale flex justify-center items-center px-4 py-12">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-xl space-y-4">
                <h2 className="text-2xl font-bold text-center text-primary">แก้ไขข้อมูลส่วนตัว</h2>

                {/* ชื่อ */}
                <input
                    type="text"
                    name="full_name"
                    placeholder="ชื่อ-นามสกุล"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg"
                    required
                />

                {/* เพศ */}
                <div className="flex items-center gap-4">
                    <label><input type="radio" name="gender" value="ชาย" checked={formData.gender === 'ชาย'} onChange={handleChange} /> ชาย</label>
                    <label><input type="radio" name="gender" value="หญิง" checked={formData.gender === 'หญิง'} onChange={handleChange} /> หญิง</label>
                    <label><input type="radio" name="gender" value="อื่นๆ" checked={formData.gender === 'อื่นๆ'} onChange={handleChange} /> อื่นๆ</label>
                </div>

                {/* การศึกษา */}
                <select
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg"
                >
                    <option value="">-- ระดับการศึกษา --</option>
                    {educationList.map((edu) => (
                        <option key={edu.id} value={edu.name}>{edu.name}</option>
                    ))}
                </select>

                {/* วันเกิด */}
                <div className="md:col-span-2">
                    <label className="block mb-1 font-semibold text-primary">วัน เดือน ปีเกิด</label>
                    <div className="relative">
                        <input
                            type="text"
                            ref={inputRef}
                            readOnly
                            onClick={() => setDateOpen(true)}
                            value={formatThaiDate(birthDate)}
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
                                                return new Date(year, month - 1, day);
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
                                                    return <option key={year} value={year}>{year + 543}</option>; // แสดง พ.ศ.
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
                <select
                    className="w-full p-3 border rounded-lg"
                    value={province}
                    onChange={(e) => {
                        setProvince(e.target.value);
                        setDistrict('');
                        setSubdistrict('');
                    }}
                >
                    <option value="">-- เลือกจังหวัด --</option>
                    {provinces.map((p) => (
                        <option key={p.id} value={p.name_th}>{p.name_th}</option>
                    ))}
                </select>

                {/* อำเภอ */}
                <select
                    className="w-full p-3 border rounded-lg"
                    value={district}
                    onChange={(e) => {
                        setDistrict(e.target.value);
                        setSubdistrict('');
                    }}
                    disabled={!province}
                >
                    <option value="">-- เลือกอำเภอ --</option>
                    {amphures
                        .filter((a) => a.province_id === provinces.find(p => p.name_th === province)?.id)
                        .map((a) => (
                            <option key={a.id} value={a.name_th}>{a.name_th}</option>
                        ))}
                </select>

                {/* ตำบล */}
                <select
                    className="w-full p-3 border rounded-lg"
                    value={subdistrict}
                    onChange={(e) => setSubdistrict(e.target.value)}
                    disabled={!district}
                >
                    <option value="">-- เลือกตำบล --</option>
                    {tambons
                        .filter((t) => t.amphure_id === amphures.find(a => a.name_th === district)?.id)
                        .map((t) => (
                            <option key={t.id} value={t.name_th}>{t.name_th}</option>
                        ))}
                </select>

                {/* รหัสผ่านใหม่ */}
                <input
                    type="password"
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleChange}
                    placeholder="รหัสผ่านใหม่ (ถ้าต้องการเปลี่ยน)"
                    className="w-full p-3 border rounded-lg"
                />

                <button type="submit" className="bg-primary text-white w-full py-3 rounded-lg hover:bg-secondary">
                    บันทึกการเปลี่ยนแปลง
                </button>
            </form>
        </div>
    );
}
