import { eq, desc, and, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  meditationSessions,
  InsertMeditationSession,
  guidedMeditations,
  InsertGuidedMeditation,
  soundPresets,
  InsertSoundPreset
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== 冥想记录相关 =====

export async function createMeditationSession(session: InsertMeditationSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(meditationSessions).values(session);
  return result;
}

export async function getUserMeditationSessions(userId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(meditationSessions)
    .where(eq(meditationSessions.userId, userId))
    .orderBy(desc(meditationSessions.createdAt))
    .limit(limit);
}

export async function getUserMeditationStats(userId: number, daysAgo = 30) {
  const db = await getDb();
  if (!db) return { totalMinutes: 0, totalSessions: 0, recentSessions: [] };
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
  
  const sessions = await db
    .select()
    .from(meditationSessions)
    .where(
      and(
        eq(meditationSessions.userId, userId),
        gte(meditationSessions.createdAt, cutoffDate)
      )
    )
    .orderBy(desc(meditationSessions.createdAt));
  
  const totalMinutes = Math.floor(
    sessions.reduce((sum, s) => sum + s.duration, 0) / 60
  );
  
  return {
    totalMinutes,
    totalSessions: sessions.length,
    recentSessions: sessions,
  };
}

// ===== 引导式冥想相关 =====

export async function createGuidedMeditation(meditation: InsertGuidedMeditation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(guidedMeditations).values(meditation);
  return result;
}

export async function getUserGuidedMeditations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(guidedMeditations)
    .where(eq(guidedMeditations.userId, userId))
    .orderBy(desc(guidedMeditations.createdAt));
}

export async function getPublicGuidedMeditations(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(guidedMeditations)
    .where(eq(guidedMeditations.isPublic, 1))
    .orderBy(desc(guidedMeditations.createdAt))
    .limit(limit);
}

export async function deleteGuidedMeditation(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(guidedMeditations)
    .where(
      and(
        eq(guidedMeditations.id, id),
        eq(guidedMeditations.userId, userId)
      )
    );
}

// ===== 音效预设相关 =====

export async function createSoundPreset(preset: InsertSoundPreset) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(soundPresets).values(preset);
  return result;
}

export async function getUserSoundPresets(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(soundPresets)
    .where(eq(soundPresets.userId, userId))
    .orderBy(desc(soundPresets.createdAt));
}

export async function getPublicSoundPresets(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(soundPresets)
    .where(eq(soundPresets.isPublic, 1))
    .orderBy(desc(soundPresets.createdAt))
    .limit(limit);
}

export async function deleteSoundPreset(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(soundPresets)
    .where(
      and(
        eq(soundPresets.id, id),
        eq(soundPresets.userId, userId)
      )
    );
}
