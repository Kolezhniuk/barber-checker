const BarberHelper = require('./barberHelper');
const EventEmitter = require('events');
class NotificationEmiter extends EventEmitter { }
const notificationEmiter = new NotificationEmiter();
const TOKEN = process.env.TOKEN || '897444320:AAHjjL0Fk9Fjo5ViFg5WeF6JGWSbrgob0A4';

const TelegramApiBot = require('node-telegram-bot-api');
const bot = new TelegramApiBot(TOKEN, { polling: true });
const BarbersFoundedEvt = 'BarbersFoundedEvt';
const BarbersDateSelectedEvt = 'BarbersDateSelectedEvt';

bot.onText(/\/start/, async (msg) => {
    const barbers = await BarberHelper.getBarbers();
    console.log('all available barbers:', barbers);
    notificationEmiter.emit(BarbersFoundedEvt, barbers);
    if (barbers.length) {
        const replyData = barbers.map(i => [{ text: `${i.name}, rating: ${i.rating}`, callback_data: i.id }]);
        console.log(replyData);
        bot.sendMessage(msg.chat.id, "Select barber:", {
            reply_markup: {
                inline_keyboard: replyData
            }
        });
    } else {
        bot.sendMessage(msg.chat.id, "Currently no barbers found, do you want to set up polling?", {
            reply_markup: {
                // remove_keyboard: true,
                // resize_keyboard: true,
                inline_keyboard: [
                    ['yes', 'no']
                ]
            }
        });
    }
});

bot.onText(/yes/, async (msg) => {
    console.log(msg)
    bot.sendMessage(msg.chat.id, "Choose polling time interval (in hours):", {
        reply_markup: {
            keyboard: [
                ['1', '2', '3', '5', '8', '12']
            ]
        }
    });
});
bot.onText(/^\d{1,2}/, async (msg) => {
    bot.sendMessage(msg.chat.id, "Job started. Wait for the notification:)");
    notificationEmiter.emit('NotificationEvt', parseInt(msg.text));
});

notificationEmiter.on('NotificationEvt', async (interval) => {
    await pollingBarbers(interval);
});

async function pollingBarbers(interval) {
    console.log('polling started with interval', interval);
}

// Handle callback queries
bot.on('callback_query', async (callbackQuery) => {
    const action = callbackQuery.data.toString();
    const msg = callbackQuery.message;
    let isOk = await getBookableBarberDates(action, msg);
    await getAvailableBarberTimeSlots(action, msg);

});

async function getAvailableBarberTimeSlots(action, msg) {
    if (action.split('&').length == 2) {
        const [barberId, bookingdate] = action.split('&');
        const timeslots = await BarberHelper.getBarbersAvailableDatesTimeSlots(barberId, bookingdate);
        const opt = {
            chat_id: msg.chat.id,
            message_id: msg.message_id
        }
        console.log(timeslots);
        const inlineKeyData = timeslots.map(i => [{ text: `${i}`, callback_data: `${barberId}&${bookingdate}&${i}` }]);

        console.log(inlineKeyData);
        await await bot.editMessageText(`List available timeslots for date }${bookingdate}:`, opt);
        await bot.editMessageReplyMarkup({ inline_keyboard: inlineKeyData }, opt);
        return true;
    }
}
async function getBookableBarberDates(action, msg) {
    if (/\d{3,}/.test(action)) {
        const opt = {
            chat_id: msg.chat.id,
            message_id: msg.message_id
        }
        const barberId = msg.text;
        console.log(action);
        const bookableDates = await BarberHelper.getBarbersAvailableDates(barberId);
        console.log(bookableDates);
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const inlineKeyData = bookableDates.map(i => [{ text: `${i} ${days[new Date(i).getUTCDay()]}`, callback_data: `${barberId}&${i}` }]);

        console.log(inlineKeyData);
        await await bot.editMessageText("List available dates:", opt);
        await bot.editMessageReplyMarkup({ inline_keyboard: inlineKeyData }, opt);
        return true;
    }
}