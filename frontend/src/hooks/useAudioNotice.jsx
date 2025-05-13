// ✅ src/hooks/useAudioNotice.js
import Swal from 'sweetalert2';

const useAudioNotice = () => {
  const showAudioNotice = () => {
    Swal.fire({
      title: 'กรุณาเปิดเสียง',
      html: `
        <p>เพื่อให้การทำแบบประเมินสมบูรณ์</p>
        <p><strong>กรุณาเปิดเสียง</strong> และปิดโหมดเงียบ (Silent Mode)</p>
      `,
      icon: 'info',
      confirmButtonText: 'เข้าใจแล้ว',
      confirmButtonColor: '#3085d6',
      allowOutsideClick: false,
      customClass: {
        popup: 'rounded-xl',
      },
    });
  };

  return { showAudioNotice };
};

export default useAudioNotice;
