import { useState } from 'react';
import Swal from '../utils/SwalTheme';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}forgot-password/`, { email });
      Swal.fire({
        icon: 'success',
        title: 'ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว',
        text: 'โปรดตรวจสอบกล่องจดหมายของคุณ หากอีเมลนี้มีในระบบ เราจะส่งลิงก์ไปให้ทันที',
        confirmButtonText: 'กลับไปยังหน้าล็อกอิน'
      }).then(() => {
        navigate('/login');
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: err.response?.data?.error || 'ไม่สามารถดำเนินการได้',
        confirmButtonText: 'ลองใหม่อีกครั้ง'
      });
    }
  };  

  return (
    <div className="min-h-screen flex items-center justify-center bg-pale px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">ลืมรหัสผ่าน</h2>
        <input
          type="email"
          placeholder="กรอกอีเมล"
          className="w-full p-3 border rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="bg-primary text-white w-full py-3 rounded hover:bg-secondary">
          ส่งลิงก์รีเซ็ตรหัสผ่าน
        </button>
      </form>
    </div>
  );
}
