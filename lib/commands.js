import { getMainMenuKeyboard } from './keyboard.js'

export async function start(ctx) {
  const firstName = ctx.from.first_name || 'Foydalanuvchi'

  await ctx.reply(
    `👋 Salom, ${firstName}!\n\n` +
      `🤖 Men sizning shaxsiy moliyaviy yordamchingizman.\n` +
      `Daromad va xarajatlaringizni kuzatishga yordam beraman.\n\n` +
      `✨ Quyidagi tugmalardan birini tanlang:`,
    { reply_markup: getMainMenuKeyboard() }
  )
}

export async function menu(ctx) {
  await ctx.reply('📋 Asosiy menyu:', { reply_markup: getMainMenuKeyboard() })
}

export async function help(ctx) {
  await ctx.reply(
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
    { reply_markup: getMainMenuKeyboard() }
  )
}

export async function cancel(ctx) {
  await ctx.reply("❌ Agar davom etayotgan jarayon bo'lsa, u bekor qilindi.", {
    reply_markup: getMainMenuKeyboard(),
  })
}
