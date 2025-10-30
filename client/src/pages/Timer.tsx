import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

const PRESET_TIMES = [
  { label: "5 分钟", value: 5 * 60 },
  { label: "10 分钟", value: 10 * 60 },
  { label: "15 分钟", value: 15 * 60 },
  { label: "20 分钟", value: 20 * 60 },
  { label: "30 分钟", value: 30 * 60 },
];

export default function Timer() {
  const { isAuthenticated } = useAuth();
  const [selectedTime, setSelectedTime] = useState(10 * 60);
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const intervalRef = useRef<number | null>(null);

  const createSessionMutation = trpc.meditation.createSession.useMutation();

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            // 冥想结束,保存记录
            saveMeditationRecord(selectedTime);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, selectedTime]);

  const saveMeditationRecord = async (duration: number) => {
    // 如果用户已登录,保存到数据库
    if (isAuthenticated) {
      try {
        await createSessionMutation.mutateAsync({
          duration: duration,
          type: "timer",
          completed: 1,
        });
        toast.success("冥想记录已保存!");
      } catch (error) {
        console.error("保存记录失败:", error);
        // 降级到本地存储
        saveToLocalStorage(duration);
      }
    } else {
      // 未登录用户使用本地存储
      saveToLocalStorage(duration);
    }
  };

  const saveToLocalStorage = (duration: number) => {
    const records = JSON.parse(localStorage.getItem("meditationRecords") || "[]");
    records.push({
      date: new Date().toISOString(),
      duration: duration,
      completed: true,
    });
    localStorage.setItem("meditationRecords", JSON.stringify(records));
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedTime);
  };

  const handlePresetSelect = (value: number) => {
    setSelectedTime(value);
    setTimeLeft(value);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((selectedTime - timeLeft) / selectedTime) * 100;

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
          <h1 className="text-lg font-medium">冥想计时器</h1>
          <div className="w-20" />
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8">
          {/* 时间选择器 */}
          {!isRunning && timeLeft === selectedTime && (
            <div className="flex flex-wrap gap-3 justify-center">
              {PRESET_TIMES.map((preset) => (
                <Button
                  key={preset.value}
                  variant={selectedTime === preset.value ? "default" : "outline"}
                  onClick={() => handlePresetSelect(preset.value)}
                  className="min-w-24"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          )}

          {/* 计时器显示 */}
          <Card className="bg-card/50 backdrop-blur border-border/50 p-12">
            <div className="flex flex-col items-center space-y-8">
              {/* 圆形进度指示器 */}
              <div className="relative w-64 h-64 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted opacity-20"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="text-primary transition-all duration-1000"
                    strokeDasharray={`${2 * Math.PI * 120}`}
                    strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                  />
                </svg>
                <div className="text-6xl font-light tracking-wider">
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* 控制按钮 */}
              <div className="flex items-center gap-4">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                  className="rounded-full w-12 h-12"
                >
                  {isSoundEnabled ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <VolumeX className="w-5 h-5" />
                  )}
                </Button>

                {!isRunning ? (
                  <Button
                    size="lg"
                    onClick={handleStart}
                    className="rounded-full w-20 h-20 text-lg"
                  >
                    <Play className="w-8 h-8" />
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={handlePause}
                    variant="secondary"
                    className="rounded-full w-20 h-20 text-lg"
                  >
                    <Pause className="w-8 h-8" />
                  </Button>
                )}

                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleReset}
                  className="rounded-full w-12 h-12"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </div>

              {/* 提示文字 */}
              {isRunning && (
                <p className="text-muted-foreground text-sm animate-pulse">
                  保持专注,感受当下...
                </p>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
