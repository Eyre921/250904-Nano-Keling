# AI商品视频智能生成器

一个基于AI技术的商品视频智能生成系统，支持图像背景去除和视频自动生成功能。

## 功能特性

- 🖼️ **智能抠图**: 使用Gemini API自动去除商品图片背景
- 🎬 **视频生成**: 集成可灵AI，根据首尾帧图片生成动态商品展示视频
- 📝 **提示词库**: 内置丰富的视频生成提示词，支持自定义添加
- ⚙️ **服务配置**: 灵活的AI服务配置，支持多种服务切换
- 🎨 **现代界面**: 基于React + Ant Design的美观用户界面

## 技术架构

### 后端
- **框架**: FastAPI
- **语言**: Python 3.8+
- **主要依赖**: 
  - fastapi: Web框架
  - uvicorn: ASGI服务器
  - requests: HTTP客户端
  - pyjwt: JWT令牌处理
  - pydantic: 数据验证

### 前端
- **框架**: React 18
- **UI库**: Ant Design
- **样式**: CSS + Styled Components
- **HTTP客户端**: Axios

## 快速开始

### 环境要求
- Python 3.8+
- Node.js 16+
- npm 或 yarn

### 后端启动

1. 进入后端目录：
```bash
cd backend
```

2. 安装依赖：
```bash
pip install -r requirements.txt
```

3. 启动服务：
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 前端启动

1. 进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm start
```

4. 打开浏览器访问：http://localhost:3000

## 配置说明

### 服务配置 (services_config.json)

配置文件包含图像处理和视频生成服务的详细信息：

```json
{
  "image_processing_services": [
    {
      "id": "nano_banana_remove_bg_v1",
      "name": "Nano Banana (Gemini 抠图)",
      "api_endpoint": "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent",
      "default_model": "gemini-2.5-flash-image-preview",
      "auth": {
        "type": "api_key_query_param",
        "key_name": "key"
      }
    }
  ],
  "video_generation_services": [
    {
      "id": "kling_image2video_v1",
      "name": "可灵 AI (首尾帧生视频)",
      "api_endpoint_base": "https://api-beijing.klingai.com",
      "default_model": "kling-v1",
      "auth": {
        "type": "jwt_bearer_header",
        "header_name": "Authorization"
      }
    }
  ]
}
```

### 提示词库 (prompts.json)

系统内置多种商品展示效果的提示词，用户也可以自定义添加。

## API接口

### 图像处理
- `POST /api/image-process` - 处理图像（背景去除）
- `GET /api/services` - 获取服务配置

### 视频生成
- `POST /api/video-generate` - 创建视频生成任务
- `GET /api/video-status/{task_id}` - 查询视频生成状态

### 提示词管理
- `GET /api/prompts` - 获取提示词库
- `POST /api/prompts` - 添加新提示词

## 使用流程

1. **上传图片**: 选择商品图片上传
2. **图像处理**: 选择AI服务进行背景去除
3. **生成视频**: 配置视频生成参数和提示词
4. **下载结果**: 等待生成完成后下载视频

## 注意事项

- 使用前需要获取相应AI服务的API密钥
- 图片大小建议不超过10MB
- 视频生成通常需要1-3分钟时间
- 建议使用高质量的商品图片以获得更好效果

## 许可证

MIT License