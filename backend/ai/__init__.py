from .client import get_ai_client
from .services import generate_material_summary, generate_questions_for_week, compare_open_answers, compare_coding_answers, generate_coding_problems_for_week

__all__ = [
    'generate_material_summary',
    'generate_questions_for_week',
    'compare_open_answers',
    'compare_coding_answers',
    'generate_coding_problems_for_week'
]