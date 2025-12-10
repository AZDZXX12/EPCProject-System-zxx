import bpy
import os
import zipfile
import shutil

def install_polyhaven_addon():
    """自动安装Poly Haven Assets插件"""
    
    # 获取Blender插件目录
    addon_dir = bpy.utils.user_resource('SCRIPTS', path="addons")
    
    # 源文件路径
    source_zip = r"C:\Users\Administrator\Desktop\Z1D2\polyhavenassets.zip"
    target_addon = os.path.join(addon_dir, "polyhavenassets")
    
    print(f"插件目录: {addon_dir}")
    
    # 如果已存在，先删除
    if os.path.exists(target_addon):
        print("删除旧版本...")
        shutil.rmtree(target_addon)
    
    # 解压插件
    print(f"正在解压 {source_zip}...")
    with zipfile.ZipFile(source_zip, 'r') as zip_ref:
        # 解压到临时目录
        temp_dir = os.path.join(os.path.dirname(source_zip), "temp_extract")
        zip_ref.extractall(temp_dir)
        
        # 找到实际的插件文件夹（通常是 polyhavenassets-main）
        extracted_folder = os.path.join(temp_dir, "polyhavenassets-main")
        
        # 移动到插件目录
        if os.path.exists(extracted_folder):
            shutil.move(extracted_folder, target_addon)
            print(f"✓ 插件已复制到: {target_addon}")
        else:
            print("错误：找不到插件文件夹")
            return
        
        # 清理临时目录
        shutil.rmtree(temp_dir)
    
    # 启用插件
    print("正在启用插件...")
    try:
        bpy.ops.preferences.addon_enable(module="polyhavenassets")
        print("✓ 插件已启用")
    except Exception as e:
        print(f"启用插件时出错: {e}")
        print("请手动启用：Edit → Preferences → Add-ons → 搜索 'Poly Haven'")
    
    # 保存设置
    bpy.ops.wm.save_userpref()
    print("✓ 设置已保存")
    
    print("\n" + "="*60)
    print("安装完成！")
    print("="*60)
    print("\n使用方法：")
    print("1. 在首选项中添加资产库：")
    print("   Edit → Preferences → File Paths → Asset Libraries")
    print("   点击 '+' 添加新库，命名为 'Poly Haven'")
    print("2. 打开资产浏览器，选择 'Poly Haven' 库")
    print("3. 点击 'Fetch Assets' 按钮下载资产")
    print("\n注意：首次下载约3.3GB，包含1500+资产")

if __name__ == "__main__":
    install_polyhaven_addon()

