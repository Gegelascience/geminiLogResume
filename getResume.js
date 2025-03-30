

const btn = document.getElementById("resumeLog")
const spinner = document.getElementById("spinner")
const inputFile = document.getElementById("logFile")
const keywordSearch = document.getElementById("keywordSearch")

function cleanGeminiHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const div = doc.querySelector('.geminiAnswer');
    return div ? div.innerHTML : html;
}

btn.addEventListener("click", () => {

  chrome.storage.local.get(["my_gemini_log_key"]).then((result) => {

    const GOOGLE_API_KEY = result.my_gemini_log_key;

    const fReader = new FileReader();
    fReader.readAsText(inputFile.files[0]);
    fReader.onloadend = function(event){
    
        const logsText = event.target.result;
        //console.log("val",logsLines)

        const lines = logsText.split("\n");

        let keyword = "ERROR";

        if (keywordSearch.value && keywordSearch.value !== null && keywordSearch.value.length > 0) {
            console.log("keywordSearch", keywordSearch.value)
            keyword = keywordSearch.value;
        }
        var errorLines =lines.filter(l => {
            return l.includes(keyword)
        })
        if (errorLines.length === 0) {
            document.getElementById("analyse").innerText = "Aucune ligne trouvée avec ces mots clés";
            return;
        }
        const payload = {
            "system_instruction":{
                "parts":[
                    {
                        "text": "You are an expert on log analysis.\
                        You will answer on french.\
                        Aswer must be on html format and will be part of a 'div' tag with css class 'geminiAnswer'."
                    }
                ]
            },
            "contents": [
                {
                    "parts":[
                        {
                            "text": `fais une synthèse des lignes de logs suivantes: ${errorLines}` 
                        }
                    ]
                }
            ]
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
            const analyse = data.candidates[0].content.parts[0].text;
            console.log(analyse);

            document.getElementById("analyse").innerHTML = cleanGeminiHtml(analyse);
            spinner.hidden = true;

        }).catch((error) => {
            console.error('Error:', error);
            alert("Erreur lors de l'analyse du log");
            spinner.hidden = true;
        });
    }
  });
});

