import {parseLogLine, getKeyword} from "./lib/utils.js";
import {GeminiLogAnalyseClient} from "./lib/geminiAnalyse.js";

const btn = document.getElementById("resumeLog")
const spinner = document.getElementById("spinner")
const formTagElements = document.getElementById("formAnalysis").elements;

for (let index = 0; index < formTagElements["mode"].length; index++) {
    const radioBtn = formTagElements["mode"][index];
    radioBtn.addEventListener("change", () => {

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

for (let index = 0; index < formTagElements["format"].length; index++) {
    const radioBtn = formTagElements["format"][index];
    radioBtn.addEventListener("change", () => {

        if (document.getElementsByName("regexCustom").length > 0) {
            const inputRegex = document.getElementsByName("regexCustom")[0];
            if (formTagElements["format"].value === "custom") {
                inputRegex.hidden = false;
            } else {
                inputRegex.hidden = true;
            }
        }
    })
}


btn.addEventListener("click", () => {

    //form check
    if (document.getElementsByName("logFile").length === 0 || document.getElementsByName("logFile")[0].files.length === 0) {
        alert("Veuillez sélectionner un fichier de log à analyser.");
        return;
    }

    if (document.getElementsByName("mode").length === 0 || formTagElements["mode"].value === "") {
        alert("Veuillez sélectionner un mode d'analyse.");
        return;
    }

    if (formTagElements["mode"].value === "custom" && document.getElementsByName("keywordSearch").length > 0 && document.getElementsByName("keywordSearch")[0].value === "") {
        alert("Veuillez entrer un mot clé pour l'analyse personnalisée.");
        return;
    }

    if (formTagElements["format"].value === "custom" && document.getElementsByName("regexCustom").length > 0 && document.getElementsByName("regexCustom")[0].value === "") {
        alert("Veuillez renseigner la regex de votre ligne de log.");
        return;
    }
    chrome.storage.local.get(["my_gemini_log_key"]).then((result) => {

        const GOOGLE_API_KEY = result.my_gemini_log_key;

        const geminiClient = new GeminiLogAnalyseClient(GOOGLE_API_KEY);

        const fReader = new FileReader();
        console.log(document.getElementsByName("logFile"))
        fReader.readAsText(document.getElementsByName("logFile")[0].files[0]);
        fReader.onloadend = function(event){
        
            const logsText = event.target.result;

            const lines = logsText.split("\n");
            
            let formattedLines = [];
            let regexDef = /^([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3})\s+([A-Z]+)\s+(.*)$/;
            if (formTagElements["format"].value === "custom") {
                regexDef = new RegExp(document.getElementsByName("regexCustom")[0].value);

            }
            
            for (let index = 0; index < lines.length; index++) {
                const matchLine = parseLogLine(lines[index],regexDef);

                if (matchLine) {
                    formattedLines.push(`${matchLine.date} ${matchLine.level} ${matchLine.message}`);
                } else {
                    formattedLines[formattedLines.length - 1] = formattedLines[formattedLines.length - 1] + "\n" + lines[index];
                }
            }

            const keyword = getKeyword("keywordSearch",formTagElements["mode"].value);

            var errorLines =formattedLines.filter(l => {
                return l.includes(keyword)
            })
            if (errorLines.length === 0) {
                document.getElementById("analyse").innerHTML = "<p>Aucune ligne de log trouvée avec ces mots clés<p>";
                return;
            }
            spinner.hidden = false;

            geminiClient.analyseLogGemini(formTagElements["mode"].value, errorLines, GOOGLE_API_KEY).then((analyse) => {
                console.log("Analyse", analyse);
                document.getElementById("analyse").innerHTML = analyse;

            }).catch((error) => {
                console.error('Error:', error.message);
                alert("Erreur lors de l'analyse du log");
            }).finally(() => {
                spinner.hidden = true;
            })
        }
    });
});

