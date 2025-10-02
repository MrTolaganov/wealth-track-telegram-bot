import dotenv from 'dotenv'

dotenv.config()

export const TOKEN = process.env.TELEGRAM_BOT_API_TOKEN
export const DB_FILE = process.env.DB_FILE || './db.json'

export const CATEGORIES = [
  { text: '🍔 Oziq-ovqat', value: 'oziq-ovqat' },
  { text: '🚗 Transport', value: 'transport' },
  { text: "🎉 Ko'ngilochar", value: 'kongilochar' },
  { text: '🏠 Uy-joy', value: 'uy-joy' },
  { text: "💊 Sog'liq", value: 'sogliq' },
  { text: "📚 Ta'lim", value: 'talim' },
  { text: '👕 Kiyim', value: 'kiyim' },
  { text: '📱 Aloqa', value: 'aloqa' },
  { text: "🎁 Sovg'alar", value: 'sovgalar' },
  { text: '📦 Boshqa', value: 'boshqa' },
]

export const INCOME_SOURCES = [
  { text: '💼 Ish haqi', value: 'ish-haqi' },
  { text: "💰 Qo'shimcha ish", value: 'qoshimcha-ish' },
  { text: '🎁 Bonus', value: 'bonus' },
  { text: '📈 Investitsiya', value: 'investitsiya' },
  { text: '🎯 Boshqa', value: 'boshqa' },
]
