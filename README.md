# 🧘‍♀️ 静心空间 (Meditation Space)

<div align="center">

![静心空间](https://img.shields.io/badge/静心空间-冥想助手-blue)
![React](https://img.shields.io/badge/React-19.1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.14-38B2AC)
![License](https://img.shields.io/badge/License-MIT-green)

[在线演示](#) | [快速开始](#-快速开始) | [功能特性](#-功能特性) | [技术栈](#-技术栈)

</div>

## 📖 项目简介

静心空间是一个现代化的冥想辅助应用，旨在帮助用户在忙碌的生活中找到内心的宁静。无论你是冥想新手还是资深练习者，这里都有适合你的工具和资源。

### ✨ 核心特色

- 🎯 **多样化冥想工具** - 计时器、呼吸练习、环境音效
- 📱 **响应式设计** - 完美适配移动端和桌面端
- 🚀 **性能优化** - 代码分割、懒加载、智能缓存
- 🌐 **PWA 支持** - 可安装为桌面应用，支持离线使用
- 🎨 **精美界面** - 温暖柔和的视觉风格，舒缓的用户体验

## 🚀 快速开始

### 前置要求

- **Node.js** 18+
- **pnpm** (推荐) 或 npm/yarn
- **MySQL** 5.7+ 或 MariaDB 10.2+ (可选，用于高级功能)

### 一键启动

```bash
# 克隆项目
git clone <repository-url>
cd meditation-space

# 快速修复和配置
./quick-fix.sh

# 启动开发服务器
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 开始使用！

### 手动启动

```bash
# 1. 安装 pnpm (如果尚未安装)
npm install -g pnpm

# 2. 安装项目依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置必要的环境变量

# 4. 启动开发服务器
pnpm dev
```

## 🎯 功能特性

### 🕐 冥想计时器
- 预设时长：5/10/15/20/30分钟
- 圆形进度条显示
- 完成提示和记录保存
- 沉浸式界面设计

### 🌬️ 呼吸练习
- 4-7-8 放松法
- 箱式呼吸法
- 简单放松节奏
- 动态视觉引导动画

### 🎵 环境音效
- 雨声、海浪、森林、篝火等自然音效
- 多音效同时播放和混合
- 音量独立调节
- 音效组合保存和分享

### 🎧 引导式冥想
- 精选冥想课程库
- 用户自定义音频上传
- 分类管理和收藏
- 标题和描述编辑

### 📊 冥想记录
- 详细的冥想历史记录
- 统计数据可视化
- 每日/每周趋势分析
- 本地存储和云端同步

### 📱 PWA 功能
- 离线使用支持
- 桌面应用安装
- 推送通知提醒
- 快速启动访问

## 🛠️ 技术栈

### 前端技术
- **React 19** - 现代化 UI 框架
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS 4** - 实用优先的 CSS 框架
- **shadcn/ui** - 高质量组件库
- **Framer Motion** - 流畅动画效果
- **Wouter** - 轻量级路由管理

### 后端技术
- **Node.js** - 服务端运行环境
- **Express** - Web 应用框架
- **tRPC** - 类型安全的 API
- **Drizzle ORM** - 现代化数据库工具
- **MySQL** - 关系型数据库

### 开发工具
- **Vite** - 快速构建工具
- **pnpm** - 高效包管理器
- **ESLint** + **Prettier** - 代码质量
- **Vitest** - 单元测试框架

### 部署和服务
- **AWS S3** - 文件存储
- **Manus OAuth** - 用户认证
- **Service Worker** - 离线支持
- **CDN** - 全球内容分发

## 📁 项目结构

```
meditation-space/
├── client/                 # 前端应用
│   ├── src/
│   │   ├── components/     # UI 组件
│   │   ├── pages/         # 页面组件
│   │   ├── hooks/         # 自定义 hooks
│   │   ├── lib/           # 工具库
│   │   └── contexts/      # React 上下文
│   └── public/            # 静态资源
├── server/                # 后端应用
│   ├── _core/             # 核心功能
│   └── routers.ts         # API 路由
├── shared/                # 共享代码
├── drizzle/               # 数据库配置
└── docs/                  # 项目文档
```

## 🔧 开发指南

### 可用脚本

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm check        # TypeScript 类型检查
pnpm format       # 代码格式化
pnpm test         # 运行测试
pnpm db:push      # 数据库迁移
```

### 环境变量配置

创建 `.env` 文件并配置以下变量：

```env
# 数据库配置
DATABASE_URL=mysql://username:password@localhost:3306/meditation_space

# JWT 密钥
JWT_SECRET=your-super-secret-jwt-key

# 应用配置
VITE_APP_ID=your-app-id
VITE_APP_TITLE=静心空间

# OAuth 配置
VITE_OAUTH_PORTAL_URL=https://oauth.manus.computer
OAUTH_SERVER_URL=https://oauth.manus.computer
OWNER_OPEN_ID=your-owner-open-id
```

### 代码规范

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 和 Prettier 配置
- 组件使用 PascalCase 命名
- 文件和目录使用 camelCase 命名
- 提交信息遵循 Conventional Commits 规范

## 🌐 浏览器支持

| 浏览器 | 版本 | 支持状态 |
|--------|------|----------|
| Chrome | 90+ | ✅ 完全支持 |
| Firefox | 88+ | ✅ 完全支持 |
| Safari | 14+ | ✅ 完全支持 |
| Edge | 90+ | ✅ 完全支持 |
| IE | - | ❌ 不支持 |

### 移动端支持
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+

## 📊 性能优化

### 已实现的优化
- **代码分割** - 页面级懒加载，减少初始包体积
- **资源预加载** - 智能预加载常用音频和图片资源
- **缓存策略** - Service Worker 缓存静态资源，支持离线访问
- **内存管理** - 音频文件智能缓存，避免重复下载
- **网络适配** - 根据网络状况自动调整资源质量

### 性能指标
- 首屏加载时间 < 2s
- 交互响应时间 < 100ms
- Lighthouse 性能评分 > 90

## 🔒 安全特性

- JWT 令牌认证
- CORS 跨域保护
- XSS 防护
- 文件上传安全检查
- 环境变量保护

## 📈 路线图

### 已完成 ✅
- [x] 基础冥想功能 (计时器、呼吸练习)
- [x] 环境音效系统
- [x] 用户认证和数据存储
- [x] PWA 离线支持
- [x] 性能优化
- [x] 浏览器兼容性

### 计划中 🚧
- [ ] 社区分享功能
- [ ] 冥想课程系统
- [ ] 智能推荐算法
- [ ] 多语言支持
- [ ] 数据分析和洞察

### 未来构想 💭
- [ ] AI 语音引导
- [ ] 生物反馈集成
- [ ] 社交功能
- [ ] 专家指导课程

## 🤝 贡献指南

我们欢迎各种形式的贡献！

### 如何贡献

1. **Fork** 本仓库
2. 创建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 **Pull Request**

### 贡献类型
- 🐛 Bug 修复
- ✨ 新功能开发
- 📝 文档改进
- 🎨 UI/UX 优化
- ⚡ 性能优化
- 🌐 国际化支持

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [React](https://reactjs.org/) - UI 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Radix UI](https://www.radix-ui.com/) - 无头组件库
- [Lucide](https://lucide.dev/) - 图标库
- [Manus](https://manus.computer/) - 部署平台

## 📞 联系我们

- 项目主页: [GitHub Repository]
- 问题反馈: [GitHub Issues]
- 邮箱: [your-email@example.com]

---

<div align="center">

**🌸 开始你的冥想之旅，在静心空间找到属于自己的宁静时刻 🌸**

Made with ❤️ by Meditation Space Team

</div>