import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // 冥想记录
  meditation: router({
    // 创建冥想记录
    createSession: protectedProcedure
      .input(
        z.object({
          duration: z.number(),
          type: z.enum(["timer", "breathe", "guided"]),
          completed: z.number().default(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.createMeditationSession({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),

    // 获取用户冥想记录
    getSessions: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserMeditationSessions(ctx.user.id);
    }),

    // 获取统计数据
    getStats: protectedProcedure
      .input(z.object({ daysAgo: z.number().default(30) }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getUserMeditationStats(ctx.user.id, input?.daysAgo);
      }),
  }),

  // 引导式冥想
  guided: router({
    // 上传音频
    upload: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          audioBase64: z.string(),
          duration: z.number(),
          category: z.string().optional(),
          isPublic: z.boolean().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // 解码base64音频
        const audioBuffer = Buffer.from(input.audioBase64, "base64");
        const fileKey = `guided-meditations/${ctx.user.id}/${Date.now()}.mp3`;
        
        // 上传到S3
        const { url } = await storagePut(fileKey, audioBuffer, "audio/mpeg");

        // 保存到数据库
        await db.createGuidedMeditation({
          userId: ctx.user.id,
          title: input.title,
          description: input.description || null,
          audioUrl: url,
          duration: input.duration,
          category: input.category || null,
          isPublic: input.isPublic ? 1 : 0,
        });

        return { success: true, url };
      }),

    // 获取用户的引导式冥想
    getMy: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserGuidedMeditations(ctx.user.id);
    }),

    // 获取公开的引导式冥想
    getPublic: publicProcedure.query(async () => {
      return await db.getPublicGuidedMeditations();
    }),

    // 删除
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteGuidedMeditation(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // 音效预设
  sounds: router({
    // 保存音效组合
    savePreset: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          config: z.string(), // JSON字符串
          isPublic: z.boolean().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.createSoundPreset({
          userId: ctx.user.id,
          name: input.name,
          description: input.description || null,
          config: input.config,
          isPublic: input.isPublic ? 1 : 0,
        });
        return { success: true };
      }),

    // 获取用户的音效预设
    getMy: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserSoundPresets(ctx.user.id);
    }),

    // 获取公开的音效预设
    getPublic: publicProcedure.query(async () => {
      return await db.getPublicSoundPresets();
    }),

    // 删除
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteSoundPreset(input.id, ctx.user.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
