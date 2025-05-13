import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import Swal from '../utils/SwalTheme';

export default function ResetPassword() {
  const { uid, token } = useParams();
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const handleReset = async (e) => {
    e.preventDefault();
  
    if (!password || password.length < 3) {
      Swal.fire('รหัสผ่านไม่ปลอดภัย', 'กรุณาตั้งรหัสผ่านอย่างน้อย 3 ตัวอักษร', 'warning');
      return;
    }
  
    try {
      await axios.post(`${API_BASE}reset-password/${uid}/${token}/`, {
        password
      });
      Swal.fire('สำเร็จ', 'รีเซ็ตรหัสผ่านเรียบร้อยแล้ว', 'success').then(() => {
        navigate('/login');
      });
    } catch (err) {
      Swal.fire('ล้มเหลว', err.response?.data?.error || 'ไม่สามารถเปลี่ยนรหัสผ่านได้', 'error');
    }
  };  

  return (
    <div className="min-h-screen flex items-center justify-center bg-pale px-4">
      <form onSubmit={handleReset} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">ตั้งรหัสผ่านใหม่</h2>
        <input
          type="password"
          placeholder="รหัสผ่านใหม่ (อย่างน้อย 3 ตัว)"
          className="w-full p-3 border rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="bg-primary text-white w-full py-3 rounded hover:bg-secondary">
          รีเซ็ตรหัสผ่าน
        </button>
      </form>
    </div>
  );
}
