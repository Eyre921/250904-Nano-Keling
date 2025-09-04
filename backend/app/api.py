from fastapi import APIRouter, HTTPException
import time
from typing import Dict, Any
from app.models import (
    ImageProcessRequest, ImageProcessResponse,
    VideoGenerateRequest, VideoStatusResponse,
    MultiImageVideoGenerateRequest,
    PromptSaveRequest, ServicesResponse, ServiceInfo
)
from app.services import (
    process_image, create_video_task, query_video_task, 
    create_multi_image_video_task, query_multi_image_video_task, AIServiceError
)
from app.config import get_services_config, get_prompts_data, add_prompt
from app.logger import get_logger, log_api_request, log_api_response, log_error

# 获取日志器
logger = get_logger("api")

router = APIRouter()

@router.get("/services", response_model=ServicesResponse)
async def get_services():
    """获取所有可配置的AI服务列表"""
    start_time = time.time()
    
    # 记录API请求
    log_api_request("/services", "GET")
    
    try:
        config = get_services_config()
        
        image_services = []
        for service in config.get('image_processing_services', []):
            image_services.append(ServiceInfo(
                id=service['id'],
                name=service['name'],
                api_endpoint=service.get('api_endpoint'),
                default_model=service['default_model'],
                auth=service['auth'],
                api_key=service.get('api_key')  # 包含预配置的API密钥
            ))
        
        video_services = []
        for service in config.get('video_generation_services', []):
            video_services.append(ServiceInfo(
                id=service['id'],
                name=service['name'],
                api_endpoint_base=service.get('api_endpoint_base'),
                default_model=service['default_model'],
                auth=service['auth'],
                endpoints=service.get('endpoints'),
                access_key=service.get('access_key'),  # 包含预配置的访问密钥
                secret_key=service.get('secret_key')   # 包含预配置的秘密密钥
            ))
        
        response_time = time.time() - start_time
        log_api_response("/services", 200, response_time)
        logger.info(f"Retrieved {len(image_services)} image services and {len(video_services)} video services")
        
        return ServicesResponse(
            image_services=image_services,
            video_services=video_services
        )
    except Exception as e:
        response_time = time.time() - start_time
        log_api_response("/services", 500, response_time, str(e))
        log_error(e, "get services")
        raise HTTPException(status_code=500, detail=f"获取服务列表失败: {str(e)}")

@router.post("/image-process", response_model=ImageProcessResponse)
async def process_image_endpoint(request: ImageProcessRequest):
    """处理图像（抠图）"""
    start_time = time.time()
    
    # 记录API请求
    log_api_request("/image-process", "POST", body={
        "service_id": request.service_id,
        "api_key": "***",
        "mime_type": request.mime_type,
        "image_size": len(request.image_base64) if request.image_base64 else 0
    })
    
    try:
        processed_image_data, processed_mime_type = process_image(
            service_id=request.service_id,
            api_key=request.api_key,
            image_base64=request.image_base64,
            mime_type=request.mime_type,
            custom_prompt=request.custom_prompt
        )
        
        response_time = time.time() - start_time
        log_api_response("/image-process", 200, response_time)
        
        return ImageProcessResponse(
            image_base64=processed_image_data,
            mime_type=processed_mime_type
        )
    except AIServiceError as e:
        response_time = time.time() - start_time
        log_api_response("/image-process", e.code, response_time, str(e))
        log_error(e, "image processing")
        raise HTTPException(status_code=e.code, detail=e.message)
    except Exception as e:
        response_time = time.time() - start_time
        log_api_response("/image-process", 500, response_time, str(e))
        log_error(e, "image processing")
        raise HTTPException(status_code=500, detail=f"图像处理失败: {str(e)}")

@router.post("/video-generate")
async def generate_video_endpoint(request: VideoGenerateRequest):
    """创建视频生成任务"""
    start_time = time.time()
    
    # 记录API请求
    log_api_request("/video-generate", "POST", body={
        "service_id": request.service_id,
        "access_key": "***",
        "secret_key": "***",
        "prompt": request.prompt,
        "model_name": request.model_name,
        "start_frame_size": len(request.start_frame_base64) if request.start_frame_base64 else 0,
        "end_frame_size": len(request.end_frame_base64) if request.end_frame_base64 else 0
    })
    
    try:
        task_id = create_video_task(
            service_id=request.service_id,
            access_key=request.access_key,
            secret_key=request.secret_key,
            prompt=request.prompt,
            start_frame_base64=request.start_frame_base64,
            end_frame_base64=request.end_frame_base64,
            model_name=request.model_name,
            duration=request.duration,
            mode=request.mode
        )
        
        response_time = time.time() - start_time
        log_api_response("/video-generate", 200, response_time)
        logger.info(f"Video generation task created: {task_id}")
        
        return {"task_id": task_id}
    except AIServiceError as e:
        response_time = time.time() - start_time
        log_api_response("/video-generate", e.code, response_time, str(e))
        log_error(e, "video generation")
        raise HTTPException(status_code=e.code, detail=e.message)
    except Exception as e:
        response_time = time.time() - start_time
        log_api_response("/video-generate", 500, response_time, str(e))
        log_error(e, "video generation")
        raise HTTPException(status_code=500, detail=f"视频生成任务创建失败: {str(e)}")

@router.get("/video-status/{task_id}", response_model=VideoStatusResponse)
async def get_video_status_endpoint(task_id: str, service_id: str, access_key: str, secret_key: str):
    """查询视频生成任务状态"""
    start_time = time.time()
    
    # 记录API请求
    log_api_request(f"/video-status/{task_id}", "GET", params={
        "service_id": service_id,
        "access_key": "***",
        "secret_key": "***"
    })
    
    try:
        result = query_video_task(
            service_id=service_id,
            access_key=access_key,
            secret_key=secret_key,
            task_id=task_id
        )
        
        response_time = time.time() - start_time
        log_api_response(f"/video-status/{task_id}", 200, response_time)
        
        return VideoStatusResponse(**result)
    except AIServiceError as e:
        response_time = time.time() - start_time
        log_api_response(f"/video-status/{task_id}", e.code, response_time, str(e))
        log_error(e, "video status query")
        raise HTTPException(status_code=e.code, detail=e.message)
    except Exception as e:
        response_time = time.time() - start_time
        log_api_response(f"/video-status/{task_id}", 500, response_time, str(e))
        log_error(e, "video status query")
        raise HTTPException(status_code=500, detail=f"查询视频状态失败: {str(e)}")

@router.get("/prompts")
async def get_prompts_endpoint():
    """获取提示词库"""
    start_time = time.time()
    
    # 记录API请求
    log_api_request("/prompts", "GET")
    
    try:
        prompts_data = get_prompts_data()
        
        response_time = time.time() - start_time
        log_api_response("/prompts", 200, response_time)
        logger.info(f"Retrieved prompts data with {len(prompts_data)} categories")
        
        return prompts_data
    except Exception as e:
        response_time = time.time() - start_time
        log_api_response("/prompts", 500, response_time, str(e))
        log_error(e, "get prompts")
        raise HTTPException(status_code=500, detail=f"获取提示词库失败: {str(e)}")

@router.post("/prompts")
async def save_prompt_endpoint(request: PromptSaveRequest):
    """保存一个新的提示词"""
    start_time = time.time()
    
    # 记录API请求
    log_api_request("/prompts", "POST", body={
        "name": request.name,
        "prompt_length": len(request.prompt) if request.prompt else 0
    })
    
    try:
        success = add_prompt(request.name, request.prompt)
        if success:
            response_time = time.time() - start_time
            log_api_response("/prompts", 200, response_time)
            logger.info(f"Prompt saved successfully: {request.name}")
            return {"status": "success", "message": "提示词保存成功"}
        else:
            response_time = time.time() - start_time
            log_api_response("/prompts", 400, response_time, "提示词名称已存在")
            raise HTTPException(status_code=400, detail="提示词名称已存在")
    except HTTPException:
        raise
    except Exception as e:
        response_time = time.time() - start_time
        log_api_response("/prompts", 500, response_time, str(e))
        log_error(e, "save prompt")
        raise HTTPException(status_code=500, detail=f"保存提示词失败: {str(e)}")

@router.post("/multi-image-video-generate")
async def generate_multi_image_video_endpoint(request: MultiImageVideoGenerateRequest):
    """创建多图参考生视频任务"""
    start_time = time.time()
    
    # 记录API请求
    log_api_request("/multi-image-video-generate", "POST", body={
        "service_id": request.service_id,
        "access_key": "***",
        "secret_key": "***",
        "prompt": request.prompt,
        "model_name": request.model_name,
        "image_count": len(request.image_list),
        "duration": request.duration,

        "mode": request.mode
    })
    
    try:
        # 验证图片数量
        if len(request.image_list) != 2:
            raise HTTPException(status_code=400, detail="需要上传2张图片（首帧和尾帧）")
        
        # 验证duration参数
        if request.duration not in ["5", "10"]:
            raise HTTPException(status_code=400, detail="duration参数只支持5或10秒")
        
        task_id = create_multi_image_video_task(
            service_id=request.service_id,
            access_key=request.access_key,
            secret_key=request.secret_key,
            prompt=request.prompt,
            image_list=request.image_list,
            model_name=request.model_name,
            negative_prompt=request.negative_prompt,
            duration=request.duration,

            mode=request.mode
        )
        
        response_time = time.time() - start_time
        log_api_response("/multi-image-video-generate", 200, response_time)
        logger.info(f"Multi-image video generation task created: {task_id}")
        
        return {"task_id": task_id}
    except AIServiceError as e:
        response_time = time.time() - start_time
        log_api_response("/multi-image-video-generate", e.code, response_time, str(e))
        log_error(e, "multi-image video generation")
        raise HTTPException(status_code=e.code, detail=e.message)
    except HTTPException:
        raise
    except Exception as e:
        response_time = time.time() - start_time
        log_api_response("/multi-image-video-generate", 500, response_time, str(e))
        log_error(e, "multi-image video generation")
        raise HTTPException(status_code=500, detail=f"多图生视频任务创建失败: {str(e)}")

@router.get("/multi-image-video-status/{task_id}", response_model=VideoStatusResponse)
async def get_multi_image_video_status_endpoint(task_id: str, service_id: str, access_key: str, secret_key: str):
    """查询多图参考生视频任务状态"""
    start_time = time.time()
    
    # 记录API请求
    log_api_request(f"/multi-image-video-status/{task_id}", "GET", params={
        "service_id": service_id,
        "access_key": "***",
        "secret_key": "***"
    })
    
    try:
        result = query_multi_image_video_task(
            service_id=service_id,
            access_key=access_key,
            secret_key=secret_key,
            task_id=task_id
        )
        
        response_time = time.time() - start_time
        log_api_response(f"/multi-image-video-status/{task_id}", 200, response_time)
        
        return VideoStatusResponse(**result)
    except AIServiceError as e:
        response_time = time.time() - start_time
        log_api_response(f"/multi-image-video-status/{task_id}", e.code, response_time, str(e))
        log_error(e, "multi-image video status query")
        raise HTTPException(status_code=e.code, detail=e.message)
    except Exception as e:
        response_time = time.time() - start_time
        log_api_response(f"/multi-image-video-status/{task_id}", 500, response_time, str(e))
        log_error(e, "multi-image video status query")
        raise HTTPException(status_code=500, detail=f"查询多图生视频状态失败: {str(e)}")