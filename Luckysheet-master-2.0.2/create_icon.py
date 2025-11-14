#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成应用图标
"""

from PIL import Image, ImageDraw, ImageFont
import os

# 创建256x256的图标
size = 256
image = Image.new('RGBA', (size, size), (255, 255, 255, 0))
draw = ImageDraw.Draw(image)

# 绘制渐变背景圆形
for i in range(size//2):
    alpha = int(255 * (1 - i/(size//2)))
    color = (26, 115, 232, alpha)  # 蓝色渐变
    draw.ellipse([i, i, size-i, size-i], fill=color)

# 绘制主圆形背景
main_color = (26, 115, 232, 255)  # 主蓝色
draw.ellipse([20, 20, 236, 236], fill=main_color)

# 绘制高光
highlight_color = (42, 139, 232, 200)
draw.ellipse([40, 40, 180, 180], fill=highlight_color)

# 绘制齿轮图案（简化版）
center_x, center_y = size // 2, size // 2
gear_radius = 60

# 绘制齿轮齿
teeth = 8
for i in range(teeth):
    angle = i * 360 / teeth
    import math
    x1 = center_x + int(gear_radius * math.cos(math.radians(angle)))
    y1 = center_y + int(gear_radius * math.sin(math.radians(angle)))
    x2 = center_x + int((gear_radius + 20) * math.cos(math.radians(angle)))
    y2 = center_y + int((gear_radius + 20) * math.sin(math.radians(angle)))
    
    draw.rectangle([x2-8, y2-8, x2+8, y2+8], fill=(255, 255, 255, 255))

# 绘制齿轮中心圆
draw.ellipse([center_x-gear_radius, center_y-gear_radius, 
              center_x+gear_radius, center_y+gear_radius], 
             fill=(255, 255, 255, 255))

# 绘制中心孔
draw.ellipse([center_x-20, center_y-20, center_x+20, center_y+20], 
             fill=(26, 115, 232, 255))

# 保存为PNG和ICO（多尺寸）
output_dir = 'dist-refactored/css'
png_path = os.path.join(output_dir, 'app_icon_256.png')
ico_path = os.path.join(output_dir, 'app_icon.ico')

# 保存PNG
image.save(png_path, 'PNG')
print(f'✅ 已生成PNG图标: {png_path}')

# 生成多尺寸ICO
icon_sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
icon_images = []

for icon_size in icon_sizes:
    resized = image.resize(icon_size, Image.Resampling.LANCZOS)
    icon_images.append(resized)

# 保存ICO
icon_images[0].save(ico_path, format='ICO', sizes=icon_sizes)
print(f'✅ 已生成ICO图标: {ico_path}')
print(f'   包含尺寸: {", ".join([f"{w}x{h}" for w, h in icon_sizes])}')

