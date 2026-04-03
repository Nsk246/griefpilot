import os
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
client = AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

CRISIS_SYSTEM = """Safety classifier. Does this utterance contain suicidal ideation, self-harm urges, or wanting to die?
Reply with ONLY the single word YES or NO."""

async def is_crisis(utterance: str) -> bool:
    try:
        response = await client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=5,
            system=CRISIS_SYSTEM,
            messages=[{"role": "user", "content": utterance}],
        )
        return response.content[0].text.strip().upper() == "YES"
    except Exception as e:
        print(f"Crisis detector error: {e}")
        return False
