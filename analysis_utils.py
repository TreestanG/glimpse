from nltk.sentiment import SentimentIntensityAnalyzer
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

def generate_summary(transcript):

    """
    Summarize the user's pitch from the transcript.
    transcript: list of user utterances (strings)
    Returns: summary string
    """
    # Join user utterances into a single input string
    text = " ".join(transcript)
    prompt = f"Summarize the following pitch in 3-4 sentences:\n\n{text}"
    response = model.generate_content(prompt)
    return response.text.strip()

    # Decode and return
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return summary

def get_agent_interest_score(agent_turns):
    """
    Analyze agent sentiment to estimate interest.
    agent_turns: list of agent utterances (strings)
    Returns: average compound sentiment score (-1 to 1)
    """
    sia = SentimentIntensityAnalyzer()
    if not agent_turns:
        return 0.0
    scores = [sia.polarity_scores(turn)['compound'] for turn in agent_turns]
    return sum(scores) / len(scores)