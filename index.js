//get token
//get newnam
//write code
//bublish to heroku

const TelegramApiBot = require('node-telegram-bot-api');
const TOKEN = process.env.TOKEN;
const bot = new TelegramApiBot(TOKEN, { polling: true });

bot.on('message', msg => bot.sendMessage(msg.chat.id, 'test'));