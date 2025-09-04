from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router
from app.config import load_services_config

# 创建FastAPI应用实例
app = FastAPI(
    title="AI商品视频智能生成器",
    description="一站式Web应用，利用AI技术将商品图片转化为动态短视频",
    version="1.0.0"
)

# 配置CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境中应该设置具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 在应用启动时加载服务配置
@app.on_event("startup")
async def startup_event():
    """应用启动时的初始化操作"""
    load_services_config()
    print("AI商品视频智能生成器后端服务已启动")

# 包含API路由
app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    """根路径健康检查"""
    return {"message": "AI商品视频智能生成器后端服务运行正常"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)