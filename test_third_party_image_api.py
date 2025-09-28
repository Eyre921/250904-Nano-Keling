#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第三方生图API测试脚本
API提供商: ChatAI API
模型: gemini-2.5-flash-image-preview
"""

import requests
import json
import time
from datetime import datetime

# API配置
API_BASE_URL = "https://www.chataiapi.com"
API_KEY = "sk-Dsqpgt7NrKQlU2gWPaG8SFlv0SjWTkJzTr6Dun0Cbo1us6sL"
MODEL_NAME = "gemini-2.5-flash-image-preview"

def test_image_generation_api():
    """
    测试第三方生图API
    """
    print(f"开始测试第三方生图API - {datetime.now()}")
    print(f"API地址: {API_BASE_URL}")
    print(f"模型名称: {MODEL_NAME}")
    print("-" * 50)
    
    # 构建请求URL
    url = f"{API_BASE_URL}/v1/images/generations"
    
    # 请求头
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    # 测试用例
    test_cases = [
        {
            "name": "简单商品图片生成",
            "prompt": "A beautiful red apple on a white background, product photography style, high quality, 4K",
            "size": "1024x1024",
            "n": 1
        },
        {
            "name": "电子产品图片生成",
            "prompt": "Modern smartphone with sleek design, black color, floating on gradient background, commercial photography",
            "size": "1024x1024", 
            "n": 1
        },
        {
            "name": "时尚商品图片生成",
            "prompt": "Elegant watch with leather strap, luxury style, studio lighting, white background, product shot",
            "size": "1024x1024",
            "n": 1
        }
    ]
    
    results = []
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n测试用例 {i}: {test_case['name']}")
        print(f"提示词: {test_case['prompt']}")
        
        # 构建请求数据
        data = {
            "model": MODEL_NAME,
            "prompt": test_case['prompt'],
            "size": test_case['size'],
            "n": test_case['n'],
            "quality": "standard"
        }
        
        try:
            # 发送请求
            start_time = time.time()
            response = requests.post(url, headers=headers, json=data, timeout=60)
            end_time = time.time()
            
            response_time = end_time - start_time
            
            print(f"响应状态码: {response.status_code}")
            print(f"响应时间: {response_time:.2f}秒")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ 请求成功!")
                
                # 解析响应
                if 'data' in result and len(result['data']) > 0:
                    image_url = result['data'][0].get('url', 'N/A')
                    print(f"生成的图片URL: {image_url}")
                    
                    results.append({
                        "test_case": test_case['name'],
                        "status": "成功",
                        "response_time": response_time,
                        "image_url": image_url
                    })
                else:
                    print("⚠️ 响应中没有找到图片数据")
                    results.append({
                        "test_case": test_case['name'],
                        "status": "失败 - 无图片数据",
                        "response_time": response_time,
                        "error": "响应中没有图片数据"
                    })
                    
            else:
                print(f"❌ 请求失败: {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"错误详情: {json.dumps(error_detail, indent=2, ensure_ascii=False)}")
                except:
                    print(f"错误详情: {response.text}")
                
                results.append({
                    "test_case": test_case['name'],
                    "status": f"失败 - {response.status_code}",
                    "response_time": response_time,
                    "error": response.text[:200]
                })
                
        except requests.exceptions.Timeout:
            print("❌ 请求超时")
            results.append({
                "test_case": test_case['name'],
                "status": "超时",
                "error": "请求超时(60秒)"
            })
            
        except requests.exceptions.RequestException as e:
            print(f"❌ 请求异常: {str(e)}")
            results.append({
                "test_case": test_case['name'],
                "status": "异常",
                "error": str(e)
            })
            
        except Exception as e:
            print(f"❌ 未知错误: {str(e)}")
            results.append({
                "test_case": test_case['name'],
                "status": "未知错误",
                "error": str(e)
            })
        
        # 避免请求过于频繁
        if i < len(test_cases):
            print("等待2秒后进行下一个测试...")
            time.sleep(2)
    
    # 输出测试总结
    print("\n" + "=" * 60)
    print("测试总结")
    print("=" * 60)
    
    success_count = sum(1 for r in results if r['status'] == '成功')
    total_count = len(results)
    
    print(f"总测试用例: {total_count}")
    print(f"成功: {success_count}")
    print(f"失败: {total_count - success_count}")
    print(f"成功率: {(success_count/total_count)*100:.1f}%")
    
    print("\n详细结果:")
    for result in results:
        print(f"- {result['test_case']}: {result['status']}")
        if 'response_time' in result:
            print(f"  响应时间: {result['response_time']:.2f}秒")
        if 'image_url' in result:
            print(f"  图片URL: {result['image_url']}")
        if 'error' in result:
            print(f"  错误: {result['error']}")
        print()
    
    return results

def test_api_connectivity():
    """
    测试API连通性
    """
    print("测试API连通性...")
    
    try:
        # 尝试访问API基础URL
        response = requests.get(API_BASE_URL, timeout=10)
        print(f"API基础URL访问状态: {response.status_code}")
        
        # 测试模型列表接口（如果存在）
        models_url = f"{API_BASE_URL}/v1/models"
        headers = {"Authorization": f"Bearer {API_KEY}"}
        
        models_response = requests.get(models_url, headers=headers, timeout=10)
        print(f"模型列表接口状态: {models_response.status_code}")
        
        if models_response.status_code == 200:
            models_data = models_response.json()
            print("可用模型:")
            if 'data' in models_data:
                for model in models_data['data'][:5]:  # 只显示前5个
                    print(f"  - {model.get('id', 'N/A')}")
            
    except Exception as e:
        print(f"连通性测试失败: {str(e)}")

if __name__ == "__main__":
    print("第三方生图API测试工具")
    print("=" * 30)
    
    # 首先测试连通性
    test_api_connectivity()
    print()
    
    # 然后测试图片生成
    results = test_image_generation_api()
    
    print("\n测试完成!")