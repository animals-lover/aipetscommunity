
# import os
# import json
# import base64
# import cv2
# import tempfile
# import numpy as np
# from groq import Groq

# def analyze_pet(image_bytes: bytes, mime_type: str) -> dict:
#     client = Groq(api_key=os.getenv("GROQ_API_KEY"))
#     image_b64 = base64.b64encode(image_bytes).decode("utf-8")

#     response = client.chat.completions.create(
#         model="meta-llama/llama-4-scout-17b-16e-instruct",
#         messages=[{
#             "role": "user",
#             "content": [
#                 {
#                     "type": "image_url",
#                     "image_url": {"url": f"data:{mime_type};base64,{image_b64}"}
#                 },
# #                 {
# #                     "type": "text",
# #                     "text": """You are a veterinary AI assistant. Analyze this pet photo carefully.
# # Respond ONLY in this exact JSON format, nothing else:
# # {
# #   "score": <0-100>,
# #   "animal": "<dog/cat/rabbit/other>",
# #   "observations": [{"label": "...", "type": "ok|warn|danger"}],
# #   "analysis": "2-3 sentences about what you see",
# #   "conditions": [{"name": "...", "likelihood": "low|medium|high"}],
# #   "recommendation": "What owner should do",
# #   "urgency": "Monitor at home|Visit vet soon|Urgent vet visit"
# # }"""
# #                 }
#                   {   "type": "text",
#                       "text": """You are an expert veterinary AI assistant with deep medical knowledge. Analyze this pet photo carefully.

# # IMPORTANT SCORING RULES - Follow strictly:
# # - If ANY condition has likelihood "high" → score must be between 20-50
# # - If ANY condition has likelihood "medium" → score must be between 51-70
# # - If ALL conditions are "low" likelihood → score can be 71-100
# # - If urgency is "Urgent vet visit" → score must be below 40
# # - If urgency is "Visit vet soon" → score must be below 60
# # - Score should reflect actual health condition, not just appearance             

# IMPORTANT CONDITIONS RULES - Follow strictly:
# - ONLY suggest conditions that have VISIBLE evidence in the photo
# - If pet looks completely healthy, return conditions as empty array []
# - Do NOT suggest hypothetical or precautionary conditions
# - Do NOT suggest conditions just because breed is prone to them
# - Only flag what you can actually SEE in the image         
# Respond ONLY in this exact JSON format, nothing else:
# {
#   "score": <0-100>,
#   "animal": "<dog/cat/rabbit/other>",
#   "observations": [{"label": "...", "type": "ok|warn|danger"}],
#   "analysis": "2-3 sentences about what you visually see",
#   "conditions": [
#     {
#       "name": "condition name",
#       "likelihood": "low|medium|high",
#       "what_is_it": "1 sentence - is disease ke baare mein simple explanation",
#       "why_happens": "1 sentence - ye kyun hota hai",
#       "treatment": "Specific safe treatment options",
#       "supplements": "Safe supplements if applicable, or 'None needed'",
#       "see_vet": true or false
#     }
#   ],
#   "recommendation": "Clear next steps for owner in simple language",
#   "urgency": "Monitor at home|Visit vet soon|Urgent vet visit",
#   "disclaimer": "This is AI screening only. Always consult a licensed veterinarian for proper diagnosis and treatment."
# }"""
#                   }
#             ]
#         }],
#         max_tokens=1024
#     )

#     text = response.choices[0].message.content
#     clean = text.replace("```json", "").replace("```", "").strip()
#     result = json.loads(clean)
#     if "conditions" in result and isinstance(result["conditions"], list):
#         priority = {"high": 3, "medium": 2, "low": 1}
    
#         result["conditions"] = sorted(
#             result["conditions"],
#             key=lambda x: priority.get(x.get("likelihood", "low"), 1),
#             reverse=True
#             )[:1]   # 👈 only top 1

#     return result

# def extract_frames(video_bytes: bytes, num_frames: int = 4) -> list:
#     with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
#         f.write(video_bytes)
#         tmp_path = f.name

#     cap = cv2.VideoCapture(tmp_path)
#     total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
#     frames = []

#     for i in range(num_frames):
#         pos = int((i / num_frames) * total)
#         cap.set(cv2.CAP_PROP_POS_FRAMES, pos)
#         ret, frame = cap.read()
#         if ret:
#             _, buf = cv2.imencode(".jpg", frame)
#             frames.append(base64.b64encode(buf).decode("utf-8"))

#     cap.release()
#     return frames


# def analyze_pet_video(video_bytes: bytes) -> dict:
#     client = Groq(api_key=os.getenv("GROQ_API_KEY"))
#     frames = extract_frames(video_bytes, num_frames=4)

#     if not frames:
#         return {"error": "Video se frames nahi nikle"}

#     content = []
#     for f in frames:
#         content.append({
#             "type": "image_url",
#             "image_url": {"url": f"data:image/jpeg;base64,{f}"}
#         })

#     content.append({
#         "type": "text",
#         "text": """You are an expert veterinary AI assistant with deep medical knowledge. Analyze this pet photo carefully.
# Respond ONLY in this exact JSON format, nothing else:
# {
#   "score": <0-100>,
#   "animal": "<dog/cat/rabbit/other>",
#   "observations": [{"label": "...", "type": "ok|warn|danger"}],
#   "analysis": "2-3 sentences about what you visually see",
#   "conditions": [
#     {
#       "name": "condition name",
#       "likelihood": "low|medium|high",
#       "what_is_it": "1 sentence - is disease ke baare mein simple explanation",
#       "why_happens": "1 sentence - ye kyun hota hai",
#       "treatment": "Specific safe treatment options",
#       "supplements": "Safe supplements if applicable, or 'None needed'",
#       "see_vet": true or false
#     }
#   ],
#   "recommendation": "Clear next steps for owner in simple language",
#   "urgency": "Monitor at home|Visit vet soon|Urgent vet visit",
#   "disclaimer": "This is AI screening only. Always consult a licensed veterinarian for proper diagnosis and treatment."
# }"""
#     })

#     response = client.chat.completions.create(
#         model="meta-llama/llama-4-scout-17b-16e-instruct",
#         messages=[{"role": "user", "content": content}],
#         max_tokens=1024
#     )

#     text = response.choices[0].message.content
#     clean = text.replace("```json", "").replace("```", "").strip()
#     result = json.loads(clean)

#     if "conditions" in result and isinstance(result["conditions"], list):
#         priority = {"high": 3, "medium": 2, "low": 1}
    
#         result["conditions"] = sorted(
#             result["conditions"],
#             key=lambda x: priority.get(x.get("likelihood", "low"), 1),
#             reverse=True
#             )[:1]   # 👈 only top 1

#     return result

# def analyze_pet_text(description: str) -> dict:
#     client = Groq(api_key=os.getenv("GROQ_API_KEY"))

#     prompt = f"""
# You are an expert veterinary AI assistant.

# User description of pet problem:
# \"\"\"{description}\"\"\"

# IMPORTANT:
# - Only suggest realistic conditions based on symptoms
# CRITICAL RULE:

# - If the pet appears healthy or symptoms are normal → return "conditions": []
# - Do NOT create placeholder or general conditions like "Routine Checkup"
# - Do NOT suggest any disease if no strong symptoms are present
# - Do NOT hallucinate rare diseases
# - Keep explanation simple
# - Only return conditions if there is clear evidence of a problem
# - If no clear issue → conditions must be empty []
# Respond ONLY in JSON:

# {{
#   "score": <0-100>,
#   "animal": "dog",
#   "observations": [{{"label": "...", "type": "ok|warn|danger"}}],
#   "analysis": "2-3 sentence explanation",
#   "conditions": [
#     {{
#       "name": "...",
#       "likelihood": "low|medium|high",
#       "what_is_it": "...",
#       "why_happens": "...",
#       "treatment": "...",
#       "supplements": "...",
#       "see_vet": true
#     }}
#   ],
#   "recommendation": "...",
#   "urgency": "Monitor at home|Visit vet soon|Urgent vet visit",
#   "disclaimer": "This is AI screening only..."
# }}
# """

#     response = client.chat.completions.create(
#         model="meta-llama/llama-4-scout-17b-16e-instruct",
#         messages=[{"role": "user", "content": prompt}],
#         max_tokens=1024
#     )

#     text = response.choices[0].message.content
#     clean = text.replace("```json", "").replace("```", "").strip()
#     result = json.loads(clean)

#     if "conditions" in result and isinstance(result["conditions"], list):
#         priority = {"high": 3, "medium": 2, "low": 1}
    
#         result["conditions"] = sorted(
#             result["conditions"],
#             key=lambda x: priority.get(x.get("likelihood", "low"), 1),
#             reverse=True
#             )[:1]   # 👈 only top 1

#     return result


import os
import json
import base64
import cv2
import tempfile
import time
import numpy as np
from groq import Groq

# ──────────────────────────────────────────────
#  LOAD DISEASE DATABASE (dog_diseases.json)
# ──────────────────────────────────────────────
import os as _os
_DB_PATH = _os.path.join(_os.path.dirname(__file__), "dog_diseases.json")
try:
    with open(_DB_PATH, "r", encoding="utf-8") as _f:
        DISEASE_DB = json.load(_f)
    print(f"[INFO] Disease DB loaded: {len(DISEASE_DB)} diseases")
except Exception as _e:
    DISEASE_DB = []
    print(f"[WARN] dog_diseases.json not found: {_e}")
# ──────────────────────────────────────────────
#  ROBUST JSON PARSER
#  Handles: empty response, markdown fences,
#  extra text before/after JSON, partial output
# ──────────────────────────────────────────────
def parse_response(text: str) -> dict:
    if not text or not text.strip():
        raise ValueError("AI returned an empty response")

    clean = text.strip()
    # Remove markdown code fences
    clean = clean.replace("```json", "").replace("```", "").strip()
    # Extract the JSON object even if model adds intro/outro text
    start = clean.find("{")
    end   = clean.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError(f"No valid JSON in response: {clean[:300]}")
    clean = clean[start : end + 1]
    return json.loads(clean)


# ──────────────────────────────────────────────
#  GROQ API WITH RETRY
#  Retries 3x on: empty response, bad JSON,
#  transient API errors
# ──────────────────────────────────────────────
def call_groq(client, messages: list, max_tokens: int = 1024, retries: int = 3) -> dict:
    last_error = None

    for attempt in range(1, retries + 1):
        try:
            response = client.chat.completions.create(
                model="meta-llama/llama-4-scout-17b-16e-instruct",
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.3,
            )
            raw = (response.choices[0].message.content or "").strip()
            if not raw:
                raise ValueError(f"Empty response on attempt {attempt}")
            return parse_response(raw)   # success

        except (ValueError, json.JSONDecodeError) as e:
            last_error = e
            print(f"[WARN] Attempt {attempt}/{retries} — {type(e).__name__}: {e}")
            if attempt < retries:
                time.sleep(1.5 * attempt)

        except Exception as e:
            last_error = e
            print(f"[ERROR] API error attempt {attempt}: {e}")
            if attempt < retries:
                time.sleep(2 * attempt)

    print(f"[ERROR] All {retries} retries exhausted. Last: {last_error}")
    return _fallback_result()


def _fallback_result() -> dict:
    return {
        "score": 50,
        "animal": "dog",
        "observations": [{"label": "Analysis could not be completed", "type": "warn"}],
        "analysis": "The AI was unable to process the input right now. This is usually temporary. Please try again.",
        "conditions": [],
        "recommendation": "Please try again. If the issue persists, add more detail in the text box.",
        "urgency": "Monitor at home",
        "disclaimer": "This is AI screening only. Always consult a licensed veterinarian.",
        "_fallback": True
    }


# ──────────────────────────────────────────────
#  DETERMINISTIC SCORE CORRECTOR
# ──────────────────────────────────────────────
def fix_score(result: dict) -> dict:
    conditions = result.get("conditions") or []
    urgency    = (result.get("urgency") or "").lower()

    try:
        ai_score = int(result.get("score", 70))
    except (TypeError, ValueError):
        ai_score = 70
    ai_score = max(0, min(100, ai_score))

    priority = {"high": 3, "medium": 2, "low": 1}
    worst = 0
    for c in conditions:
        lk = (c.get("likelihood") or "low").lower()
        worst = max(worst, priority.get(lk, 1))

    # Cross-check: high condition + "Monitor at home" urgency → override
    if worst == 3 and "urgent" not in urgency and "soon" not in urgency:
        result["urgency"] = "Visit vet soon"
        urgency = "visit vet soon"

    if "urgent" in urgency:
        corrected = max(20, min(ai_score, 39))
    elif "soon" in urgency:
        corrected = max(40, min(ai_score, 59))
    elif worst == 3:
        corrected = max(30, min(ai_score, 54))
    elif worst == 2:
        corrected = max(50, min(ai_score, 69))
    elif worst == 1:
        corrected = max(65, min(ai_score, 89))
    else:
        corrected = max(min(ai_score, 100), 80)

    result["score"] = corrected
    return result

# ──────────────────────────────────────────────
#  JSON DATABASE LOOKUP
#  Matches AI condition name against aliases
#  and injects real treatment data into result
# ──────────────────────────────────────────────
def enrich_from_db(result: dict) -> dict:
    if not DISEASE_DB or not result.get("conditions"):
        return result

    for condition in result["conditions"]:
        ai_name = (condition.get("name") or "").lower().strip()
        if not ai_name:
            continue

        matched = None
        best_score = 0

        for disease in DISEASE_DB:
            # Check common_name
            db_name = disease.get("common_name", "").lower()
            # Check all aliases
            aliases = [a.lower() for a in disease.get("aliases", [])]
            all_terms = [db_name] + aliases

            for term in all_terms:
                # Exact match → highest priority
                if term == ai_name:
                    matched = disease
                    best_score = 100
                    break
                # Partial match — AI name contains DB term or vice versa
                elif term in ai_name or ai_name in term:
                    score = len(term)   # longer match = more specific
                    if score > best_score:
                        best_score = score
                        matched = disease

            if best_score == 100:
                break   # exact match found, stop searching

        if matched and best_score >= 3:
            print(f"[DB] Matched '{ai_name}' → '{matched['common_name']}' (score:{best_score})")

            # Inject real data — overwrite AI guesses with JSON facts
            condition["what_is_it"]  = condition.get("what_is_it") or matched.get("cause", "")
            condition["why_happens"] = matched.get("cause", condition.get("why_happens", ""))
            condition["warning"]     = matched.get("warning", "")
            condition["see_vet"]     = matched.get("urgency", "Low") in ("Medium", "High", "Critical")

            # Inject medicines
            condition["medicines"] = matched.get("medicines", [])

            # Inject topical treatments
            condition["topical_treatments"] = matched.get("topical_treatments", [])

            # Inject supplements with images and links
            condition["supplements_detail"] = matched.get("supplements", [])

            # Inject safety warnings
            condition["safety_warnings"] = matched.get("safety_warnings", [])

            # Override treatment text with real medicine names
            med_names = [m["name"] for m in matched.get("medicines", [])]
            if med_names:
                condition["treatment"] = " | ".join(med_names)

            # Override supplements text with real supplement names
            sup_names = [s["name"] for s in matched.get("supplements", [])]
            if sup_names:
                condition["supplements"] = " | ".join(sup_names)

        else:
            print(f"[DB] No match for '{ai_name}' — keeping AI response")

    return result
# ──────────────────────────────────────────────
#  SHARED POST-PROCESSING
# ──────────────────────────────────────────────
def post_process(result: dict) -> dict:
    if not isinstance(result.get("conditions"), list):
        result["conditions"] = []
    priority = {"high": 3, "medium": 2, "low": 1}
    result["conditions"] = sorted(
        result["conditions"],
        key=lambda x: priority.get((x.get("likelihood") or "low").lower(), 1),
        reverse=True
    )[:1]
    result = enrich_from_db(result)   # ← ADD THIS LINE
    return fix_score(result)


# ──────────────────────────────────────────────
#  PROMPTS
# ──────────────────────────────────────────────
IMAGE_PROMPT = """You are an expert veterinary AI assistant. Analyze this pet photo carefully.

SCORING RULES (mandatory):
- Any condition with likelihood "high"   → score 30-54
- Any condition with likelihood "medium" → score 50-69
- All conditions "low" likelihood        → score 65-89
- No conditions (healthy pet)           → score 80-100
- Urgency "Urgent vet visit"            → score below 40
- Urgency "Visit vet soon"              → score below 60

CONDITIONS RULES:
- ONLY report conditions with VISIBLE evidence in the photo
- Healthy pet → "conditions": []
- Do NOT invent conditions based on breed

You MUST respond ONLY with a valid JSON object. No intro text. No explanation. Just JSON:
{
  "score": <integer 0-100>,
  "animal": "<dog/cat/rabbit/other>",
  "observations": [{"label": "<string>", "type": "<ok|warn|danger>"}],
  "analysis": "<2-3 sentences about what you visually see>",
  "conditions": [
    {
      "name": "<condition name>",
      "likelihood": "<low|medium|high>",
      "what_is_it": "<1 sentence simple explanation>",
      "why_happens": "<1 sentence on cause>",
      "treatment": "<specific safe treatment options>",
      "supplements": "<safe supplements or 'None needed'>",
      "see_vet": <true or false>
    }
  ],
  "recommendation": "<clear next steps for owner>",
  "urgency": "<Monitor at home|Visit vet soon|Urgent vet visit>",
  "disclaimer": "This is AI screening only. Always consult a licensed veterinarian for proper diagnosis and treatment."
}"""

TEXT_PROMPT_TEMPLATE = """You are an expert veterinary AI assistant.

Pet owner's description:
\"\"\"{description}\"\"\"

SCORING RULES (mandatory):
- Any condition with likelihood "high"   → score 20-49
- Any condition with likelihood "medium" → score 50-69
- All conditions "low" likelihood        → score 70-85
- No conditions (healthy)               → score 80-100
- Urgency "Urgent vet visit"            → score 20-39
- Urgency "Visit vet soon"              → score 40-59
- Monitor at home  → score 60-100


CRITICAL RULES:
- Only suggest conditions supported by described symptoms
- Mild but clear symptoms → allow 1 low/medium condition
- Vague symptoms → conditions: []
- Do NOT hallucinate rare diseases
- For respiratory symptoms, use general condition unless clearly specific
- Avoid over-specific diagnosis without strong evidence
- If conditions is empty, set "recommendation" to: "Your description is unclear. Please describe specific symptoms like: location of pain, duration, changes in eating/drinking/urination, any visible skin changes, or behavioral changes."
- Do NOT force a condition name when symptoms are insufficient
- If only 1-2 vague symptoms described (e.g. "dog seems tired") → conditions: [] and ask for more detail in recommendation

You MUST respond ONLY with a valid JSON object. No intro text. No explanation. Just JSON:
{{
  "score": <integer 0-100>,
  "animal": "dog",
  "observations": [{{"label": "<string>", "type": "<ok|warn|danger>"}}],
  "analysis": "<2-3 sentence explanation>",
  "conditions": [
    {{
      "name": "<condition name>",
      "likelihood": "<low|medium|high>",
      "what_is_it": "<1 sentence explanation>",
      "why_happens": "<1 sentence cause>",
      "treatment": "<specific treatment options>",
      "supplements": "<supplements or 'None needed'>",
      "see_vet": <true or false>
    }}
  ],
  "recommendation": "<clear next steps>",
  "urgency": "<Monitor at home|Visit vet soon|Urgent vet visit>",
  "disclaimer": "This is AI screening only. Always consult a licensed veterinarian for proper diagnosis and treatment."
}}"""


# ──────────────────────────────────────────────
#  IMAGE ANALYSIS
# ──────────────────────────────────────────────
def analyze_pet(image_bytes: bytes, mime_type: str) -> dict:
    client  = Groq(api_key=os.getenv("GROQ_API_KEY"))
    img_b64 = base64.b64encode(image_bytes).decode("utf-8")
    messages = [{
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{img_b64}"}},
            {"type": "text",      "text": IMAGE_PROMPT}
        ]
    }]
    return post_process(call_groq(client, messages))


# ──────────────────────────────────────────────
#  VIDEO ANALYSIS
# ──────────────────────────────────────────────
def extract_frames(video_bytes: bytes, num_frames: int = 4) -> list:
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
        f.write(video_bytes)
        tmp_path = f.name
    cap   = cv2.VideoCapture(tmp_path)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frames = []
    for i in range(num_frames):
        pos = int((i / num_frames) * total)
        cap.set(cv2.CAP_PROP_POS_FRAMES, pos)
        ret, frame = cap.read()
        if ret:
            _, buf = cv2.imencode(".jpg", frame)
            frames.append(base64.b64encode(buf).decode("utf-8"))
    cap.release()
    return frames


def analyze_pet_video(video_bytes: bytes) -> dict:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    frames = extract_frames(video_bytes, num_frames=4)
    if not frames:
        return {"error": "Video se frames nahi nikle"}
    content = [
        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{f}"}}
        for f in frames
    ]
    content.append({"type": "text", "text": IMAGE_PROMPT})
    return post_process(call_groq(client, [{"role": "user", "content": content}]))


# ──────────────────────────────────────────────
#  TEXT-ONLY ANALYSIS
# ──────────────────────────────────────────────
def analyze_pet_text(description: str) -> dict:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    messages = [{
        "role": "user",
        "content": TEXT_PROMPT_TEMPLATE.format(description=description)
    }]
    return post_process(call_groq(client, messages))