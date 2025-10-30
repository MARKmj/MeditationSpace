import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, TrendingUp } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface LocalMeditationRecord {
  date: string;
  duration: number;
  completed: boolean;
}

export default function Records() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [localRecords, setLocalRecords] = useState<LocalMeditationRecord[]>([]);

  // 获取数据库记录
  const { data: dbSessions, isLoading: dbLoading } = trpc.meditation.getSessions.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: dbStats } = trpc.meditation.getStats.useQuery(
    { daysAgo: 30 },
    { enabled: isAuthenticated }
  );

  // 加载本地记录
  useEffect(() => {
    const stored = localStorage.getItem("meditationRecords");
    if (stored) {
      setLocalRecords(JSON.parse(stored));
    }
  }, []);

  // 合并数据库和本地记录
  const allRecords = useMemo(() => {
    if (isAuthenticated && dbSessions) {
      return dbSessions.map((s) => ({
        date: s.createdAt.toISOString(),
        duration: s.duration,
        completed: s.completed === 1,
      }));
    }
    return localRecords;
  }, [isAuthenticated, dbSessions, localRecords]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} 分钟`;
  };

  const getTotalMinutes = () => {
    if (isAuthenticated && dbStats) {
      return dbStats.totalMinutes;
    }
    return Math.floor(
      allRecords.reduce((sum, record) => sum + record.duration, 0) / 60
    );
  };

  const getTotalSessions = () => {
    if (isAuthenticated && dbStats) {
      return dbStats.totalSessions;
    }
    return allRecords.length;
  };

  const getThisWeekSessions = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return allRecords.filter((record) => new Date(record.date) > oneWeekAgo).length;
  };

  // 准备图表数据 - 每日冥想时长
  const dailyData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    const dataMap = new Map<string, number>();
    last7Days.forEach((day) => dataMap.set(day, 0));

    allRecords.forEach((record) => {
      const day = new Date(record.date).toISOString().split("T")[0];
      if (dataMap.has(day)) {
        dataMap.set(day, (dataMap.get(day) || 0) + Math.floor(record.duration / 60));
      }
    });

    return last7Days.map((day) => ({
      date: new Date(day).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
      minutes: dataMap.get(day) || 0,
    }));
  }, [allRecords]);

  // 准备图表数据 - 每日冥想次数
  const frequencyData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    const dataMap = new Map<string, number>();
    last7Days.forEach((day) => dataMap.set(day, 0));

    allRecords.forEach((record) => {
      const day = new Date(record.date).toISOString().split("T")[0];
      if (dataMap.has(day)) {
        dataMap.set(day, (dataMap.get(day) || 0) + 1);
      }
    });

    return last7Days.map((day) => ({
      date: new Date(day).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
      count: dataMap.get(day) || 0,
    }));
  }, [allRecords]);

  const handleClearRecords = () => {
    if (confirm("确定要清除所有本地冥想记录吗?")) {
      localStorage.removeItem("meditationRecords");
      setLocalRecords([]);
    }
  };

  if (authLoading || (isAuthenticated && dbLoading)) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="border-b border-border/50 backdrop-blur-sm">
          <div className="container py-4 flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← 返回首页
              </Button>
            </Link>
            <h1 className="text-lg font-medium">冥想记录</h1>
            <div className="w-20" />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="bg-card/50 backdrop-blur border-border/50 p-12 text-center max-w-md">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-semibold mb-2">登录查看完整记录</h2>
            <p className="text-muted-foreground mb-6">
              登录后,你的冥想记录将自动同步到云端,并可查看详细的统计图表
            </p>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>立即登录</a>
            </Button>
            {localRecords.length > 0 && (
              <p className="text-sm text-muted-foreground mt-4">
                当前本地记录: {localRecords.length} 次
              </p>
            )}
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 顶部导航 */}
      <header className="border-b border-border/50 backdrop-blur-sm">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              ← 返回首页
            </Button>
          </Link>
          <h1 className="text-lg font-medium">冥想记录</h1>
          <div className="w-20" />
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 container py-8 space-y-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50 backdrop-blur border-border/50 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{getTotalMinutes()}</div>
                <div className="text-sm text-muted-foreground">总冥想时长(分钟)</div>
              </div>
            </div>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{getTotalSessions()}</div>
                <div className="text-sm text-muted-foreground">总冥想次数</div>
              </div>
            </div>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-chart-2/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-chart-2" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{getThisWeekSessions()}</div>
                <div className="text-sm text-muted-foreground">本周冥想次数</div>
              </div>
            </div>
          </Card>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 每日时长趋势 */}
          <Card className="bg-card/50 backdrop-blur border-border/50 p-6">
            <h3 className="text-lg font-semibold mb-4">近7天冥想时长(分钟)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorMinutes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* 每日次数统计 */}
          <Card className="bg-card/50 backdrop-blur border-border/50 p-6">
            <h3 className="text-lg font-semibold mb-4">近7天冥想次数</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={frequencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* 记录列表 */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <h2 className="text-xl font-medium">历史记录</h2>
            {!isAuthenticated && localRecords.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearRecords}
                className="text-destructive hover:text-destructive"
              >
                清除本地记录
              </Button>
            )}
          </div>

          <div className="divide-y divide-border/50">
            {allRecords.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>还没有冥想记录</p>
                <p className="text-sm mt-2">开始你的第一次冥想吧!</p>
              </div>
            ) : (
              allRecords
                .slice()
                .reverse()
                .slice(0, 20)
                .map((record, index) => (
                  <div
                    key={index}
                    className="p-6 flex items-center justify-between hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {formatDuration(record.duration)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(record.date)}
                        </div>
                      </div>
                    </div>
                    {record.completed && (
                      <div className="text-accent text-sm font-medium">✓ 已完成</div>
                    )}
                  </div>
                ))
            )}
          </div>
        </Card>

        {/* 鼓励文字 */}
        {allRecords.length > 0 && (
          <div className="text-center text-muted-foreground space-y-2">
            <p className="text-lg">
              {getTotalSessions() >= 7
                ? "太棒了!你已经养成了良好的冥想习惯 🌟"
                : getTotalSessions() >= 3
                ? "做得很好!继续保持 💪"
                : "很好的开始!坚持下去 ✨"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
