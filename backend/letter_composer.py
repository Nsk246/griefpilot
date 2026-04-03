import os
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
client = AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

LETTER_SYSTEM = """You write a short closing reflection at the end of an emotional support session.

You receive a list of memory fragments and emotions the person shared during the session.

Your job: write a warm, specific 3-4 sentence closing piece that reflects back what this person shared — honoring their pain, their courage in speaking, and the specific things they mentioned.

This is NOT always a letter from someone who died. Read the memories carefully:
- If the person shared memories of someone who passed away → write as if gently from that person, using only what was shared
- If the person shared their own pain (depression, breakup, loneliness, not knowing what to do) → write a warm closing reflection addressed TO them, honoring what they carried today

Rules:
- Use ONLY what was actually shared — never invent details
- Be specific — reference their actual words and feelings
- 3-4 sentences maximum
- No platitudes, no "healing journey", no generic comfort
- Start directly — no preamble, no "Dear...", just the words
- End with something that honors their courage in showing up today"""

async def compose_letter(memories: list) -> str:
    if not memories:
        return "You showed up today. That's not nothing — that's everything. Whatever you're carrying, you didn't carry it alone for these few minutes. Come back whenever you need."

    memory_list = "\n".join([
        f"- {m['text']} (emotion: {m['emotion']}, weight: {m['weight']}/5)"
        for m in memories
    ])

    try:
        response = await client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=300,
            system=LETTER_SYSTEM,
            messages=[{
                "role": "user",
                "content": f"Here is what the person shared today:\n{memory_list}\n\nWrite the closing reflection."
            }],
        )
        text = response.content[0].text.strip()
        # Remove any undefined/null artifacts
        text = text.replace('undefined', '').replace('null', '').strip()
        return text
    except Exception as e:
        print(f"Letter error: {e}")
        return "You came here today and spoke what was on your heart. That took something. Whatever you're carrying, it was real, and it was heard."
