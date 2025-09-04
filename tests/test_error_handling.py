#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试错误处理机制
验证500错误的重试逻辑和错误信息
"""

import sys
import os

# 添加backend目录到Python路径
backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend')
sys.path.insert(0, backend_path)

from app.services import handle_api_error, AIServiceError
import requests
from unittest.mock import Mock

def test_500_error_handling():
    """测试500错误的处理"""
    print("=== 测试500错误处理 ===")
    
    # 模拟500错误响应
    mock_response = Mock(spec=requests.Response)
    mock_response.status_code = 500
    mock_response.json.return_value = {"error": {"code": 500, "message": "Internal error"}}
    mock_response.text = '{"error": {"code": 500, "message": "Internal error"}}'
    
    try:
        error = handle_api_error(mock_response)
        print(f"错误码: {error.code}")
        print(f"错误信息: {error.message}")
        print(f"详细信息: {error.details}")
    except Exception as e:
        print(f"处理错误时发生异常: {e}")

def test_other_server_errors():
    """测试其他服务器错误"""
    print("\n=== 测试其他服务器错误 ===")
    
    for status_code in [502, 503, 504]:
        mock_response = Mock(spec=requests.Response)
        mock_response.status_code = status_code
        mock_response.json.side_effect = ValueError("No JSON")
        mock_response.text = f'Server Error {status_code}'
        
        try:
            error = handle_api_error(mock_response)
            print(f"HTTP {status_code} - 错误信息: {error.message}")
        except Exception as e:
            print(f"处理HTTP {status_code}错误时发生异常: {e}")

def test_retry_logic_simulation():
    """模拟重试逻辑的等待时间计算"""
    print("\n=== 模拟重试等待时间 ===")
    
    # 模拟500错误的等待时间
    print("500错误的等待时间:")
    for attempt in range(5):
        wait_time_500 = min((2 ** attempt) * 2, 30)
        print(f"  尝试 {attempt + 1}: {wait_time_500}秒")
    
    # 模拟其他错误的等待时间
    print("\n其他错误的等待时间:")
    for attempt in range(5):
        wait_time_normal = (2 ** attempt)
        print(f"  尝试 {attempt + 1}: {wait_time_normal}秒")

if __name__ == "__main__":
    test_500_error_handling()
    test_other_server_errors()
    test_retry_logic_simulation()
    print("\n=== 测试完成 ===")