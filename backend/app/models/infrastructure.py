from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class DistrictInfrastructureBaseline(Base):
    __tablename__ = "district_infrastructure_baseline"

    id = Column(Integer, primary_key=True, autoincrement=True)
    state = Column(String(50), nullable=False)
    district = Column(String(50), nullable=False, unique=True)
    population_total = Column(Integer, nullable=False)
    vulnerability_index = Column(Float, nullable=False) # 0.0 to 1.0

    # Sector infrastructure deficit ratings (0-100, where 100 = extreme deficit)
    infra_gap_water = Column(Float, nullable=False, default=50.0)
    infra_gap_roads = Column(Float, nullable=False, default=50.0)
    infra_gap_electricity = Column(Float, nullable=False, default=50.0)
    infra_gap_health = Column(Float, nullable=False, default=50.0)
    infra_gap_education = Column(Float, nullable=False, default=50.0)

    # Sector historical investment / capex deficit (0-100, where 100 = severe underfunding)
    investment_gap_water = Column(Float, nullable=False, default=50.0)
    investment_gap_roads = Column(Float, nullable=False, default=50.0)
    investment_gap_electricity = Column(Float, nullable=False, default=50.0)
    investment_gap_health = Column(Float, nullable=False, default=50.0)
    investment_gap_education = Column(Float, nullable=False, default=50.0)

    center_lat = Column(Float, nullable=True)
    center_lng = Column(Float, nullable=True)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
