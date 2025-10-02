import { Bot, session } from 'grammy'
import { conversations, createConversation } from '@grammyjs/conversations'
import { TOKEN, DB_FILE, PORT } from './lib/constants.js'
import { initDB } from './lib/db.js'
import { start, menu, help, cancel } from './lib/commands.js'
import express from 'express'

import {
  addExpenseConversation,
  addIncomeConversation,
  setLimitConversation,
} from './lib/conversation.js'

import {
  mainMenu,
  addExpense,
  addIncome,
  balance,
  reportMenu,
  limitMenu,
  setLimit,
  getLimit,
  helpQuery,
  cancelQuery,
  reportWeeklyAndMonthly,
} from './lib/callback-queries.js'

const bot = new Bot(TOKEN)
const app = express()

initDB()

bot.use(session({ initial: () => ({}) }))
bot.use(conversations())

bot.use(createConversation(addExpenseConversation))
bot.use(createConversation(addIncomeConversation))
bot.use(createConversation(setLimitConversation))

bot.command('start', async ctx => await start(ctx))
bot.command('menu', async ctx => await menu(ctx))
bot.command('help', async ctx => await help(ctx))
bot.command('cancel', async ctx => await cancel(ctx))

bot.callbackQuery('main_menu', async ctx => await mainMenu(ctx))
bot.callbackQuery('add_expense', async ctx => await addExpense(ctx))
bot.callbackQuery('add_income', async ctx => await addIncome(ctx))
bot.callbackQuery('balance', async ctx => await balance(ctx))
bot.callbackQuery('report_menu', async ctx => await reportMenu(ctx))
bot.callbackQuery('limit_menu', async ctx => await limitMenu(ctx))
bot.callbackQuery('set_limit', async ctx => await setLimit(ctx))
bot.callbackQuery('get_limit', async ctx => await getLimit(ctx))
bot.callbackQuery('help', async ctx => await helpQuery(ctx))
bot.callbackQuery('cancel', async ctx => await cancelQuery(ctx))

bot.callbackQuery(
  ['report_weekly', 'report_monthly'],
  async ctx => await reportWeeklyAndMonthly(ctx)
)

bot.start({
  onStart: botInfo => {
    console.log(`✅ Bot muvaffaqiyatli ishga tushdi!`)
    console.log(`🤖 Bot username: @${botInfo.username}`)
    console.log(`📁 Ma'lumotlar bazasi: ${DB_FILE}`)
    console.log(`🎯 Bot tayyor! Foydalanuvchilarni kutmoqda...`)
  },
})

bot.catch(err => {
  console.error('❌ Xatolik yuz berdi:', err)
})

app.get('/', (req, res) => {
  res.send('Telegram bot web service running')
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
