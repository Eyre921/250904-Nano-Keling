import time
import jwt
import requests
import base64
import json
import urllib3
from typing import Dict, Any, Optional, Tuple
from app.config import get_services_config
from app.logger import get_logger, log_ai_service_call, log_error
from threading import Lock

# 禁用SSL警告（使用代理时需要）
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# 获取日志器
logger = get_logger("services")

# JWT Token缓存
_token_cache = {}
_token_cache_lock = Lock()

class AIServiceError(Exception):
    """AI服务调用异常"""
    def __init__(self, code: int, message: str, details: str = None):
        self.code = code
        self.message = message
        self.details = details
        super().__init__(f"Code {code}: {message}")

def generate_kling_token(access_key: str, secret_key: str) -> str:
    """生成可灵AI的JWT Token（带缓存）"""
    cache_key = f"{access_key}:{secret_key}"
    current_time = int(time.time())
    
    with _token_cache_lock:
        # 检查缓存中是否有有效的token
        if cache_key in _token_cache:
            cached_token, cached_exp = _token_cache[cache_key]
            # 如果token还有5分钟以上有效期，直接使用缓存
            if cached_exp - current_time > 300:  # 5分钟缓冲时间
                logger.info(f"Using cached JWT token, remaining time: {cached_exp - current_time} seconds")
                return cached_token
            else:
                logger.info("Cached JWT token expired, generating new one")
                del _token_cache[cache_key]
        
        # 生成新的token
        headers = {
            "alg": "HS256",
            "typ": "JWT"
        }
        exp_time = current_time + 1800  # 30分钟有效期
        payload = {
            "iss": access_key,
            "exp": exp_time,
            "nbf": current_time - 10  # 开始生效时间，当前时间-10秒
        }
        token = jwt.encode(payload, secret_key, algorithm="HS256", headers=headers)
        
        # 缓存新生成的token
        _token_cache[cache_key] = (token, exp_time)
        logger.info(f"Generated and cached new JWT token, expires in {1800} seconds")
        
        return token

def build_payload(template: Dict[str, Any], data: Dict[str, Any]) -> Dict[str, Any]:
    """构建API请求载荷，替换模板中的占位符"""
    def replace_placeholders(obj, data_dict):
        if isinstance(obj, dict):
            return {k: replace_placeholders(v, data_dict) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [replace_placeholders(item, data_dict) for item in obj]
        elif isinstance(obj, str):
            # 替换 {{key}} 格式的占位符
            for key, value in data_dict.items():
                placeholder = f"{{{{{key}}}}}"
                if placeholder in obj:
                    obj = obj.replace(placeholder, str(value))
            return obj
        else:
            return obj
    
    return replace_placeholders(template, data)

def handle_api_error(response: requests.Response) -> AIServiceError:
    """处理API错误响应，映射为用户友好的错误信息（增强版）"""
    status_code = response.status_code
    
    try:
        error_data = response.json()
        business_code = error_data.get('code', 0)
        error_message = error_data.get('message', '未知错误')
        request_id = error_data.get('request_id', 'N/A')
    except:
        business_code = 0
        error_message = '未知错误'
        request_id = 'N/A'
    
    # 根据PRD 7.1节的错误码映射表
    error_mappings = {
        (401, 1000): "认证失败: API Key或Token无效，请检查您的设置。",
        (401, 1001): "认证失败: API Key或Token无效，请检查您的设置。",
        (401, 1002): "认证失败: API Key或Token无效，请检查您的设置。",
        (401, 1003): "认证失败: API Key或Token无效，请检查您的设置。",
        (401, 1004): "认证失败: API Key或Token无效，请检查您的设置。",
        (429, 1101): "处理失败: AI服务商提示账户欠费，请充值。",
        (429, 1102): "处理失败: AI服务商提示资源包已用尽或过期。",
        (403, 1103): "处理失败: 您的账户无权使用该模型或接口。",
        (400, 1201): "系统错误: 请求参数不合法，请联系技术支持。",
        (400, 1301): "处理失败: 您的图片或提示词可能包含不适宜内容，请修改后重试。",
        (429, 1302): "处理失败: AI服务繁忙，请稍后再试。",
    }
    
    # 通用错误处理
    if status_code == 401:
        # 详细分析401错误的原因
        if 'token' in error_message.lower() or 'jwt' in error_message.lower():
            message = "认证失败: JWT Token无效或已过期。可能原因：1) Token格式错误 2) Token已过期 3) 签名验证失败"
        elif 'key' in error_message.lower():
            message = "认证失败: API Key无效。请检查Access Key和Secret Key是否正确"
        elif 'expired' in error_message.lower():
            message = "认证失败: 认证信息已过期，请重新生成Token"
        elif 'signature' in error_message.lower():
            message = "认证失败: Token签名验证失败，请检查Secret Key是否正确"
        else:
            message = f"认证失败: {error_message}。请检查API密钥配置"
    elif status_code == 429:
        if business_code in [1101, 1102]:
            message = error_mappings.get((status_code, business_code), "处理失败: AI服务商提示账户问题。")
        else:
            # 分析频率限制的具体原因
            if 'rate' in error_message.lower():
                message = f"请求频率限制: {error_message}。建议降低请求频率或稍后重试"
            else:
                message = "处理失败: AI服务繁忙，请稍后再试。"
    elif status_code == 403:
        message = f"处理失败: 您的账户无权使用该模型或接口。{error_message}"
    elif status_code == 400:
        if business_code == 1301:
            message = "处理失败: 您的图片或提示词可能包含不适宜内容，请修改后重试。"
        else:
            message = f"系统错误: 请求参数不合法 - {error_message}，请联系技术支持。"
    elif status_code == 404:
        message = f"资源未找到: {error_message}。请检查任务ID是否正确"
    elif status_code >= 500:
        if status_code == 500:
            message = f"处理失败: AI服务提供商服务器内部错误 - {error_message}。这通常是临时问题，请等待几分钟后重试。如果问题持续存在，请联系技术支持。"
        elif status_code in [502, 503]:
            message = f"服务暂时不可用: {error_message}。请稍后重试"
        else:
            message = f"处理失败: AI服务提供商服务器错误 (HTTP {status_code}) - {error_message}，请稍后再试。"
    else:
        message = f"处理失败: 未知错误 (HTTP {status_code}) - {error_message}"
    
    details = f"Request ID: {request_id}" if request_id != 'N/A' else response.text
    return AIServiceError(status_code, message, details)

def call_ai_service_with_retry(url: str, headers: Dict[str, str], payload: Dict[str, Any], max_retries: int = 4) -> requests.Response:
    """带重试机制的AI服务调用"""
    # 配置代理（适用于中国大陆用户）
    proxies = {
        'http': 'http://127.0.0.1:10809',
        'https': 'http://127.0.0.1:10809'
    }
    
    start_time = time.time()
    
    for attempt in range(max_retries + 1):
        try:
            logger.info(f"Calling AI service: {url} (attempt {attempt + 1}/{max_retries + 1})")
            # 禁用SSL验证以支持代理
            response = requests.post(url, headers=headers, json=payload, proxies=proxies, timeout=120, verify=False)
            
            response_time = time.time() - start_time
            log_ai_service_call("unknown", url, response.status_code, response_time)
            
            # 如果成功或不需要重试的错误，直接返回
            if response.status_code == 200 or response.status_code not in [429, 500, 502, 503, 504]:
                return response
            
            # 需要重试的情况
            if attempt < max_retries:
                # 对500错误使用更长的等待时间
                if response.status_code == 500:
                    wait_time = min((2 ** attempt) * 2, 30)  # 500错误使用更长等待时间，最大30秒
                else:
                    wait_time = (2 ** attempt)  # 其他错误使用标准指数退避
                logger.warning(f"请求失败 (HTTP {response.status_code})，{wait_time}秒后重试... (尝试 {attempt + 1}/{max_retries})")
                time.sleep(wait_time)
            else:
                return response
                
        except requests.exceptions.RequestException as e:
            response_time = time.time() - start_time
            error_msg = f"网络请求失败: {str(e)}"
            
            if attempt < max_retries:
                wait_time = (2 ** attempt)
                logger.warning(f"网络请求异常: {e}，{wait_time}秒后重试... (尝试 {attempt + 1}/{max_retries})")
                time.sleep(wait_time)
            else:
                log_ai_service_call("unknown", url, 0, response_time, error_msg)
                log_error(e, f"AI service call failed after {max_retries + 1} attempts")
                raise AIServiceError(500, error_msg)
    
    return response

def process_image(service_id: str, api_key: str, image_base64: str, mime_type: str, custom_prompt: str = None) -> Tuple[str, str]:
    """处理图像（背景去除）"""
    config = get_services_config()
    
    # 查找服务配置
    service_config = None
    for service in config.get('image_processing_services', []):
        if service['id'] == service_id:
            service_config = service
            break
    
    if not service_config:
        raise AIServiceError(404, f"未找到服务配置: {service_id}")
    
    # 构建请求URL
    url = service_config['api_endpoint']
    auth_config = service_config['auth']
    
    if auth_config['type'] == 'api_key_query_param':
        key_name = auth_config['key_name']
        url += f"?{key_name}={api_key}"
    
    # 构建请求头
    headers = {'Content-Type': 'application/json'}
    
    # 构建请求载荷
    payload_data = {
        'base64_image': image_base64,
        'mime_type': mime_type
    }
    
    # 处理自定义提示词
    payload_template = service_config['payload_template'].copy()
    if custom_prompt and custom_prompt.strip():
        # 如果有自定义提示词，替换默认提示词
        if 'contents' in payload_template and len(payload_template['contents']) > 0:
            if 'parts' in payload_template['contents'][0] and len(payload_template['contents'][0]['parts']) > 0:
                # 替换第一个文本部分为自定义提示词
                payload_template['contents'][0]['parts'][0]['text'] = custom_prompt.strip()
    
    payload = build_payload(payload_template, payload_data)
    
    # 发送请求
    print(f"发送请求到: {url}")
    print(f"请求载荷: {json.dumps(payload, indent=2)}")
    
    response = call_ai_service_with_retry(url, headers, payload)
    
    print(f"响应状态码: {response.status_code}")
    print(f"响应内容: {response.text[:500]}...")
    
    if response.status_code != 200:
        raise handle_api_error(response)
    
    # 解析响应
    try:
        result = response.json()
        # 从Gemini响应中提取生成的图像
        candidates = result.get('candidates', [])
        if not candidates:
            raise AIServiceError(500, "AI服务返回的响应格式不正确")
        
        parts = candidates[0].get('content', {}).get('parts', [])
        for part in parts:
            # 检查两种可能的格式：inline_data 和 inlineData
            if 'inline_data' in part:
                return part['inline_data']['data'], part['inline_data']['mime_type']
            elif 'inlineData' in part:
                return part['inlineData']['data'], part['inlineData']['mimeType']
        
        raise AIServiceError(500, "AI服务未返回处理后的图像")
        
    except json.JSONDecodeError:
        raise AIServiceError(500, "AI服务返回的响应格式不正确")

def create_multi_image_video_task(service_id: str, access_key: str, secret_key: str, prompt: str, 
                                 image_list: list, model_name: str = "kling-v1", negative_prompt: str = None,
                                 duration: str = "5", mode: str = "pro") -> str:
    """创建多图参考生视频任务（使用首尾帧）"""
    config = get_services_config()
    
    # 查找服务配置
    service_config = None
    for service in config.get('video_generation_services', []):
        if service['id'] == service_id:
            service_config = service
            break
    
    if not service_config:
        raise AIServiceError(404, f"未找到服务配置: {service_id}")
    
    # 验证图片数量
    if len(image_list) < 1:
        raise AIServiceError(400, "至少需要1张图片")
    
    # 生成JWT Token
    token = generate_kling_token(access_key, secret_key)
    
    # 构建请求URL
    base_url = service_config['api_endpoint_base']
    create_endpoint = service_config['endpoints']['create_task']
    url = base_url + create_endpoint
    
    # 构建请求头
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    # 使用首尾帧逻辑：第一张图作为起始帧，最后一张图作为结束帧
    start_frame = image_list[0]
    end_frame = image_list[-1] if len(image_list) > 1 else image_list[0]
    
    # 构建请求载荷
    payload_data = {
        'model_name': model_name or service_config['default_model'],
        'prompt': prompt,
        'image': start_frame,
        'image_tail': end_frame,
        'duration': duration,
        'mode': mode
    }
    
    # 添加可选参数
    if negative_prompt:
        payload_data['negative_prompt'] = negative_prompt
    
    payload = build_payload(service_config['payload_template'], payload_data)
    
    # 发送请求
    response = call_ai_service_with_retry(url, headers, payload)
    
    if response.status_code != 200:
        raise handle_api_error(response)
    
    # 解析响应
    try:
        result = response.json()
        if result.get('code') != 0:
            raise AIServiceError(400, result.get('message', '创建多图生视频任务失败'))
        
        data = result.get('data', {})
        task_id = data.get('task_id')
        
        if not task_id:
            raise AIServiceError(500, "AI服务未返回任务ID")
        
        logger.info(f"Multi-image video task created successfully: {task_id}")
        return task_id
        
    except json.JSONDecodeError:
        raise AIServiceError(500, "AI服务返回的响应格式不正确")

def query_multi_image_video_task(service_id: str, access_key: str, secret_key: str, task_id: str) -> Dict[str, Any]:
    """查询多图参考生视频任务状态"""
    config = get_services_config()
    
    # 查找服务配置
    service_config = None
    for service in config.get('video_generation_services', []):
        if service['id'] == service_id:
            service_config = service
            break
    
    if not service_config:
        raise AIServiceError(404, f"未找到服务配置: {service_id}")
    
    # 优先使用服务配置中的密钥，如果没有则使用传入的密钥
    config_access_key = service_config.get('access_key', access_key)
    config_secret_key = service_config.get('secret_key', secret_key)
    
    # 调试日志
    logger.info(f"Query video task - Using access_key: {config_access_key[:8]}...")
    logger.info(f"Query video task - Using secret_key: {config_secret_key[:8]}...")
    
    # 生成JWT Token
    token = generate_kling_token(config_access_key, config_secret_key)
    logger.info(f"Generated JWT token: {token[:50]}...")
    
    # 构建请求URL
    base_url = service_config['api_endpoint_base']
    query_endpoint = service_config['endpoints']['query_task']
    url = base_url + query_endpoint + task_id
    
    # 构建请求头
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    # 发送GET请求（带重试机制）
    max_retries = 3
    retry_delay = 1  # 秒
    
    for attempt in range(max_retries):
        try:
            # 如果是重试，重新生成token（清除缓存）
            if attempt > 0:
                logger.info(f"Retry attempt {attempt + 1}/{max_retries} for task {task_id}")
                # 清除缓存的token，强制生成新的
                cache_key = f"{config_access_key}:{config_secret_key}"
                with _token_cache_lock:
                    if cache_key in _token_cache:
                        del _token_cache[cache_key]
                        logger.info("Cleared cached token for retry")
                
                # 重新生成token
                token = generate_kling_token(config_access_key, config_secret_key)
                headers['Authorization'] = f'Bearer {token}'
                
                # 等待一段时间再重试
                time.sleep(retry_delay * attempt)
            
            response = requests.get(url, headers=headers, timeout=120)
            
            # 如果是401错误且还有重试次数，继续重试
            if response.status_code == 401 and attempt < max_retries - 1:
                logger.warning(f"Got 401 error on attempt {attempt + 1}, will retry")
                continue
            
            # 其他错误或最后一次重试失败，抛出异常
            if response.status_code != 200:
                raise handle_api_error(response)
            
            # 成功，跳出重试循环
            if attempt > 0:
                logger.info(f"Request succeeded on retry attempt {attempt + 1}")
            break
            
        except requests.exceptions.RequestException as e:
            if attempt == max_retries - 1:
                raise AIServiceError(500, f"网络请求失败: {str(e)}")
            logger.warning(f"Network error on attempt {attempt + 1}, will retry: {str(e)}")
            time.sleep(retry_delay * (attempt + 1))
    
    # 解析响应
    try:
        result = response.json()
        if result.get('code') != 0:
            raise AIServiceError(400, result.get('message', '查询多图生视频任务失败'))
        
        data = result.get('data', {})
        task_status = data.get('task_status', 'unknown')
        
        response_data = {
            'task_id': task_id,
            'status': task_status,
            'video_url': None,
            'error_message': None
        }
        
        if task_status == 'succeed':
            # 提取视频URL
            task_result = data.get('task_result', {})
            videos = task_result.get('videos', [])
            if videos:
                response_data['video_url'] = videos[0].get('url')
        elif task_status == 'failed':
            response_data['error_message'] = data.get('task_status_msg', '多图生视频失败')
        
        return response_data
        
    except json.JSONDecodeError:
        raise AIServiceError(500, "AI服务返回的响应格式不正确")

def create_video_task(service_id: str, access_key: str, secret_key: str, prompt: str, 
                     start_frame_base64: str, end_frame_base64: str, model_name: str = "kling-v1",
                     duration: str = "5", mode: str = "pro") -> str:
    """创建视频生成任务"""
    config = get_services_config()
    
    # 查找服务配置
    service_config = None
    for service in config.get('video_generation_services', []):
        if service['id'] == service_id:
            service_config = service
            break
    
    if not service_config:
        raise AIServiceError(404, f"未找到服务配置: {service_id}")
    
    # 生成JWT Token
    token = generate_kling_token(access_key, secret_key)
    
    # 构建请求URL
    base_url = service_config['api_endpoint_base']
    create_endpoint = service_config['endpoints']['create_task']
    url = base_url + create_endpoint
    
    # 构建请求头
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    # 构建请求载荷
    payload_data = {
        'model_name': model_name or service_config['default_model'],
        'prompt': prompt,
        'image': start_frame_base64,
        'image_tail': end_frame_base64,
        'duration': duration,
        'mode': mode
    }
    payload = build_payload(service_config['payload_template'], payload_data)
    
    # 发送请求
    response = call_ai_service_with_retry(url, headers, payload)
    
    if response.status_code != 200:
        raise handle_api_error(response)
    
    # 解析响应
    try:
        result = response.json()
        if result.get('code') != 0:
            raise AIServiceError(400, result.get('message', '视频任务创建失败'))
        
        task_id = result.get('data', {}).get('task_id')
        if not task_id:
            raise AIServiceError(500, "AI服务未返回任务ID")
        
        return task_id
        
    except json.JSONDecodeError:
        raise AIServiceError(500, "AI服务返回的响应格式不正确")

def query_video_task(service_id: str, access_key: str, secret_key: str, task_id: str) -> Dict[str, Any]:
    """查询视频生成任务状态"""
    config = get_services_config()
    
    # 查找服务配置
    service_config = None
    for service in config.get('video_generation_services', []):
        if service['id'] == service_id:
            service_config = service
            break
    
    if not service_config:
        raise AIServiceError(404, f"未找到服务配置: {service_id}")
    
    # 优先使用服务配置中的密钥，如果没有则使用传入的密钥
    config_access_key = service_config.get('access_key', access_key)
    config_secret_key = service_config.get('secret_key', secret_key)
    
    # 调试日志
    logger.info(f"Query video task - Using access_key: {config_access_key[:8]}...")
    logger.info(f"Query video task - Using secret_key: {config_secret_key[:8]}...")
    
    # 生成JWT Token
    token = generate_kling_token(config_access_key, config_secret_key)
    logger.info(f"Generated JWT token: {token[:50]}...")
    
    # 构建请求URL
    base_url = service_config['api_endpoint_base']
    query_endpoint = service_config['endpoints']['query_task']
    url = base_url + query_endpoint + task_id
    
    # 构建请求头
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    # 发送GET请求
    try:
        response = requests.get(url, headers=headers, timeout=120)
    except requests.exceptions.RequestException as e:
        raise AIServiceError(500, f"网络请求失败: {str(e)}")
    
    if response.status_code != 200:
        raise handle_api_error(response)
    
    # 解析响应
    try:
        result = response.json()
        if result.get('code') != 0:
            raise AIServiceError(400, result.get('message', '查询视频任务失败'))
        
        data = result.get('data', {})
        task_status = data.get('task_status', 'unknown')
        
        response_data = {
            'task_id': task_id,
            'status': task_status,
            'video_url': None,
            'error_message': None
        }
        
        if task_status == 'succeed':
            # 提取视频URL
            task_result = data.get('task_result', {})
            videos = task_result.get('videos', [])
            if videos:
                response_data['video_url'] = videos[0].get('url')
        elif task_status == 'failed':
            response_data['error_message'] = data.get('task_status_msg', '视频生成失败')
        
        return response_data
        
    except json.JSONDecodeError:
        raise AIServiceError(500, "AI服务返回的响应格式不正确")