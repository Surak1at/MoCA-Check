/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#22988F',    // เขียวเข้ม
        secondary: '#135B78',  // ฟ้าเข้ม
        light: '#DAEEC7',      // เขียวอ่อน
        soft: '#C6E2E2',       // ฟ้าอ่อน
        pale: '#E4EBEE',       // เทาอ่อน
      },
      fontFamily: {
        sans: ['Noto Sans Thai Looped', 'sans-serif'], // กำหนดฟอนต์หลัก
      },
    },
  },
  plugins: [],
};
