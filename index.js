"use strict"

const Telegraf = require('telegraf');

const BOT_TOKEN = process.env.BOT_TOKEN;

const bot = new Telegraf(BOT_TOKEN);
bot.start((ctx) => ctx.reply('Welcome! Just send me the name of the group, whose schedule you want to get.'));
bot.help((ctx) => ctx.reply('There is nothing difficult. Just send me the name of the group, whose schedule you want to get.'));


//bot.telegram.setWebhook('https://scrapper.dmitrylyk.now.sh');

module.exports = bot.webhookCallback('/');
