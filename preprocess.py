from dotenv import load_dotenv
import os
import google.generativeai as genai

from db_utils import connect_to_db
from text_utils import clean_text, extract_keywords
from analysis_utils import (
    extract_turns, count_words, extract_metadata, preprocess_transcript,
    generate_summary, generate_improvement_points, get_agent_interest_score
)


def main():
    load_dotenv()
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    model = genai.GenerativeModel("gemini-2.5-flash")
    uri = os.getenv("MONGODB_URI")
    db_name = "transcripts"
    collection_name = "transcripts"
    analysis_collection_name = "transcript_analysis"

    collection = connect_to_db(uri, db_name, collection_name)
    analysis_collection = connect_to_db(uri, db_name, analysis_collection_name)

    cursor = collection.find().sort("timestamp", -1).limit(1)

    for doc in cursor:
        processed = preprocess_transcript(
            doc, extract_turns, clean_text, count_words, extract_metadata
        )
        summary = generate_summary(processed["user_turns"], model)
        agent_interest_score = get_agent_interest_score(processed["agent_turns"])
        feedback = generate_improvement_points(
            processed["user_turns"], extract_keywords, model
        )

        analysis_doc = {
            "call_id": processed["call_id"],
            "timestamp": processed["timestamp"],
            "summary": summary,
            "agent_interest_score": agent_interest_score,
            "feedback": feedback,
            "clarity_score": processed["clarity_score"],
            "user_filler_count": processed["user_filler_count"],
            "talk_listen_ratio": processed["talk_listen_ratio"],
        }
        analysis_collection.insert_one(analysis_doc)
        print("Call ID:", processed["call_id"])
        print("Timestamp:", processed["timestamp"])
        print("Summary:", summary)
        print("Agent Interest Score:", agent_interest_score)
        print("Feedback:", feedback)
        print("Clarity Score:", processed["clarity_score"])
        print("User Filler Count:", processed["user_filler_count"])
        print("-" * 40)

if __name__ == "__main__":
    main()