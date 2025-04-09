from django.db import models
from django.contrib.postgres.fields import JSONField

class Course(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Question(models.Model):
    DIFFICULTY_CHOICES = [
        ('B', 'Beginner'),
        ('K', 'Base Knowledge'),
        ('I', 'Intermediate'),
        ('A', 'Advanced'),
        ('E', 'Expert')
    ]
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='questions')
    difficulty = models.CharField(max_length=1, choices=DIFFICULTY_CHOICES)
    question_text = models.TextField()
    answer = models.TextField()
    explanation = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['course', 'difficulty']
        indexes = [
            models.Index(fields=['course', 'difficulty']),
        ]

    def __str__(self):
        return f"{self.get_difficulty_display()} question for {self.course.name}"