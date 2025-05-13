from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from geometry_ai import decode_and_predict
import base64
from io import BytesIO
import numpy as np
import asyncio

from PIL import Image

app = FastAPI()

# ✅ CORS (ไว้ใช้กับ frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # production แนะนำระบุ domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/geometry-check/")
async def geometry_check(req: Request):
    try:
        data = await req.json()
        image_b64 = data.get("image")
        if not image_b64:
            raise HTTPException(status_code=400, detail="Missing image field")

        # ✅ เรียกผ่าน run_in_executor ป้องกัน block
        loop = asyncio.get_event_loop()
        prediction, confidence, image = await loop.run_in_executor(
            None, decode_and_predict, image_b64
        )
        
        image.save("debug_input.png")  # 🔍 บันทึกรูปไว้สำหรับ debug

        # ✅ ตรวจสอบว่าไม่มีภาพ
        if np.array(image).mean() > 250:
            raise HTTPException(status_code=400, detail="กรุณาวาดภาพก่อนกด Predict")

        # ✅ encode debug image (ไม่ save เป็นไฟล์แล้ว)
        buffer = BytesIO()
        image.save(buffer, format="PNG")
        debug_b64 = base64.b64encode(buffer.getvalue()).decode()

        return {
            "prediction": prediction,
            "confidence": round(confidence, 4),
            "debug_base64": f"data:image/png;base64,{debug_b64}"
        }

    except HTTPException as e:
        raise e  # ส่ง status code ที่ระบุไว้
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
