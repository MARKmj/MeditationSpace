# 🧘‍♀️ 静心空间 - 快速启动指南

## 📋 前置要求

- **Node.js** 18+ (推荐使用最新版本)
- **MySQL** 5.7+ 或 **MariaDB** 10.2+
- **Git** (可选)

## 🚀 一键启动

```bash
# 进入项目目录
cd "/Users/jm/文件/001-编程/003-AI编程出海行动营/004-小工具/001-冥想训练工具/meditation-space"

# 运行启动脚本
./start.sh
```

## 🛠️ 手动启动步骤

### 1. 安装 pnpm 包管理器
```bash
npm install -g pnpm
```

### 2. 安装项目依赖
```bash
pnpm install
```

### 3. 配置环境变量
```bash
# 复制示例配置文件
cp .env.example .env

# 编辑配置文件（使用你喜欢的编辑器）
nano .env  # 或 vscode .env, 或 open .env
```

**必需配置项：**
```env
DATABASE_URL=mysql://用户名:密码@localhost:3306/数据库名
JWT_SECRET=your-jwt-secret-key-here
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://oauth.manus.computer
OWNER_OPEN_ID=your-owner-open-id
```

### 4. 初始化数据库
```bash
pnpm db:push
```

### 5. 启动开发服务器
```bash
pnpm dev
```

## 🌐 访问应用

启动成功后，访问以下地址：

- **主应用**: http://localhost:3000
- **兼容性测试**: http://localhost:3000/browser-test (仅开发环境)

## 📱 主要功能

- **冥想计时器** - 可自定义时长的冥想计时
- **呼吸练习** - 引导式呼吸训练
- **环境音效** - 自然声音混合器
- **引导冥想** - 音频上传和播放
- **冥想记录** - 统计和历史记录
- **PWA支持** - 离线使用和桌面安装

## 🔧 常用命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm check        # TypeScript 类型检查
pnpm format       # 代码格式化
pnpm test         # 运行测试
pnpm db:push      # 数据库迁移
```

## 📖 文档

- `userGuide.md` - 用户使用指南
- `todo.md` - 开发进度和功能列表

## ❓ 常见问题

### Q: 提示"command not found: pnpm"
A: 需要先安装 pnpm: `npm install -g pnpm`

### Q: 数据库连接失败
A: 检查 .env 文件中的 DATABASE_URL 配置是否正确

### Q: 端口被占用
A: 服务器会自动寻找可用端口，查看终端输出的实际地址

### Q: 音频无法播放
A: 检查浏览器是否支持 Web Audio API，访问 /browser-test 进行兼容性检测

## 🎯 开发提示

- 项目使用 **TypeScript** + **React** + **Tailwind CSS**
- 后端使用 **Node.js** + **tRPC** + **Drizzle ORM**
- 支持 **PWA**，可安装为桌面应用
- 代码已优化性能，支持离线使用

---

准备好开始你的冥想之旅了吗？🌸