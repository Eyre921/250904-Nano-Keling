#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
创建测试图片脚本
生成用于测试首尾帧视频生成的示例图片
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_test_image(filename, text, bg_color, text_color, size=(512, 512)):
    """创建测试图片"""
    # 创建图片
    image = Image.new('RGB', size, bg_color)
    draw = ImageDraw.Draw(image)
    
    # 尝试使用系统字体，如果没有则使用默认字体
    try:
        # Windows系统字体路径
        font_path = "C:/Windows/Fonts/arial.ttf"
        if os.path.exists(font_path):
            font = ImageFont.truetype(font_path, 48)
        else:
            font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    # 获取文本尺寸
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # 计算文本位置（居中）
    x = (size[0] - text_width) // 2
    y = (size[1] - text_height) // 2
    
    # 绘制文本
    draw.text((x, y), text, fill=text_color, font=font)
    
    # 添加一些装饰元素
    # 绘制边框
    draw.rectangle([10, 10, size[0]-10, size[1]-10], outline=text_color, width=3)
    
    # 绘制角落的小圆圈
    circle_radius = 20
    positions = [
        (30, 30),  # 左上
        (size[0]-30, 30),  # 右上
        (30, size[1]-30),  # 左下
        (size[0]-30, size[1]-30)  # 右下
    ]
    
    for pos in positions:
        draw.ellipse([
            pos[0] - circle_radius, pos[1] - circle_radius,
            pos[0] + circle_radius, pos[1] + circle_radius
        ], fill=text_color)
    
    # 保存图片
    image.save(filename, 'JPEG', quality=95)
    print(f"✅ 创建测试图片: {filename}")

def main():
    """创建测试图片"""
    print("正在创建测试图片...")
    
    # 创建起始帧图片（蓝色背景）
    create_test_image(
        "test_start_frame.jpg",
        "START FRAME",
        bg_color=(70, 130, 180),  # 钢蓝色
        text_color=(255, 255, 255),  # 白色文字
        size=(512, 512)
    )
    
    # 创建结束帧图片（绿色背景）
    create_test_image(
        "test_end_frame.jpg",
        "END FRAME",
        bg_color=(60, 179, 113),  # 海绿色
        text_color=(255, 255, 255),  # 白色文字
        size=(512, 512)
    )
    
    print("\n🎉 测试图片创建完成!")
    print("现在可以运行 test_start_end_frame_video.py 进行视频生成测试")

if __name__ == "__main__":
    main()