import os
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
client = AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

LETTER_SYSTEM = """Write a brief letter as if from the deceased loved one.
Rules: use ONLY memories shared, 3-4 sentences, warm and specific, no platitudes,
first person as the deceased, begin with just the letter content (no salutation needed)."""

async def compose_letter(memories: list) -> str:
    if not memories:
        return "There wasn't enough shared today to write a letter. Come back when you're ready to remember."
    memory_list = "\n".join([f"- {m['text']} (emotion: {m['emotion']}, weight: {m['weight']}/5)" for m in memories])
    try:
        response = await client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=300,
            system=LETTER_SYSTEM,
            messages=[{"role": "user", "content": f"Memories shared:\n{memory_list}\n\nWrite the letter."}],
        )
        return response.content[0].text.strip()
    except Exception as e:
        print(f"Letter error: {e}")
        return "The memories you shared today are held gently. Thank you for speaking."
