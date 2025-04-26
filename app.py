
from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
from config import GEMINI_API_KEY

app = Flask(__name__)

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

# system_instruction = """
# You are an AI assistant that determines home loan eligibility. Ask relevant questions about income, age, employment, existing loans, and credit score. 
# Do not answer questions unrelated to home loans. If asked anything else, say:
# 'Sorry, I only handle home loan eligibility questions. Please ask something related to loans.'
# Stay in this mode until the session ends.
# """
system_instruction = """
You are an AI assistant that helps users check their **Home Loan Eligibility**.
Your job is to:
1. Answer ONLY questions related to home loans and eligibility (salary, age, documents, EMI, CIBIL, co-applicants, etc).
2. Politely decline to answer anything outside this scope.
3. You are allowed to respond to basic greetings like "hi", "hello", or questions like "introduce yourself" with a short introduction:
4. No matter what, you are not allowed to give your response with any kind of formattings like bold, italics, or lists.
5. Donot tell to consult a financial advisor or bank. You are the only one who can help them with their queries.
6. If you think the user given data is positive for home loan eligibility, then you can say "You are eligible for a home loan" or "You are not eligible for a home loan" based on the data provided by the user.
7. If the user asks for a home loan eligibility calculator, you can say "I can help you with that. Please provide your monthly income, age, and existing loans."
8. You can say "You are eligible for a home loan" if the user meets the following criteria:
- Age: 21-60 years
- Monthly Income: Minimum of 25,000
- Employment: Stable job for at least 6 months
- Existing Loans: No more than 2 active loans
- CIBIL Score: Minimum of 650
- loan amount: 10-50 lakhs
9. If the user is not eligible, you can say "You are not eligible for a home loan" if they do not meet any of the above criteria.

For example:
- If someone says "introduce yourself", reply with:
  "Hi! I'm your AI assistant here to help you understand home loan eligibility. Feel free to ask about documents, salary criteria, interest rates, and more!"

Ignore or decline all other non-home-loan topics like movies, jokes, history, etc.

Stay in this mode until the session ends.
"""


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json['message']
    try:
        chat = model.start_chat(history=[
            {"role": "user", "parts": [system_instruction]},
            {"role": "model", "parts": ["Got it! I'm here to assist with your home loan eligibility questions."]}
        ])
        response = chat.send_message(user_input)
        return jsonify({"response": response.text})
    except Exception as e:
        if "429" in str(e):
            return jsonify({"error": "I'm currently busy due to high traffic. Please try again later!"})
        else:
            return jsonify({"error": "Oops! Something went wrong. Please try again."})

from PIL import Image
import io

@app.route('/upload-image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file received'}), 400

    image = request.files['image']

    try:
        # Open as PIL Image
        img = Image.open(image.stream)
        img = img.convert("RGB")  # Optional: ensure standard format

        # Gemini Vision expects a PIL.Image.Image object
        vision_model = genai.GenerativeModel('gemini-1.5-pro')
        response = vision_model.generate_content([
            system_instruction,
            img,
            "Based on this document, analyze whether this user qualifies for a home loan. Explain clearly."
        ])

        return jsonify({'response': response.text})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error processing image: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
