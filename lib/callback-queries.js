import { InlineKeyboard } from 'grammy'
import { getUserData } from './db.js'
import { currencyFmt } from './format.js'
import { getLimitMenuKeyboard, getMainMenuKeyboard, getReportMenuKeyboard } from './keyboard.js'
import { endOfMonth, endOfWeek, format, parseISO, startOfMonth, startOfWeek } from 'date-fns'
import { CATEGORIES } from './constants.js'

async function safeAnswerCallback(ctx, options = {}) {
  try {
    await ctx.answerCallbackQuery(options)
  } catch (error) {
    if (
      !error.description?.includes('query is too old') &&
      !error.description?.includes('query ID is invalid')
    ) {
      console.error('Callback error:', error)
    }
  }
}

export async function mainMenu(ctx) {
  await safeAnswerCallback(ctx)
  await ctx.editMessageText('📋 Asosiy menyu:', { reply_markup: getMainMenuKeyboard() })
}

export async function addExpense(ctx) {
  await safeAnswerCallback(ctx)
  await ctx.conversation.enter('addExpenseConversation')
}

export async function addIncome(ctx) {
  await safeAnswerCallback(ctx)
  await ctx.conversation.enter('addIncomeConversation')
}

export async function balance(ctx) {
  await safeAnswerCallback(ctx)

  const userId = String(ctx.from.id)
  const user = await getUserData(userId)

  const totalIncome = user.incomes.reduce((s, i) => s + Number(i.amount), 0)
  const totalExpense = user.expenses.reduce((s, e) => s + Number(e.amount), 0)
  const balance = totalIncome - totalExpense

  const balanceEmoji = balance >= 0 ? '✅' : '⚠️'
  const balanceStatus = balance >= 0 ? 'Ijobiy balans' : 'Manfiy balans'

  await ctx.editMessageText(
    `${balanceEmoji} UMUMIY BALANS\n\n` +
      `📈 Jami daromad: ${currencyFmt(totalIncome)} so'm\n` +
      `📉 Jami xarajat: ${currencyFmt(totalExpense)} so'm\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `💰 Sof balans: ${currencyFmt(balance)} so'm\n\n` +
      `📊 Status: ${balanceStatus}\n\n` +
      `💡 Yozuvlar:\n` +
      `   • Daromadlar: ${user.incomes.length} ta\n` +
      `   • Xarajatlar: ${user.expenses.length} ta`,
    { reply_markup: new InlineKeyboard().text('🔙 Ortga', 'main_menu') }
  )
}

export async function reportMenu(ctx) {
  await safeAnswerCallback(ctx)
  await ctx.editMessageText('📊 Hisobot turini tanlang:', { reply_markup: getReportMenuKeyboard() })
}

export async function reportWeeklyAndMonthly(ctx) {
  await safeAnswerCallback(ctx)

  const mode = ctx.callbackQuery.data === 'report_monthly' ? 'monthly' : 'weekly'
  const userId = String(ctx.from.id)
  const user = await getUserData(userId)

  const now = new Date()
  let start, end, title

  if (mode === 'monthly') {
    start = startOfMonth(now)
    end = endOfMonth(now)
    title = '📆 OYLIK HISOBOT'
  } else {
    start = startOfWeek(now, { weekStartsOn: 1 })
    end = endOfWeek(now, { weekStartsOn: 1 })
    title = '📅 HAFTALIK HISOBOT'
  }

  const exps = user.expenses.filter(e => {
    const d = parseISO(e.date)
    return d >= start && d <= end
  })

  const incs = user.incomes.filter(i => {
    const d = parseISO(i.date)
    return d >= start && d <= end
  })

  const totalExpense = exps.reduce((s, e) => s + Number(e.amount), 0)
  const totalIncome = incs.reduce((s, i) => s + Number(i.amount), 0)
  const net = totalIncome - totalExpense

  const byCat = {}
  for (const e of exps) {
    byCat[e.category] = (byCat[e.category] || 0) + Number(e.amount)
  }

  let msg = `<b>${title}</b>\n`
  msg += `🕑 Davr: ${format(start, 'dd.MM.yyyy')} — ${format(end, 'dd.MM.yyyy')}\n\n`
  msg += `━━━━━━━━━━━━━━━━━━\n`
  msg += `📈 Jami daromad: ${currencyFmt(totalIncome)} so'm\n`
  msg += `📉 Jami xarajat: ${currencyFmt(totalExpense)} so'm\n`
  msg += `💰 Sof balans: ${currencyFmt(net)} so'm\n`
  msg += `━━━━━━━━━━━━━━━━━━\n\n`

  msg += `<b>📂 Kategoriyalar:</b>\n\n`

  if (Object.keys(byCat).length === 0) {
    msg += '❌ Bu davrda xarajatlar topilmadi.\n'
  } else {
    const sortedCats = Object.entries(byCat).sort((a, b) => b[1] - a[1])
    for (const [cat, val] of sortedCats) {
      const percentage = totalExpense > 0 ? ((val / totalExpense) * 100).toFixed(1) : 0
      const catName = CATEGORIES.find(c => c.value === cat)?.text.substring(2) || cat
      msg += `• <b>${catName}</b>: ${currencyFmt(val)} so'm (${percentage}%)\n`
    }
  }

  await ctx.editMessageText(msg, {
    parse_mode: 'HTML',
    reply_markup: new InlineKeyboard().text('🔙 Ortga', 'report_menu'),
  })
}

export async function limitMenu(ctx) {
  await safeAnswerCallback(ctx)
  await ctx.editMessageText('📌 Limit sozlamalari:', { reply_markup: getLimitMenuKeyboard() })
}

export async function setLimit(ctx) {
  await safeAnswerCallback(ctx)
  await ctx.conversation.enter('setLimitConversation')
}

export async function getLimit(ctx) {
  await safeAnswerCallback(ctx)

  const userId = String(ctx.from.id)
  const user = await getUserData(userId)

  if (!user.limit) {
    await ctx.editMessageText(
      `📍 Limit o'rnatilmagan.\n\n` +
        `💡 Limit o'rnatish uchun\n` +
        `"📌 Limit o'rnatish" tugmasini bosing.`,
      { reply_markup: getLimitMenuKeyboard() }
    )
    return
  }

  const now = new Date()
  const start = startOfMonth(now)
  const end = endOfMonth(now)
  const monthSum = user.expenses
    .filter(e => {
      const d = parseISO(e.date)
      return d >= start && d <= end
    })
    .reduce((s, e) => s + Number(e.amount), 0)

  const remaining = user.limit - monthSum
  const percentage = ((monthSum / user.limit) * 100).toFixed(1)

  await ctx.editMessageText(
    `📊 OYLIK LIMIT STATISTIKASI\n\n` +
      `📌 Limit: ${currencyFmt(user.limit)} so'm\n` +
      `💸 Sarflangan: ${currencyFmt(monthSum)} so'm (${percentage}%)\n` +
      `💰 Qolgan: ${currencyFmt(remaining)} so'm\n\n` +
      `${
        remaining < 0
          ? '⚠️ Limit oshib ketdi!'
          : remaining < user.limit * 0.2
          ? '⚠️ Limitga yaqinlashdingiz!'
          : '✅ Yaxshi boshqaryapsiz!'
      }`,
    { reply_markup: new InlineKeyboard().text('🔙 Ortga', 'limit_menu') }
  )
}

export async function helpQuery(ctx) {
  await safeAnswerCallback(ctx)

  await ctx.editMessageText(
    `📚 YORDAM BO'LIMI\n\n` +
      `🎯 Buyruqlar:\n\n` +
      `• /menu - Asosiy menyu\n` +
      `• /cancel - Amalni bekor qilish\n\n` +
      `💡 Xususiyatlar:\n\n` +
      `✅ Xarajat va daromad qo'shish\n` +
      `✅ Balans va hisobotlar\n` +
      `✅ Oylik xarajat limiti\n` +
      `✅ Kategoriyalar bo'yicha tahlil\n` +
      `✅ Avtomatik ogohlantirishlar\n\n` +
      `💡 Maslahat: Tugmalardan foydalaning,\n` +
      `bu tezroq va qulayroq!`,
    { reply_markup: new InlineKeyboard().text('🔙 Ortga', 'main_menu') }
  )
}

export async function cancelQuery(ctx) {
  await safeAnswerCallback(ctx, { text: '❌ Operatsiya bekor qilindi' })
}
