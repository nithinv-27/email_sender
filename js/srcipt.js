document.querySelector("#form_id").addEventListener("submit", (event)=>{
    event.preventDefault();

    const form_data = new FormData(event.target);

    fetch("http://127.0.0.1:8000/upload",{
        method:"POST",
        body:form_data
    });
    
    // window.location.assign("http://127.0.0.1:5500/prompt.html");

})