_shared_inference_engine = None

class InferenceEngine:
    """High-Throughput Vision Stream Inference Pipeline with shared model caching."""
    def __init__(self, location: str = "Junction 04 - Smart Highway"):
        self.location = location
        self.pipeline = TrafficAnalyticsPipeline(location=location)

    def process(self, video_source, frame_callback=None, status_callback=None):
        self.pipeline.location = self.location
        return self.pipeline.process_video(
            video_source=video_source,
            frame_callback=frame_callback,
            status_callback=status_callback
        )

def get_shared_inference_engine(location: str = "Junction 04 - Smart Highway"):
    """Singleton getter to reuse pre-initialized pipeline and neural weights across API calls."""
    global _shared_inference_engine
    if _shared_inference_engine is None:
        _shared_inference_engine = InferenceEngine(location=location)
    else:
        _shared_inference_engine.location = location
    return _shared_inference_engine
