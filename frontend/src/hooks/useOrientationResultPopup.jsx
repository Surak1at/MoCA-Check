import Swal from '../utils/SwalTheme';

export default function useOrientationResultPopup() {
  return (callback) => {
    Swal.fire({
      icon: 'success',
      title: '🎉 ส่งแบบฟอร์มสำเร็จ',
      text: 'ระบบจะพาคุณไปหน้าผลการประเมิน',
      confirmButtonText: 'ตกลง',
      timer: 60000,
      timerProgressBar: true,
      showConfirmButton: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(callback);
  };
}
