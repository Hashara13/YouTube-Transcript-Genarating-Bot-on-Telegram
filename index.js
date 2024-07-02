require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const { getTranscript } = require('youtube-transcript');

const app = express();
const PORT = process.env.PORT || 5000;

const { TOKEN, NGROK_URL } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEB_URI = `${NGROK_URL}${URI}`;

console.log('TOKEN:', TOKEN);
console.log('NGROK_URL:', NGROK_URL);
console.log('WEB_URI:', WEB_URI);

const init = async () => {
    try {
        const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEB_URI}`);
        console.log('Webhook set:', res.data);
    } catch (error) {
        console.error('Error setting webhook:', error.response ? error.response.data : error.message);
    }
};

app.use(bodyParser.json());

const checkVideo = (url) => {
    const validCheck = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/.*v=([^&]+)|youtu\.be\/([^?&]+)/;
    const match = url.match(validCheck);
    return match ? (match[1] || match[2]) : null;
};

app.post(URI, async (req, res) => {
    const message = req.body.message;
    if (message && message.text) {
        const chatId = message.chat.id;
        const text = message.text;

        const videoId = checkVideo(text);
        if (videoId) {
            try {
                const videoTranscript = await getTranscript(videoId);
                const videoTranscriptBody = videoTranscript.map(item => item.text).join(" ");
                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                    chat_id: chatId,
                    text: videoTranscriptBody
                });
            } catch (error) {
                console.error("Error occurred:", error);
                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                    chat_id: chatId,
                    text: 'Failed to get transcript. Please make sure the video URL is correct and the video has a transcript.'
                });
            }
        } else {
            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                chat_id: chatId,
                text: 'Please send a valid YouTube video URL to get the transcript.'
            });
        }
    }

    return res.send();
});

app.listen(PORT, async () => {
    console.log("Server is running on port", PORT);
    await init();
});
