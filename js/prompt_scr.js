document.querySelector("#form_id").addEventListener("submit", (event) => {
    // Prevent the default form submission behavior (page reload)
    event.preventDefault();

    let text_body = document.querySelector("#prompt_text").value;
    document.querySelector("#prompt_text").value = "";
    // Create FormData to properly send data as a form
    const form_data = new FormData();
    form_data.append("prompt", text_body);

    // Send data to the FastAPI endpoint
    const llm_answer = fetch("http://127.0.0.1:8000/answer", {
        method: "POST",
        body: form_data
    }).then((res)=>res.json()).then((res_json)=>{
        const answerBox = document.querySelector("#prompt_answer");
        answerBox.style.display = "block";  // Make the answer box visible
        answerBox.value = res_json["result"]["output"];  // Insert the response text

    })
});

