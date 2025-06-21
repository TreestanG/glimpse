import re

def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^\w\s\?]", "", text)
    filler_words = {"um", "uh", "like", "you know", "so", "actually", "basically"}
    words = text.split()
    filtered_words = [w for w in words if w not in filler_words]
    return " ".join(filtered_words)

def extract_keywords(text, model):
    prompt = (
        "Extract the 10 most important keywords or phrases from the following pitch transcript. "
        "Return them as a comma-separated list.\n\n"
        f"{text}"
    )
    response = model.generate_content(prompt)
    keywords = [kw.strip() for kw in response.text.split(",") if kw.strip()]
    return keywords