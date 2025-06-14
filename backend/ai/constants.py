DIFFICULTIES = ["Beginner", "Base Knowledge", "Intermediate", "Advanced", "Expert"]
DIFFICULTY_LEVEL = {"B": "Beginner", "K": "Base Knowledge", "I": "Intermediate", 
                   "A": "Advanced", "E": "Expert"}
DIFFICULTY_MAPPING = {'Beginner': 'B', 'Base Knowledge': 'K', 'Intermediate': 'I',
                    'Advanced': 'A', 'Expert': 'E'}
QUESTION_TYPE_CHOICES = ["open", "choice", "multiple_choice", "true_false"]
CODE_DIFFICULTIES = ["Easy", "Medium", "Hard"]

QUESTIONS_PER_LEVEL = 2
MAX_CHUNK_SIZE = 4000

DISTRIBUTIONS = {
          'B': {'true_false': 40, 'choice': 30, 'multiple_choice': 20, 'open': 10},
          'K': {'true_false': 30, 'choice': 35, 'multiple_choice': 25, 'open': 10},
          'I': {'true_false': 20, 'choice': 30, 'multiple_choice': 35, 'open': 15},
          'A': {'true_false': 20, 'choice': 20, 'multiple_choice': 30, 'open': 30},
          'E': {'true_false': 10, 'choice': 10, 'multiple_choice': 40, 'open': 40},
      }

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
Generate exactly {num_questions} number of questions about this material for each difficulty level: {difficulties}. 
so if num_questions is 2, for each difficulty level, generate 2 questions. (precisely)

Format each question as line with | separator:
QUESTION|ANSWER|EXPLANATION|TYPE|DIFFICULTY

Requirements:
1. Include these question types: {question_types}
2. Test both factual recall and conceptual understanding
3. Word limits:
   - Question: 15-25 words
   - Answer: 20-30 words
   - Explanation: 30-50 words
4. For choice questions: Format as "Q: What is X? a) A b) B c) C" with answer "a"
5. For multiple_choice: Same as choice but answer like "a,c"
6. For true_false: Answer must be "True" or "False"
7. The 'DIFFICULTY' field must be one of: {difficulties}
8. Each question should be seperated by line
9. Please be flexible with the question types (do not just generate open questions)
10. Also, do not include "**" or some characters like Q:, or 1: or etc.. or question type (for examle "True or False:" before the question), just text
Please, pay good attention to the step 10 (others too).
11. Generate unique questions. Do not repeat questions across different difficulty levels.
12. Do not include questions which cannot be answered with the given material. Also in formulas don't forget ending, for example O(n) must include brackets

example output:
What is the capital of France?|Paris|Paris is the capital of France|open|Beginner
What is the capital of Georgia? a) Kutaisi b) Batumi c) Tbilisi|c|Tbilisi is the capital of Georgia|choice|Intermediate

Material Excerpt:
{chunk}
"""

ANSWER_COMPARISON_TEMPLATE = """
Compare a user's answer with the correct answer and determine if they are semantically equivalent.

Context:
- Correct Answer: {answer}
- User's Answer: {user_answer}

Rules for comparison:
   - Focus on key concepts and main ideas
   - Ignore minor grammatical differences
   - Accept different phrasings that convey the same meaning
   - Be somewhat lenient but ensure core understanding is demonstrated

Please only return true or false, nothing more (all lowercase)
"""

CODE_COMPARISON_TEMPLATE = """
Compare a user's code with the correct code and determine if they are logically equivalent.

Context:
- Programming language: {programming_language}
- Correct code: {correct_answer}
- User's code: {user_answer}

Rules for comparison:
   - Ignore whitespace and formatting differences
   - Accept different variable names if logic is identical
   - Consider alternative valid implementations
   - Focus on algorithmic correctness and output
   
Be lenient with language/formatting but strict with core concepts and logic

Hints:
user score is between 0-100 on how does it similar logic to the real solution, 


OUTPUT FORMAT:
   return only user score (number between 0-100), nothing else (strictly nothing else)
"""

CODE_GENERATION_TEMPLATE = """
Generate {num_codes} coding challenges for each of these difficulty levels: {difficulties}.
The challenges should be based on the following material and programming language: {programming_language}.
Focus on practical applications of the concepts.

For each challenge, provide the following, with each field on a new line:
1. Problem Statement: [The problem description]
2. Solution: [The full solution code]
3. Template: [The boilerplate code for the user]
4. Difficulty: [One of: {difficulties}]

Separate each complete challenge block with a line containing only '=============='.

Material:
{chunk}

Example format:
Problem Statement: Write a function to add two numbers.
Solution: 
   def add(a, b):
      return a + b
Template: 
Solution: 
   # function to implement
   def add(a, b):
      # todo
      raise NotImplementedError("Not implemented")
  
Difficulty: Easy
==============
Problem Statement: Write a function to subtract two numbers.
Solution: 
   def sub(a, b):
      return a - b
Template:
Solution: 
   # function to implement
   def sub(a, b):
      # todo
      raise NotImplementedError("Not implemented")
Difficulty: Easy
"""