import { pgTable, text, timestamp, serial, integer, pgEnum } from "drizzle-orm/pg-core";


export const senderTable = pgTable("sender", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const statusEnum = pgEnum("status", ["pending", "scheduled", "sent", "failed"]);

export const emailJobTable = pgTable("email_job", {
    id: serial("id").primaryKey(),
    senderId: integer("sender_id").notNull().references(() => senderTable.id),
    recipient: text("email").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    status: statusEnum("status").notNull().default("pending"),
    scheduledAt: timestamp("scheduled_at").notNull(),
    sentAt: timestamp("sentAt")
});