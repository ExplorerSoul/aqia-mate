from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import os


# Render and Neon both provide DATABASE_URL starting with "postgres://"
# SQLAlchemy 2.x requires "postgresql://" — fix it transparently.
# Neon sometimes uses sslmode=req — psycopg2 needs sslmode=require.
_raw_url = os.getenv("DATABASE_URL", "sqlite:///./aqia_data.db")
DATABASE_URL = (
    _raw_url
    .replace("postgres://", "postgresql://", 1)
    .replace("sslmode=req&", "sslmode=require&")
    .replace("sslmode=req", "sslmode=require")
)

_is_sqlite = DATABASE_URL.startswith("sqlite")

# ── Engine ───────────────────────────────────────────────────────────────────
if _is_sqlite:
    # Dev only — SQLite with WAL for concurrent reads
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True,
    )

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, _):
        cur = dbapi_conn.cursor()
        cur.execute("PRAGMA journal_mode=WAL")    # concurrent reads + writes
        cur.execute("PRAGMA synchronous=NORMAL")  # safe + faster than FULL
        cur.execute("PRAGMA foreign_keys=ON")     # enforce FK constraints
        cur.execute("PRAGMA cache_size=-32000")   # 32 MB page cache
        cur.execute("PRAGMA temp_store=MEMORY")   # temp tables in RAM
        cur.close()

else:
    # PostgreSQL — production connection pool
    # pool_size=10   : persistent connections kept open
    # max_overflow=20: extra connections allowed under burst load
    # pool_pre_ping  : test connection before handing it out
    # pool_recycle   : recycle after 30 min (avoids server-side timeouts)
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=1800,
    )


# ── Session factory ───────────────────────────────────────────────────────────
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ── Declarative base ──────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    pass


# ── FastAPI dependency ────────────────────────────────────────────────────────
def get_db():
    """Yield a DB session; always closed after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
