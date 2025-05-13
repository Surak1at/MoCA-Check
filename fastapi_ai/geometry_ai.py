import base64
import io
import numpy as np
from PIL import Image
import onnxruntime as ort

# 🔹 หมวดหมู่ที่ model รองรับ
categories = ['cylindrical', 'squarepyramid', 'triangularpyramid', 'cone', 'cube']

# 🔹 โหลดโมเดล ONNX เพียงครั้งเดียว
session = ort.InferenceSession("model/geometric_shapes_model.onnx")
input_name = session.get_inputs()[0].name

def center_and_resize(image, target_size=(128, 128), margin=20):
    arr = np.array(image).astype(np.float32) / 255.0
    coords = np.argwhere(arr < 0.95)

    if coords.size == 0:
        return image.resize(target_size)

    y0, x0 = coords.min(axis=0)
    y1, x1 = coords.max(axis=0) + 1
    cropped = image.crop((x0, y0, x1, y1))

    w, h = cropped.size
    new_w = w + margin * 2
    new_h = h + margin * 2
    new_image = Image.new("L", (new_w, new_h), 255)
    new_image.paste(cropped, (margin, margin))

    return new_image.resize(target_size, Image.Resampling.LANCZOS)

def random_shift_image(image, max_shift=5):
    w, h = image.size
    dx = np.random.randint(-max_shift, max_shift + 1)
    dy = np.random.randint(-max_shift, max_shift + 1)
    shifted = Image.new("L", (w, h), 255)
    shifted.paste(image, (dx, dy))
    return shifted

def decode_and_predict(base64_image):
    try:
        if "," in base64_image:
            base64_image = base64_image.split(",")[1]

        image_data = base64.b64decode(base64_image)
        image = Image.open(io.BytesIO(image_data)).convert("L")

        image = center_and_resize(image)
        image = random_shift_image(image, max_shift=3)
        image_array = np.array(image).astype(np.float32) / 255.0

        if np.isnan(image_array).any() or np.isinf(image_array).any():
            print("⚠️ Invalid input array: NaN/Inf detected")
            return "invalid_input", 0.0, image

        image_array = image_array.reshape(1, 128, 128, 1)
        result = session.run(None, {input_name: image_array})
        prediction = np.array(result[0])[0]

        if np.isnan(prediction).any() or np.isinf(prediction).any():
            print("⚠️ Model returned NaN/Inf")
            return "invalid_output", 0.0, image

        predicted_index = int(np.argmax(prediction))
        confidence = float(np.max(prediction))

        return categories[predicted_index], confidence, image

    except Exception as e:
        print(f"🔥 ERROR in decode_and_predict: {e}")
        return "error", 0.0, Image.new("L", (128, 128), 255)
