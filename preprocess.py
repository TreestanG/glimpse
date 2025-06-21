from pymongo import MongoClient
import re
from nltk.sentiment import SentimentIntensityAnalyzer
from analysis_utils import generate_summary, get_agent_interest_score
from dotenv import load_dotenv
import os
from transformers import pipeline
import google.generativeai as genai

pitch_keywords_2025 = [
    # Problem & Solution
    "problem", "pain point", "customer need", "unmet need", "solution", "product",
    "MVP", "prototype", "proof of concept",

    # Market
    "market size", "TAM", "SAM", "SOM", "growth rate", "target market",
    "customer segment", "niche", "early adopters", "market validation", "industry trend",

    # Business Model
    "business model", "revenue model", "monetization", "pricing", "subscription",
    "freemium", "marketplace", "SaaS", "B2B", "B2C", "lifetime value", "CAC",

    # Go-to-Market & Traction
    "go-to-market", "launch", "traction", "user growth", "waitlist", "churn",
    "retention", "acquisition strategy", "growth hack", "distribution", "marketing", "partnerships",

    # Technology & Product
    "AI", "ML", "LLM", "GenAI", "automation", "data", "privacy", "proprietary",
    "open source", "API", "integration", "product roadmap",

    # Defensibility
    "moat", "IP", "intellectual property", "network effects", "proprietary data",
    "switching costs", "first-mover advantage", "patents",

    # Team
    "founder", "co-founder", "team", "domain expertise", "experience",
    "background", "track record", "exited",

    # Financials
    "revenue", "ARR", "MRR", "unit economics", "runway", "burn rate",
    "profitability", "funding", "valuation", "projections", "growth",

    # Competition & Differentiation
    "competitors", "competitive landscape", "differentiation", "USP",
    "unique selling proposition", "unfair advantage", "positioning",

    # Vision & Impact
    "mission", "vision", "long-term", "social impact", "climate tech",
    "sustainability", "remote work", "future of work", "global expansion",

    # The Ask
    "raise", "funding", "seed", "pre-seed", "series A", "investor",
    "capital", "dilution", "equity", "use of funds"
]


def connect_to_db(uri, db_name, collection_name):
    client = MongoClient(uri)
    db = client[db_name]
    collection = db[collection_name]
    return collection

def clean_text(text):
    """
    Lowercase and remove punctuation except question marks.
    You can customize filler word removal here if needed.
    """
    text = text.lower()
    # Remove punctuation except question marks to preserve questions
    text = re.sub(r"[^\w\s\?]", "", text)
    # Optionally remove filler words - example list
    filler_words = {"um", "uh", "like", "you know", "so", "actually", "basically"}
    # Remove filler words by splitting and filtering
    words = text.split()
    filtered_words = [w for w in words if w not in filler_words]
    return " ".join(filtered_words)

def extract_turns(transcript_items):
    user_turns, agent_turns = [], []
    user_interruptions, agent_interruptions = 0, 0
    agent_sentiments = []
    sia = SentimentIntensityAnalyzer()
    for item in transcript_items:
        role = item.get('role')
        content_list = item.get('content', [])
        utterance_raw = ' '.join(content_list).strip()
        utterance = clean_text(utterance_raw)
        interrupted = item.get('interrupted', False)
        if role == 'user':
            user_turns.append(utterance)
            if interrupted:
                user_interruptions += 1
        elif role == 'assistant':
            agent_turns.append(utterance)
            if interrupted:
                agent_interruptions += 1
                sentiment = sia.polarity_scores(utterance)
                agent_sentiments.append(sentiment['compound'])
    return user_turns, agent_turns, agent_sentiments, user_interruptions, agent_interruptions

def count_words(text_list):
    return sum(len(t.split()) for t in text_list)

def extract_metadata(doc):
    timestamp_field = doc.get('timestamp', None)
    if isinstance(timestamp_field, dict):
        timestamp = timestamp_field.get('$date', None)
    else:
        timestamp = timestamp_field
    return {
        "call_id": doc.get("call_id"),
        "timestamp": timestamp
    }

def preprocess_transcript(doc):
    """
    Input: MongoDB doc (dict)
    Output: dict with normalized turns and metadata
    """
    transcript_items = doc.get('transcript', {}).get('items', [])
    user_turns, agent_turns, agent_sentiments, user_interruptions, agent_interruptions = extract_turns(transcript_items)
    user_word_count = count_words(user_turns)
    agent_word_count = count_words(agent_turns)
    user_turn_count = len(user_turns)
    agent_turn_count = len(agent_turns)
    user_avg_words_per_turn = user_word_count / user_turn_count if user_turn_count else 0
    agent_avg_words_per_turn = agent_word_count / agent_turn_count if agent_turn_count else 0
    meta = extract_metadata(doc)
    result = {
        **meta,
        "user_turns": user_turns,
        "agent_turns": agent_turns,
        "agent_sentiments": agent_sentiments,
        "user_word_count": user_word_count,
        "agent_word_count": agent_word_count,
        "user_turn_count": user_turn_count,
        "agent_turn_count": agent_turn_count,
        "user_avg_words_per_turn": user_avg_words_per_turn,
        "agent_avg_words_per_turn": agent_avg_words_per_turn,
        "user_interruptions": user_interruptions,
        "agent_interruptions": agent_interruptions,
    }
    return result

model = genai.GenerativeModel("gemini-2.5-flash")

def extract_keywords(text):
    prompt = (
        "Extract the 10 most important keywords or phrases from the following pitch transcript. "
        "Return them as a comma-separated list.\n\n"
        f"{text}"
    )
    response = model.generate_content(prompt)
    keywords = [kw.strip() for kw in response.text.split(",") if kw.strip()]
    return keywords

def detect_missing_elements(keywords):
    missing = [elem for elem in pitch_keywords_2025 if not any(elem in k for k in keywords)]
    return missing

def generate_improvement_points(user_turns):
    text = " ".join(user_turns)
    keywords = extract_keywords(text)
    missing = detect_missing_elements(keywords)

    feedback = []
    if missing:
        feedback.append(f"Missing standard pitch elements: {', '.join(missing)}.")

    # LLM feedback
    prompt = (
        f"Based on the following pitch, what are 3 ways it could be improved?\n\n"
        f"{text}\n\n"
        f"Consider: missing metrics, vague TAM, no mention of competition."
    )
    response = model.generate_content(prompt)
    llm_feedback = response.text.strip()
    feedback.append(llm_feedback)

    return feedback

def main():
    # Setup connection info
    load_dotenv()  # Load environment variables from .env file if needed
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    uri = os.getenv("MONGODB_URI")  # Replace with your MongoDB URI
    print(uri)
    db_name = "transcripts"         # Replace this
    collection_name = "transcripts" # Replace this
    analysis_collection_name = "transcript_analysis"

    collection = connect_to_db(uri, db_name, collection_name)
    analysis_collection = connect_to_db(uri, db_name, analysis_collection_name)

    # Fetch few transcripts (limit=5 for demo)
    cursor = collection.find().sort("timestamp", -1).limit(1)

    for doc in cursor:
        processed = preprocess_transcript(doc)
        summary = generate_summary(processed["user_turns"])
        agent_interest_score = get_agent_interest_score(processed["agent_turns"])
        feedback = generate_improvement_points(processed["user_turns"])

        # Prepare analysis document
        analysis_doc = {
            "call_id": processed["call_id"],
            "timestamp": processed["timestamp"],
            "user_avg_words_per_turn": processed["user_avg_words_per_turn"],
            "agent_avg_words_per_turn": processed["agent_avg_words_per_turn"],
            "summary": summary,
            "agent_interest_score": agent_interest_score,
            "feedback": feedback
        }

        # Insert into transcript_analysis collection
        analysis_collection.insert_one(analysis_doc)

        # Print for verification
        print("Call ID:", processed["call_id"])
        print("Timestamp:", processed["timestamp"])
        print("User Avg Words/Turn:", processed["user_avg_words_per_turn"])
        print("Agent Avg Words/Turn:", processed["agent_avg_words_per_turn"])
        print("Summary:", summary)
        print("Agent Interest Score:", agent_interest_score)
        print("-" * 40)

if __name__ == "__main__":
    main()