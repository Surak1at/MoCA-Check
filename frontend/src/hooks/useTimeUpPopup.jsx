import Swal from '../utils/SwalTheme';

const useTimeUpPopup = (callback) => {
  const showPopup = () => {
    Swal.fire({
      icon: 'info',
      title: '⏰ เวลาหมดแล้ว!',
      text: 'ระบบจะพาคุณไปทำแบบทดสอบถัดไป',
      confirmButtonText: 'ตกลง',
      timer: 10000,
      timerProgressBar: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didClose: callback,
    });
  };

  return showPopup;
};

export default useTimeUpPopup;
