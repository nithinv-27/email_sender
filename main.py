from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from read_csv import create_db, get_answer, extract_placeholders
from starlette.responses import JSONResponse
from fastapi_mail import FastMail, MessageSchema, MessageType


app = FastAPI()

origins = [
    "http://127.0.0.1:5500",  # Replace with the frontend URL if different
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow only these origins, or use "*" to allow all
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
def get():
    return {"message": "success"}

dbs = None

@app.post("/upload")
def create_upload_file(file: UploadFile = File(...)):
    global dbs
    db = create_db(file)
    dbs = db

@app.post("/answer")
def answer_endpoint(prompt: str = Form(...)):
    global dbs
    place_holders = extract_placeholders(prompt)
    result = get_answer(dbs, prompt)
    return {"result":result, "place_holders":place_holders}
