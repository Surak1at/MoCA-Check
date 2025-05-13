// ✅ hooks/useMemorySubmitConfirm.jsx
import Swal from '../utils/SwalTheme';
import { useNavigate } from 'react-router-dom';

const useMemorySubmitConfirm = () => {
  const navigate = useNavigate();

  const handleConfirmSubmit = (selectedOrder, selectedSet) => {
    Swal.fire({
      icon: 'info',
      title: '<strong>โปรดจำคำศัพท์นี้ไว้</strong>',
      html: `
        <div style="text-align: center; font-size: 1rem; line-height: 1.8;">
          <span style="color: #0f766e; font-weight: 600;">เพื่อใช้ในการทบทวนในหมวด Delay recall</span> 
        </div>
      `,
      confirmButtonText: 'ตกลง',
      customClass: {
        popup: 'rounded-xl shadow-lg p-6', // ขอบโค้งและเงา
        title: 'text-xl font-bold text-gray-800',
        confirmButton: 'bg-green-600 hover:bg-green-700 text-white px-8 py-2 text-lg rounded-lg',
      },      
      width: '400px',
      padding: '1.5rem',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.setItem('memoryTestResult', JSON.stringify({
          answer: selectedOrder,
          correct: selectedSet,
        }));
        navigate('/assessment/number-sequence');
      }
    });
  };

  return handleConfirmSubmit;
};

export default useMemorySubmitConfirm;
