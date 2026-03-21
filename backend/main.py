from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import ranking, search

app = FastAPI(title='Jooba API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(search.router)
app.include_router(ranking.router)


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.get('/')
def root():
    return {'message': 'Jooba API'}
