#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import base64
import json
import time
from PIL import Image
import io

def test_video_generation():
    """测试视频生成功能"""
    
    # 测试参数
    service_id = "kling_image2video_v1"
    access_key = "AMM8mCR8Q8rC48PPEfNeKLHFfbmQJGAA"  # 需要替换为实际的access_key
    secret_key = "QHTNTLLLyd3HfGLTFrm4T3QLmAARCN8F "  # 需要替换为实际的secret_key
    prompt = "一个美丽的花园，花朵在微风中轻轻摇摆"
    
    # 创建测试图像（简单的彩色方块）
    def create_test_image(color):
        img = Image.new('RGB', (512, 512), color)
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        return base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    start_frame = create_test_image((255, 0, 0))  # 红色
    end_frame = create_test_image((0, 0, 255))    # 蓝色
    
    print("=== 视频生成功能测试 ===")
    
    # 1. 获取服务配置
    print("\n1. 获取服务配置...")
    try:
        response = requests.get("http://localhost:8000/api/services")
        if response.status_code == 200:
            services = response.json()
            video_services = services.get('video_services', [])
            print(f"视频生成服务数量: {len(video_services)}")
            for service in video_services:
                print(f"  - {service['id']}: {service['name']}")
        else:
            print(f"获取服务配置失败: {response.status_code}")
            return
    except Exception as e:
        print(f"获取服务配置异常: {e}")
        return
    
    # 2. 创建视频生成任务
    print("\n2. 创建视频生成任务...")
    try:
        create_data = {
            "service_id": service_id,
            "access_key": access_key,
            "secret_key": secret_key,
            "prompt": prompt,
            "start_frame_base64": start_frame,
            "end_frame_base64": end_frame,
            "model": "kling-v1"
        }
        
        response = requests.post(
            "http://localhost:8000/api/video-generate",
            json=create_data
        )
        
        print(f"创建任务响应状态码: {response.status_code}")
        print(f"响应内容类型: {response.headers.get('content-type', 'unknown')}")
        
        if response.status_code == 200:
            result = response.json()
            task_id = result.get('task_id')
            print(f"视频生成任务创建成功!")
            print(f"任务ID: {task_id}")
            
            # 3. 查询任务状态
            print("\n3. 查询任务状态...")
            status_params = {
                "service_id": service_id,
                "access_key": access_key,
                "secret_key": secret_key
            }
            
            status_response = requests.get(
                f"http://localhost:8000/api/video-status/{task_id}",
                params=status_params
            )
            
            print(f"查询状态响应码: {status_response.status_code}")
            if status_response.status_code == 200:
                status_result = status_response.json()
                print(f"任务状态: {status_result.get('status')}")
                if status_result.get('video_url'):
                    print(f"视频URL: {status_result.get('video_url')}")
                if status_result.get('error_message'):
                    print(f"错误信息: {status_result.get('error_message')}")
            else:
                print(f"查询状态失败: {status_response.text}")
                
        else:
            print(f"创建任务失败: {response.text}")
            
    except Exception as e:
        print(f"视频生成测试异常: {e}")

if __name__ == "__main__":
    test_video_generation()