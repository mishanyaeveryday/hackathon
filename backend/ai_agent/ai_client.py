# ai_client.py
import json
import re

from langchain_google_genai import ChatGoogleGenerativeAI
from server.settings import GENAI_API_KEY, GENAI_MODEL


class PracticeGenerator:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model=GENAI_MODEL,
            temperature=0.7,
            api_key=GENAI_API_KEY,
        )
    
    def _get_json_group(self, raw_json: str):
        text = raw_json.strip()

        first_point = re.search(
            r"^```(?:json)?", text, flags=re.MULTILINE)
        second_point = re.search(r"```$", text, flags=re.MULTILINE)

        if first_point and second_point and first_point.end() < second_point.start():
            json_text = text[first_point.end():second_point.start()]
        else:
            json_text = text 

        json_text = re.sub(r"<.*?>", "", json_text)
        json_text = json_text.strip()
        return json_text if json_text else False

    def generate_practices(self, user_message: str):
        prompt = f"""
        The user wants to build a habit: "{user_message}".
        Generate a list of helpful habits in JSON format.
        Example:
        [
          {{
            "title": "Wake up early",
            "description": "Wake up at 7:00 without using your phone.",
            "default_duration_sec": 120
          }},
          {{
            "title": "Morning reading",
            "description": "Read at least 30 minutes after breakfast.",
            "default_duration_sec": 60
          }}
        ]

        Return only valid JSON — no extra text.
        """

        response = self.llm.invoke(prompt)
        text = response.content.strip()
        json_text = self._get_json_group(text)
        print("LLM output:", json_text) 

        try:
            return json.loads(json_text)
        except json.JSONDecodeError:
            return []
