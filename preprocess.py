from pymongo import MongoClient
from collections import defaultdict
import re
from nltk.sentiment import SentimentIntensityAnalyzer
from analysis_utils import generate_summary, get_agent_interest_score
from dotenv import load_dotenv
import os

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



def preprocess_transcript(doc):
    """
    Input: MongoDB doc (dict)
    Output: dict with normalized turns and metadata
    """
    transcript_items = doc.get('transcript', {}).get('items', [])
    
    sia = SentimentIntensityAnalyzer()

    # Separate user and assistant turns
    user_turns = []
    agent_turns = []
    agent_sentiments = []
    user_interruptions = 0
    agent_interruptions = 0
    
    for item in transcript_items:
        role = item.get('role')
        content_list = item.get('content', [])
        # Join list of strings into one utterance string
        utterance_raw = ' '.join(content_list).strip()
        utterance = clean_text(utterance_raw)
        interrupted = item.get('interrupted', False)
        
        if role == 'user':
            user_turns.append(utterance)
            if  interrupted:
                user_interruptions += 1
        elif role == 'assistant':
            agent_turns.append(utterance)
            if interrupted:
                agent_interruptions += 1
                # Compute sentiment for this agent turn
                sentiment = sia.polarity_scores(utterance)
                # You can store compound score or full dict; compound is -1 to 1 float
                agent_sentiments.append(sentiment['compound'])
        else:
            # If role unknown or other, skip or log
            pass
    
    # Basic Metadata
    def count_words(text_list):
        return sum(len(t.split()) for t in text_list)
    
    user_word_count = count_words(user_turns)
    agent_word_count = count_words(agent_turns)
    user_turn_count = len(user_turns)
    agent_turn_count = len(agent_turns)

    user_avg_words_per_turn = user_word_count / user_turn_count if user_turn_count else 0
    agent_avg_words_per_turn = agent_word_count / agent_turn_count if agent_turn_count else 0   
    
    # Call timestamp (top-level)
    timestamp_field = doc.get('timestamp', None)
    if isinstance(timestamp_field, dict):
        timestamp = timestamp_field.get('$date', None)
    else:
        timestamp = timestamp_field
    
    result = {
        "call_id": doc.get("call_id"),
        "timestamp": timestamp,
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

def main():
    # Setup connection info
    load_dotenv()  # Load environment variables from .env file if needed
    uri = os.getenv("MONGODB_URI")  # Replace with your MongoDB URI
    db_name = "transcripts"         # Replace this
    collection_name = "transcripts" # Replace this
    
    collection = connect_to_db(uri, db_name, collection_name)
    
    # Fetch few transcripts (limit=5 for demo)
    cursor = collection.find().sort("timestamp", -1).limit(1)
    
    for doc in cursor:
        processed = preprocess_transcript(doc)
        summary = generate_summary(processed["user_turns"])
        agent_interest_score = get_agent_interest_score(processed["agent_turns"])
        print("Call ID:", processed["call_id"])
        print("Timestamp:", processed["timestamp"])
        print("User Turns:", processed["user_turn_count"], "words:", processed["user_word_count"])
        print("Agent Turns:", processed["agent_turn_count"], "words:", processed["agent_word_count"])
        print("Sample User Turn:", processed["user_turns"][:2])
        print("Sample Agent Turn:", processed["agent_turns"][:2])
        print("User Avg Words/Turn:", processed["user_avg_words_per_turn"])
        print("Agent Avg Words/Turn:", processed["agent_avg_words_per_turn"])
        print("User Interruptions:", processed["user_interruptions"])
        print("Agent Interruptions:", processed["agent_interruptions"])
        print("Summary:", summary)
        print("Agent Interest Score:", agent_interest_score)
        print("-" * 40)

if __name__ == "__main__":
    main()