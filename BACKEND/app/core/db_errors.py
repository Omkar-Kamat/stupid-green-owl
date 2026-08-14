from sqlalchemy.exc import IntegrityError


def is_unique_violation(error: IntegrityError) -> bool:
    """Detect unique-constraint violations across SQLite and Postgres."""
    orig = getattr(error, "orig", None)
    if orig is None:
        return "UNIQUE constraint failed" in str(error)

    if orig.__class__.__name__ == "UniqueViolation":
        return True

    pgcode = getattr(orig, "pgcode", None)
    if pgcode == "23505":
        return True

    return "UNIQUE constraint failed" in str(orig)
