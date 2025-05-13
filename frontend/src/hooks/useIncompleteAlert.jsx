import Swal from '../utils/SwalTheme';

const useIncompleteAlert = () => {
  const showAlert = () => {
    Swal.fire({
      icon: 'warning',
      title: 'กรุณาเชื่อมเส้นให้ครบ',
      text: 'เชื่อมเส้นให้ครบทุกลำดับก่อนจึงจะไปต่อได้',
      confirmButtonText: 'ตกลง',
    });
  };

  return showAlert;
};

export default useIncompleteAlert;
