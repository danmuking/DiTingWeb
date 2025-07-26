# DiTingWeb - 在线聊天应用

## 📖 项目介绍

DiTingWeb 是一个基于 Vue 3 开发的现代化在线聊天应用，提供实时消息传递、用户管理、群组聊天等功能。项目采用响应式设计，支持桌面端和移动端访问，为用户提供流畅的即时通讯体验。

### 🎯 主要功能

- **实时聊天**: 支持一对一和群组实时消息传递
- **用户管理**: 用户注册、登录、好友管理
- **消息类型**: 支持文本、图片、视频、语音、文件等多种消息类型
- **搜索功能**: 用户搜索、消息搜索
- **消息管理**: 消息撤回、转发、回复等功能
- **虚拟列表**: 高性能消息列表渲染
- **表情支持**: 内置表情包和自定义表情上传
- **文件传输**: 支持各种文件类型的上传和下载
- **通知系统**: 桌面通知、消息提醒
- **响应式设计**: 适配不同屏幕尺寸

## 🛠️ 技术栈

### 前端框架
- **Vue 3.4.21** - 渐进式 JavaScript 框架
- **TypeScript 5.2.2** - 类型安全的 JavaScript 超集
- **Vue Router 4.3.2** - 官方路由管理器
- **Pinia 2.1.7** - Vue 状态管理库
- **Pinia Plugin Persistedstate 3.2.1** - 状态持久化插件

### UI 组件库
- **Element Plus 2.7.2** - Vue 3 组件库
- **@element-plus/icons-vue 2.3.1** - Element Plus 图标库

### 构建工具
- **Vite 5.2.0** - 下一代前端构建工具
- **@vitejs/plugin-vue 5.0.4** - Vue 3 插件
- **@vitejs/plugin-vue-jsx 3.1.0** - Vue JSX 支持

### 样式处理
- **Sass 1.76.0** - CSS 预处理器
- **Node Sass 9.0.0** - Sass 编译器
- **Autoprefixer 10.4.19** - CSS 自动添加前缀

### 工具库
- **@vueuse/core 10.9.0** - Vue 组合式 API 工具集
- **Day.js 1.11.11** - 轻量级日期处理库
- **Lodash 4.17.21** - JavaScript 实用工具库
- **Mitt 3.0.1** - 事件发射器

### 网络请求
- **Alova 2.20.3** - 轻量级请求策略库

### 其他功能
- **@imengyu/vue3-context-menu 1.4.1** - 右键菜单组件
- **El-table-infinite-scroll 3.0.3** - 无限滚动表格
- **React 18.3.1** - 用于某些特定组件

### 开发工具
- **Unplugin Auto Import 0.17.5** - 自动导入插件
- **Unplugin Vue Components 0.27.0** - 组件自动导入
- **Unplugin Icons 0.19.0** - 图标自动导入
- **Vue TSC 2.0.6** - Vue TypeScript 编译器

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- pnpm >= 7.0.0 (推荐) 或 npm >= 8.0.0

### 安装依赖
```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

### 开发环境运行
```bash
# 启动开发服务器
pnpm dev

# 或使用 npm
npm run dev
```

### 生产环境构建
```bash
# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 📁 项目结构

```
DiTingWeb/
├── config/                 # Vite 配置文件
│   ├── vite.config.base.ts # 基础配置
│   ├── vite.config.dev.ts  # 开发环境配置
│   └── vite.config.prod.ts # 生产环境配置
├── public/                 # 静态资源
├── src/
│   ├── assets/            # 资源文件
│   │   ├── iconfont/      # 字体图标
│   │   └── images/        # 图片资源
│   ├── components/        # 公共组件
│   │   ├── Avatar/        # 头像组件
│   │   ├── Icon/          # 图标组件
│   │   ├── LoginBox/      # 登录框组件
│   │   ├── RenderMessage/ # 消息渲染组件
│   │   └── VirtualList/   # 虚拟列表组件
│   ├── constant/          # 常量定义
│   ├── directives/        # 自定义指令
│   ├── enums/            # 枚举定义
│   ├── hooks/            # 组合式函数
│   ├── router/           # 路由配置
│   ├── services/         # API 服务
│   ├── stores/           # 状态管理
│   ├── styles/           # 全局样式
│   ├── utils/            # 工具函数
│   └── views/            # 页面组件
│       └── Home/         # 主页面
│           ├── Chat/      # 聊天页面
│           └── Contacts/  # 联系人页面
├── package.json          # 项目配置
└── README.md            # 项目说明
```

## 🎨 主要特性

### 1. 现代化技术栈
- 基于 Vue 3 Composition API
- TypeScript 类型安全
- Vite 快速构建
- Pinia 状态管理

### 2. 高性能
- 虚拟列表优化大量消息渲染
- 图片懒加载
- 消息分页加载
- 智能缓存策略

### 3. 用户体验
- 响应式设计，支持多端适配
- 流畅的动画效果
- 直观的操作界面
- 丰富的消息类型支持

### 4. 开发体验
- 自动导入组件和 API
- TypeScript 类型提示
- 热更新开发
- 代码分割优化

## 🔧 开发指南

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 组合式 API 规范
- 使用 ESLint 和 Prettier 进行代码格式化

### 组件开发
- 组件采用单文件组件 (SFC) 格式
- 使用 `<script setup>` 语法
- 样式使用 SCSS 预处理器

### 状态管理
- 使用 Pinia 进行状态管理
- 状态持久化存储
- 模块化状态设计

## 📝 许可证

本项目采用 MIT 许可证。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件至项目维护者

---

**注意**: 本项目仅供学习和研究使用，请遵守相关法律法规。
