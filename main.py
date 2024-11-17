import os
import random
import time
import re
import pandas as pd
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from utils import convert_to_lowercase, invoke_llm
from setup_groq import LLM
from send_grid import send_email
import multiprocessing
from threading import Thread
import requests
from typing import List
from pydantic import BaseModel, EmailStr

class PromptRequest(BaseModel):
    prompts: List[str]

class EmailRequest(BaseModel):
    email: EmailStr
    prompt: str

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
async def create_upload_file(file: UploadFile = File(...)):
    os.makedirs(name="uploads", exist_ok=True)
    file_path = os.path.join(file.filename)

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    model_outputs = []
    try:
        # Parse CSV with pandas
        df = pd.read_csv(file_path)
        # Convert the DataFrame to a dictionary
        data = df.to_dict(orient='records')

        for p_row in data:
            normalized_dict = {}
            for key in p_row:
                # Make a normalized dictionary by converting all keys to lowercase
                # such that it matches the prompt placeholder keys
                normalized_dict[key.lower()] = p_row[key]
            
            # Converting prompt placeholder keys to lowercase
            prompt = normalized_dict.pop("prompt", None)
            if prompt is None:
                print("No prompt found. Moving on to next record without sending email.")
                continue

            prompt = re.sub(r"\{(\w+)\}", convert_to_lowercase, prompt)

            try:
                llm_prompt = prompt.format(**normalized_dict)
            except KeyError:
                print("Invalid key found. Skipping")
                continue

            # manager = multiprocessing.Manager()
            # res = manager.Value(str, "")

            # LLM prooompting
            # p1 = multiprocessing.Process(target=invoke_llm, daemon=True, args=(prompt, res))
            # print("started")
            # p1.start()
            # print("waiting.....")
            # p1.join()
 
            # time.sleep(2)

            # print("RESSSS:::: ", res.value)
            # model_output = LLM.invoke(llm_prompt)
            # model_outputs.append(model_output.content)
    except Exception as e:
        return {"error": f"Failed to process CSV: {str(e)}"}
    finally:
        # Optionally delete the uploaded file after processing
        os.remove(file_path)
    print(">>>>BRUUUUUU:: ", model_outputs)
    return {
        "success": True,
        "message": "File processed successfully",
        "data": model_outputs
    }


@app.post("/answer")
async def answer_endpoint(request: PromptRequest):

    print("prompot:: ", request.prompts)
    res = [LLM.invoke(prompt).content for prompt in request.prompts]
    print("done???")

    return {"success": True, "data":res}

@app.post("/send-email")
async def send_email_endpoint(emails: List[EmailRequest]):
    for email_data in emails:
        send_email(email_data.email, email_data.prompt)
        # Replace this with actual email sending logic
        print(f"Sending email to: {email_data.email}")
        print(f"Email content: {email_data.prompt}")
    
    return {"success": True, "message": "Emails sent successfully"}
