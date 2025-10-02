import { endOfMonth, parseISO, startOfMonth } from "date-fns"
import { currencyFmt } from "./format.js"

export async function checkMonthlyLimit(ctx, user) {
  if (!user.limit) return

  const now = new Date()
  const start = startOfMonth(now)
  const end = endOfMonth(now)
  const monthSum = user.expenses
    .filter(e => {
      const d = parseISO(e.date)
      return d >= start && d <= end
    })
    .reduce((s, e) => s + Number(e.amount), 0)

  if (monthSum > user.limit) {
    await ctx.reply(
      `⚠️ OGOHLANTIRISH!\n\n` +
        `Oylik xarajat limitingiz oshib ketdi!\n\n` +
        `📊 Limit: ${currencyFmt(user.limit)} so'm\n` +
        `📈 Joriy xarajat: ${currencyFmt(monthSum)} so'm\n` +
        `🔴 Oshgan: ${currencyFmt(monthSum - user.limit)} so'm`
    )
  } else if (monthSum > user.limit * 0.8) {
    await ctx.reply(
      `⚠️ Diqqat!\n\n` +
        `Limitingizning 80% dan ortig'ini sarfladingiz.\n\n` +
        `📊 Limit: ${currencyFmt(user.limit)} so'm\n` +
        `📈 Sarflangan: ${currencyFmt(monthSum)} so'm\n` +
        `💰 Qolgan: ${currencyFmt(user.limit - monthSum)} so'm`
    )
  }
}