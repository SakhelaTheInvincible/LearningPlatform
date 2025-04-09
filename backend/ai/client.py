import os
from openai import OpenAI
from django.conf import settings
from dotenv import load_dotenv

load_dotenv()

def get_ai_client():
    return OpenAI(
        api_key=os.getenv("DEEPSEEK_API_KEY"),
        base_url="https://api.deepseek.com"
    )