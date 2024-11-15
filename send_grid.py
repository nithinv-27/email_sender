import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

message = Mail(
    from_email='',
    to_emails='',
    subject='Sending with Twilio SendGrid is Fun',
    html_content='<strong>and easy to do anywhere, even with Python</strong>')

sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))


response = sg.send(message)


print(response.status_code, response.body, response.headers)