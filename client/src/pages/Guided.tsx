import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Play, Headphones, Clock, Upload, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useState } from "react";

const PRESET_SESSIONS = [
  {
    id: "preset-1",
    title: "正念呼吸冥想",
    description: "通过专注呼吸,培养当下的觉知力",
    duration: "10 分钟",
    category: "基础",
    image: "🌬️",
  },
  {
    id: "preset-2",
    title: "身体扫描放松",
    description: "系统性地放松身体各个部位,释放紧张",
    duration: "15 分钟",
    category: "放松",
    image: "🧘",
  },
  {
    id: "preset-3",
    title: "慈心冥想",
    description: "培养对自己和他人的慈悲与善意",
    duration: "12 分钟",
    category: "情绪",
    image: "💚",
  },
  {
    id: "preset-4",
    title: "睡前冥想",
    description: "帮助你放松身心,进入深度睡眠",
    duration: "20 分钟",
    category: "睡眠",
    image: "🌙",
  },
  {
    id: "preset-5",
    title: "焦虑缓解",
    description: "通过冥想技巧,缓解焦虑和压力",
    duration: "15 分钟",
    category: "情绪",
    image: "🌊",
  },
  {
    id: "preset-6",
    title: "专注力训练",
    description: "提升注意力和工作效率",
    duration: "10 分钟",
    category: "专注",
    image: "🎯",
  },
];

export default function Guided() {
  const { isAuthenticated } = useAuth();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "",
    isPublic: false,
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const { data: userMeditations, refetch } = trpc.guided.getMy.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const uploadMutation = trpc.guided.upload.useMutation({
    onSuccess: () => {
      toast.success("上传成功!");
      setUploadDialogOpen(false);
      setUploadForm({ title: "", description: "", category: "", isPublic: false });
      setAudioFile(null);
      refetch();
    },
    onError: (error) => {
      toast.error("上传失败: " + error.message);
    },
  });

  const deleteMutation = trpc.guided.delete.useMutation({
    onSuccess: () => {
      toast.success("删除成功!");
      refetch();
    },
  });

  const handlePlay = (session: any) => {
    toast.info("音频功能开发中", {
      description: `"${session.title}" 即将推出`,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 检查文件大小 (限制16MB)
      if (file.size > 16 * 1024 * 1024) {
        toast.error("文件大小不能超过16MB");
        return;
      }
      // 检查文件类型
      if (!file.type.startsWith("audio/")) {
        toast.error("请选择音频文件");
        return;
      }
      setAudioFile(file);
    }
  };

  const handleUpload = async () => {
    if (!audioFile || !uploadForm.title) {
      toast.error("请填写标题并选择音频文件");
      return;
    }

    try {
      // 读取文件为base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(",")[1]; // 移除data:audio/xxx;base64,前缀

        // 获取音频时长
        const audio = new Audio(base64);
        await new Promise((resolve) => {
          audio.onloadedmetadata = resolve;
        });
        const duration = Math.floor(audio.duration);

        await uploadMutation.mutateAsync({
          title: uploadForm.title,
          description: uploadForm.description || undefined,
          audioBase64: base64Data,
          duration,
          category: uploadForm.category || undefined,
          isPublic: uploadForm.isPublic,
        });
      };
      reader.readAsDataURL(audioFile);
    } catch (error) {
      toast.error("上传失败,请重试");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("确定要删除这个冥想音频吗?")) {
      await deleteMutation.mutateAsync({ id });
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
          <h1 className="text-lg font-medium">引导式冥想</h1>
          <div className="w-20" />
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 container py-8 space-y-8">
        {/* 介绍卡片 */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur border-border/50 p-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-3xl">
              <Headphones className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-2">专业引导冥想</h2>
              <p className="text-muted-foreground">
                由经验丰富的冥想导师精心设计的引导冥想课程,帮助你在不同场景下找到内心的平静。
                无论你是初学者还是有经验的练习者,都能找到适合自己的冥想方式。
              </p>
            </div>
            {isAuthenticated && (
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    上传音频
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>上传引导式冥想音频</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">标题 *</Label>
                      <Input
                        id="title"
                        value={uploadForm.title}
                        onChange={(e) =>
                          setUploadForm({ ...uploadForm, title: e.target.value })
                        }
                        placeholder="例如: 晨间正念冥想"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">描述</Label>
                      <Textarea
                        id="description"
                        value={uploadForm.description}
                        onChange={(e) =>
                          setUploadForm({ ...uploadForm, description: e.target.value })
                        }
                        placeholder="简单描述这段冥想的内容和目的"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">分类</Label>
                      <Input
                        id="category"
                        value={uploadForm.category}
                        onChange={(e) =>
                          setUploadForm({ ...uploadForm, category: e.target.value })
                        }
                        placeholder="例如: 放松、专注、睡眠"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="audio">音频文件 * (最大16MB)</Label>
                      <Input
                        id="audio"
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                      />
                      {audioFile && (
                        <p className="text-sm text-muted-foreground">
                          已选择: {audioFile.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="public"
                        checked={uploadForm.isPublic}
                        onCheckedChange={(checked) =>
                          setUploadForm({ ...uploadForm, isPublic: checked })
                        }
                      />
                      <Label htmlFor="public">公开分享</Label>
                    </div>
                    <Button
                      onClick={handleUpload}
                      disabled={uploadMutation.isPending}
                      className="w-full"
                    >
                      {uploadMutation.isPending ? "上传中..." : "确认上传"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {!isAuthenticated && (
              <Button asChild>
                <a href={getLoginUrl()}>登录上传</a>
              </Button>
            )}
          </div>
        </Card>

        {/* 用户上传的冥想 */}
        {isAuthenticated && userMeditations && userMeditations.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">我的冥想</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userMeditations.map((meditation) => (
                <Card
                  key={meditation.id}
                  className="bg-card/50 backdrop-blur border-border/50 overflow-hidden hover:border-primary/50 transition-all group"
                >
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-6xl">
                    🎵
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {meditation.category && (
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                            {meditation.category}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.floor(meditation.duration / 60)} 分钟
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{meditation.title}</h3>
                      {meditation.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {meditation.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handlePlay(meditation)}
                        className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        variant="outline"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        播放
                      </Button>
                      <Button
                        onClick={() => handleDelete(meditation.id)}
                        variant="outline"
                        size="icon"
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

        {/* 预设冥想课程 */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">精选课程</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRESET_SESSIONS.map((session) => (
              <Card
                key={session.id}
                className="bg-card/50 backdrop-blur border-border/50 overflow-hidden hover:border-primary/50 transition-all group"
              >
                <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-6xl">
                  {session.image}
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                        {session.category}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.duration}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{session.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {session.description}
                    </p>
                  </div>
                  <Button
                    onClick={() => handlePlay(session)}
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    variant="outline"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    开始冥想
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 底部提示 */}
        <div className="text-center text-sm text-muted-foreground space-y-2 py-8">
          <p>💡 建议使用耳机以获得最佳体验</p>
          <p>找一个安静舒适的地方,让自己完全放松</p>
        </div>
      </main>
    </div>
  );
}
