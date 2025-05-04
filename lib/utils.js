

export function getKeyword(nameTagSearch, mode) {
    if (document.getElementsByName(nameTagSearch).length > 0) {
        const keyword = document.getElementsByName(nameTagSearch)[0].value;
        console.log("keyword", keyword)
        return mode ==="custom" && keyword ? keyword : "ERROR";
    }
    return "ERROR";
    
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