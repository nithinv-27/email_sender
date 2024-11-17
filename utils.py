from setup_groq import LLM

def convert_to_lowercase(match):
    key = match.group(1)  # Extract the key inside curly braces
    return f"{{{key.lower()}}}"  # Return the key converted to lowercase within braces

def invoke_llm(prompt: str, res: str) -> str:
    print("enter the dragon")
    res = LLM.invoke(prompt).content
    print("exit the dragon")
    # print("i>>>>>>>dk:: ", res)
    return res
