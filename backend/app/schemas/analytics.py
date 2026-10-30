from pydantic import BaseModel

class SummaryStatsSchema(BaseModel):
    total_violations: int
    no_helmet: int
    invalid_helmet: int
    no_seatbelt: int
    motorcycle_violations: int
    car_violations: int
