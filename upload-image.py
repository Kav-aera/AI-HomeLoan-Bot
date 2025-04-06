from flask import request, jsonify
from PIL import Image
import io
import google.generativeai as genai

@app.route('/upload-image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded.'})

    file = request.files['image']

    try:
        # Open image
        img = Image.open(io.BytesIO(file.read())).convert("RGB")

        # Prepare image in the format Gemini needs
        buffered = io.BytesIO()
        img.save(buffered, format="JPEG")
        image_bytes = buffered.getvalue()

        # Use Gemini Vision model
        vision_model = genai.GenerativeModel('gemini-pro-vision')
        response = vision_model.generate_content([
            system_instruction,  # Same instruction used in /chat
            image_bytes,
            "Based on this document, can you check if the person is eligible for a home loan?"
        ])

        return jsonify({'response': response.text})

    except Exception as e:
        return jsonify({'error': f'❌ Error analyzing image: {str(e)}'})
