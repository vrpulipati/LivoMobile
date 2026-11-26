import * as SQLite from 'expo-sqlite';

export type RecordType = 'note' | 'transaction' | 'activity';
export type TransactionDirection = 'expense' | 'income';
export type LivoRecord = {
  id: string; eventDate: number; eventTime: number; type: RecordType; title: string; notes: string;
  amount: string | null; currency: string; category: string | null; direction: TransactionDirection | null;
  createdAt: number; updatedAt: number;
};
export type Reminder = { id: string; title: string; notes: string; dueAt: number; frequency: 'once' | 'daily' | 'weekly' | 'monthly'; enabled: number; createdAt: number; updatedAt: number; notificationId: string | null };

let database: SQLite.SQLiteDatabase | null = null;

export async function db(): Promise<SQLite.SQLiteDatabase> {
  if (database) return database;
  database = await SQLite.openDatabaseAsync('livo.db');
  await database.execAsync(`PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS records (
      id TEXT PRIMARY KEY NOT NULL, event_date INTEGER NOT NULL, event_time INTEGER NOT NULL,
      type TEXT NOT NULL, title TEXT NOT NULL, notes TEXT NOT NULL DEFAULT '', amount TEXT,
      currency TEXT NOT NULL DEFAULT 'INR', category TEXT, direction TEXT,
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, notes TEXT NOT NULL DEFAULT '', due_at INTEGER NOT NULL,
      frequency TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL, notification_id TEXT
    );
    CREATE TABLE IF NOT EXISTS reminder_completions (
      id TEXT PRIMARY KEY NOT NULL, reminder_id TEXT NOT NULL, completed_at INTEGER NOT NULL
    );`);
  return database;
}

const mapRecord = (row: Record<string, unknown>): LivoRecord => ({
  id: String(row.id), eventDate: Number(row.event_date), eventTime: Number(row.event_time), type: row.type as RecordType,
  title: String(row.title), notes: String(row.notes), amount: row.amount ? String(row.amount) : null,
  currency: String(row.currency), category: row.category ? String(row.category) : null,
  direction: (row.direction as TransactionDirection | null) ?? null, createdAt: Number(row.created_at), updatedAt: Number(row.updated_at),
});

export async function listRecords(): Promise<LivoRecord[]> {
  const rows = await (await db()).getAllAsync<Record<string, unknown>>('SELECT * FROM records ORDER BY event_date DESC, event_time DESC');
  return rows.map(mapRecord);
}

export async function saveRecord(input: Omit<LivoRecord, 'createdAt' | 'updatedAt'>): Promise<void> {
  const now = Date.now();
  await (await db()).runAsync(`INSERT INTO records (id,event_date,event_time,type,title,notes,amount,currency,category,direction,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET event_date=excluded.event_date,event_time=excluded.event_time,type=excluded.type,title=excluded.title,notes=excluded.notes,amount=excluded.amount,currency=excluded.currency,category=excluded.category,direction=excluded.direction,updated_at=excluded.updated_at`,
    input.id, input.eventDate, input.eventTime, input.type, input.title, input.notes, input.amount, input.currency, input.category, input.direction, now, now);
}

export async function deleteRecord(id: string): Promise<void> { await (await db()).runAsync('DELETE FROM records WHERE id = ?', id); }

const mapReminder = (row: Record<string, unknown>): Reminder => ({
  id: String(row.id), title: String(row.title), notes: String(row.notes), dueAt: Number(row.due_at), frequency: row.frequency as Reminder['frequency'], enabled: Number(row.enabled), createdAt: Number(row.created_at), updatedAt: Number(row.updated_at), notificationId: row.notification_id ? String(row.notification_id) : null,
});

export async function listReminders(): Promise<Reminder[]> { return (await (await db()).getAllAsync<Record<string, unknown>>('SELECT * FROM reminders ORDER BY due_at ASC')).map(mapReminder); }
export async function saveReminder(input: Omit<Reminder, 'createdAt' | 'updatedAt'>): Promise<void> {
  const now = Date.now();
  await (await db()).runAsync(`INSERT INTO reminders (id,title,notes,due_at,frequency,enabled,created_at,updated_at,notification_id)
    VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,notes=excluded.notes,due_at=excluded.due_at,frequency=excluded.frequency,enabled=excluded.enabled,updated_at=excluded.updated_at,notification_id=excluded.notification_id`, input.id, input.title, input.notes, input.dueAt, input.frequency, input.enabled, now, now, input.notificationId);
}
export async function deleteReminder(id: string): Promise<void> { await (await db()).runAsync('DELETE FROM reminders WHERE id = ?', id); }
export async function completeReminder(id: string, recurring: boolean): Promise<void> {
  const now = Date.now(); const database = await db();
  await database.runAsync('INSERT INTO reminder_completions (id,reminder_id,completed_at) VALUES (?,?,?)', `${now}-${Math.random()}`, id, now);
  if (!recurring) await database.runAsync('UPDATE reminders SET enabled = 0, updated_at = ? WHERE id = ?', now, id);
}
