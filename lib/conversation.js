import { CATEGORIES, INCOME_SOURCES } from './constants.js'
import { db, getUserData } from './db.js'
import { currencyFmt } from './format.js'
import { getCategoryKeyboard, getIncomeSourceKeyboard, getMainMenuKeyboard } from './keyboard.js'
import { checkMonthlyLimit } from './limit.js'

export async function addExpenseConversation(conversation, ctx) {
  await ctx.reply("💰 Yangi xarajat qo'shish.\n\n📝 Xarajat nomini kiriting:")

  const nameCtx = await conversation.wait()
  if (nameCtx.message?.text === '/cancel') {
    await ctx.reply('❌ Operatsiya bekor qilindi.', { reply_markup: getMainMenuKeyboard() })
    return
  }

  const name = nameCtx.message?.text?.trim()

  if (!name) {
    await ctx.reply("❌ Noto'g'ri nom, operatsiya bekor qilindi.", {
      reply_markup: getMainMenuKeyboard(),
    })
    return
  }

  await ctx.reply('💵 Summasini kiriting (faqat raqam):\n\n💡 Bekor qilish: /cancel')

  const sumCtx = await conversation.wait()
  if (sumCtx.message?.text === '/cancel') {
    await ctx.reply('❌ Operatsiya bekor qilindi.', { reply_markup: getMainMenuKeyboard() })
    return
  }

  const sumText = sumCtx.message?.text?.replace(/[,\s]/g, '.').trim()
  const amount = parseFloat(sumText)

  if (!amount || isNaN(amount) || amount <= 0) {
    await ctx.reply("❌ Noto'g'ri summa, operatsiya bekor qilindi.", {
      reply_markup: getMainMenuKeyboard(),
    })
    return
  }

  await ctx.reply('📂 Kategoriyani tanlang:', { reply_markup: getCategoryKeyboard() })

  const catCtx = await conversation.wait()
  let category = 'boshqa'

  if (catCtx.callbackQuery?.data?.startsWith('cat_')) {
    category = catCtx.callbackQuery.data.replace('cat_', '')
    await catCtx.answerCallbackQuery()
  } else if (catCtx.callbackQuery?.data === 'cancel') {
    await catCtx.answerCallbackQuery()
    await ctx.reply('❌ Operatsiya bekor qilindi.', { reply_markup: getMainMenuKeyboard() })
    return
  }

  const userId = String(ctx.from.id)
  const user = await getUserData(userId)

  const expense = {
    id: Date.now().toString(),
    name,
    amount,
    category,
    date: new Date().toISOString(),
  }

  user.expenses.push(expense)

  await db.write()

  const categoryName = CATEGORIES.find(c => c.value === category)?.text || category

  await ctx.reply(
    `✅ Xarajat muvaffaqiyatli qo'shildi!\n\n` +
      `📝 Nomi: ${name}\n` +
      `💵 Summa: ${currencyFmt(amount)} so'm\n` +
      `📂 Kategoriya: ${categoryName}`,
    { reply_markup: getMainMenuKeyboard() }
  )

  await checkMonthlyLimit(ctx, user)
}

export async function addIncomeConversation(conversation, ctx) {
  await ctx.reply("💼 Yangi daromad qo'shish.\n\n📝 Daromad manbasini tanlang:", {
    reply_markup: getIncomeSourceKeyboard(),
  })

  const srcCtx = await conversation.wait()
  let source = 'boshqa'

  if (srcCtx.callbackQuery?.data?.startsWith('inc_')) {
    source = srcCtx.callbackQuery.data.replace('inc_', '')
    await srcCtx.answerCallbackQuery()
  } else if (srcCtx.callbackQuery?.data === 'cancel') {
    await srcCtx.answerCallbackQuery()
    await ctx.reply('❌ Operatsiya bekor qilindi.', { reply_markup: getMainMenuKeyboard() })
    return
  }

  await ctx.reply('💵 Summasini kiriting (faqat raqam):\n\n💡 Bekor qilish: /cancel')

  const sumCtx = await conversation.wait()
  if (sumCtx.message?.text === '/cancel') {
    await ctx.reply('❌ Operatsiya bekor qilindi.', { reply_markup: getMainMenuKeyboard() })
    return
  }

  const sumText = sumCtx.message?.text?.replace(/[,\s]/g, '.').trim()
  const amount = parseFloat(sumText)

  if (!amount || isNaN(amount) || amount <= 0) {
    await ctx.reply("❌ Noto'g'ri summa, operatsiya bekor qilindi.", {
      reply_markup: getMainMenuKeyboard(),
    })
    return
  }

  const userId = String(ctx.from.id)
  const user = await getUserData(userId)
  const income = {
    id: Date.now().toString(),
    source,
    amount,
    date: new Date().toISOString(),
  }
  user.incomes.push(income)
  await db.write()

  const sourceName = INCOME_SOURCES.find(s => s.value === source)?.text || source

  await ctx.reply(
    `✅ Daromad muvaffaqiyatli qo'shildi!\n\n` +
      `💼 Manba: ${sourceName}\n` +
      `💵 Summa: ${currencyFmt(amount)} so'm`,
    { reply_markup: getMainMenuKeyboard() }
  )
}

export async function setLimitConversation(conversation, ctx) {
  await ctx.reply(
    "📌 Oylik xarajat limitini o'rnatish.\n\n💵 Limit summasini kiriting:\n\n💡 Bekor qilish: /cancel"
  )

  const limitCtx = await conversation.wait()
  if (limitCtx.message?.text === '/cancel') {
    await ctx.reply('❌ Operatsiya bekor qilindi.', { reply_markup: getMainMenuKeyboard() })
    return
  }

  const limitText = limitCtx.message?.text?.replace(/[,\s]/g, '.').trim()
  const limit = parseFloat(limitText)

  if (!limit || isNaN(limit) || limit <= 0) {
    await ctx.reply("❌ Noto'g'ri summa, operatsiya bekor qilindi.", {
      reply_markup: getMainMenuKeyboard(),
    })
    return
  }

  const userId = String(ctx.from.id)
  const user = await getUserData(userId)
  user.limit = limit
  await db.write()

  await ctx.reply(
    `✅ Oylik xarajat limiti o'rnatildi!\n\n` +
      `📌 Limit: ${currencyFmt(limit)} so'm\n\n` +
      `⚠️ Limit oshib ketganda avtomatik xabar olasiz!`,
    { reply_markup: getMainMenuKeyboard() }
  )
}
