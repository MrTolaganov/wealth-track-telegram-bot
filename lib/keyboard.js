import { InlineKeyboard } from 'grammy'
import { CATEGORIES, INCOME_SOURCES } from './constants.js'

export function getMainMenuKeyboard() {
  return new InlineKeyboard()
    .text("💰 Xarajat qo'shish", 'add_expense')
    .text("💼 Daromad qo'shish", 'add_income')
    .row()
    .text('💳 Balans', 'balance')
    .text('📊 Hisobot', 'report_menu')
    .row()
    .text('📌 Limit', 'limit_menu')
    .text('❓ Yordam', 'help')
}

export function getCategoryKeyboard() {
  const keyboard = new InlineKeyboard()

  for (let i = 0; i < CATEGORIES.length; i += 2) {
    if (i + 1 < CATEGORIES.length) {
      keyboard
        .text(CATEGORIES[i].text, `cat_${CATEGORIES[i].value}`)
        .text(CATEGORIES[i + 1].text, `cat_${CATEGORIES[i + 1].value}`)
        .row()
    } else {
      keyboard.text(CATEGORIES[i].text, `cat_${CATEGORIES[i].value}`).row()
    }
  }

  keyboard.text('🔙 Bekor qilish', 'cancel')
  return keyboard
}

export function getIncomeSourceKeyboard() {
  const keyboard = new InlineKeyboard()

  for (let i = 0; i < INCOME_SOURCES.length; i += 2) {
    if (i + 1 < INCOME_SOURCES.length) {
      keyboard
        .text(INCOME_SOURCES[i].text, `inc_${INCOME_SOURCES[i].value}`)
        .text(INCOME_SOURCES[i + 1].text, `inc_${INCOME_SOURCES[i + 1].value}`)
        .row()
    } else {
      keyboard.text(INCOME_SOURCES[i].text, `inc_${INCOME_SOURCES[i].value}`).row()
    }
  }

  keyboard.text('🔙 Bekor qilish', 'cancel')
  return keyboard
}

export function getReportMenuKeyboard() {
  return new InlineKeyboard()
    .text('📅 Haftalik', 'report_weekly')
    .text('📆 Oylik', 'report_monthly')
    .row()
    .text('🔙 Ortga', 'main_menu')
}

export function getLimitMenuKeyboard() {
  return new InlineKeyboard()
    .text("📌 Limit o'rnatish", 'set_limit')
    .text("📍 Limitni ko'rish", 'get_limit')
    .row()
    .text('🔙 Ortga', 'main_menu')
}
