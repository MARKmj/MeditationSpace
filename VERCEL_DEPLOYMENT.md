# 🚀 Vercel 部署指南

## 📋 部署方案

由于你的项目是全栈应用，但 Vercel 主要优化前端部署，这里提供两种部署方案：

### 方案一：仅前端部署（推荐用于演示）

#### 特点
- ✅ 部署简单，一键完成
- ✅ 静态网站加载速度快
- ✅ 免费托管
- ⚠️ 后端功能不可用（用户登录、数据存储等）
- ✅ 核心冥想功能可用（计时器、呼吸练习、本地记录）

#### 部署步骤

1. **连接 Vercel**
   ```bash
   # 安装 Vercel CLI
   npm i -g vercel

   # 登录 Vercel
   vercel login
   ```

2. **部署项目**
   ```bash
   # 在项目根目录执行
   vercel --prod
   ```

3. **配置环境变量**
   在 Vercel 控制台中添加以下环境变量：
   ```
   VITE_APP_TITLE=静心空间
   VITE_APP_ID=vercel-demo-app
   VITE_OAUTH_PORTAL_URL=
   ```

### 方案二：全栈部署（高级）

#### 特点
- ✅ 完整功能支持
- ⚠️ 需要额外数据库配置
- ⚠️ 部署复杂度较高
- 💰 可能需要付费计划

## 🔧 环境变量配置

### 前端部署必需变量
```env
VITE_APP_TITLE=静心空间
VITE_APP_ID=your-vercel-app-id
VITE_OAUTH_PORTAL_URL=
VITE_APP_LOGO=https://placehold.co/128x128/E1E7EF/1F2937?text=🧘‍♀️
```

### 可选变量
```env
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
```

## 📁 项目结构（Vercel 版本）

```
meditation-space/
├── vercel.json                 # Vercel 配置
├── vite.config.ts             # Vite 构建配置
├── package.json               # 依赖和脚本
├── client/                    # 前端源码
│   ├── src/
│   └── public/
└── dist/public/               # 构建输出（自动生成）
```

## 🚨 重要说明

### 当前配置状态
- ✅ 已配置为仅前端部署
- ✅ 移除了服务器端代码打包
- ✅ 优化了构建输出
- ✅ 添加了静态资源处理

### 功能可用性
- ✅ **完全可用**：
  - 冥想计时器
  - 呼吸练习
  - 环境音效播放
  - 本地冥想记录
  - PWA 离线功能

- ⚠️ **部分可用**：
  - 引导式冥想（仅播放，无法上传）
  - 统计图表（仅本地数据）

- ❌ **不可用**：
  - 用户登录/注册
  - 云端数据同步
  - 音频文件上传
  - 社区分享功能

## 🎯 部署后访问

部署成功后，你可以通过以下方式访问：

1. **Vercel 提供的 URL**：`https://your-app-name.vercel.app`
2. **自定义域名**：在 Vercel 控制台配置

## 🔄 本地开发和生产部署

### 本地开发
```bash
# 使用完整配置（包含后端）
pnpm dev

# 或者使用前端配置
pnpm build && npx serve dist/public
```

### 生产部署
```bash
# 构建生产版本
pnpm build

# 部署到 Vercel
vercel --prod
```

## 🛠️ 故障排除

### 常见问题

1. **构建失败**
   - 检查 `package.json` 中的构建脚本
   - 确保 `vite.config.ts` 配置正确
   - 检查 TypeScript 类型错误

2. **路由问题**
   - 确保所有路由都指向前端
   - 检查 `vercel.json` 中的路由配置

3. **环境变量问题**
   - 确保 Vite 前缀的环境变量已设置
   - 检查 Vercel 控制台中的环境变量配置

4. **静态资源问题**
   - 确保 `public` 目录中的文件正确复制
   - 检查资源路径引用

## 📊 性能优化

### 已实现的优化
- 代码分割和懒加载
- 静态资源压缩
- 缓存策略优化
- PWA 离线支持

### Vercel 自动优化
- CDN 分发
- 自动压缩
- 边缘函数优化
- 图片优化

## 🎉 部署成功后

部署成功后，你的应用将具备：

1. **现代化界面** - 响应式设计，适配各种设备
2. **核心冥想功能** - 计时器、呼吸练习、环境音效
3. **本地数据存储** - 冥想记录保存在浏览器中
4. **PWA 支持** - 可安装为桌面应用
5. **离线功能** - 支持离线访问已缓存的页面

## 📞 获取帮助

- [Vercel 文档](https://vercel.com/docs)
- [Vite 文档](https://vitejs.dev/)
- [项目 GitHub Issues](https://github.com/MARKmj/MeditationSpace/issues)

---

🌸 **准备开始你的冥想之旅了吗？立即部署到 Vercel！**