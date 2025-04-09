DIFFICULTIES = [
  "Beginner",
  "Base Knowledge",
  "Intermediate",
  "Advanced",
  "Expert"
]

DIFFICULTY_LEVEL = {
  "Beginner" : "B",
  "Base Knowledge" : "K",
  "Intermediate" : "I",
  "Advanced" : "A",
  "Expert" : "E"
}

QUESTION_GEN_TEMPLATE = """
Generate {num_questions} questions about "{subject}" at {difficulty} level.
Return strictly as JSON with keys: "question", "answer", "explanation".

Example:
{{
  "question": "What is a variable?",
  "answer": "A named storage location",
  "explanation": "Variables hold data..."
}}

Subject: {subject}
Difficulty: {difficulty}
Number of questions: {num_questions}

OUTPUT ONLY RAW JSON (no markdown formatting):
[{{"question": "...", ...}}, ...]

ALSO LIMIT WORD COUNT TO 20-30 WORDS PER QUESTION, ANSWER and 40-60 FOR EXPLENATION
"""