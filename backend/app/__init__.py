"""
Traffic AI Backend Package.
Provides application factory and core services.
"""
def create_app(*args, **kwargs):
    from backend.app.main import create_app as _create_app
    return _create_app(*args, **kwargs)

__all__ = ["create_app"]

