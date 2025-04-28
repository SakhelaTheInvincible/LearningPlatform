from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Course(models.Model):
    name = models.CharField(max_length=100, unique=True)
    duration_weeks = models.PositiveSmallIntegerField(
        default=14,
        validators=[MinValueValidator(1), MaxValueValidator(20)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Week(models.Model):
    course = models.ForeignKey(
        Course, 
        on_delete=models.CASCADE, 
        related_name='weeks'
    )
    week_number = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1)]
    )
    material = models.TextField()
    summarized_material = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['course', 'week_number']
        ordering = ['course', 'week_number']
        indexes = [
            models.Index(fields=['course', 'week_number']),
        ]

    def __str__(self):
        return f"Week {self.week_number} of {self.course.name}"

class Question(models.Model):
    DIFFICULTY_CHOICES = [
        ('B', 'Beginner'),
        ('K', 'Base Knowledge'),
        ('I', 'Intermediate'),
        ('A', 'Advanced'),
        ('E', 'Expert')
    ]
    
    QUESTION_TYPE_CHOICES = [
        ('open', 'Open-ended'),
        ('choice', 'Single Choice'),
        ('multiple_choice', 'Multiple Choice')
    ]
    
    week = models.ForeignKey(
        Week, 
        on_delete=models.CASCADE, 
        related_name='questions'
    )
    difficulty = models.CharField(max_length=1, choices=DIFFICULTY_CHOICES)
    question_type = models.CharField(
        max_length=20, 
        choices=QUESTION_TYPE_CHOICES
    )
    question_text = models.TextField()
    answer = models.TextField()
    explanation = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['week', 'difficulty']
        indexes = [
            models.Index(fields=['week', 'difficulty']),
        ]

    def __str__(self):
        return f"{self.get_difficulty_display()} question for Week {self.week.week_number} of {self.week.course.name}"