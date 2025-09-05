#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
import time

def test_specific_task_status():
    """测试特定任务ID的视频状态查询"""
    
    # 测试参数
    BASE_URL = "http://localhost:8000"
    TASK_ID = "792872054319501352"
    SERVICE_ID = "kling_image2video_v1"
    ACCESS_KEY = "AMM8mCR8Q8rC48PPEfNeKLHFfbmQJGAA"
    SECRET_KEY = "QHTNTLLLyd3HfGLTFrm4T3QLmAARCN8F"
    
    print("=" * 60)
    print("测试特定任务状态查询")
    print("=" * 60)
    print(f"任务ID: {TASK_ID}")
    print(f"服务ID: {SERVICE_ID}")
    print(f"Access Key: {ACCESS_KEY[:8]}...")
    print(f"Secret Key: {SECRET_KEY[:8]}...")
    print()
    
    # 构建查询参数
    params = {
        "service_id": SERVICE_ID,
        "access_key": ACCESS_KEY,
        "secret_key": SECRET_KEY
    }
    
    try:
        print("正在查询任务状态...")
        response = requests.get(
            f"{BASE_URL}/api/video-status/{TASK_ID}",
            params=params,
            timeout=30
        )
        
        print(f"响应状态码: {response.status_code}")
        print(f"响应头: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ 查询成功!")
            print(f"任务状态: {result.get('status', 'unknown')}")
            print(f"任务ID: {result.get('task_id', 'N/A')}")
            
            if result.get('video_url'):
                print(f"视频URL: {result.get('video_url')}")
                print("🎉 视频生成完成！")
            elif result.get('status') == 'processing':
                print("⏳ 视频正在生成中...")
            elif result.get('status') == 'failed':
                print(f"❌ 视频生成失败: {result.get('error_message', '未知错误')}")
            
            print("\n完整响应数据:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif response.status_code == 401:
            print("\n❌ 认证失败 (401)")
            try:
                error_detail = response.json()
                print(f"错误详情: {error_detail.get('detail', '未知认证错误')}")
            except:
                print(f"错误详情: {response.text}")
                
        elif response.status_code == 404:
            print("\n❌ 任务未找到 (404)")
            try:
                error_detail = response.json()
                print(f"错误详情: {error_detail.get('detail', '任务不存在')}")
            except:
                print(f"错误详情: {response.text}")
                
        else:
            print(f"\n❌ 请求失败 ({response.status_code})")
            try:
                error_detail = response.json()
                print(f"错误详情: {error_detail}")
            except:
                print(f"错误详情: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("\n❌ 连接失败: 无法连接到后端服务")
        print("请确保后端服务正在运行 (python -m app.main)")
        
    except requests.exceptions.Timeout:
        print("\n❌ 请求超时")
        
    except Exception as e:
        print(f"\n❌ 发生错误: {str(e)}")
        
    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)

def test_multiple_queries():
    """测试多次查询以验证认证稳定性"""
    
    print("\n" + "=" * 60)
    print("测试多次查询认证稳定性")
    print("=" * 60)
    
    BASE_URL = "http://localhost:8000"
    TASK_ID = "792872054319501352"
    SERVICE_ID = "kling_image2video_v1"
    ACCESS_KEY = "AMM8mCR8Q8rC48PPEfNeKLHFfbmQJGAA"
    SECRET_KEY = "QHTNTLLLyd3HfGLTFrm4T3QLmAARCN8F"
    
    params = {
        "service_id": SERVICE_ID,
        "access_key": ACCESS_KEY,
        "secret_key": SECRET_KEY
    }
    
    success_count = 0
    total_queries = 5
    
    for i in range(total_queries):
        print(f"\n查询 {i+1}/{total_queries}:")
        try:
            response = requests.get(
                f"{BASE_URL}/api/video-status/{TASK_ID}",
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"  ✅ 成功 - 状态: {result.get('status', 'unknown')}")
                success_count += 1
            else:
                print(f"  ❌ 失败 - 状态码: {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ 异常: {str(e)}")
            
        # 间隔1秒
        if i < total_queries - 1:
            time.sleep(1)
    
    print(f"\n结果统计: {success_count}/{total_queries} 次成功")
    if success_count == total_queries:
        print("🎉 所有查询都成功，认证稳定！")
    else:
        print("⚠️ 部分查询失败，需要进一步检查")

if __name__ == "__main__":
    # 测试特定任务状态
    test_specific_task_status()
    
    # 测试多次查询稳定性
    test_multiple_queries()