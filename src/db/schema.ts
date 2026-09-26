import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table authenticated via Firebase Auth (UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Central Invitations Table storing all digital wedding invitation metadata and structure
export const invitations = pgTable('invitations', {
  id: text('id').primaryKey(), // e.g. 'inv-gold-001' or uuid
  slug: text('slug').notNull().unique(), // e.g. 'rizky-amanda'
  title: text('title').notNull(),
  category: text('category').default('wedding').notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  viewsCount: integer('views_count').default(0).notNull(),
  userId: text('user_id'), // Optional creator Firebase UID
  data: jsonb('data').notNull(), // Complete invitation JSON (mempelai, events, music, theme, gallery)
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// RSVP and Greetings table linked to specific invitations
export const rsvps = pgTable('rsvps', {
  id: text('id').primaryKey(), // UUID string
  invitationId: text('invitation_id')
    .notNull()
    .references(() => invitations.id, { onDelete: 'cascade' }),
  nama: text('nama').notNull(),
  kehadiran: text('kehadiran').notNull(), // 'hadir' | 'tidak_hadir' | 'ragu'
  jumlahTamu: integer('jumlah_tamu').default(1).notNull(),
  ucapan: text('ucapan'),
  replies: jsonb('replies'), // Array of AdminReply objects
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const invitationsRelations = relations(invitations, ({ many }) => ({
  rsvps: many(rsvps),
}));

export const rsvpsRelations = relations(rsvps, ({ one }) => ({
  invitation: one(invitations, {
    fields: [rsvps.invitationId],
    references: [invitations.id],
  }),
}));
