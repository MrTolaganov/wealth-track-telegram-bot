import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { DB_FILE } from './constants.js'

export const adapter = new JSONFile(DB_FILE)
export const db = new Low(adapter, { users: {} })

export async function initDB() {
  try {
    await db.read()
  } catch {
    db.data = { users: {} }
    await db.write()
  }

  if (!db.data) {
    db.data = { users: {} }
    await db.write()
  }
}

export async function getUserData(userId) {
  await db.read()
  db.data.users[userId] = db.data.users[userId] || {
    expenses: [],
    incomes: [],
    limit: null,
  }
  return db.data.users[userId]
}
