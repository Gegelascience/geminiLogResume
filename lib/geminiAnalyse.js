
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

function cleanGeminiHtml(html, selector) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const div = doc.querySelector(selector);
    return div ? div.innerHTML : html;
}


export async function analyseLogGemini(mode,loglines, apikey) {

    const systemInstruction = getSystemPrompt(mode);
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
                    "text": `fais une synthèse des lignes de logs suivantes: ${loglines}` 
                }
            ]
        }
    };
        
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?" + new URLSearchParams({
        key: apikey
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