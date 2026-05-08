from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import json
import re 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_URL ="https://hackathon-1pvb.onrender.com/api/ai-model/v2/chat"
API_KEY = "sk_3dd9fc477ad99a1b04228f1ee4bd753f11182d6b"
@app.get("/")
async def root():
        return{"Message":"Backend online"}

@app.post("/generate")
def generate(data: dict):
    topic = data.get("topic", "unknown")

    prompt = f"""
    Generate flashcards about "{topic}" in English.

    Return ONLY valid JSON using this structure:
    {{
        "flashcards": [
            {{
                "question": "Question here",
                "answer": "Answer here"
            }}
        ]
    }}

    Do not include reasoning, markdown, or extra text.
    """

    response = requests.post(
        API_URL,
        json={"context": prompt},
        headers={
            "content-type": "application/json",
            "X-API-Key": API_KEY
        }
    )

    raw = response.json()

    # Extract the text returned by the API
    content = raw.get("prompt", "")

    # Remove <reasoning>...</reasoning>
    content = re.sub(
        r"<reasoning>.*?</reasoning>",
        "",
        content,
        flags=re.DOTALL
    ).strip()

    # Convert cleaned JSON string into Python dict
    cleaned_json = json.loads(content)

    return cleaned_json