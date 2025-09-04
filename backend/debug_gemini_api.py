#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gemini API调试脚本
"""

import requests
import json
import base64
import os

def test_gemini_direct():
    """直接测试Gemini API"""
    
    # 测试图像（1x1像素的PNG）
    test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    
    api_key = "AIzaSyAzTyItlAqQazqV8HorekORPhWtx22Me30"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key={api_key}"
    
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": "Remove the background from this product image, keeping only the main product. The background must be transparent."
                    },
                    {
                        "inline_data": {
                            "mime_type": "image/png",
                            "data": test_image_base64
                        }
                    }
                ]
            }
        ]
    }
    
    headers = {'Content-Type': 'application/json'}
    
    # 配置代理
    proxies = {
        'http': 'http://127.0.0.1:10809',
        'https': 'http://127.0.0.1:10809'
    }
    
    try:
        print("发送请求到Gemini API...")
        print(f"URL: {url}")
        print(f"使用代理: {proxies}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(url, headers=headers, json=payload, proxies=proxies, timeout=60)
        
        print(f"\n状态码: {response.status_code}")
        print(f"响应头: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ 请求成功!")
            print(f"完整响应: {json.dumps(result, indent=2, ensure_ascii=False)}")
            
            # 分析响应结构
            candidates = result.get('candidates', [])
            print(f"\nCandidates数量: {len(candidates)}")
            
            if candidates:
                for i, candidate in enumerate(candidates):
                    print(f"\nCandidate {i}:")
                    content = candidate.get('content', {})
                    parts = content.get('parts', [])
                    print(f"  Parts数量: {len(parts)}")
                    
                    for j, part in enumerate(parts):
                        print(f"  Part {j}: {list(part.keys())}")
                        if 'inline_data' in part:
                            inline_data = part['inline_data']
                            print(f"    MIME类型: {inline_data.get('mime_type')}")
                            print(f"    数据长度: {len(inline_data.get('data', ''))} 字符")
                        elif 'text' in part:
                            print(f"    文本: {part['text'][:100]}...")
        else:
            print(f"\n❌ 请求失败:")
            print(f"错误响应: {response.text}")
            
    except Exception as e:
        print(f"❌ 测试失败: {e}")

if __name__ == "__main__":
    print("=== Gemini API 直接调试测试 ===")
    test_gemini_direct()