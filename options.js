

const restoreOptions = () => {
    chrome.storage.local.get(
      { my_gemini_log_key: '' },
      (items) => {
        document.getElementById('geminiKey').value = items.my_gemini_log_key;
      }
    );
  };

const saveOptions = () => {

    const gemini_key = document.getElementById('geminiKey').value;

    chrome.storage.local.set({ "my_gemini_log_key": gemini_key }).then(() => {
        console.log("Value is set");
        alert("Options sauvegardées");
      });
}


document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);