from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from db.database import init_db
from api.chat import router as chat_router
from api.upload import router as upload_router
from api.tickets import router as tickets_router
from api.analytics import router as analytics_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Resolva — AI Support Agent",
    description="Confidence-based AI customer support with automatic human escalation.",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def generic_error_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.include_router(chat_router, tags=["Chat"])
app.include_router(upload_router, tags=["Knowledge Base"])
app.include_router(tickets_router, tags=["Tickets"])
app.include_router(analytics_router, tags=["Analytics"])


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "Resolva"}
