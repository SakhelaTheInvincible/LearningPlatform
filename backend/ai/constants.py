DIFFICULTIES = ["Beginner", "Base Knowledge", "Intermediate", "Advanced", "Expert"]
DIFFICULTY_LEVEL = {"B": "Beginner", "K": "Base Knowledge", "I": "Intermediate", 
                   "A": "Advanced", "E": "Expert"}
DIFFICULTY_MAPPING = {'Beginner': 'B', 'Base Knowledge': 'K', 'Intermediate': 'I',
                    'Advanced': 'A', 'Expert': 'E'}
QUESTION_TYPE_CHOICES = ["open", "choice", "multiple_choice", "true_false", "coding"]

QUESTIONS_PER_LEVEL = 2
MAX_CHUNK_SIZE = 32000

# Prompt Templates
SUMMARY_TEMPLATE = """
Create a simplified version of this material using plain language while preserving all key concepts.
Rules:
1. Keep technical terms but explain them simply
2. Target high school reading level
3. Maintain original structure
4. Output should be 40-60% of the input
5. End with a clear transition sentence for context continuity

Material:
{chunk}
"""

QUESTION_GEN_TEMPLATE = """
Generate {num_questions} {difficulty}-level questions about this material.

Requirements:
1. Include these question types: {question_types}
2. Test both factual recall and conceptual understanding
3. Format as JSON with: question, answer, explanation, type, difficulty
4. Word limits:
   - Question: 15-25 words
   - Answer: 20-30 words
   - Explanation: 30-50 words
5. Difficulty must be outputed as it is: Beginner|Base Knowledge|Intermediate|Advanced|Expert
6. Choice means only 1 correct answer, multiple_choice means minimum 2 correct answers
7. Coding question is Optional, only include this type if a provided material focuses on the programming language, 
  for example python or etc. Also the question must be just description of problem, answer should be formatted code snippet
  and explanation just a description of how the code works and why is it the answer
8. Please, don't mix question types and questions themselves, for example, if question type is true_false, don't output open-question type answer

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