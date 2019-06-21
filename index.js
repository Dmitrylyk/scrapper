const Telegraf = require('telegraf');

const bot = new Telegraf("process.env.BOT_TOKEN");
bot.start((ctx) => ctx.reply('Welcome! Just send me the name of the group whose schedule you want to get.'));
bot.help((ctx) => ctx.reply('There is nothing difficult. Just send me the name of the group whose schedule you want to get.'));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));


bot.telegram.setWebhook('https://scrapper.dmitrylyk.now.sh');

module.exports = bot.webhookCallback('/');
