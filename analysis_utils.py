from nltk.sentiment import SentimentIntensityAnalyzer
import google.generativeai as genai
from dotenv import load_dotenv
import os

def extract_turns(transcript_items, clean_text):
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

def count_filler_words(turns, filler_words=None):
    if filler_words is None:
        filler_words = {"um", "uh", "like", "you know", "so", "actually", "basically"}
    count = 0
    for turn in turns:
        words = turn.lower().split()
        count += sum(1 for w in words if w in filler_words)
    return count


def preprocess_transcript(doc, extract_turns, clean_text, count_words, extract_metadata):
    transcript_items = doc.get('transcript', {}).get('items', [])
    user_turns, agent_turns, agent_sentiments, user_interruptions, agent_interruptions = extract_turns(transcript_items, clean_text)
    user_word_count = count_words(user_turns)
    agent_word_count = count_words(agent_turns)
    user_turn_count = len(user_turns)
    agent_turn_count = len(agent_turns)
    user_avg_words_per_turn = user_word_count / user_turn_count if user_turn_count else 0
    agent_avg_words_per_turn = agent_word_count / agent_turn_count if agent_turn_count else 0
    meta = extract_metadata(doc)

    # Filler word counts
    user_filler_count = count_filler_words(user_turns)


    # Talk vs listen ratio
    total_talk_time = doc.get("user_talk_time", None)
    total_listen_time = doc.get("user_listen_time", None)
    if total_talk_time and total_listen_time:
        talk_listen_ratio = total_talk_time / (total_listen_time or 1)
    else:
        # Fallback: ratio of user to agent words
        talk_listen_ratio = user_word_count / (agent_word_count or 1)

    # Clarity/confidence score (example: inverse of filler rate)
    total_user_words = sum(len(turn.split()) for turn in user_turns)
    clarity_score = 1 - (user_filler_count / total_user_words) if total_user_words else 1

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
        "user_filler_count": user_filler_count,
        "talk_listen_ratio": talk_listen_ratio,
        "clarity_score": clarity_score
    }
    return result

def generate_summary(transcript, model):
    text = " ".join(transcript)
    prompt = f"Summarize the following pitch in 3-4 sentences:\n\n{text}"
    response = model.generate_content(prompt)
    return response.text.strip()

def generate_improvement_points(user_turns, extract_keywords,model):
    text = " ".join(user_turns)
    keywords = extract_keywords(text, model)

    feedback = []

    prompt = (
        f"Based on the following pitch, what are 3 ways it could be improved?\n\n"
        f"{text}\n\n"
        f"Consider: missing metrics, vague TAM, no mention of competition."
    )
    response = model.generate_content(prompt)
    llm_feedback = response.text.strip()
    feedback.append(llm_feedback)

    return feedback

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