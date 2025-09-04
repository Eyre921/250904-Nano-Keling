import json
import os
from typing import Dict, Any
from pathlib import Path

# 全局配置存储
services_config: Dict[str, Any] = {}
prompts_data: Dict[str, Any] = {"prompts": []}

def get_project_root() -> Path:
    """获取项目根目录"""
    return Path(__file__).parent.parent.parent

def load_services_config() -> Dict[str, Any]:
    """加载AI服务配置文件"""
    global services_config
    
    config_path = get_project_root() / "services_config.json"
    
    try:
        if config_path.exists():
            with open(config_path, 'r', encoding='utf-8') as f:
                services_config = json.load(f)
                print(f"已加载服务配置: {len(services_config.get('image_processing_services', []))} 个图像服务, {len(services_config.get('video_generation_services', []))} 个视频服务")
        else:
            print(f"警告: 服务配置文件不存在: {config_path}")
            services_config = {
                "image_processing_services": [],
                "video_generation_services": []
            }
    except Exception as e:
        print(f"加载服务配置失败: {e}")
        services_config = {
            "image_processing_services": [],
            "video_generation_services": []
        }
    
    return services_config

def get_services_config() -> Dict[str, Any]:
    """获取当前的服务配置"""
    global services_config
    if not services_config:
        load_services_config()
    return services_config

def load_prompts_data() -> Dict[str, Any]:
    """加载提示词库数据"""
    global prompts_data
    
    prompts_path = get_project_root() / "prompts.json"
    
    try:
        if prompts_path.exists():
            with open(prompts_path, 'r', encoding='utf-8') as f:
                prompts_data = json.load(f)
        else:
            # 创建默认的提示词文件
            prompts_data = {"prompts": []}
            save_prompts_data()
    except Exception as e:
        print(f"加载提示词库失败: {e}")
        prompts_data = {"prompts": []}
    
    return prompts_data

def save_prompts_data() -> bool:
    """保存提示词库数据"""
    global prompts_data
    
    prompts_path = get_project_root() / "prompts.json"
    
    try:
        with open(prompts_path, 'w', encoding='utf-8') as f:
            json.dump(prompts_data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"保存提示词库失败: {e}")
        return False

def get_prompts_data() -> Dict[str, Any]:
    """获取当前的提示词库数据"""
    global prompts_data
    if not prompts_data or not prompts_data.get("prompts"):
        load_prompts_data()
    return prompts_data

def add_prompt(name: str, prompt: str) -> bool:
    """添加新的提示词"""
    global prompts_data
    
    # 检查是否已存在同名提示词
    for existing_prompt in prompts_data.get("prompts", []):
        if existing_prompt.get("name") == name:
            return False  # 已存在同名提示词
    
    # 添加新提示词
    prompts_data.setdefault("prompts", []).append({
        "name": name,
        "prompt": prompt
    })
    
    return save_prompts_data()