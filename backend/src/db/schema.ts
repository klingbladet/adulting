import { pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: varchar('username').notNull().unique(),
    email: varchar('email').notNull().unique(),
    passwordHash: varchar('password_hash').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});