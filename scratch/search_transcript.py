import json

log_path = r"C:\Users\pc\.gemini\antigravity\brain\d920dd82-04c6-4a2d-80e5-0fae7134eefc\.system_generated\logs\transcript.jsonl"

with open(log_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get("type") == "USER_INPUT":
                content = data.get("content", "")
                # Print user message if it mentions team or scores
                if any(word in content.lower() for word in ["skor", "tarih", "saat", "mac", "maç", "fransa", "paraguay", "türkiye", "turkey"]):
                    print(f"[{data.get('step_index')}]: {content}\n")
        except Exception as e:
            pass
