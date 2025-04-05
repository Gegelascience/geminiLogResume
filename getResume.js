

const btn = document.getElementById("resumeLog")
const spinner = document.getElementById("spinner")
const formTagElements = document.getElementById("formAnalysis").elements;

for (let index = 0; index < formTagElements["mode"].length; index++) {
    const radioBtn = formTagElements["mode"][index];
    radioBtn.addEventListener("change", () => {
        console.log(formTagElements["mode"].value)
        if (document.getElementsByName("keywordSearch").length > 0) {
            const inputKeyword = document.getElementsByName("keywordSearch")[0];
            if (formTagElements["mode"].value === "custom") {
                inputKeyword.hidden = false;
            } else {
                inputKeyword.hidden = true;
            }
        }
    })
}

function cleanGeminiHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const div = doc.querySelector('.geminiAnswer');
    return div ? div.innerHTML : html;
}

function getKeyword() {
    if (document.getElementsByName("keywordSearch").length > 0) {
        const keyword = document.getElementsByName("keywordSearch")[0].value;
        console.log("keyword", keyword)
        return formTagElements["mode"].value ==="custom" && keyword ? keyword : "ERROR";
    }
    return "ERROR";
    
}

function getSystemPrompt(mode) {
    if (mode === "synthesis") {
        return "You are an expert on log analysis.\
            You will answer on french.\
            Aswer must be on html format and will be part of a 'div' tag with css class 'geminiAnswer'."
    } else if (mode === "table") {
        return "You are an expert on log analysis.\
            You will answer on french.\
            You will answer in html format on a div tag. div tag will have the css class 'geminiAnswer'.\
            The div contains only a table tag. \
            The table inside the div tag contains the number of errors by type. table tag will have css class 'table table-hover table-secondary'\
            There is no text outside the table."
    } else {
        return "You are an expert on log analysis.\
            You will answer on french."
    }
               
}

function parseLogLine(line) {
    const regexDef = /^([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3})\s+([A-Z]+)\s+(.*)$/;
    const match = line.match(regexDef);
    if (match) {
        return {
            date: match[1],
            level: match[2],
            message: match[3]
        };
    } else {
        return null;
    }
}

btn.addEventListener("click", () => {

  chrome.storage.local.get(["my_gemini_log_key"]).then((result) => {

    const GOOGLE_API_KEY = result.my_gemini_log_key;

    const fReader = new FileReader();
    console.log(document.getElementsByName("logFile"))
    fReader.readAsText(document.getElementsByName("logFile")[0].files[0]);
    fReader.onloadend = function(event){
    
        const logsText = event.target.result;

        const lines = logsText.split("\n");
        
        let formattedLines = [];
        for (let index = 0; index < lines.length; index++) {
            const matchLine = parseLogLine(lines[index]);

            if (matchLine) {
                formattedLines.push(`${matchLine.date} ${matchLine.level} ${matchLine.message}`);
            } else {
                formattedLines[formattedLines.length - 1] = formattedLines[formattedLines.length - 1] + "\n" + lines[index];
            }
        }

        const keyword = getKeyword();

        var errorLines =formattedLines.filter(l => {
            return l.includes(keyword)
        })
        if (errorLines.length === 0) {
            document.getElementById("analyse").innerHTML = "<p>Aucune ligne de log trouvée avec ces mots clés<p>";
            return;
        }

        //console.log("errorLines", errorLines)
        //console.log("errorLines", errorLines[0])
        //console.log("errorLines", errorLines[1])

        const systemInstruction = getSystemPrompt(formTagElements["mode"].value);

        const payload = {
            "system_instruction":{
                "parts":[
                    {
                        "text": systemInstruction
                    }
                ]
            },
            "contents": {
                "parts":[
                    {
                        "text": `fais une synthèse des lignes de logs suivantes: ${errorLines}` 
                    }
                ]
            }
        };
        

 
        const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?" + new URLSearchParams({
            key: GOOGLE_API_KEY
        }).toString();
    
        spinner.hidden = false;

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify(payload),
        }).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json()
        })
        .then(data => {
            const analyse = data.candidates[0].content.parts[0].text;
            console.log(analyse);

            document.getElementById("analyse").innerHTML = cleanGeminiHtml(analyse);
            spinner.hidden = true;

        }).catch((error) => {
            console.error('Error:', error.message);
            alert("Erreur lors de l'analyse du log");
            spinner.hidden = true;
        });
    }
  });
});

