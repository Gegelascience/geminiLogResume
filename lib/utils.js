
 export function getSystemPrompt(mode) {
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

export function getKeyword(nameTagSearch, mode) {
    if (document.getElementsByName(nameTagSearch).length > 0) {
        const keyword = document.getElementsByName(nameTagSearch)[0].value;
        console.log("keyword", keyword)
        return mode ==="custom" && keyword ? keyword : "ERROR";
    }
    return "ERROR";
    
}

export function cleanGeminiHtml(html, selector) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const div = doc.querySelector(selector);
    return div ? div.innerHTML : html;
}


export function parseLogLine(line, regexDef) {
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