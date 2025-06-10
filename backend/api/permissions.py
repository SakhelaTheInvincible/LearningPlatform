from rest_framework import permissions


class IsCourseOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of a course to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions are only allowed to the owner
        return obj.user == request.user


class IsWeekOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of a course to edit its weeks.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions are only allowed to the course owner
        return obj.course.user == request.user


class IsMaterialOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of a course to edit its materials.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions are only allowed to the course owner
        return obj.week.course.user == request.user


class IsQuizOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of a course to edit its quizzes.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions are only allowed to the course owner
        return obj.week.course.user == request.user
