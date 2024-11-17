# CSV Parser with Editable Table

A web application for uploading and processing CSV files with a customizable table where users can input and edit data. The application integrates with a backend to process the prompts, and it also provides functionality to send emails based on the processed data.

## Features

- Upload a CSV file and parse its content.
- Display the data in an editable HTML table with input fields for each row.
- Replace placeholders in the prompts with corresponding data from the CSV.
- Submit the prompts to a backend for processing.
- Dynamically update the table with returned processed prompts.
- Collect email addresses and processed prompts to send via email.
- Responsive design for better usability across devices.

## Technologies

- **Frontend**: HTML, CSS, JavaScript (Vanilla JS)
- **Backend**: FastAPI, Python
- **Libraries/Frameworks**:
  - **Pandas** for CSV parsing
  - **Requests** for API communication
  - **SendGrid** for email sending
  - **Groq** for model inference

## Installation

### Prerequisites

- Python 3.x
- FastAPI and related dependencies

### Backend Setup

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/csv-parser.git
    cd csv-parser
    ```

2. Create and activate a virtual environment:

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3. Install the dependencies:

    ```bash
    pip install -r requirements.txt
    ```

4. Create a file named `keys.env` in the root directory of the project with the following content:

    ```
    GROQ_API_KEY=your-groq-api-key
    SENDGRID_API_KEY=your-sendgrid-api-key
    SENDER_EMAIL=your-email@example.com
    ```

    - Replace `your-groq-api-key` with your Groq API key.
    - Replace `your-sendgrid-api-key` with your SendGrid API key.
    - Replace `your-email@example.com` with your sender email address. 

5. Run the FastAPI backend:

    ```bash
    uvicorn main:app --reload
    ```
    
6. Open the `index.html` in your browser or use a simple server like `live-server` to view the application.
