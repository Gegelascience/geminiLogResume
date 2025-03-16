

const btn = document.getElementById("resumeLog")
const spinner = document.getElementById("spinner")
const inputFile = document.getElementById("logFile")
const geminiKeyInput = document.getElementById("geminiKey")


btn.addEventListener("click", () => {
  
  const GOOGLE_API_KEY = geminiKeyInput.value;

  
  const fReader = new FileReader();
  fReader.readAsText(inputFile.files[0]);
  fReader.onloadend = function(event){
    
    const logsText = event.target.result;
    //console.log("val",logsLines)

    const lines = logsText.split("\n");

    var errorLines =lines.filter(l => {
        return l.includes("ERROR")
    })

    const payload = {
        "contents": [{
        "parts":[{"text": `fais une synthèse des lignes de logs suivantes: ${errorLines}` }]
        }]
    };
    
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?" + new URLSearchParams({
        key: GOOGLE_API_KEY
    }).toString();
    
    spinner.hidden = false;

    fetch(url, {
        method: 'POST',
        
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    }).then(response => response.json())
    .then(data => {
        // console.log(data);
        const analyse = data.candidates[0].content.parts[0].text;

        document.getElementById("analyse").innerText = analyse;
        spinner.hidden = true;

    })


}

  

})

