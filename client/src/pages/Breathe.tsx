import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";

type BreathPhase = "inhale" | "hold" | "exhale" | "rest";

const BREATH_CYCLES = [
  { name: "4-7-8 呼吸法", inhale: 4, hold: 7, exhale: 8, rest: 0 },
  { name: "箱式呼吸", inhale: 4, hold: 4, exhale: 4, rest: 4 },
  { name: "放松呼吸", inhale: 4, hold: 0, exhale: 6, rest: 0 },
];

export default function Breathe() {
  const [selectedCycle, setSelectedCycle] = useState(BREATH_CYCLES[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("inhale");
  const [countdown, setCountdown] = useState(selectedCycle.inhale);
  const [totalCycles, setTotalCycles] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // 切换到下一个阶段
          if (phase === "inhale") {
            if (selectedCycle.hold > 0) {
              setPhase("hold");
              return selectedCycle.hold;
            } else {
              setPhase("exhale");
              return selectedCycle.exhale;
            }
          } else if (phase === "hold") {
            setPhase("exhale");
            return selectedCycle.exhale;
          } else if (phase === "exhale") {
            if (selectedCycle.rest > 0) {
              setPhase("rest");
              return selectedCycle.rest;
            } else {
              setPhase("inhale");
              setTotalCycles((c) => c + 1);
              return selectedCycle.inhale;
            }
          } else {
            // rest
            setPhase("inhale");
            setTotalCycles((c) => c + 1);
            return selectedCycle.inhale;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, phase, selectedCycle]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setPhase("inhale");
    setCountdown(selectedCycle.inhale);
    setTotalCycles(0);
  };

  const handleCycleChange = (cycle: typeof BREATH_CYCLES[0]) => {
    setSelectedCycle(cycle);
    setPhase("inhale");
    setCountdown(cycle.inhale);
    setIsRunning(false);
    setTotalCycles(0);
  };

  const getPhaseText = () => {
    switch (phase) {
      case "inhale":
        return "吸气";
      case "hold":
        return "屏息";
      case "exhale":
        return "呼气";
      case "rest":
        return "休息";
    }
  };

  const getCircleScale = () => {
    if (phase === "inhale") return "scale-150";
    if (phase === "hold") return "scale-150";
    if (phase === "exhale") return "scale-75";
    return "scale-100";
  };

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
          <h1 className="text-lg font-medium">呼吸练习</h1>
          <div className="w-20" />
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8">
          {/* 呼吸法选择 */}
          {!isRunning && (
            <div className="flex flex-wrap gap-3 justify-center">
              {BREATH_CYCLES.map((cycle) => (
                <Button
                  key={cycle.name}
                  variant={selectedCycle.name === cycle.name ? "default" : "outline"}
                  onClick={() => handleCycleChange(cycle)}
                >
                  {cycle.name}
                </Button>
              ))}
            </div>
          )}

          {/* 呼吸可视化 */}
          <Card className="bg-card/50 backdrop-blur border-border/50 p-12">
            <div className="flex flex-col items-center space-y-12">
              {/* 动画圆圈 */}
              <div className="relative w-80 h-80 flex items-center justify-center">
                <div
                  className={`absolute w-64 h-64 rounded-full bg-primary/20 backdrop-blur transition-all duration-[4000ms] ease-in-out ${getCircleScale()}`}
                />
                <div
                  className={`absolute w-48 h-48 rounded-full bg-primary/30 backdrop-blur transition-all duration-[4000ms] ease-in-out ${getCircleScale()}`}
                />
                <div
                  className={`absolute w-32 h-32 rounded-full bg-primary/40 backdrop-blur transition-all duration-[4000ms] ease-in-out ${getCircleScale()}`}
                />
                <div className="relative z-10 text-center space-y-2">
                  <div className="text-5xl font-light">{countdown}</div>
                  <div className="text-xl text-muted-foreground">{getPhaseText()}</div>
                </div>
              </div>

              {/* 控制按钮 */}
              <div className="flex items-center gap-4">
                {!isRunning ? (
                  <Button
                    size="lg"
                    onClick={handleStart}
                    className="rounded-full px-8"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    开始练习
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={handlePause}
                    variant="secondary"
                    className="rounded-full px-8"
                  >
                    <Pause className="w-5 h-5 mr-2" />
                    暂停
                  </Button>
                )}

                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleReset}
                  className="rounded-full"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  重置
                </Button>
              </div>

              {/* 统计信息 */}
              {totalCycles > 0 && (
                <div className="text-center text-muted-foreground">
                  已完成 <span className="text-primary font-medium">{totalCycles}</span> 个呼吸循环
                </div>
              )}

              {/* 说明文字 */}
              <div className="text-center text-sm text-muted-foreground max-w-md space-y-2">
                <p>跟随圆圈的节奏进行呼吸练习</p>
                <p className="text-xs">圆圈扩大时吸气,缩小时呼气</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
