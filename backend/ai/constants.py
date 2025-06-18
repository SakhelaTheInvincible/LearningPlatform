DIFFICULTIES = ["Beginner", "Base Knowledge", "Intermediate", "Advanced", "Expert"]
DIFFICULTY_LEVEL = {"B": "Beginner", "K": "Base Knowledge", "I": "Intermediate", 
                   "A": "Advanced", "E": "Expert"}
DIFFICULTY_MAPPING = {'Beginner': 'B', 'Base Knowledge': 'K', 'Intermediate': 'I',
                    'Advanced': 'A', 'Expert': 'E'}
QUESTION_TYPE_CHOICES = ["open", "choice", "multiple_choice", "true_false"]
CODE_DIFFICULTIES = ["E", "M", "H"]  # Easy, Medium, Hard

QUESTIONS_PER_LEVEL = 2
MAX_CHUNK_SIZE = 4000

DISTRIBUTIONS = {
   'Beginner': {'true_false': 40, 'choice': 30, 'multiple_choice': 20, 'open': 10},
   'Base Knowledge': {'true_false': 30, 'choice': 35, 'multiple_choice': 25, 'open': 10},
   'Intermediate': {'true_false': 20, 'choice': 30, 'multiple_choice': 35, 'open': 15},
   'Advanced': {'true_false': 20, 'choice': 20, 'multiple_choice': 30, 'open': 30},
   'Expert': {'true_false': 10, 'choice': 10, 'multiple_choice': 40, 'open': 40},
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
13. For each difficulty, use distributions of question types as in percentages distribution: {distributions}

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
Compare a user's code solution with the expected solution, using the problem statement as the primary evaluation guide.

Context:
- Problem Statement: {problem_statement}
- Programming Language: {programming_language}
- Expected Solution: {solution}
- User's Solution: {user_solution}

Rules for comparison:
1. Evaluate if the user's solution satisfies the requirements specified in the problem statement
2. Check if the solution follows the programming language's best practices and conventions
3. Consider alternative valid approaches that may differ from the expected solution but still solve the problem
4. Verify that the solution:
   - Handles the core problem requirements
   - Uses appropriate data structures and algorithms
   - Has correct logic and flow
   - Produces the expected output
5. Ignore differences in:
   - Variable/function naming (unless specified in requirements)
   - Code formatting and style
   - Implementation details that don't affect functionality
6. Be lenient with alternative valid solutions that demonstrate understanding

Scoring Criteria:
- 100: Perfect solution that meets all requirements
- 90-99: Minor improvements needed (edge cases, optimizations)
- 70-89: Good approach but has some issues
- 50-69: Correct basic logic but significant issues
- 30-49: Partial understanding, major issues
- 1-29: Significant problems, but shows some attempt
- 0: Syntax errors, runtime errors, or completely incorrect

Output Format:
Return the score and detailed hint separated by a pipe character (|)

Hint:
Scoring should only matter in #TODO-s, if there is no implementation in todo functions, then user scores 0
(evaluations must be in todo functions too). Also pay attention to syntax and runtime errors first, and then other issues.

Example outputs:
0|Syntax Error: Missing closing bracket in function definition
0|Runtime Error: Division by zero in line 15
100|Perfect solution! Code is efficient and handles all edge cases
95|Excellent solution! Consider optimizing the loop in lines 20-25
85|Good solution! Missing handling for negative numbers in the input
75|Correct approach but inefficient. Consider using a hash map instead of nested loops
50|Basic logic is correct but has several issues:
  - Missing input validation
  - Incorrect loop condition in line 12
  - Doesn't handle empty input case
30|Shows understanding of the problem but implementation has major flaws:
  - Incorrect algorithm choice
  - Missing core functionality
  - Runtime Errors
0|Solution doesn't address the problem requirements, Or Syntax Error

Please provide both the score (0-100) and a specific, detailed hint about the solution
"""

CODE_GENERATION_TEMPLATE = """
Generate {num_codes} coding challenges for each difficulty level: {difficulties} for {programming_language}.

(E difficulty means Easy, M difficulty means Medium, H difficulty means Hard)

Requirements:
1. Each challenge must be practical and testable
2. Include edge cases and error handling
3. Focus on real-world applications
5. Strictly generate {num_codes} challenges for each difficulty level

Format each challenge as:
Problem Statement: [Clear, specific task]
Solution: [Complete, working code]
Template: [Starter code with TODO]
Difficulty: [One of: {difficulties}]

(Output difficulty onlt as it is: E|M|H)

Separate challenges with '=============='

Material Context:
{chunk}

Example:
Problem Statement: Implement a function to validate email addresses
Solution:
Class Solution:
   def validate_email(self, email):
      import re
      pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
      return bool(re.match(pattern, email))
Template:
Class Solution:
   def validate_email(self, email):
      # TODO: Implement email validation
      pass
Difficulty: E
==============
"""

CODE_SUMMARY_TEMPLATE = """
Create a programming-focused summary for {language} challenges.
Extract:
1. Core Concepts
   - Key algorithms
   - Data structures
   - Design patterns
   - Language-specific features

2. Implementation Patterns
   - Common solutions
   - Best practices
   - Error handling
   - Performance considerations

3. Challenge Opportunities
   - Practical applications
   - Problem scenarios
   - Testing scenarios
   - Edge cases

Keep summary focused and actionable.
Target length: 20-30% of original.

Material:
{chunk}
"""
