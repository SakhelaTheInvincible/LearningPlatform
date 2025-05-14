from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Course

User = get_user_model()

@receiver(post_save, sender=User)
def clone_admin_courses_to_new_user(sender, instance, created, **kwargs):
    """
    Signal handler to clone admin courses to new users upon registration.
    """
    if not created:
        return
    
    try:
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            return
        
        for course in admin_user.courses:
            course.clone_to_user(instance)
            
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to clone admin courses to new user {instance}: {str(e)}")