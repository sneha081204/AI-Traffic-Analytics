import pymysql
from flask_sqlalchemy import SQLAlchemy
from backend.app.core.logging import logger

db = SQLAlchemy()

def prepare_mysql_database(settings):
    """Ensure target MySQL database exists before SQLAlchemy initialization."""
    if settings.DB_ENGINE.lower() == "mysql":
        try:
            conn = pymysql.connect(
                host=settings.MYSQL_HOST,
                port=settings.MYSQL_PORT,
                user=settings.MYSQL_USER,
                password=settings.MYSQL_PASSWORD or "",
                charset=settings.MYSQL_CHARSET,
                connect_timeout=1,
                read_timeout=1,
                write_timeout=1
            )
            with conn.cursor() as cursor:
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{settings.MYSQL_DATABASE}` CHARACTER SET {settings.MYSQL_CHARSET} COLLATE utf8mb4_unicode_ci;")
            conn.commit()
            conn.close()
            logger.info(f"[+] MySQL Database '{settings.MYSQL_DATABASE}' is ready.")
            return True
        except Exception as e:
            logger.warning(f"[!] MySQL connection notice ({e}). Set MYSQL_PASSWORD in backend/.env if required.")
            return False
    return False

def init_db(app, settings):
    """Initializes the database instance, ensuring MySQL database exists or falling back gracefully."""
    mysql_ready = prepare_mysql_database(settings)
    if settings.DB_ENGINE.lower() == "mysql" and not mysql_ready:
        sqlite_url = f"sqlite:///{str(settings.DATABASE_PATH).replace(chr(92), '/')}"
        logger.warning(f"[!] Fallback to local SQLite database: {sqlite_url}")
        app.config["SQLALCHEMY_DATABASE_URI"] = sqlite_url
        app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
            "connect_args": {"timeout": settings.DB_TIMEOUT, "check_same_thread": False},
            "pool_pre_ping": True,
        }
    else:
        app.config["SQLALCHEMY_DATABASE_URI"] = settings.DATABASE_URL
        if "sqlite" in settings.DATABASE_URL.lower():
            app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
                "connect_args": {"timeout": settings.DB_TIMEOUT, "check_same_thread": False},
                "pool_pre_ping": True,
            }

    db.init_app(app)
    with app.app_context():
        import backend.app.models  # noqa: F401 - Register all models with SQLAlchemy
        db.create_all()
        logger.info(f"[+] Database schema verified on: {app.config['SQLALCHEMY_DATABASE_URI'].split('@')[-1] if '@' in app.config['SQLALCHEMY_DATABASE_URI'] else 'SQLite'}")
