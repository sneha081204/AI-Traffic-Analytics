import cv2
import numpy as np
from pathlib import Path

def generate_synthetic_traffic_clip(output_path, num_frames=180, width=1280, height=720):
    """
    Generates a realistic synthetic traffic simulation video with moving cars and motorcycles,
    allowing end-to-end testing of detection, tracking, violation detection, and evidence logging.
    """
    output_dir = Path(output_path).parent
    output_dir.mkdir(parents=True, exist_ok=True)

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(str(output_path), fourcc, 30.0, (width, height))

    print(f"Generating synthetic traffic video ({num_frames} frames) -> {output_path}...")

    # Road coordinates
    road_top = int(height * 0.35)
    road_bottom = int(height * 0.95)

    for i in range(num_frames):
        # Background: asphalt road & highway surroundings
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        frame[:] = (35, 45, 40) # Greenish roadside grass
        
        # Draw road
        cv2.rectangle(frame, (0, road_top), (width, road_bottom), (50, 50, 55), -1)
        
        # Lane divider dashes
        lane_y = (road_top + road_bottom) // 2
        for x in range(0, width, 80):
            cv2.line(frame, (x, lane_y), (x + 40, lane_y), (255, 255, 255), 3)

        # Vehicle 1: Motorcycle with rider (No Helmet) moving left to right
        m_x = int(50 + (i * 6.5)) % (width + 200) - 100
        m_y = lane_y - 80
        if -50 <= m_x <= width + 50:
            # Motorcycle body
            cv2.rectangle(frame, (m_x, m_y + 40), (m_x + 90, m_y + 80), (30, 30, 200), -1)
            cv2.circle(frame, (m_x + 15, m_y + 80), 16, (15, 15, 15), -1)
            cv2.circle(frame, (m_x + 75, m_y + 80), 16, (15, 15, 15), -1)
            # Rider body
            cv2.rectangle(frame, (m_x + 30, m_y), (m_x + 65, m_y + 45), (180, 100, 50), -1)
            # Rider head with exposed skin / hair (No helmet)
            cv2.circle(frame, (m_x + 48, m_y - 12), 14, (120, 160, 220), -1) # Skin tone
            # Number plate at rear
            cv2.rectangle(frame, (m_x - 10, m_y + 55), (m_x + 10, m_y + 75), (240, 240, 240), -1)
            cv2.putText(frame, "KA05", (m_x - 8, m_y + 70), cv2.FONT_HERSHEY_SIMPLEX, 0.25, (0, 0, 0), 1)

        # Vehicle 2: Car (No Seatbelt) moving right to left
        c_x = int(width + 100 - (i * 5.5)) % (width + 300) - 150
        c_y = lane_y + 40
        if -100 <= c_x <= width + 100:
            # Car body
            cv2.rectangle(frame, (c_x, c_y), (c_x + 180, c_y + 85), (20, 80, 180), -1)
            # Windshield
            cv2.rectangle(frame, (c_x + 30, c_y - 30), (c_x + 140, c_y), (140, 180, 200), -1)
            # Driver inside windshield (Torso without seatbelt)
            cv2.circle(frame, (c_x + 100, c_y - 15), 10, (120, 160, 220), -1)
            cv2.rectangle(frame, (c_x + 88, c_y - 5), (c_x + 115, c_y + 20), (220, 220, 220), -1) # Plain white shirt
            # Number plate on front bumper
            cv2.rectangle(frame, (c_x - 5, c_y + 45), (c_x + 25, c_y + 70), (240, 240, 240), -1)
            cv2.putText(frame, "DL08", (c_x - 2, c_y + 62), cv2.FONT_HERSHEY_SIMPLEX, 0.25, (0, 0, 0), 1)

        out.write(frame)

    out.release()
    print(f"[+] Generated sample video at: {output_path}")

if __name__ == '__main__':
    dest = Path(__file__).resolve().parent.parent.parent / "data" / "sample_videos" / "traffic_sample.mp4"
    generate_synthetic_traffic_clip(dest)


