from abc import ABC, abstractmethod

class BaseDetector(ABC):
    """Abstract Base Class for AI Object Detectors."""

    @abstractmethod
    def load_model(self):
        """Loads model weights onto device."""
        pass

    @abstractmethod
    def detect(self, image):
        """Performs inference on image frame and returns standardized detection dicts."""
        pass
