from flask import Flask, render_template, request
from chatbot import get_gemini_response

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def home():
    user_input = None
    bot_response = None

    if request.method == 'POST':
        user_input = request.form['message']
        bot_response = get_gemini_response(user_input)

    return render_template('index.html', user_input=user_input, bot_response=bot_response)

if __name__ == '__main__':
    app.run(debug=True)
