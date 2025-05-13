import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const swalWithCustom = Swal.mixin({
  customClass: {
    confirmButton: 'bg-green-500 text-white px-4 py-2 rounded-lg',
    cancelButton: 'bg-red-500 text-white px-4 py-2 rounded-lg',
    popup: 'rounded-lg max-w-[90%] sm:max-w-md p-4', // ✅ แก้ max-width และ padding แล้ว
  },
  buttonsStyling: false,
  backdrop: true, // มีฉากหลังดำ
  allowOutsideClick: true, // กดข้างนอกปิด popup ได้
  // ✅ ไม่ต้องใส่ width: '100%', ให้ max-w จัดการแทน
  grow: false, // ป้องกัน popup ขยายเกิน
});
export default swalWithCustom;

