require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const { getTranscript } = require('youtube-transcript');

const app = express();
const PORT = process.env.PORT || 5000;

const { TOKEN, NGROK_URL } = process.env;
const TELEGRAM_API = `http://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEB_URI = `${NGROK_URL}${URI}`;

const init = async () => {
    try {
        const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEB_URI}`);
        console.log(res.data);
    } catch (error) {
        console.error('Error setting webhook:', error);
    }
};



app.use(bodyParser.json());
const checkVideo=(url)=>{
    const validCheck = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/.*v=([^&]+)|youtu\.be\/([^?&]+)/;
    const match = url.match(validCheck);
    return match? (match[1] || match[2]:null)
}
app.post(URI,async(req,res)=>{
    console.log(req.body)
   return res.send();
})
app.listen(PORT, async () => {
    console.log("Server is running on port", PORT);
    await init();
});
