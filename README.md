# MoCA Check

การพัฒนาเว็บแอปพลิเคชันคัดกรองและประเมินความเสี่ยงโรคสมองเสื่อมด้วยแบบประเมิน MoCA Check
สามารถทดสอบใช้งานได้ที่
http://moca.202.44.47.45.nip.io/

โปรเจกต์นี้ประกอบด้วย 3 ส่วนหลัก: Django Backend, FastAPI AI Service และ Frontend
## 🗂️ โครงสร้างโฟลเดอร์
for_deploy/
├── backend/ # Django backend (API และจัดการฐานข้อมูล)
│ ├── core/
│ ├── media/
│ ├── moca_backend/
│ └── manage.py
│
├── fastapi_ai/ # FastAPI สำหรับวิเคราะห์ภาพด้วย AI (เช่น ทดสอบวาดรูป)
│ ├── app.py
│ ├── geometry_ai.py
│ ├── model/ # โมเดล AI (.onnx หรืออื่น ๆ)
│ └── requirements.txt
│
├── frontend/ # ระบบหน้าบ้าน (React, Vite หรือ static HTML)
│ 
│
├── README.md
└── .gitignore

## 📌 การใช้งานเบื้องต้น

1. ติดตั้ง Python 3.10+
2. สร้างและ activate virtualenv
3. ติดตั้ง dependencies จาก `requirements.txt`
4. รัน backend: `python manage.py runserver`
5. รัน FastAPI: `uvicorn app:app --host 0.0.0.0 --port 8002`
6. รัน frontend: `npm run dev`
