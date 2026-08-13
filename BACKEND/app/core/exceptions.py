class DomainError(Exception):
    """Base class for domain exceptions."""
    pass

class NotFoundError(DomainError):
    def __init__(self, resource: str, resource_id: int | str):
        self.resource = resource
        self.resource_id = resource_id
        super().__init__(f"{resource} {resource_id} not found")

class ForbiddenError(DomainError):
    def __init__(self, reason: str = "FORBIDDEN"):
        self.reason = reason
        super().__init__(reason)

class ConflictError(DomainError):
    def __init__(self, reason: str = "CONFLICT"):
        self.reason = reason
        super().__init__(reason)

class InvalidPayloadError(DomainError):
    def __init__(self, reason: str = "INVALID_PAYLOAD"):
        self.reason = reason
        super().__init__(reason)
