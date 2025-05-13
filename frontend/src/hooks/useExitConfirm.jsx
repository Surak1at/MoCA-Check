import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from '../utils/SwalTheme';

const useExitConfirm = () => {
    const navigate = useNavigate(); // 

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };

        const handlePopState = () => {
            Swal.fire({
                icon: 'warning',
                title: 'ออกจากการประเมิน?',
                text: 'หากออก ข้อมูลจะไม่ถูกบันทึก',
                showCancelButton: true,
                confirmButtonText: 'ใช่, ออก',
                cancelButtonText: 'ยกเลิก',
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/');
                } else {
                    window.history.pushState(null, '', window.location.href);
                }
            });
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);
};

export default useExitConfirm;
