import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Play, Pause, Volume2, Save, Share2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const AMBIENT_SOUNDS = [
  {
    id: 1,
    name: "雨声",
    description: "温柔的雨滴声,营造宁静氛围",
    icon: "🌧️",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: 2,
    name: "海浪",
    description: "海浪拍打海岸的自然韵律",
    icon: "🌊",
    color: "from-cyan-500/20 to-blue-600/20",
  },
  {
    id: 3,
    name: "森林",
    description: "鸟鸣与树叶沙沙声",
    icon: "🌲",
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    id: 4,
    name: "篝火",
    description: "温暖的火焰噼啪声",
    icon: "🔥",
    color: "from-orange-500/20 to-red-500/20",
  },
  {
    id: 5,
    name: "雷雨",
    description: "远处的雷声与雨声",
    icon: "⛈️",
    color: "from-purple-500/20 to-blue-500/20",
  },
  {
    id: 6,
    name: "风铃",
    description: "清脆悦耳的风铃声",
    icon: "🎐",
    color: "from-pink-500/20 to-purple-500/20",
  },
  {
    id: 7,
    name: "溪流",
    description: "潺潺流水声",
    icon: "💧",
    color: "from-teal-500/20 to-cyan-500/20",
  },
  {
    id: 8,
    name: "白噪音",
    description: "帮助专注的白噪音",
    icon: "📻",
    color: "from-gray-500/20 to-slate-500/20",
  },
];

export default function Sounds() {
  const { isAuthenticated } = useAuth();
  const [playingIds, setPlayingIds] = useState<number[]>([]);
  const [volumes, setVolumes] = useState<Record<number, number>>(
    Object.fromEntries(AMBIENT_SOUNDS.map((s) => [s.id, 70]))
  );
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetForm, setPresetForm] = useState({
    name: "",
    description: "",
    isPublic: false,
  });

  const { data: userPresets, refetch } = trpc.sounds.getMy.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: publicPresets } = trpc.sounds.getPublic.useQuery();

  const savePresetMutation = trpc.sounds.savePreset.useMutation({
    onSuccess: () => {
      toast.success("音效组合已保存!");
      setSaveDialogOpen(false);
      setPresetForm({ name: "", description: "", isPublic: false });
      refetch();
    },
    onError: (error) => {
      toast.error("保存失败: " + error.message);
    },
  });

  const deletePresetMutation = trpc.sounds.delete.useMutation({
    onSuccess: () => {
      toast.success("删除成功!");
      refetch();
    },
  });

  const toggleSound = (id: number) => {
    if (playingIds.includes(id)) {
      setPlayingIds(playingIds.filter((pid) => pid !== id));
    } else {
      setPlayingIds([...playingIds, id]);
      toast.success("音效功能开发中", {
        description: "完整版将支持真实环境音效",
      });
    }
  };

  const handleVolumeChange = (id: number, value: number[]) => {
    setVolumes({ ...volumes, [id]: value[0] });
  };

  const handleSavePreset = async () => {
    if (!presetForm.name) {
      toast.error("请输入配置名称");
      return;
    }

    if (playingIds.length === 0) {
      toast.error("请至少选择一个音效");
      return;
    }

    const config = {
      sounds: playingIds,
      volumes: Object.fromEntries(
        playingIds.map((id) => [id, volumes[id]])
      ),
    };

    await savePresetMutation.mutateAsync({
      name: presetForm.name,
      description: presetForm.description || undefined,
      config: JSON.stringify(config),
      isPublic: presetForm.isPublic,
    });
  };

  const loadPreset = (configStr: string) => {
    try {
      const config = JSON.parse(configStr);
      setPlayingIds(config.sounds || []);
      setVolumes({ ...volumes, ...config.volumes });
      toast.success("已加载音效配置");
    } catch (error) {
      toast.error("加载配置失败");
    }
  };

  const handleDeletePreset = async (id: number) => {
    if (confirm("确定要删除这个音效配置吗?")) {
      await deletePresetMutation.mutateAsync({ id });
    }
  };

  const handleShare = () => {
    if (playingIds.length === 0) {
      toast.error("请至少选择一个音效");
      return;
    }

    const config = {
      sounds: playingIds,
      volumes: Object.fromEntries(
        playingIds.map((id) => [id, volumes[id]])
      ),
    };

    const shareText = `我在静心空间创建了一个音效组合,包含: ${playingIds
      .map((id) => AMBIENT_SOUNDS.find((s) => s.id === id)?.name)
      .join("、")}`;

    if (navigator.share) {
      navigator.share({
        title: "我的冥想音效组合",
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("已复制到剪贴板");
    }
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
          <h1 className="text-lg font-medium">环境音效</h1>
          <div className="w-20" />
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 container py-8 space-y-8">
        {/* 介绍 */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">沉浸式环境音效</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            选择你喜欢的自然声音,创造专属的冥想氛围。你可以同时播放多个音效,调节音量以达到最佳效果。
          </p>
        </div>

        {/* 操作按钮 */}
        {playingIds.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={handleShare} variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              分享组合
            </Button>
            {isAuthenticated ? (
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    保存配置
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>保存音效配置</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="preset-name">配置名称 *</Label>
                      <Input
                        id="preset-name"
                        value={presetForm.name}
                        onChange={(e) =>
                          setPresetForm({ ...presetForm, name: e.target.value })
                        }
                        placeholder="例如: 雨夜放松"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preset-desc">描述</Label>
                      <Textarea
                        id="preset-desc"
                        value={presetForm.description}
                        onChange={(e) =>
                          setPresetForm({ ...presetForm, description: e.target.value })
                        }
                        placeholder="简单描述这个音效组合的特点"
                        rows={2}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="preset-public"
                        checked={presetForm.isPublic}
                        onCheckedChange={(checked) =>
                          setPresetForm({ ...presetForm, isPublic: checked })
                        }
                      />
                      <Label htmlFor="preset-public">公开分享</Label>
                    </div>
                    <Button
                      onClick={handleSavePreset}
                      disabled={savePresetMutation.isPending}
                      className="w-full"
                    >
                      {savePresetMutation.isPending ? "保存中..." : "确认保存"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>
                  <Save className="w-4 h-4 mr-2" />
                  登录保存
                </a>
              </Button>
            )}
          </div>
        )}

        {/* 我的配置 */}
        {isAuthenticated && userPresets && userPresets.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">我的配置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userPresets.map((preset) => (
                <Card
                  key={preset.id}
                  className="bg-card/50 backdrop-blur border-border/50 p-4"
                >
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold mb-1">{preset.name}</h4>
                      {preset.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {preset.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => loadPreset(preset.config)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        加载
                      </Button>
                      <Button
                        onClick={() => handleDeletePreset(preset.id)}
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 音效网格 */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">选择音效</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {AMBIENT_SOUNDS.map((sound) => {
              const isPlaying = playingIds.includes(sound.id);
              return (
                <Card
                  key={sound.id}
                  className={`bg-card/50 backdrop-blur border-border/50 overflow-hidden transition-all ${
                    isPlaying ? "ring-2 ring-primary" : ""
                  }`}
                >
                  {/* 顶部渐变区域 */}
                  <div
                    className={`h-24 bg-gradient-to-br ${sound.color} flex items-center justify-center text-5xl`}
                  >
                    {sound.icon}
                  </div>

                  {/* 内容区域 */}
                  <div className="p-4 space-y-4">
                    <div>
                      <h3 className="font-semibold mb-1">{sound.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {sound.description}
                      </p>
                    </div>

                    {/* 音量控制 */}
                    {isPlaying && (
                      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <Volume2 className="w-4 h-4 text-muted-foreground" />
                        <Slider
                          value={[volumes[sound.id]]}
                          onValueChange={(value) =>
                            handleVolumeChange(sound.id, value)
                          }
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {volumes[sound.id]}%
                        </span>
                      </div>
                    )}

                    {/* 播放按钮 */}
                    <Button
                      onClick={() => toggleSound(sound.id)}
                      variant={isPlaying ? "default" : "outline"}
                      className="w-full"
                      size="sm"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          停止
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          播放
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 底部提示 */}
        {playingIds.length > 0 && (
          <Card className="bg-primary/10 backdrop-blur border-primary/20 p-6">
            <div className="text-center space-y-2">
              <p className="text-sm">
                正在播放 <span className="font-semibold">{playingIds.length}</span> 个音效
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPlayingIds([])}
              >
                停止全部
              </Button>
            </div>
          </Card>
        )}

        {/* 使用建议 */}
        <div className="text-center text-sm text-muted-foreground space-y-2 py-4">
          <p>💡 尝试混合不同的声音,创造独特的氛围</p>
          <p>建议音量设置在 50-70% 之间以获得最佳体验</p>
        </div>
      </main>
    </div>
  );
}
