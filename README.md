# 留言板应用

这是一个基于 React + Appwrite 的完整留言板应用，支持用户注册、登录和留言功能。

## 功能特性

- ✅ 用户注册/登录
- ✅ 发布留言
- ✅ 查看所有留言（按时间倒序）
- ✅ 用户信息显示
- ✅ 响应式设计
- ✅ 错误处理

## 技术栈

- **前端**: React 19, Vite
- **后端**: Appwrite (用户认证 + 数据库)
- **样式**: CSS (自定义样式)
- **部署**: 支持任何静态网站托管

## 环境配置

1. 复制 `.env.example` 到 `.env`:
   ```bash
   cp .env.example .env
   ```

2. 在 `.env` 文件中填入您的 Appwrite 配置:
   ```env
   VITE_APPWRITE_ENDPOINT=your-appwrite-endpoint
   VITE_APPWRITE_PROJECT_ID=your-project-id
   VITE_APPWRITE_PROJECT_NAME=your-project-name
   ```

## 数据库结构

应用使用以下数据库结构：

**数据库**: `d1` (ID: `6940fa1f000ba38eed91`)
- **表**: `messages` (ID: `694103b40039a4f17d4c`)
  - `content` (string, 必填) - 留言内容
  - `userId` (string, 必填) - 用户ID
  - `username` (string, 必填) - 用户名

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 构建

```bash
# 构建生产版本
npm run build
```

## 使用说明

1. 首次访问会显示登录/注册页面
2. 新用户可以点击 "Register" 进行注册
3. 已有账户的用户可以登录
4. 登录后可以发布留言
5. 所有留言都会显示在留言列表中，最新留言在最上方
6. 可以随时点击 "Logout" 退出登录

## 注意事项

- 用户密码需要至少6个字符
- 邮箱地址必须是有效的邮箱格式
- 留言内容不能为空
- 应用已包含基本的错误处理和加载状态

## 截图

![登录页面](https://placehold.co/600x400/667eea/white?text=Login+Page)
![留言板](https://placehold.co/600x400/f5f5f5/333333?text=Message+Board)

---

Made with ❤️ using React and Appwrite
   Start the project by running `npm run dev`.

## 💡 Additional notes
- This starter project is designed to streamline your React development with Appwrite.
- Refer to the [Appwrite documentation](https://appwrite.io/docs) for detailed integration guidance.