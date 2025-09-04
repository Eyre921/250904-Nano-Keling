# AI商品视频智能生成器 - 部署指南

## 系统要求

- Python 3.8+
- Node.js 14+
- npm 或 yarn

## 安装和运行

### 1. 后端部署

```bash
cd backend

# 创建虚拟环境
python -m venv .venv

# 激活虚拟环境 (Windows)
.venv\Scripts\activate

# 激活虚拟环境 (Linux/Mac)
source .venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 启动后端服务
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

后端服务将在 http://localhost:8000 启动

### 2. 前端部署

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

前端应用将在 http://localhost:3000 启动

## 配置文件

### services_config.json

项目根目录下的 `services_config.json` 包含AI服务配置：

- **图像处理服务**: Nano Banana (Gemini 抠图)
- **视频生成服务**: 可灵 AI (首尾帧生视频)

### prompts.json

包含预定义的提示词模板，用于视频生成。

## 功能特性

✅ **已完成功能**:
- 图像背景去除（支持自定义提示词）
- 批量图像处理
- 视频生成（首尾帧模式 + 单图模式）
- 图片库管理
- 提示词库管理
- 系统设置配置
- 纯白背景输出优化
- Keling AI查询频率优化（10秒间隔）
- 增强错误处理和自动重试机制
- Gemini API 500错误智能处理

## 测试状态

- ✅ 前端编译正常（仅有1个ESLint警告：未使用变量）
- ✅ 后端API服务正常运行
- ✅ 服务配置加载正常
- ✅ 数据库连接正常

## 生产部署建议

1. **环境变量**: 将API密钥等敏感信息移至环境变量
2. **HTTPS**: 生产环境启用HTTPS
3. **反向代理**: 使用Nginx等反向代理服务器
4. **进程管理**: 使用PM2或systemd管理后端进程
5. **静态文件**: 构建前端静态文件并配置CDN

## 故障排除

### 常见问题

1. **端口冲突**: 确保8000和3000端口未被占用
2. **依赖安装失败**: 检查Python和Node.js版本
3. **API调用失败**: 验证services_config.json中的API密钥
4. **Gemini API 500错误**: 系统已实现自动重试机制，详见 `docs/Gemini API 500错误处理说明.md`
5. **视频生成查询超时**: 系统每10秒自动查询状态，遇到临时错误会自动重试

### 日志查看

- 后端日志: 终端输出 + `backend/logs/` 目录
- 前端日志: 浏览器开发者工具控制台
- 错误日志: `backend/logs/error_*.log`
- 测试日志: `tests/logs/` 目录

## 更新日志

最新更新详见：
- `docs/更新日志-Keling AI查询频率调整.md`
- `docs/Gemini API 500错误处理说明.md`

## 联系支持

如遇问题，请检查:
1. 系统要求是否满足
2. 配置文件是否正确
3. 网络连接是否正常
4. API密钥是否有效
5. 查看相关错误处理文档