DIFFICULTIES = ["Beginner", "Base Knowledge", "Intermediate", "Advanced", "Expert"]
DIFFICULTY_LEVEL = {"B": "Beginner", "K": "Base Knowledge", "I": "Intermediate", 
                   "A": "Advanced", "E": "Expert"}
DIFFICULTY_MAPPING = {'Beginner': 'B', 'Base Knowledge': 'K', 'Intermediate': 'I',
                    'Advanced': 'A', 'Expert': 'E'}
QUESTION_TYPE_CHOICES = ["open", "choice", "multiple_choice", "true_false"]
CODE_DIFFICULTIES = ["Easy", "Medium", "Hard"]

QUESTIONS_PER_LEVEL = 2
MAX_CHUNK_SIZE = 32000

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
8. Please, don't mix question types and questions themselves, for example, if question type is true_false, don't output open-question type answer
9. for choice questions at the end of question (text) output choices like this for example: a) something b) nothing c) anything..., and for answer just output the letter: a, b, c....
10. for multiple choice questions do the same as choice, but in answer output string with commas: a,b,c,....
11. balance question_types, use probability distribution for {difficulty} {distribution}.

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

ANSWER_COMPARISON_TEMPLATE = """
Compare a user's answer with the correct answer and determine if they are semantically equivalent.

Context:
- Correct Answer: {correct_answer}
- User's Answer: {user_answer}

Rules for comparison:
   - Focus on key concepts and main ideas
   - Ignore minor grammatical differences
   - Accept different phrasings that convey the same meaning
   - Be somewhat lenient but ensure core understanding is demonstrated

Determine if the answers are equivalent and respond with:
true/false
"""


CHECK_LANGUAGE_TEMPLATE = """
Check if the course is about some programming language, if it is, return the language name, if not return "None".
For example: if sentence is "Fundamentals of Python" return "Python", 
but if course name is: Data structure and algorithms, nothing more, then "None".
but if it has Data structures with Python, again language will be python


Course name: {course_name}
respond only with:
language name / None
"""

CODE_COMPARISON_TEMPLATE = """
Compare a user's code with the correct code and determine if they are logicallyequivalent.

Context:
- Correct code: {correct_answer}
- User's code: {user_answer}

Rules for comparison:
   - Ignore whitespace and formatting differences
   - Accept different variable names if logic is identical
   - Consider alternative valid implementations
   - Focus on algorithmic correctness and output
   - Be strict about syntax and logic errors
   
Be lenient with language/formatting but strict with core concepts and logic

Determine if the answers are equivalent and respond with Format as JSON with:
user_score, error

Hints:
user score is between 0-100 on how does it similar logic to the real solution, 
but be strict to syntax (if it is error, 0 + "syntax error in this line ...")

error must be like above "syntax error", or just some hint like "logic error in this line ...",
or if everything is correct, then return "none"


OUTPUT FORMAT:
{{
  "user_score: "...",
  "error": "..."
}}
"""



CODE_GENERATION_TEMPLATE = """
Generate {num_codes} {difficulty}-level coding problems in {programming_language} about this material.

Requirements:
1. Problems should test both syntax knowledge and problem-solving ability
2. Format as JSON with: problem_statement, solution, template_code, difficulty
3. Word limits:
   - Problem statement: 30-50 words
   - Solution: actual code implementation
4. Difficulty must be output as it is: Easy|Medium|Hard
5. Template code requirements:
   - Use class/functions with clear "TODO" markers
   - Include all necessary imports
   - Provide clear entry points for implementation
6. Solution must:
   - Use the same structure as template code
   - Be properly formatted and executable
7. Balance problems by difficulty

Material Excerpt:
{chunk}

OUTPUT FORMAT:
{{
  "codes": [
    {{
      "problem_statement": "...",
      "solution": "...",
      "template_code": "...",
      "difficulty": "..."
    }}
  ],
  "continuation_marker": "..."
}}

Example Template for Python:
class Solution:
    #Implement the function below according to the problem statement
    def function_to_implement(self, args):
        # TODO: Implement this function
        pass

Example Solution:
class Solution:
    def function_to_implement(self, a, b):
        return a ** b
"""