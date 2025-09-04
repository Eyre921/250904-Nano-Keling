#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import logging
import sys
from datetime import datetime
from pathlib import Path

# 创建日志目录
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

# 配置日志格式
log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
date_format = "%Y-%m-%d %H:%M:%S"

# 创建formatter
formatter = logging.Formatter(log_format, date_format)

# 配置根日志器
logging.basicConfig(
    level=logging.INFO,
    format=log_format,
    datefmt=date_format
)

# 创建文件处理器
today = datetime.now().strftime("%Y-%m-%d")
file_handler = logging.FileHandler(
    log_dir / f"app_{today}.log",
    encoding='utf-8'
)
file_handler.setFormatter(formatter)
file_handler.setLevel(logging.INFO)

# 创建错误文件处理器
error_handler = logging.FileHandler(
    log_dir / f"error_{today}.log",
    encoding='utf-8'
)
error_handler.setFormatter(formatter)
error_handler.setLevel(logging.ERROR)

# 创建控制台处理器
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(formatter)
console_handler.setLevel(logging.INFO)

# 获取应用日志器
app_logger = logging.getLogger("ai_video_generator")
app_logger.setLevel(logging.INFO)
app_logger.addHandler(file_handler)
app_logger.addHandler(error_handler)
app_logger.addHandler(console_handler)

# 防止重复日志
app_logger.propagate = False

def get_logger(name: str = None) -> logging.Logger:
    """获取日志器实例"""
    if name:
        return logging.getLogger(f"ai_video_generator.{name}")
    return app_logger

def log_api_request(endpoint: str, method: str, params: dict = None, body: dict = None):
    """记录API请求"""
    logger = get_logger("api")
    logger.info(f"API Request: {method} {endpoint}")
    if params:
        logger.info(f"Params: {params}")
    if body:
        # 隐藏敏感信息
        safe_body = {k: "***" if k in ['access_key', 'secret_key', 'api_key'] else v for k, v in body.items()}
        logger.info(f"Body: {safe_body}")

def log_api_response(endpoint: str, status_code: int, response_time: float, error: str = None):
    """记录API响应"""
    logger = get_logger("api")
    if error:
        logger.error(f"API Response: {endpoint} - {status_code} - {response_time:.2f}s - Error: {error}")
    else:
        logger.info(f"API Response: {endpoint} - {status_code} - {response_time:.2f}s")

def log_ai_service_call(service_id: str, endpoint: str, status_code: int, response_time: float, error: str = None):
    """记录AI服务调用"""
    logger = get_logger("ai_service")
    if error:
        logger.error(f"AI Service Call: {service_id} - {endpoint} - {status_code} - {response_time:.2f}s - Error: {error}")
    else:
        logger.info(f"AI Service Call: {service_id} - {endpoint} - {status_code} - {response_time:.2f}s")

def log_error(error: Exception, context: str = None):
    """记录错误信息"""
    logger = get_logger("error")
    if context:
        logger.error(f"Error in {context}: {str(error)}", exc_info=True)
    else:
        logger.error(f"Error: {str(error)}", exc_info=True)