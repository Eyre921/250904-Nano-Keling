#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
图像处理功能测试脚本
"""

import base64
import requests
import json
from pathlib import Path

def test_image_processing():
    """测试图像处理API"""
    
    # 创建一个简单的测试图像（1x1像素的PNG）
    # 这是一个最小的PNG图像的base64编码
    test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    
    # 测试数据
    test_data = {
        "service_id": "nano_banana_remove_bg_v1",
        "api_key": "AIzaSyAzTyItlAqQazqV8HorekORPhWtx22Me30",  # 使用真实的Gemini API密钥
        "image_base64": test_image_base64,
        "mime_type": "image/png"
    }
    
    # 发送请求到本地API
    try:
        response = requests.post(
            "http://localhost:8000/api/image-process",
            json=test_data,
            timeout=30
        )
        
        print(f"状态码: {response.status_code}")
        print(f"响应头: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 图像处理成功!")
            print(f"处理后图像大小: {len(result.get('processed_image', ''))} 字符")
            print(f"MIME类型: {result.get('mime_type', 'unknown')}")
        else:
            print("❌ 图像处理失败:")
            try:
                error_detail = response.json()
                print(f"错误详情: {error_detail}")
            except:
                print(f"错误响应: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到后端服务器，请确保后端服务正在运行")
    except requests.exceptions.Timeout:
        print("❌ 请求超时")
    except Exception as e:
        print(f"❌ 测试失败: {e}")

def test_service_config():
    """测试服务配置API"""
    try:
        response = requests.get("http://localhost:8000/api/services", timeout=10)
        
        if response.status_code == 200:
            config = response.json()
            print("✅ 服务配置获取成功!")
            print(f"图像处理服务数量: {len(config.get('image_services', []))}")
            print(f"视频生成服务数量: {len(config.get('video_services', []))}")
            
            # 显示图像处理服务详情
            for service in config.get('image_services', []):
                print(f"- 服务ID: {service.get('id')}")
                print(f"  名称: {service.get('name')}")
                print(f"  API端点: {service.get('api_endpoint')}")
        else:
            print(f"❌ 获取服务配置失败: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 测试服务配置失败: {e}")

if __name__ == "__main__":
    print("=== AI商品视频智能生成器 - 图像处理功能测试 ===")
    print()
    
    print("1. 测试服务配置...")
    test_service_config()
    print()
    
    print("2. 测试图像处理...")
    print("注意: 需要有效的Gemini API密钥才能成功测试")
    test_image_processing()
    print()
    
    print("测试完成!")