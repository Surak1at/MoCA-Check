// src/pages/Logout.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 🔐 ลบ token ทั้งหมด
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    toast.success('ออกจากระบบเรียบร้อยแล้ว');
    navigate('/login');
  }, [navigate]);

  return null; // ไม่ต้องแสดงอะไรบนหน้าจอ
};

export default Logout;
