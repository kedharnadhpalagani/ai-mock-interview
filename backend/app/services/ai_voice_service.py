import logging
import asyncio
import json
from typing import Dict, Any, Optional, AsyncGenerator
from app.config import settings
from google import genai
from google.genai import types

logger = logging.getLogger("uvicorn.error")

SYSTEM_INSTRUCTION = """
You are the official AI Technical Interviewer for Vignan's University.
Your mission is to conduct a professional, rigorous, yet encouraging mock technical interview for engineering students.

Interview Guidelines:
1. Greet the candidate by name with warmth and professional decorum ("Welcome to your Vignan AI Technical Mock Interview. Take a deep breath; we are here to help you get interview-ready.").
2. Confirm their readiness before diving into questions.
3. Systematically present the assigned technical questions based on the candidate's selected skills.
4. Genuinely listen to their spoken responses. Do not just move to the next question—acknowledge their answer, probe deeper with an insightful follow-up if their answer is incomplete, and challenge them gently when appropriate.
5. Inquire in-depth about their submitted technical projects: their architecture, trade-offs, technologies used, personal contributions, challenges, and measurable results.
6. Evaluate their problem-solving mindset and behavioral traits through STAR-format scenario questions.
7. Maintain natural, engaging spoken conversation. Speak concisely, clearly, and authoritatively, avoiding robotic lists or overlong speeches.
8. At the end, thank the student, provide a quick encouraging remark, and notify them that their full evidence-based evaluation report is being generated.
"""

class GeminiVoiceInterviewer:
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.AI_PROVIDER_API_KEY
        self.model = model or settings.AI_MODEL or "gemini-2.0-flash"
        self.client = None
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key, http_options={'api_version': 'v1alpha'})
            except Exception as e:
                logger.error(f"Failed to initialize Google GenAI Client: {e}")

    def is_configured(self) -> bool:
        return bool(self.api_key and self.client is not None)

    async def generate_conversational_response(
        self,
        candidate_name: str,
        current_question: str,
        candidate_answer: str,
        conversation_history: list
    ) -> Dict[str, Any]:
        """
        Generate dynamic interviewer feedback, follow-up, or transition using Gemini.
        """
        if not self.is_configured():
            return {
                "text": f"Thank you for sharing your thoughts on {current_question[:40]}..., {candidate_name}. Let's explore your practical experience with this further.",
                "follow_up": "Can you give a concrete real-world example of how you implemented that?",
                "is_mock": True,
                "warning": "AI_PROVIDER_API_KEY is not configured in backend environment."
            }

        try:
            prompt = f"""
            Candidate Name: {candidate_name}
            Current Question Asked: "{current_question}"
            Candidate Spoken Answer: "{candidate_answer}"

            Recent Conversation History:
            {json.dumps(conversation_history[-4:] if conversation_history else [])}

            Task:
            As Vignan University's AI Interviewer, formulate your next spoken conversational response.
            - If their answer was strong, acknowledge it and smoothly ask the next question or an advanced nuance.
            - If their answer was incomplete or missing key concepts, ask a targeted follow-up question to help them clarify.
            - Keep your response conversational, concise (2-4 sentences max), and professional.

            Return a JSON object with:
            {{
                "spoken_response": "What you say out loud to the candidate",
                "next_question_or_follow_up": "The core question being posed",
                "interviewer_intent": "probe_deeper | move_next | clarify"
            }}
            """

            response = await asyncio.to_thread(
                self.client.models.generate_content,
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    response_mime_type="application/json",
                    temperature=0.7
                )
            )

            result_json = json.loads(response.text)
            return {
                "text": result_json.get("spoken_response", ""),
                "follow_up": result_json.get("next_question_or_follow_up", ""),
                "intent": result_json.get("interviewer_intent", "move_next"),
                "is_mock": False
            }
        except Exception as e:
            logger.error(f"Gemini API error during interview turn: {str(e)}")
            return {
                "text": f"I see your point regarding {current_question[:30]}... Let's continue forward to our next question.",
                "follow_up": "",
                "intent": "move_next",
                "error": str(e)
            }

ai_voice_interviewer = GeminiVoiceInterviewer()
