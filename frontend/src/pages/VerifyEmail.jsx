import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from '../utils/SwalTheme';

export default function VerifyEmail() {
  const { uid, token } = useParams();
  const [status, setStatus] = useState('กำลังตรวจสอบ...');
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(`${API_BASE}verify-email/${uid}/${token}/`);
        setStatus(res.data.message || 'ยืนยันอีเมลสำเร็จแล้ว');
        Swal.fire('สำเร็จ', 'บัญชีของคุณได้รับการยืนยันแล้ว', 'success');
        setTimeout(() => navigate('/login'), 2500);
      } catch (err) {
        setStatus(err.response?.data?.error || 'ลิงก์ไม่ถูกต้องหรือหมดอายุ');
        Swal.fire('ล้มเหลว', status, 'error');
      }
    };
    verify();
  }, [uid, token, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pale px-4 text-center">
      <h1 className="text-2xl font-bold text-primary mb-4">การยืนยันอีเมล</h1>
      <p className="text-lg text-gray-700">{status}</p>
    </div>
  );
}
