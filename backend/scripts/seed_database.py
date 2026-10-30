import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.app.main import create_app
from backend.app.core.database import db
from backend.app.repositories.traffic_repository import TrafficRepository
from backend.app.repositories.user_repository import UserRepository
from backend.app.core.security import hash_password
from ai_engine.evidence.evidence_builder import EvidenceBuilder
import numpy as np

def seed_database():
    app = create_app()
    with app.app_context():
        db.create_all()
        print("[*] Database tables verified.")

        # Seed admin officer if not exists
        if not UserRepository.get_by_username("admin"):
            UserRepository.create_user(
                username="admin",
                email="admin@traffic.gov",
                hashed_password=hash_password("admin123"),
                role="admin"
            )
            print("[+] Seeded default admin officer: username='admin', password='admin123'")

        # Seed verified sample evidence if empty
        if TrafficRepository.get_stats()['total_violations'] == 0:
            builder = EvidenceBuilder()
            dummy_frame = np.zeros((720, 1280, 3), dtype=np.uint8)
            dummy_frame[:] = (40, 45, 50)

            # Sample 1: No Helmet
            ev1, d1, t1 = builder.generate_evidence_image(
                frame=dummy_frame,
                vehicle_track_id=101,
                vehicle_type="motorcycle",
                vehicle_box=[350, 280, 520, 500],
                violation_type="No Helmet",
                violation_box=[400, 250, 480, 330],
                plate_text="KA05MN4821",
                plate_box=[380, 440, 490, 480],
                confidence=0.94,
                location="Junction 04 - North Highway"
            )
            TrafficRepository.create_violation(
                vehicle_track_id=101,
                vehicle_type="motorcycle",
                vehicle_number="KA05MN4821",
                violation_type="No Helmet",
                helmet_type="No helmet",
                confidence=0.94,
                date_str=d1,
                time_str=t1,
                location="Junction 04 - North Highway",
                evidence_image=ev1,
                vehicle_make_model="Honda Activa 6G",
                vehicle_color="Matte Black",
                violation_details="Rider observed operating two-wheeler on public highway with exposed head and no protective helmet shell or chin fastener."
            )

            # Sample 2: No Seatbelt
            ev2, d2, t2 = builder.generate_evidence_image(
                frame=dummy_frame,
                vehicle_track_id=102,
                vehicle_type="car",
                vehicle_box=[600, 300, 950, 580],
                violation_type="No Seatbelt",
                violation_box=[700, 330, 820, 450],
                plate_text="DL08CY1994",
                plate_box=[680, 510, 860, 560],
                confidence=0.91,
                location="Junction 04 - North Highway"
            )
            TrafficRepository.create_violation(
                vehicle_track_id=102,
                vehicle_type="car",
                vehicle_number="DL08CY1994",
                violation_type="No Seatbelt",
                helmet_type="N/A",
                confidence=0.91,
                date_str=d2,
                time_str=t2,
                location="Junction 04 - North Highway",
                evidence_image=ev2,
                vehicle_make_model="Maruti Suzuki Swift",
                vehicle_color="Pearl Arctic White",
                violation_details="Driver observed operating four-wheeler without mandatory diagonal shoulder safety restraint harness engaged."
            )
            print("[+] Seeded 2 verified e-Challan evidence packages.")

        print("[SUCCESS] Database seeding complete.")

if __name__ == '__main__':
    seed_database()
