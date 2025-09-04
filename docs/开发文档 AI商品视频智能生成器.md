# **开发文档: AI商品视频智能生成器**

|**文档版本**|1.0|
|---|---|
|**关联PRD版本**|2.0 (最终版)|
|**创建日期**|2025年9月4日|
|**创建人**|Gemini|

### **1. 概述 (Introduction)**

本文档是《AI商品视频智能生成器 PRD V2.0》的技术实现指南，旨在为前端和后端开发团队提供清晰的架构设计、API接口定义、核心逻辑实现和开发规范。所有开发工作都应严格遵循本文档和关联的PRD。

### **2. 系统架构 (System Architecture)**

项目采用前后端分离的现代Web应用架构。

- **前端 (Frontend)**:
    
    - **技术栈**: React (推荐使用 Vite 创建) 或 Vue.js。
        
    - **职责**: 构建用户界面(UI)，处理用户交互，管理前端状态，并与后端API进行通信。
        
    - **核心特性**: 单页应用 (SPA)，响应式布局。
        
- **后端 (Backend)**:
    
    - **技术栈**: Python (使用 FastAPI 框架) 或 Node.js (使用 Express/Fastify)。(本文档将以Python/FastAPI为例)
        
    - **职责**: 实现业务逻辑API，安全地管理和使用用户凭证，调度和调用外部AI服务，处理文件（JSON配置和提示词库）。
        
    - **核心特性**: 配置驱动，无状态API服务。
        
- **配置文件**:
    
    - `services_config.json`: 定义所有可用的AI服务，是系统的“大脑”。
        
    - `prompts.json`: 存储用户自定义的提示词库。
        

### **3. 后端开发指南 (Backend Development Guide)**

#### **3.1 项目设置与依赖**

1. **环境**: Python 3.9+
    
2. **框架**: FastAPI
    
3. **核心依赖**:
    
    ```
    pip install fastapi uvicorn python-multipart requests python-dotenv pyjwt
    ```
    
4. **项目结构 (建议)**:
    
    ```
    /project
    |-- /app
    |   |-- __init__.py
    |   |-- main.py             # FastAPI应用实例和路由
    |   |-- api.py              # API路由实现
    |   |-- services.py         # AI服务调度和核心逻辑
    |   |-- config.py           # 配置加载模块
    |   |-- models.py           # Pydantic数据模型
    |-- services_config.json    # AI服务配置文件
    |-- prompts.json            # 提示词库
    |-- .env                    # 环境变量
    |-- requirements.txt        # 依赖列表
    ```
    

#### **3.2 API 端点定义 (API Endpoints)**

|方法|路径|描述|请求体 (Body)|响应 (Response)|
|---|---|---|---|---|
|`GET`|`/api/services`|获取所有可配置的AI服务列表|(无)|`{"image_services": [...], "video_services": [...]}`|
|`POST`|`/api/image-process`|处理图像（抠图）|`ImageProcessRequest`|`ImageProcessResponse`|
|`POST`|`/api/video-generate`|创建视频生成任务|`VideoGenerateRequest`|`{"task_id": "string"}` 或 错误|
|`GET`|`/api/video-status/{task_id}`|查询视频生成任务状态|(无)|`VideoStatusResponse`|
|`GET`|`/api/prompts`|获取提示词库|(无)|`{"prompts": [...]}`|
|`POST`|`/api/prompts`|保存一个新的提示词|`{"name": "string", "prompt": "string"}`|`{"status": "success"}`|

#### **3.3 数据模型 (Pydantic Models)**

```
# app/models.py
from pydantic import BaseModel
from typing import Optional, Dict

class ImageProcessRequest(BaseModel):
    service_id: str
    api_key: str
    image_base64: str
    mime_type: str

class ImageProcessResponse(BaseModel):
    image_base64: str
    mime_type: str

class VideoGenerateRequest(BaseModel):
    service_id: str
    access_key: str
    secret_key: str
    prompt: str
    model: Optional[str] = None
    start_frame_base64: str
    end_frame_base64: str

class VideoStatusResponse(BaseModel):
    task_id: str
    status: str # e.g., "processing", "succeeded", "failed"
    video_url: Optional[str] = None
    error_message: Optional[str] = None
```

#### **3.4 核心逻辑实现 (`app/services.py`)**

1. **配置加载 (`app/config.py`)**:
    
    - 应用启动时，读取 `services_config.json` 到一个全局可访问的字典或类中。
        
2. **AI服务调度器**:
    
    - 创建一个主函数 `call_ai_service(...)`，它接收服务ID、用户凭证和数据。
        
    - 根据服务ID从加载的配置中查找对应的 `api_endpoint`, `auth`, `payload_template` 等信息。
        
    - **认证处理**:
        
        - **`api_key_query_param`**: 将 `api_key` 拼接到 `api_endpoint` URL中。
            
        - **`jwt_bearer_header`**: 调用JWT生成函数，并将结果放入请求头 `Authorization: Bearer <token>`。
            
3. **Kling JWT Token 生成**:
    
    ```
    import time
    import jwt
    
    def generate_kling_token(ak: str, sk: str) -> str:
        headers = {"alg": "HS256", "typ": "JWT"}
        payload = {
            "iss": ak,
            "exp": int(time.time()) + 1800,  # 30 minutes validity
            "nbf": int(time.time()) - 5
        }
        token = jwt.encode(payload, sk, algorithm="HS256", headers=headers)
        return token
    ```
    
4. **Payload构建**:
    
    - 遍历 `payload_template`，用传入的真实数据（如图片Base64、prompt）替换 `{{...}}` 占位符。
        
5. **错误处理与重试**:
    
    - 所有对外部AI服务的HTTP请求都应包含在 `try...except` 块中。
        
    - 根据PRD `7.1`节的表格实现错误映射和重试逻辑。对于 `429` 和 `5xx` 错误码，实现一个带指数退避的循环重试机制。
        

### **4. 前端开发指南 (Frontend Development Guide)**

#### **4.1 项目设置与依赖**

1. **环境**: Node.js LTS, Vite
    
2. **框架**: React
    
3. **核心依赖**:
    
    ```
    npm install react react-dom axios
    # UI 库 (推荐)
    npm install tailwindcss postcss autoprefixer
    # 图标库 (推荐)
    npm install lucide-react
    ```
    

#### **4.2 组件结构 (Component Structure)**

```
/src
|-- /components
|   |-- AILayout.jsx          # 主布局，包含各个功能区
|   |-- SettingsModal.jsx     # 设置弹窗（API Keys等）
|   |-- ImageUploader.jsx     # 图片上传组件
|   |-- ProcessedImageList.jsx  # 已抠图的图片列表
|   |-- VideoCanvas.jsx       # 视频生成区（首尾帧、Prompt输入）
|   |-- PromptLibrary.jsx     # 提示词库选择/保存
|   |-- ResultViewer.jsx      # 最终视频结果展示
|   |-- Spinner.jsx           # 加载动画
|   |-- ErrorMessage.jsx      # 错误提示
|-- /services
|   |-- api.js                # 封装所有对后端的axios请求
|-- /hooks
|   |-- useAIServices.js      # 自定义Hook，管理AI服务状态
|-- /context
|   |-- AppContext.js         # 全局状态管理 (可选)
|-- App.jsx                   # 应用主入口
|-- index.css                 # 全局样式 (Tailwind)
```

#### **4.3 状态管理 (State Management)**

- **本地状态 (`useState`)**: 用于管理组件内部的UI状态，如输入框内容、加载状态等。
    
- **全局状态 (`useContext` 或 `Zustand/Redux`)**: 用于管理跨组件共享的数据：
    
    - `apiCredentials`: `{ nano_banana_key: '...', kling_ak: '...', kling_sk: '...' }`
        
    - `servicesConfig`: `{ image_services: [], video_services: [] }` (从后端获取)
        
    - `processedImages`: `[{id, base64}, ...]`
        
    - `videoGenerationTask`: `{ task_id, status, video_url, error }`
        

#### **4.4 核心流程实现**

1. **应用加载**:
    
    - `App.jsx` 在 `useEffect` 中调用 `api.getServices()` 和 `api.getPrompts()`，获取配置和服务列表，存入全局状态。
        
2. **图片处理**:
    
    - `ImageUploader.jsx` 将文件转为Base64。
        
    - 点击处理按钮后，调用 `api.processImage(...)`，并传入服务ID、API Key和图片数据。
        
    - 在请求期间，显示加载状态。请求成功后，将返回的图片添加到 `processedImages` 状态数组中。
        
3. **视频生成与轮询**:
    
    - 当用户在 `VideoCanvas.jsx` 中点击生成按钮：
        
        1. 调用 `api.generateVideo(...)` 发送请求。
            
        2. 将返回的 `task_id` 存入 `videoGenerationTask` 状态，并设置 `status` 为 `processing`。
            
        3. `App.jsx` 或一个自定义Hook中，使用 `useEffect` 监听 `videoGenerationTask.task_id` 和 `videoGenerationTask.status` 的变化。
            
        4. 如果 `status` 是 `processing`，则启动一个 `setInterval`，每10秒调用一次 `api.getVideoStatus(task_id)`。
            
        5. 根据查询结果更新 `videoGenerationTask` 的 `status`, `video_url` 或 `error`。
            
        6. 如果 `status` 变为 `succeeded` 或 `failed`，`clearInterval` 停止轮询。
            
        7. `ResultViewer.jsx` 根据 `videoGenerationTask` 的状态显示视频、加载动画或错误信息。
            

### **5. 部署 (Deployment)**

- **后端**: 建议使用Docker容器化FastAPI应用，并部署到云服务器 (如AWS EC2, Google Cloud Run) 或PaaS平台。
    
- **前端**: 构建为静态文件 (`npm run build`)，并部署到静态托管服务 (如Netlify, Vercel, AWS S3 + CloudFront)。
    
- **环境变量**: 生产环境中的`.env`文件需要通过部署平台的环境变量管理功能进行安全配置。