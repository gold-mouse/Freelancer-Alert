// Initial load
loadCredentialsAndObserve();

// Reload credentials on config update
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'telegramConfigUpdated') {
        console.log("Telegram config updated. Reloading credentials...");
        loadCredentialsAndObserve();
    }
});

function loadCredentialsAndObserve() {
    chrome.storage.sync.get(['botToken', 'chatId'], (result) => {
        const TELEGRAM_BOT_TOKEN = result.botToken;
        const TELEGRAM_CHAT_ID = result.chatId;

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            console.warn("Telegram credentials not set.");
            return;
        }

        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("inject.js");
        script.onload = () => {
            script.remove()
            window.postMessage({
                type: 'FROM_EXTENSION',
                credentials: {
                    botToken: TELEGRAM_BOT_TOKEN,
                    chatId: TELEGRAM_CHAT_ID
                }
            }, '*');
        };
        (document.head || document.documentElement).appendChild(script);

    });
}
