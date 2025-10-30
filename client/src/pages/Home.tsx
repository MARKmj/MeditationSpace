import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Timer, Wind, Headphones, Music, BookOpen, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { APP_TITLE } from "@/const";
import { useEffect, useState } from "react";
import { preloadResources } from "@/lib/performance";

export default function Home() {
  // 使用 try-catch 来处理可能的认证错误
  let authState;
  try {
    authState = useAuth();
  } catch (error) {
    console.warn('认证功能暂时不可用:', error);
    authState = {
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      logout: () => {}
    };
  }

  const { user, loading, error, isAuthenticated, logout } = authState;

  const [greeting, setGreeting] = useState("");
  const [totalMinutes, setTotalMinutes] = useState(0);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 6) {
      setGreeting("深夜好");
    } else if (hour < 12) {
      setGreeting("早上好");
    } else if (hour < 18) {
      setGreeting("下午好");
    } else {
      setGreeting("晚上好");
    }

    // 加载冥想记录
    const records = JSON.parse(localStorage.getItem("meditationRecords") || "[]");
    const total = Math.floor(
      records.reduce((sum: number, record: any) => sum + record.duration, 0) / 60
    );
    setTotalMinutes(total);

    // 预加载常用资源以提升用户体验
    const resourcesToPreload = [
      { type: 'audio' as const, src: '/sounds/rain.mp3' },
      { type: 'audio' as const, src: '/sounds/ocean.mp3' },
      { type: 'audio' as const, src: '/sounds/forest.mp3' },
    ];

    // 延迟预加载，避免影响初始页面渲染
    setTimeout(() => {
      preloadResources(resourcesToPreload);
    }, 2000);
  }, []);

  const features = [
    {
      title: "冥想计时器",
      description: "选择时长,开始你的冥想之旅",
      icon: Timer,
      href: "/timer",
      color: "from-primary/20 to-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "呼吸练习",
      description: "跟随节奏,调整呼吸",
      icon: Wind,
      href: "/breathe",
      color: "from-accent/20 to-accent/10",
      iconColor: "text-accent",
    },
    {
      title: "引导式冥想",
      description: "专业导师引导,深度放松",
      icon: Headphones,
      href: "/guided",
      color: "from-chart-2/20 to-chart-2/10",
      iconColor: "text-chart-2",
    },
    {
      title: "环境音效",
      description: "自然声音,营造氛围",
      icon: Music,
      href: "/sounds",
      color: "from-chart-3/20 to-chart-3/10",
      iconColor: "text-chart-3",
    },
    {
      title: "冥想记录",
      description: "追踪进度,见证成长",
      icon: BarChart3,
      href: "/records",
      color: "from-chart-4/20 to-chart-4/10",
      iconColor: "text-chart-4",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative container py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {/* 问候语 */}
            <div className="space-y-2">
              <p className="text-lg text-muted-foreground">{greeting}</p>
              <h1 className="text-5xl md:text-6xl font-light tracking-tight">
                {APP_TITLE}
              </h1>
            </div>

            {/* 副标题 */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              在这里,找到内心的宁静。无论你是冥想新手还是资深练习者,
              我们都为你准备了专业的工具和温暖的陪伴。
            </p>

            {/* 统计信息 */}
            {totalMinutes > 0 && (
              <Card className="inline-block bg-card/50 backdrop-blur border-border/50 px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  你已累计冥想{" "}
                  <span className="text-2xl font-semibold text-primary mx-2">
                    {totalMinutes}
                  </span>{" "}
                  分钟
                </p>
              </Card>
            )}

            {/* 快速开始按钮 */}
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link href="/timer">
                <Button size="lg" className="rounded-full px-8">
                  <Timer className="w-5 h-5 mr-2" />
                  开始冥想
                </Button>
              </Link>
              <Link href="/breathe">
                <Button size="lg" variant="outline" className="rounded-full px-8">
                  <Wind className="w-5 h-5 mr-2" />
                  呼吸练习
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-3xl font-semibold">探索冥想工具</h2>
            <p className="text-muted-foreground">
              多样化的功能,满足你不同场景的冥想需求
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Link key={feature.title} href={feature.href}>
                <Card className="bg-card/50 backdrop-blur border-border/50 p-6 h-full hover:border-primary/50 transition-all hover:scale-105 cursor-pointer group">
                  <div className="space-y-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}

            {/* 学习资源卡片(占位) */}
            <Card className="bg-gradient-to-br from-muted/50 to-muted/20 backdrop-blur border-border/50 p-6 h-full flex flex-col justify-center items-center text-center space-y-3">
              <BookOpen className="w-12 h-12 text-muted-foreground/50" />
              <div>
                <h3 className="text-lg font-semibold mb-1">更多功能</h3>
                <p className="text-sm text-muted-foreground">
                  冥想课程、社区分享等功能即将推出
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="container py-16 md:py-24">
        <Card className="max-w-3xl mx-auto bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur border-border/50 p-12 text-center">
          <blockquote className="space-y-4">
            <p className="text-2xl md:text-3xl font-light leading-relaxed">
              "冥想不是要让你成为更好的人,
              而是让你成为更真实的自己。"
            </p>
            <footer className="text-muted-foreground">
              — Jon Kabat-Zinn
            </footer>
          </blockquote>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container text-center text-sm text-muted-foreground space-y-2">
          <p>每天几分钟,让心灵回归平静</p>
          <p className="text-xs">© 2024 {APP_TITLE}. 用心打造.</p>
        </div>
      </footer>
    </div>
  );
}
