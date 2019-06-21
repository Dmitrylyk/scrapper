'use strict'

const Telegraf = require('telegraf');
import {parse} from './parser.js';

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_PATH = process.env.WEBHOOK_PATH;

const bot = new Telegraf(BOT_TOKEN);
bot.start((ctx) => ctx.reply('Welcome! Just send me the name of the group, whose schedule you want to get.'));
bot.help((ctx) => ctx.reply('There is nothing difficult. Just send me the name of the group, whose schedule you want to get.'));
bot.hears(/^[А-ЯІа-яі]{2}-[1-9а-яі]{2,5}$/, (ctx) => parse(ctx.message.text)
    .then(result => {ctx.reply(result)})
    .catch(() => ctx.reply('Schedule for this group was not found. Please, try again.')));

module.exports = bot.webhookCallback('/');
