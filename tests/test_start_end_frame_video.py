#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
首尾帧视频生成测试脚本
用于测试Keling AI的起始帧到结束帧视频生成功能
"""

import requests
import json
import time
import base64
from pathlib import Path

# 配置信息
BASE_URL = "http://localhost:8000"
ACCESS_KEY = "AMM8mCR8Q8rC48PPEfNeKLHFfbmQJGAA"
SECRET_KEY = "QHTNTLLLyd3HfGLTFrm4T3QLmAARCN8F"
SERVICE_ID = "kling_image2video_v1"  # Keling AI (start/end frame video generation)

def encode_image_to_base64(image_path):
    """将图片文件编码为base64字符串"""
    try:
        with open(image_path, 'rb') as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            return encoded_string
    except Exception as e:
        print(f"编码图片失败: {e}")
        return None

def create_test_video_task():
    """创建视频生成任务"""
    # 测试图片路径（需要准备两张测试图片）
    start_frame_path = "test_start_frame.jpg"  # 起始帧图片
    end_frame_path = "test_end_frame.jpg"      # 结束帧图片
    
    # 检查图片文件是否存在
    if not Path(start_frame_path).exists():
        print(f"起始帧图片不存在: {start_frame_path}")
        print("请在脚本目录下放置名为 'test_start_frame.jpg' 的起始帧图片")
        return None
        
    if not Path(end_frame_path).exists():
        print(f"结束帧图片不存在: {end_frame_path}")
        print("请在脚本目录下放置名为 'test_end_frame.jpg' 的结束帧图片")
        return None
    
    # 编码图片
    print("正在编码图片...")
    start_frame_base64 = encode_image_to_base64(start_frame_path)
    end_frame_base64 = encode_image_to_base64(end_frame_path)
    
    if not start_frame_base64 or not end_frame_base64:
        print("图片编码失败")
        return None
    
    # 构建请求数据
    payload = {
        "service_id": SERVICE_ID,
        "access_key": ACCESS_KEY,
        "secret_key": SECRET_KEY,
        "prompt": "产品缓慢旋转360度，展示各个角度的细节，背景保持简洁，光线柔和均匀",
        "start_frame_base64": start_frame_base64,
        "end_frame_base64": end_frame_base64,
        "model_name": "kling-v1",
        "duration": "5",
        "mode": "pro"
    }
    
    print("正在创建视频生成任务...")
    print(f"服务ID: {SERVICE_ID}")
    print(f"模型: {payload['model_name']}")
    print(f"时长: {payload['duration']}秒")
    print(f"模式: {payload['mode']}")
    print(f"提示词: {payload['prompt']}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/video-generate",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"响应状态码: {response.status_code}")
        print(f"响应内容: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            task_id = result.get('task_id')
            if task_id:
                print(f"✅ 任务创建成功! Task ID: {task_id}")
                return task_id
            else:
                print("❌ 响应中没有找到task_id")
                return None
        else:
            print(f"❌ 任务创建失败: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 请求异常: {e}")
        return None

def query_video_status(task_id):
    """查询视频生成状态"""
    params = {
        "service_id": SERVICE_ID,
        "access_key": ACCESS_KEY,
        "secret_key": SECRET_KEY
    }
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/video-status/{task_id}",
            params=params,
            timeout=30
        )
        
        print(f"状态查询响应码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            status = result.get('status', 'unknown')
            print(f"任务状态: {status}")
            
            if status in ['succeeded', 'succeed']:
                print("✅ 视频生成成功!")
                print("完整返回体:")
                print(json.dumps(result, indent=2, ensure_ascii=False))
                
                video_url = result.get('video_url')
                if video_url:
                    print(f"视频URL: {video_url}")
                else:
                    print("⚠️ 任务成功但没有返回视频URL")
            elif status == 'failed':
                error_msg = result.get('error', '未知错误')
                print(f"❌ 视频生成失败: {error_msg}")
            elif status == 'processing':
                print("⏳ 视频正在生成中...")
            
            return result
        else:
            print(f"❌ 状态查询失败: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 状态查询异常: {e}")
        return None

def test_video_generation():
    """完整的视频生成测试流程"""
    print("=" * 50)
    print("开始测试首尾帧视频生成功能")
    print("=" * 50)
    
    # 创建任务
    task_id = create_test_video_task()
    if not task_id:
        print("任务创建失败，测试终止")
        return
    
    print("\n" + "=" * 50)
    print("开始轮询任务状态")
    print("=" * 50)
    
    # 轮询状态
    max_attempts = 30  # 最多查询30次（5分钟，每次间隔10秒）
    attempt = 0
    
    while attempt < max_attempts:
        attempt += 1
        print(f"\n第 {attempt} 次状态查询:")
        
        result = query_video_status(task_id)
        if not result:
            print("状态查询失败，等待10秒后重试...")
            time.sleep(10)
            continue
        
        status = result.get('status', 'unknown')
        
        if status in ['succeeded', 'succeed']:
            print("\n🎉 测试成功完成!")
            break
        elif status == 'failed':
            print("\n💥 测试失败!")
            break
        elif status == 'processing':
            print("等待10秒后继续查询...")
            time.sleep(10)
        else:
            print(f"未知状态: {status}，等待10秒后重试...")
            time.sleep(10)
    
    if attempt >= max_attempts:
        print("\n⏰ 查询超时，请手动检查任务状态")

if __name__ == "__main__":
    test_video_generation()