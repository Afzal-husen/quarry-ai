import sqlite3
from pathlib import Path
from typing import Optional, Dict, Any

# Resolve database path under the data/ folder of the backend root
DB_DIR = Path(__file__).resolve().parent.parent.parent / "data"
DB_PATH = DB_DIR / "users.db"


class UserDatabaseManager:
    """Manages raw SQLite database connections and user operations."""

    @classmethod
    def initialize_db(cls) -> None:
        """Creates the data/ directory and initializes the users table on startup."""
        DB_DIR.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()
        try:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    hashed_password TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            conn.commit()
        finally:
            conn.close()

    @classmethod
    def get_connection(cls) -> sqlite3.Connection:
        """Returns a standard SQLite connection."""
        return sqlite3.connect(str(DB_PATH))

    @classmethod
    def get_user_by_username(cls, username: str) -> Optional[Dict[str, Any]]:
        """Retrieves a user record by username.

        Args:
            username: The unique username to look up.

        Returns:
            A dictionary of user fields, or None if the user does not exist.
        """
        conn = cls.get_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        try:
            cursor.execute(
                "SELECT id, username, hashed_password, created_at FROM users WHERE username = ?;",
                (username,)
            )
            row = cursor.fetchone()
            if row:
                return dict(row)
            return None
        finally:
            conn.close()

    @classmethod
    def create_user(cls, user_id: str, username: str, hashed_password: str) -> Dict[str, Any]:
        """Creates a new user record.

        Args:
            user_id: Unique UUID string for the user.
            username: Unique username.
            hashed_password: Hashed password string.

        Returns:
            The created user dictionary.

        Raises:
            ValueError: If the username already exists.
        """
        conn = cls.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO users (id, username, hashed_password) VALUES (?, ?, ?);",
                (user_id, username, hashed_password)
            )
            conn.commit()
            return {
                "id": user_id,
                "username": username,
                "hashed_password": hashed_password
            }
        except sqlite3.IntegrityError as e:
            if "UNIQUE constraint failed: users.username" in str(e):
                raise ValueError(f"Username '{username}' already exists.") from e
            raise e
        finally:
            conn.close()
