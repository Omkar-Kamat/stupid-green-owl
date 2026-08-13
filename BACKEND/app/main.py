from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import NotFoundError, ForbiddenError, ConflictError
from app.api.v1.routes import me, path

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.exception_handler(NotFoundError)
def not_found_error_handler(request: Request, exc: NotFoundError):
    return JSONResponse(status_code=404, content={"detail": f"{exc.resource}_NOT_FOUND"})

@app.exception_handler(ForbiddenError)
def forbidden_error_handler(request: Request, exc: ForbiddenError):
    return JSONResponse(status_code=403, content={"detail": exc.reason})

@app.exception_handler(ConflictError)
def conflict_error_handler(request: Request, exc: ConflictError):
    return JSONResponse(status_code=409, content={"detail": exc.reason})

app.include_router(me.router, prefix=f"{settings.API_V1_STR}/me", tags=["me"])
app.include_router(path.router, prefix=f"{settings.API_V1_STR}/path", tags=["path"])

@app.get("/health-check")
def health_check():
    return {"status": "ok"}
