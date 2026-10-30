import uuid

def generate_reference_id(prefix: str = "ECH") -> str:
    """Generates unique alphanumeric reference ID."""
    return f"{prefix}-2026-{uuid.uuid4().hex[:6].upper()}"

def format_currency(amount: float, currency_symbol: str = "₹") -> str:
    """Formats numeric amount into localized currency string."""
    return f"{currency_symbol}{amount:,.0f}"
