import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// 冥想记录表
export const meditationSessions = mysqlTable("meditation_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  duration: int("duration").notNull(), // 冥想时长(秒)
  type: varchar("type", { length: 50 }).notNull(), // timer, breathe, guided
  completed: int("completed").default(1).notNull(), // 1=完成, 0=未完成
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MeditationSession = typeof meditationSessions.$inferSelect;
export type InsertMeditationSession = typeof meditationSessions.$inferInsert;

// 引导式冥想音频表
export const guidedMeditations = mysqlTable("guided_meditations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  audioUrl: text("audioUrl").notNull(),
  duration: int("duration").notNull(), // 音频时长(秒)
  category: varchar("category", { length: 50 }), // 分类
  isPublic: int("isPublic").default(0).notNull(), // 0=私有, 1=公开
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GuidedMeditation = typeof guidedMeditations.$inferSelect;
export type InsertGuidedMeditation = typeof guidedMeditations.$inferInsert;

// 音效组合配置表
export const soundPresets = mysqlTable("sound_presets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  config: text("config").notNull(), // JSON格式存储音效配置
  isPublic: int("isPublic").default(0).notNull(), // 0=私有, 1=公开
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SoundPreset = typeof soundPresets.$inferSelect;
export type InsertSoundPreset = typeof soundPresets.$inferInsert;