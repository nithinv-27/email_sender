import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

load_dotenv("keys.env")

if "SENDGRID_API_KEY" not in os.environ:
    os.environ["SENDGRID_API_KEY"] = "Your API Key"
    print("No SendGridApi keyyyyy")

if "SENDER_EMAIL" not in os.environ:
    os.environ["SENDER_EMAIL"] = "Your Email ID"
    print("No Sender email id")

sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))

def send_email(email, prompt):

    subject = ""
    lines = prompt.split("\n")
    body_lines = []
    for line in lines:
        if line.startswith("Subject:"):
            subject = line[len("Subject:"):].strip()
        else:
            body_lines.append(line)

    if not subject:
        raise ValueError("Subject not found in the prompt!")

    email_body = "\n".join(body_lines).strip()

    message = Mail(
        from_email=os.getenv("SENDER_EMAIL"), 
        to_emails=email,
        subject=subject,
        html_content=email_body
    )

    response = sg.send(message)

    print(response.status_code, response.body, response.headers)