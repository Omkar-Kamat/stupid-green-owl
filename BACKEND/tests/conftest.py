import pytest
from pathlib import Path
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import get_db
from app.models.base import Base

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
ALEMBIC_INI = Path(__file__).resolve().parent.parent / "alembic.ini"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def _apply_migrations() -> None:
    Base.metadata.drop_all(bind=engine)
    with engine.begin() as connection:
        connection.execute(text("DROP TABLE IF EXISTS alembic_version"))
    cfg = Config(str(ALEMBIC_INI))
    cfg.set_main_option("sqlalchemy.url", SQLALCHEMY_DATABASE_URL)
    with engine.connect() as connection:
        cfg.attributes["connection"] = connection
        command.upgrade(cfg, "head")
        connection.commit()


@pytest.fixture(scope="function")
def db():
    _apply_migrations()
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    del app.dependency_overrides[get_db]

@pytest.fixture(scope="function")
def concurrent_client(db):
    """Factory for TestClient instances that open a fresh DB session per request."""

    def override_get_db():
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db

    def factory() -> TestClient:
        return TestClient(app)

    yield factory
    del app.dependency_overrides[get_db]
