import os
import getpass
from langchain_groq import ChatGroq

if "GROQ_API_KEY" not in os.environ:
    os.environ["GROQ_API_KEY"] = "Your API Key"
    print("No api keyyyyy")

LLM = ChatGroq(
    model="mixtral-8x7b-32768", 
    temperature=0.0,
    max_retries=2,
    # other params...
)

