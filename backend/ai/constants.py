DIFFICULTIES = ["Beginner", "Base Knowledge", "Intermediate", "Advanced", "Expert"]
DIFFICULTY_LEVEL = {"B": "Beginner", "K": "Base Knowledge", "I": "Intermediate", 
                   "A": "Advanced", "E": "Expert"}
DIFFICULTY_MAPPING = {'Beginner': 'B', 'Base Knowledge': 'K', 'Intermediate': 'I',
                    'Advanced': 'A', 'Expert': 'E'}


QUESTIONS_PER_LEVEL = 2
MAX_CHUNK_SIZE = 32000

# Prompt Templates
SUMMARY_TEMPLATE = """
Create a simplified version of this material using plain language while preserving all key concepts.
Rules:
1. Keep technical terms but explain them simply
2. Target high school reading level
3. Maintain original structure
4. Output should be 30-50% shorter than input
5. End with a clear transition sentence for context continuity

Material:
{chunk}
"""

QUESTION_GEN_TEMPLATE = """
Generate {num_questions} {difficulty}-level questions about this material.
Context: {context_hint}

Requirements:
1. Include these question types: 40% choice, 30% open_ended, 30% multiple_choice
2. Test both factual recall and conceptual understanding
3. Format as JSON with: question, answer, explanation, type, difficulty
4. Word limits:
   - Question: 15-25 words
   - Answer: 20-30 words
   - Explanation: 30-50 words
5. difficulty must be outputed as it is: Beginner|Base Knowledge|Intermediate|Advanced|Expert

Material Excerpt:
{chunk}

OUTPUT FORMAT:
{{
  "questions": [
    {{
      "question": "...",
      "answer": "...",
      "explanation": "...",
      "type": "...",
      "difficulty": "..."
    }}
  ],
  "continuation_marker": "..."
}}
"""