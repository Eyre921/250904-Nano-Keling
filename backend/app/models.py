from pydantic import BaseModel
from typing import Optional, Dict, List

class ImageProcessRequest(BaseModel):
    """图像处理请求模型"""
    service_id: str
    api_key: str
    image_base64: str
    mime_type: str
    custom_prompt: Optional[str] = None

class ImageProcessResponse(BaseModel):
    """图像处理响应模型"""
    image_base64: str
    mime_type: str

class VideoGenerateRequest(BaseModel):
    """视频生成请求模型"""
    service_id: str
    access_key: str
    secret_key: str
    prompt: str
    model_name: Optional[str] = "kling-v1"
    start_frame_base64: str
    end_frame_base64: str
    duration: Optional[str] = "5"
    mode: Optional[str] = "pro"

class MultiImageVideoGenerateRequest(BaseModel):
    """多图参考生视频请求模型"""
    service_id: str
    access_key: str
    secret_key: str
    prompt: str
    model_name: Optional[str] = "kling-v1"
    image_list: List[str]  # Base64编码的图片列表，需要2张（首帧和尾帧）
    negative_prompt: Optional[str] = None
    duration: Optional[str] = "5"

    mode: Optional[str] = "pro"

class VideoStatusResponse(BaseModel):
    """视频状态响应模型"""
    task_id: str
    status: str  # "processing", "succeeded", "failed"
    video_url: Optional[str] = None
    error_message: Optional[str] = None

class PromptSaveRequest(BaseModel):
    """提示词保存请求模型"""
    name: str
    prompt: str

class ServiceInfo(BaseModel):
    """服务信息模型"""
    id: str
    name: str
    api_endpoint: Optional[str] = None
    api_endpoint_base: Optional[str] = None
    default_model: str
    auth: Dict
    payload_template: Optional[Dict] = None
    endpoints: Optional[Dict] = None
    api_key: Optional[str] = None  # 图像处理服务的API密钥
    access_key: Optional[str] = None  # 视频生成服务的访问密钥
    secret_key: Optional[str] = None  # 视频生成服务的秘密密钥

class ServicesResponse(BaseModel):
    """服务列表响应模型"""
    image_services: List[ServiceInfo]
    video_services: List[ServiceInfo]

class ErrorResponse(BaseModel):
    """错误响应模型"""
    code: int
    message: str
    details: Optional[str] = None