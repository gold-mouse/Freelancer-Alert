var TELEGRAM_BOT_TOKEN = '';
var TELEGRAM_CHAT_ID = '';
let lastNotificationTime = 0;
var oldMsgCount = 0

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
        TELEGRAM_BOT_TOKEN = result.botToken;
        TELEGRAM_CHAT_ID = result.chatId;

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            console.warn("Telegram credentials not set.");
            return;
        }

        observeForNotification();  // Start observer
    });
}

async function sendTelegramMessage(message) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message + "\n\nNew Messages: " + oldMsgCount
            })
        });

        const data = await response.json();

        if (!data.ok) {
            console.error('Telegram API error:', data);
        }
    } catch (error) {
        console.error('Failed to send Telegram message:', error);
    }
}

function observeForNotification() {
    const OriginalWebSocket = window.WebSocket;

    function CustomWebSocket(url, protocols) {
        const ws = protocols ? new OriginalWebSocket(url, protocols) : new OriginalWebSocket(url);

        ws.addEventListener("message", function (event) {
            try {
                let raw = event.data;

                // Remove leading 'a' if present
                if (raw.startsWith('a')) {
                    raw = raw.slice(1);
                }
                const data = JSON.parse(JSON.parse(raw)[0]);
                console.log(typeof data, data);
                if (data?.body?.type === "project") {
                    const jobString = data.body.data.jobString || "New Project";

                    sendTelegramMessage(jobString);

                    console.log("[🔔 Project Notification]", jobString);
                }
            } catch (err) {
                console.log("parse error: ", event.data);
            }
        });

        return ws;
    }

    CustomWebSocket.prototype = OriginalWebSocket.prototype;
    window.WebSocket = CustomWebSocket;

    console.log("[✅ WS Interceptor + Notification is running]");
}
// Run the observer
observeForNotification();
