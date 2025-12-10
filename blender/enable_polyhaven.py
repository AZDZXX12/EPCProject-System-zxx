import bpy

# 启用Poly Haven Assets插件
print("正在启用Poly Haven Assets插件...")

try:
    # 刷新插件列表
    bpy.ops.preferences.addon_refresh()
    
    # 启用插件
    bpy.ops.preferences.addon_enable(module="polyhavenassets")
    
    # 保存用户设置
    bpy.ops.wm.save_userpref()
    
    print("="*60)
    print("✓ Poly Haven Assets 插件已成功启用！")
    print("="*60)
    print("\n下一步操作：")
    print("\n1. 设置资产库：")
    print("   编辑 → 首选项 → 文件路径 → 资产库")
    print("   点击 '+' 添加新库")
    print("   名称：Poly Haven")
    print("   路径：选择一个有4GB空间的文件夹")
    print("\n2. 下载资产：")
    print("   打开资产浏览器")
    print("   顶部选择 'Poly Haven' 库")
    print("   点击 'Fetch Assets' 按钮")
    print("   等待下载（约3.3GB）")
    print("\n3. 开始使用：")
    print("   拖拽资产到场景即可！")
    print("\n插件位置：")
    print("   %APPDATA%\\Blender Foundation\\Blender\\3.0\\scripts\\addons\\polyhavenassets")
    print("\n" + "="*60)
    
except Exception as e:
    print(f"启用插件时出错: {e}")
    print("\n请手动启用：")
    print("1. 打开Blender")
    print("2. 编辑 → 首选项 → 插件")
    print("3. 搜索 'Poly Haven'")
    print("4. 勾选启用")

