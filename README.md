# Freelancer New Project Notifier

A lightweight Chrome extension that monitors Freelancer.com for new project postings or messages and sends real-time alerts via Telegram.

## 📦 Features

- 🧠 Detects new projects and unread messages on Freelancer.com
- 📲 Sends notifications to a Telegram chat via bot integration
- ⏱ Introduces randomized delay to mimic natural behavior
- 🔐 Operates with minimal permissions for security

## 🚀 How It Works

1. Injects a content script (`content.js`) into Freelancer.com pages
2. Uses a MutationObserver to monitor for:
   - New messages
   - New project cards
3. Sends a formatted notification to a predefined Telegram chat using a bot

## 🛠 Installation

1. Clone or download this repository.
2. Go to `chrome://extensions/` in your browser.
3. Enable "Developer mode" (top right).
4. Click "Load unpacked" and select the folder containing the manifest and script.

## 🧾 Configuration

To use the Telegram notification feature, update the following constants in `content.js`:

```js
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN';
const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID';
