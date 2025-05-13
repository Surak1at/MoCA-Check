import Swal from '../utils/SwalTheme';
import { useNavigate } from 'react-router-dom';

const useAssessmentExitConfirm = () => {
  const navigate = useNavigate();

  const handleNavigateWithConfirm = (target) => {
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
  };

  return handleNavigateWithConfirm;
};

export default useAssessmentExitConfirm;
