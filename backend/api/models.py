from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import AbstractUser
from django.db import transaction
from django.utils.text import slugify
import random
from datetime import datetime, timedelta

class User(AbstractUser):
    profile_picture = models.ImageField(
        upload_to='profile_pics/', blank=True, null=True)
    
    user_exp = models.PositiveSmallIntegerField(default=0)

    def delete(self, *args, **kwargs):
        if self.profile_picture:
            self.profile_picture.delete(save=False)
        super().delete(*args, **kwargs)

    def save(self, *args, **kwargs):
        if self.pk:
            try:
                old_user = User.objects.get(pk=self.pk)
                if old_user.profile_picture and old_user.profile_picture != self.profile_picture:
                    old_user.profile_picture.delete(save=False)
            except User.DoesNotExist:

                pass
        super().save(*args, **kwargs)


    def is_admin(self):
        return self.is_superuser

    def __str__(self) -> str:
        return self.username


class Course(models.Model):
    title = models.CharField(max_length=100)
    title_slug = models.SlugField(unique=True)
    duration_weeks = models.PositiveSmallIntegerField(
        default=14,
        validators=[MinValueValidator(1), MaxValueValidator(20)]
    )
    description = models.TextField(blank=True, null=True)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='users'
    )
    image = models.ImageField(upload_to='courses/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_completed = models.BooleanField(default=False)
    language = models.TextField(default="None")
    
    DIFFICULTY_CHOICES = [
        ('E', 'Easy'),
        ('M', 'Medium'),
        ('H', 'Hard'),
    ]
    
    difficulty = models.CharField(max_length=1, choices=DIFFICULTY_CHOICES, default="E")

    def update_difficulty(self):
        total_word_count = 0
        for week in self.weeks.prefetch_related('materials'):
            for material in week.materials.all():
                if material.summarized_material:
                    total_word_count += len(material.summarized_material.split())
        
        if total_word_count < 2000:
            self.difficulty = 'E'
        elif 2000 <= total_word_count < 10000:
            self.difficulty = 'M'
        else:
            self.difficulty = 'H'
        self.save(update_fields=['difficulty'])

    def delete(self, *args, **kwargs):
        if self.image:
            self.image.delete(save=False)
        super().delete(*args, kwargs)

    def save(self, *args, **kwargs):
        if not self.pk:
            super().save(*args, **kwargs)
            self.title_slug = f'{slugify(self.title)}-{self.pk}'
            return super().save(update_fields=['title_slug'])
        else:
            self.title_slug = f'{slugify(self.title)}-{self.pk}'
            # to prevent recursion from update_difficulty
            if kwargs.get('update_fields') == ['difficulty']:
                return super().save(*args, **kwargs)
            return super().save(update_fields=['title_slug'])

    def __str__(self):
        return self.title_slug



    # def clone_to_user(self, user):
        with transaction.atomic():
            new_course = Course.objects.create(
                user=user,
                title=self.title,
                duration_weeks=self.duration_weeks,
                description=self.description,
                image=self.image,
            )

            for week in self.weeks.all():
                new_week = Week.objects.create(
                    course=new_course,
                    week_number=week.week_number
                )

                for material in week.materials.all():
                    Material.objects.create(
                        title=material.title,
                        description=material.description,
                        material=material.material,
                        summarized_material=material.summarized_material,
                        week=new_week
                    )

                for question in week.questions.all():
                    Question.objects.create(
                        week=new_week,
                        difficulty=question.difficulty,
                        question_type=question.question_type,
                        question_text=question.question_text,
                        answer=question.answer,
                        explanation=question.explanation
                    )

                for quiz in week.quizzes.all():
                    Quiz.objects.create(
                        week=new_week,
                        difficulty=quiz.difficulty,
                        user_score=0,
                        questions=quiz.questions.all()
                    )

                for code in week.codes.all():
                    Code.objects.create(
                        week=new_week,
                        difficulty=code.difficulty,
                        user_score=0,
                        problem_statement=code.problem_statement,
                        solution=code.solution,
                        template_code=code.template_code
                    )

            return new_course


class Week(models.Model):

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='weeks'
    )
    week_number = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ['course', 'week_number']
        ordering = ['course', 'week_number']
        indexes = [
            models.Index(fields=['course', 'week_number']),
        ]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        incomplete_weeks = self.course.weeks.filter(is_completed=False).count()
        self.course.is_completed = (incomplete_weeks == 0)
        self.course.save()

    def __str__(self):
        return f"Week {self.week_number} of {self.course.title}"


class Material(models.Model):
    title = models.CharField(max_length=50)
    description = models.TextField()
    material = models.TextField()  # this is extracted text for ai client
    summarized_material = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_read = models.BooleanField(default=False)
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

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.week.save()


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
        ('multiple_choice', 'Multiple Choice'),
        ('true_false', 'True or False')
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
        return f"{self.get_difficulty_display()} question for Week {self.week.week_number} of {self.week.course.title}"


class Quiz(models.Model):
    DIFFICULTY_LEVEL_CHOICES = [
        ('N', 'Normal'),
        ('M', 'Medium'),
        ('S', 'Standard'),
        ('I', 'Intermediate'),
        ('A', 'Advanced'),
    ]

    PASSING_THRESHOLD = [
        ('N', 80),
        ('M', 75),
        ('S', 70),
        ('I', 65),
        ('A', 55),
    ]

    week = models.ForeignKey(
        Week,
        on_delete=models.CASCADE,
        related_name='quizzes'
    )
    passing_requirement = models.CharField(
        max_length=1,
        choices=PASSING_THRESHOLD,
        default='S'
    )

    difficulty = models.CharField(
        max_length=1,
        choices=DIFFICULTY_LEVEL_CHOICES,
        default='S'
    )
    user_score = models.PositiveSmallIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Quizzes'
        ordering = ['week', '-created_at']

    def __str__(self):
        return f"Quiz for Week {self.week.week_number} ({self.get_difficulty_display()}) for {self.week.course}"

    def get_questions(self):
        """Get questions for this quiz based on difficulty distribution"""
        # Get all questions for this week
        week_questions = Question.objects.filter(week=self.week)
        total_questions = week_questions.count()

        # If we don't have enough questions, return what we have
        if total_questions < 10:
            return list(week_questions)

        # Determine how many questions to select (min 10 or 1/3 of total)
        num_questions = max(10, total_questions // 3)
        
        # Get difficulty distribution based on quiz difficulty
        distribution = self.get_difficulty_distribution()
        selected_questions = []

        # Use a combination of quiz ID and current timestamp for better randomization
        random.seed(self.id + int(datetime.now().timestamp()))

        for diff_code, percentage in distribution.items():
            count = max(1, round(num_questions * percentage / 100))
            questions = list(week_questions.filter(difficulty=diff_code))
            
            # If not enough questions of this difficulty, take what's available
            count = min(count, len(questions))
            
            if count > 0:
                selected = random.sample(questions, count)
                selected_questions.extend(selected)

        # If we didn't get enough questions, fill with random ones
        if len(selected_questions) < num_questions:
            remaining = num_questions - len(selected_questions)
            remaining_questions = list(set(week_questions) - set(selected_questions))
            if remaining_questions:
                selected_questions.extend(
                    random.sample(remaining_questions, min(remaining, len(remaining_questions)))
                )

        # Shuffle the final list of questions
        random.shuffle(selected_questions)

        # Reset the random seed
        random.seed()

        return selected_questions

    def get_difficulty_distribution(self):
        distributions = {
            'N': {'B': 40, 'K': 30, 'I': 15, 'A': 10, 'E': 5},    # Normal
            'M': {'B': 10, 'K': 40, 'I': 30, 'A': 10, 'E': 5},    # Medium
            'S': {'B': 10, 'K': 35, 'I': 30, 'A': 15, 'E': 10},    # Standard
            'I': {'B': 5, 'K': 25, 'I': 30, 'A': 25, 'E': 15},     # Intermediate
            'A': {'B': 5, 'K': 15, 'I': 30, 'A': 30, 'E': 20},     # Advanced
        }
        return distributions.get(self.difficulty, distributions['S'])


class Code(models.Model):
    DIFFICULTY_LEVEL_CHOICES = [
        ('E', 'Easy'),
        ('M', 'Medium'),
        ('H', 'Hard'),
    ]
    week = models.ForeignKey(
        Week,
        on_delete=models.CASCADE,
        related_name='codes'
    )
    difficulty = models.CharField(
        max_length=1,
        choices=DIFFICULTY_LEVEL_CHOICES,
        default='M'
    )

    problem_statement = models.TextField()
    solution = models.TextField()
    template_code = models.TextField()
    user_code = models.TextField(default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user_score = models.PositiveSmallIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
