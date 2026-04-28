

# from fastapi import FastAPI, File, UploadFile
# from fastapi.middleware.cors import CORSMiddleware
# from dotenv import load_dotenv
# from ai_engine import analyze_pet, analyze_pet_video
# import uvicorn

# load_dotenv()

from fastapi import FastAPI, File, UploadFile, Form
from typing import List, Optional
import json
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from ai_engine import analyze_pet, analyze_pet_video,analyze_pet_text
import uvicorn
from fastapi.staticfiles import StaticFiles


load_dotenv()

app = FastAPI()

import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,
)
@app.get("/")
def root():
    return {"status": "PawCare API running!"}

@app.post("/analyze-text")
async def analyze_text(request: dict):
    from ai_engine import analyze_pet_text
    description = request.get("description", "")
    return analyze_pet_text(description)

@app.post("/analyze")
async def analyze(
    file: UploadFile = File(None), 
    description: str = Form(None)
):
    if not file and not description:
        return {"error": "No input provided"}
    
    # If there is a file, analyze it
    if file:
        contents = await file.read()
        mime_type = file.content_type
        if mime_type.startswith("video/"):
            result = analyze_pet_video(contents)
        else:
            result = analyze_pet(contents, mime_type)
        return result
    
    # If only text is provided
    return analyze_pet_text(description)

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
