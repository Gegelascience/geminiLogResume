
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

    if (mode === modeGemini.synthesis || mode === modeGemini.custom) {
        listInstruction.push({"text":"You will answer in html format on a div tag. div tag will have the css class 'geminiAnswer'."})
        listInstruction.push({"text":"The div contains formated text on html format."})
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
        if (mode === modeGemini.table) {
            payload["generationConfig"] = {
                "response_mime_type": "application/json",
                "response_schema": {
                    "type": "object",
                    "properties": {
                        "table": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "error_type": { "type": "string" },
                                    "count": { "type": "integer" }
                                },
                                "required": ["error_type", "count"]
                            }
                        }
                    },
                    "required": ["table"]
                }
            }
        }
        
            
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
        console.log("dataGemini", dataGemini)
        
        if (mode === modeGemini.table) {
            const tableTag = document.createElement("table");
            tableTag.classList.add("table", "table-hover", "table-secondary");
            const tableBody = document.createElement("tbody");
            const tableHeader = document.createElement("thead");
            const headerRow = document.createElement("tr");
            const headerCell1 = document.createElement("th");
            headerCell1.textContent = "Type d'erreur";
            const headerCell2 = document.createElement("th");
            headerCell2.textContent = "Nombre d'erreurs";
            headerRow.appendChild(headerCell1);
            headerRow.appendChild(headerCell2);
            tableHeader.appendChild(headerRow);
            tableTag.appendChild(tableHeader);
            const jsonTableData = JSON.parse(dataGemini.candidates[0].content.parts[0].text).table;
            jsonTableData.forEach(row => {
                const tableRow = document.createElement("tr");
                const cell1 = document.createElement("td");
                cell1.textContent = row.error_type;
                const cell2 = document.createElement("td");
                cell2.textContent = row.count;
                tableRow.appendChild(cell1);
                tableRow.appendChild(cell2);
                tableBody.appendChild(tableRow);
            });
            tableTag.appendChild(tableBody);


            return tableTag.outerHTML;
        }
        return cleanGeminiHtml(dataGemini.candidates[0].content.parts[0].text,'.geminiAnswer');
            
    
    } 

    
}

