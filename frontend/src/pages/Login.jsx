import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from '../utils/SwalTheme'; // Assuming you have a custom Swal wrapper
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setUser } = useUser();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      Swal.fire('กรุณากรอกข้อมูลให้ครบ', '', 'warning');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}token/`, {
        email,
        password,
      });

      const { access, refresh } = res.data;
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      const decoded = jwtDecode(access);
      console.log("📦 decoded user:", decoded); // ✅ ควรแสดง

      try {
        setUser(decoded); // อาจพังที่นี่
      } catch (innerErr) {
        console.error("❌ setUser พัง:", innerErr);
        Swal.fire('เกิดข้อผิดพลาดภายใน', innerErr.message, 'error');
      }

      const redirectTo = localStorage.getItem('redirectTo') || '/my-results';
      localStorage.removeItem('redirectTo');

      Swal.fire({
        icon: 'success',
        title: 'เข้าสู่ระบบสำเร็จ!',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        navigate(redirectTo);
      });

    } catch (err) {
      const status = err.response?.status;
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||  // ✅ ดัก error ของเรา
        'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    
      if (detail.includes('ยืนยันอีเมล')) {
        Swal.fire({
          icon: 'warning',
          title: 'บัญชียังไม่ยืนยันอีเมล',
          html: 'กรุณาตรวจสอบกล่องจดหมายของคุณเพื่อยืนยันอีเมลก่อนเข้าสู่ระบบ<br><span style="font-size: 0.85em; color: gray">(รวมถึงจดหมายขยะ)</span>',
          confirmButtonText: 'ตกลง'
        });
      } else {
        Swal.fire('เข้าสู่ระบบไม่สำเร็จ', detail, 'error');
      }
    }    
  };


  return (
    <motion.div
      className="min-h-screen px-6 md:px-20 py-12 bg-gradient-to-br from-pale to-light flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white/80 p-8 rounded-2xl shadow-2xl max-w-md w-full space-y-6">
        <h2 className="text-3xl font-bold text-center text-secondary">เข้าสู่ระบบ</h2>
        <form onSubmit={handleLogin} className="space-y-5 text-base">
          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-500" />
            <input
              type="email"
              placeholder="อีเมล"
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-500" />
            <input
              type="password"
              placeholder="รหัสผ่าน"
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* ลืมรหัสผ่าน */}
          <p className="text-right text-sm text-gray-600">
            <Link to="/forgot-password" className="text-primary hover:underline">
              ลืมรหัสผ่าน?
            </Link>
          </p>

          <button
            type="submit"
            className="bg-primary text-white w-full py-3 rounded-lg hover:bg-secondary transition"
          >
            เข้าสู่ระบบ
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            ยังไม่มีบัญชีใช่ไหม?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              สมัครสมาชิก
            </Link>
          </p>
        </form>
      </div>
    </motion.div>
  );
};

export default Login;
