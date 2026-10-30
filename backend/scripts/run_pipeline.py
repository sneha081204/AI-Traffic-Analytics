import argparse
import sys
from pathlib import Path

# Ensure project root directory is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))


from ai_engine.pipeline import TrafficAnalyticsPipeline
from backend.app.core.config import settings

def main():
    parser = argparse.ArgumentParser(description="AI Traffic Analytics CLI Pipeline")
    parser.add_argument("--video", type=str, default=None, help="Path to traffic video file")
    parser.add_argument("--location", type=str, default="Sector 4 - Traffic Junction A", help="Camera location name")
    args = parser.parse_args()

    video_path = args.video
    if not video_path:
        sample_path = settings.BASE_DIR / "data" / "sample_videos" / "traffic_sample.mp4"
        if sample_path.exists():
            video_path = str(sample_path)
        else:
            print(f"Error: No video path provided and default '{sample_path}' does not exist.")
            print("Usage: python run_pipeline.py --video path/to/video.mp4")
            sys.exit(1)

    print("\n" + "="*70)
    print(f"[*] LAUNCHING AI TRAFFIC ANALYTICS PIPELINE")
    print(f"[*] Source Video: {video_path}")
    print(f"[*] Location:     {args.location}")
    print("="*70 + "\n")

    pipeline = TrafficAnalyticsPipeline(location=args.location)
    pipeline.process_video(video_source=video_path)
    print("\n[SUCCESS] Processing finished! View violation records at http://localhost:5000\n")

if __name__ == '__main__':
    main()
