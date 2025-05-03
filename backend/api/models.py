from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import AbstractUser



class User(AbstractUser):
    USER_TYPES = [
        ('student', 'Student'),
        ('professor', 'Professor'),
        ('admin', 'Admin'),
    ]
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='student')
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)

    
    def is_professor(self):
        return self.user_type == 'professor'
        
    def is_student(self):
        return self.user_type == 'student'
    
    def is_admin(self):
        return self.user_type == 'admin' or self.is_superuser
    def __str__(self) -> str:
        return  self.username

class Course(models.Model):
    title = models.CharField(max_length=100, unique=True)
    duration_weeks = models.PositiveSmallIntegerField(
        default=14,
        validators=[MinValueValidator(1), MaxValueValidator(20)]
    )
    description = models.TextField()

    level = models.CharField(max_length=50)
    estimated_time = models.PositiveIntegerField()
    image = models.ImageField(upload_to='courses/',blank=True,null=True)
    professor = models.ForeignKey(
        User,  
        on_delete=models.CASCADE,
        related_name='taught_courses',  # Changed from 'courses' to 'taught_courses'
        limit_choices_to={'user_type__in': ['professor','admin']} 
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']
        indexes = [
            models.Index(fields=['title']),
        ]
        
    def __str__(self):
        return self.title
    

class Week(models.Model):
    
    course = models.ForeignKey(
        Course, 
        on_delete=models.CASCADE, 
        related_name='weeks'
    )
    week_number = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1)]
    )
    professor = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='taught_weeks',  # Changed from 'courses' to 'taught_weeks'
        limit_choices_to={'user_type': 'professor'}  # Only professors can be selected
    )    ## 1 or 2 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['course', 'week_number']
        ordering = ['course', 'week_number']
        indexes = [
            models.Index(fields=['course', 'week_number']),
        ]
    
    def __str__(self):
        return f"Week {self.week_number} of {self.course.title}"

class Material(models.Model):
    title = models.CharField(max_length=50)
    description = models.TextField()
    material = models.TextField() ## this is extracted text for ai client 
    summarized_material = models.TextField() 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    week = models.ForeignKey(
        Week,
        on_delete=models.CASCADE,
        related_name='materials'
        ) 
    class Meta:
        ordering = ['week', 'title']
        indexes = [
            models.Index(fields=['week', 'title']),
        ]

    def __str__(self):
        return f"{self.title} - Week {self.week.week_number} ({self.week.course.title})"

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
    @property
    def __str__(self):
        return f"{self.get_difficulty_display()} question for Week {self.week.week_number} of {self.week.course.name}"



