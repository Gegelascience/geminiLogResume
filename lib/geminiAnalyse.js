
const modeGemini = Object.freeze({
    synthesis: "synthesis",
    table: "table",
    custom: "custom"
});

function getSystemPrompt(mode) {

    const listInstruction = [
        {"text":"You are an expert on log analysis."},
        {"text":"You will answer on french."},
    ]

    if (mode === modeGemini.synthesis) {
        listInstruction.push({"text":"You will answer in html format on a div tag. div tag will have the css class 'geminiAnswer'."})
        listInstruction.push({"text":"The div contains formated text on html format."})
    } else if (mode === modeGemini.table) {
        listInstruction.push({"text":"You will answer in html format on a div tag. div tag will have the css class 'geminiAnswer'."})
        listInstruction.push({"text":"The div contains only a table tag."})
        listInstruction.push({"text":"The table inside the div tag contains the number of errors by type."})
        listInstruction.push({"text":"table tag will have css class 'table table-hover table-secondary'."})
        listInstruction.push({"text":"There is no text outside the table."})
    } 
    return listInstruction
               
}

function cleanGeminiHtml(html, selector) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const div = doc.querySelector(selector);
    return div ? div.innerHTML : html;
}



export class GeminiLogAnalyseClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async analyseLogGemini(mode,loglines) {

        const payload = {
            "system_instruction":{
                "parts":getSystemPrompt(mode),
            },
            "contents": {
                "parts":[
                    {
                        "text": `fais une synthèse des lignes de logs suivantes: ${loglines}` 
                    }
                ]
            }
        };
            
        const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?" + new URLSearchParams({
            key: this.apiKey
        }).toString();
    
        const response =await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify(payload),
        })
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const dataGemini =await response.json()
        return cleanGeminiHtml(dataGemini.candidates[0].content.parts[0].text,'.geminiAnswer');
            
    
    } 

    
}

