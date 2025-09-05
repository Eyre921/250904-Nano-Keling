#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
import time
from urllib.parse import urlparse

def test_video_url_access():
    """测试视频URL是否可以正常访问"""
    
    # 从之前的测试结果中获取的视频URL
    video_url = "https://v2-kling.kechuangai.com/bs2/upload-ylab-stunt/special-effect/output/KLingMuse_3c13446c-6a28-4d25-9da6-58897f56ff47/-578127737718525012/outputhyie0.mp4?x-kcdn-pid=112452"
    
    print("=" * 80)
    print("测试视频URL访问")
    print("=" * 80)
    print(f"视频URL: {video_url}")
    print()
    
    try:
        print("正在检查视频URL...")
        
        # 发送HEAD请求检查视频是否存在
        response = requests.head(video_url, timeout=30)
        
        print(f"响应状态码: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type', 'N/A')}")
        print(f"Content-Length: {response.headers.get('Content-Length', 'N/A')}")
        
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type', '')
            if 'video' in content_type.lower():
                print("✅ 视频URL有效，可以正常访问！")
                
                # 获取视频大小信息
                content_length = response.headers.get('Content-Length')
                if content_length:
                    size_mb = int(content_length) / (1024 * 1024)
                    print(f"视频大小: {size_mb:.2f} MB")
                    
            else:
                print(f"⚠️ URL可访问，但内容类型不是视频: {content_type}")
        else:
            print(f"❌ 视频URL无法访问，状态码: {response.status_code}")
            
    except requests.exceptions.Timeout:
        print("❌ 请求超时，视频URL可能无法访问")
    except requests.exceptions.ConnectionError:
        print("❌ 连接错误，无法访问视频URL")
    except Exception as e:
        print(f"❌ 访问视频URL时发生错误: {str(e)}")
    
    print("\n" + "=" * 80)
    print("视频URL测试完成")
    print("=" * 80)

def test_task_query_with_delay():
    """测试带延迟的任务查询，避免频率限制"""
    
    print("\n" + "=" * 80)
    print("测试带延迟的任务查询")
    print("=" * 80)
    
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
    total_queries = 3
    delay_seconds = 5  # 5秒延迟
    
    for i in range(total_queries):
        print(f"\n查询 {i+1}/{total_queries}:")
        try:
            response = requests.get(
                f"{BASE_URL}/api/video-status/{TASK_ID}",
                params=params,
                timeout=15
            )
            
            print(f"  状态码: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"  ✅ 成功 - 任务状态: {result.get('status', 'unknown')}")
                if result.get('video_url'):
                    print(f"  📹 视频URL: {result.get('video_url')[:60]}...")
                success_count += 1
            elif response.status_code == 401:
                print("  ❌ 认证失败 (401)")
                try:
                    error_detail = response.json()
                    print(f"  错误: {error_detail.get('detail', '未知认证错误')}")
                except:
                    pass
            else:
                print(f"  ❌ 失败 - 状态码: {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ 异常: {str(e)}")
            
        # 延迟等待（除了最后一次）
        if i < total_queries - 1:
            print(f"  ⏳ 等待 {delay_seconds} 秒...")
            time.sleep(delay_seconds)
    
    print(f"\n结果统计: {success_count}/{total_queries} 次成功")
    success_rate = (success_count / total_queries) * 100
    print(f"成功率: {success_rate:.1f}%")
    
    if success_count == total_queries:
        print("🎉 所有查询都成功！")
    elif success_count > 0:
        print("⚠️ 部分查询成功，可能存在频率限制")
    else:
        print("❌ 所有查询都失败，需要检查认证配置")

def test_jwt_token_analysis():
    """分析JWT token的生成和有效性"""
    
    print("\n" + "=" * 80)
    print("JWT Token 分析")
    print("=" * 80)
    
    import jwt as jwt_lib
    import time
    
    ACCESS_KEY = "AMM8mCR8Q8rC48PPEfNeKLHFfbmQJGAA"
    SECRET_KEY = "QHTNTLLLyd3HfGLTFrm4T3QLmAARCN8F"
    
    # 生成token（模拟后端逻辑）
    current_time = int(time.time())
    payload = {
        "iss": ACCESS_KEY,
        "exp": current_time + 1800,  # 30分钟有效期
        "nbf": current_time - 10  # 开始生效时间，当前时间-10秒
    }
    
    token = jwt_lib.encode(payload, SECRET_KEY, algorithm="HS256")
    
    print(f"生成的JWT Token: {token[:50]}...")
    print(f"Token长度: {len(token)} 字符")
    
    # 解析token
    try:
        decoded = jwt_lib.decode(token, SECRET_KEY, algorithms=["HS256"])
        print("\nToken解析成功:")
        print(f"  发行者 (iss): {decoded.get('iss')}")
        print(f"  过期时间 (exp): {decoded.get('exp')} ({time.ctime(decoded.get('exp'))})")
        print(f"  生效时间 (nbf): {decoded.get('nbf')} ({time.ctime(decoded.get('nbf'))})")
        
        # 检查时间有效性
        now = int(time.time())
        if now < decoded.get('nbf', 0):
            print("  ⚠️ Token还未生效")
        elif now > decoded.get('exp', 0):
            print("  ❌ Token已过期")
        else:
            remaining = decoded.get('exp', 0) - now
            print(f"  ✅ Token有效，剩余时间: {remaining//60} 分钟 {remaining%60} 秒")
            
    except Exception as e:
        print(f"❌ Token解析失败: {str(e)}")

if __name__ == "__main__":
    # 测试视频URL访问
    test_video_url_access()
    
    # 测试JWT token分析
    test_jwt_token_analysis()
    
    # 测试带延迟的查询
    test_task_query_with_delay()