import time
import jwt
import requests

# 从配置文件中获取的密钥
access_key = "AMM8mCR8Q8rC48PPEfNeKLHFfbmQJGAA"
secret_key = "QHTNTLLLyd3HfGLTFrm4T3QLmAARCN8F"

def generate_kling_token(access_key: str, secret_key: str) -> str:
    """生成可灵AI的JWT Token"""
    headers = {
        "alg": "HS256",
        "typ": "JWT"
    }
    current_time = int(time.time())
    payload = {
        "iss": access_key,
        "exp": current_time + 1800,  # 30分钟有效期
        "nbf": current_time - 10  # 开始生效时间，当前时间-10秒
    }
    token = jwt.encode(payload, secret_key, algorithm="HS256", headers=headers)
    return token

def test_token():
    print("=" * 50)
    print("测试JWT Token生成")
    print("=" * 50)
    
    # 生成token
    token = generate_kling_token(access_key, secret_key)
    print(f"生成的Token: {token}")
    print(f"Token长度: {len(token)}")
    
    # 解码验证
    try:
        decoded = jwt.decode(token, secret_key, algorithms=["HS256"])
        print(f"解码成功: {decoded}")
        
        current_time = int(time.time())
        print(f"当前时间: {current_time}")
        print(f"Token开始时间: {decoded['nbf']}")
        print(f"Token过期时间: {decoded['exp']}")
        print(f"Token是否有效: {decoded['nbf'] <= current_time <= decoded['exp']}")
        
    except Exception as e:
        print(f"解码失败: {e}")
    
    # 测试API调用
    print("\n" + "=" * 50)
    print("测试API调用")
    print("=" * 50)
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 简单的API测试（使用一个最小的payload）
    test_payload = {
        "model_name": "kling-v1",
        "prompt": "test",
        "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        "duration": "5",
        "mode": "pro"
    }
    
    try:
        response = requests.post(
            "https://api-beijing.klingai.com/v1/videos/image2video",
            headers=headers,
            json=test_payload,
            timeout=30
        )
        
        print(f"响应状态码: {response.status_code}")
        print(f"响应内容: {response.text}")
        
        if response.status_code == 401:
            print("\n❌ 认证失败，可能的原因:")
            print("1. API Key或Secret Key不正确")
            print("2. JWT Token生成有误")
            print("3. 账户权限问题")
        elif response.status_code == 200:
            print("\n✅ 认证成功！")
        else:
            print(f"\n⚠️ 其他错误: {response.status_code}")
            
    except Exception as e:
        print(f"请求失败: {e}")

if __name__ == "__main__":
    test_token()