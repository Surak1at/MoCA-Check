import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Swal from '../../utils/SwalTheme';
import { toast } from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  // ✅ ตรวจสอบ token
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);

    if (token) {
      try {
        const decoded = jwtDecode(token);
        //console.log('🧾 JWT Payload:', decoded);
        setUserName(decoded.full_name || ''); // 👈 ดึงจาก payload ที่คุณเก็บ
      } catch {
        setUserName('');
      }
    }
  }, [location]);


  const isAssessmentCriticalPage = (
    location.pathname.startsWith('/assessment/register') &&
    location.pathname !== '/assessment/result' &&
    location.pathname !== '/assessment/register'
  );

  const handleNavigateWithConfirm = (target) => {
    if (isAssessmentCriticalPage) {
      Swal.fire({
        title: 'ออกจากการประเมิน?',
        text: 'หากออก ข้อมูลจะไม่ถูกบันทึก',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ใช่, ออก',
        cancelButtonText: 'ยกเลิก',
      }).then((result) => {
        if (result.isConfirmed) navigate(target);
      });
    } else {
      navigate(target);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'ยืนยันการออกจากระบบ',
      text: 'คุณต้องการออกจากระบบหรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ออกจากระบบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#e53935',
      cancelButtonColor: '#9e9e9e'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        Swal.fire('ออกจากระบบแล้ว', '', 'success');
        navigate('/login');
      }
    });
  };


  return (
    <motion.nav
      className="bg-white text-gray-800 shadow-lg p-4 px-6 flex justify-between items-center relative z-30 border-b-4 border-primary/40"
      initial={{ y: -70 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="text-2xl font-bold text-primary cursor-pointer flex items-center gap-2"
        onClick={() => handleNavigateWithConfirm('/')}
      >
        <span>MoCA Check</span>
      </div>

      <div className="md:hidden">
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex space-x-6 items-center text-lg">
        <button onClick={() => handleNavigateWithConfirm('/')} className="hover:text-primary transition">หน้าหลัก</button>
        <button onClick={() => handleNavigateWithConfirm('/about')} className="hover:text-primary transition">เกี่ยวกับเรา</button>

        {isLoggedIn && (
          <>
            <button
              onClick={() => handleNavigateWithConfirm('/edit-profile')}
              className="text-primary font-semibold hover:underline"
            >
              👋 สวัสดี, {userName}
            </button>
            <button onClick={() => { handleNavigateWithConfirm('/my-results'); setIsOpen(false); }} className="">
              ผลของฉัน
            </button>
          </>
        )}
        {isLoggedIn ? (
          
          <button
            onClick={handleLogout}
            className="text-red-600 hover:underline transition"
          >
            ออกจากระบบ
          </button>
        ) : (
          <button onClick={() => handleNavigateWithConfirm('/login')} className="hover:text-primary transition">
            เข้าสู่ระบบ
          </button>
        )}

      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute top-16 right-4 bg-white text-gray-800 shadow-xl rounded-xl py-4 px-6 w-56 space-y-4 md:hidden border border-gray-200"
        >
          <button onClick={() => { handleNavigateWithConfirm('/'); setIsOpen(false); }} className="block w-full text-left hover:text-primary">หน้าหลัก</button>
          <button onClick={() => { handleNavigateWithConfirm('/about'); setIsOpen(false); }} className="block w-full text-left hover:text-primary">เกี่ยวกับเรา</button>

          {isLoggedIn && (
            <button onClick={() => { handleNavigateWithConfirm('/my-results'); setIsOpen(false); }} className="block w-full text-left hover:text-primary">
              ผลของฉัน
            </button>
          )}

          {isLoggedIn ? (
            <>
              <button
                onClick={() => {
                  handleNavigateWithConfirm('/edit-profile');
                  setIsOpen(false);
                }}
                className="block w-full text-left text-primary font-semibold hover:underline"
              >
                👋 สวัสดี, {userName}
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="block w-full text-left text-red-600 hover:underline transition"
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <button onClick={() => { handleNavigateWithConfirm('/login'); setIsOpen(false); }} className="block w-full text-left hover:text-primary">
              เข้าสู่ระบบ
            </button>
          )}

        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
