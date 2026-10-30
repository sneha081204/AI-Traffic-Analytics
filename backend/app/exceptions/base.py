class AppException(Exception):
    """Base Application Exception"""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404)

class ValidationException(AppException):
    def __init__(self, message: str = "Validation error"):
        super().__init__(message, status_code=422)

class UnauthorizedException(AppException):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, status_code=401)
