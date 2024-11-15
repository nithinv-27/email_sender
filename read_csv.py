import os, re
import pandas as pd
import numpy as np
from langchain_community.utilities import SQLDatabase
from sqlalchemy import create_engine
from langchain_community.agent_toolkits import create_sql_agent
from setup_groq import llm

def create_db(file):
    # Check if "sample.db" exists and remove it to prevent conflicts
    if os.path.exists("sample.db"):
        os.remove("sample.db")
    
    # Read the CSV file from the UploadFile object
    new_df = pd.read_csv(file.file)
    
    # # Create SQLite engine and save DataFrame to the database
    engine = create_engine("sqlite:///sample.db")
    new_df.to_sql("sample", engine, index=False, if_exists="replace")
    
    # # Set up SQL database and agent for querying
    db = SQLDatabase(engine=engine)
    
    engine.dispose()
    return db

def get_answer(db, prompt):
    agent_executor = create_sql_agent(llm, db=db, verbose=True)
    
    # # Execute the query and get the result
    # \"SELECT 'Company Name' FROM sample LIMIT 1\". However, I cannot execute this query directly
    result = agent_executor.invoke(prompt)
    return result

def extract_placeholders(template):
    # Regex to match placeholders in the format {Placeholder}
    placeholders = re.findall(r"{(\w+)}", template)
    return placeholders