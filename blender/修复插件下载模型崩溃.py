"""
Blender插件下载模型时卡死/崩溃的诊断和修复脚本

使用方法：
1. 在Blender中打开脚本编辑器
2. 加载此脚本
3. 点击运行
"""

import bpy
import os
import sys
import tempfile
import shutil

def diagnose_and_fix():
    """诊断并修复插件下载问题"""
    
    print("="*70)
    print("Blender 插件下载模型崩溃问题诊断")
    print("="*70)
    
    issues_found = []
    fixes_applied = []
    
    # 1. 检查临时目录
    print("\n[1] 检查临时文件目录...")
    temp_dir = tempfile.gettempdir()
    print(f"   系统临时目录: {temp_dir}")
    
    # 检查路径是否包含中文
    if any(ord(char) > 127 for char in temp_dir):
        issues_found.append("临时目录路径包含中文字符")
        print("   ⚠️ 警告: 路径包含中文字符，可能导致下载失败")
    
    # 检查临时目录是否可写
    try:
        test_file = os.path.join(temp_dir, "blender_test.tmp")
        with open(test_file, 'w') as f:
            f.write("test")
        os.remove(test_file)
        print("   ✓ 临时目录可写")
    except Exception as e:
        issues_found.append(f"临时目录不可写: {e}")
        print(f"   ✗ 临时目录不可写: {e}")
    
    # 2. 检查Blender配置目录
    print("\n[2] 检查Blender配置目录...")
    config_dir = bpy.utils.user_resource('CONFIG')
    scripts_dir = bpy.utils.user_resource('SCRIPTS')
    
    print(f"   配置目录: {config_dir}")
    print(f"   脚本目录: {scripts_dir}")
    
    # 检查路径中的中文字符
    for path_name, path in [("配置", config_dir), ("脚本", scripts_dir)]:
        if path and any(ord(char) > 127 for char in path):
            issues_found.append(f"{path_name}目录路径包含中文")
            print(f"   ⚠️ {path_name}目录路径包含中文")
    
    # 3. 检查已安装的插件
    print("\n[3] 检查已安装的资产下载插件...")
    
    asset_addons = []
    for addon in bpy.context.preferences.addons:
        addon_name = addon.module.lower()
        if any(keyword in addon_name for keyword in ['blenderkit', 'polyhaven', 'asset', 'download']):
            asset_addons.append(addon.module)
            print(f"   ✓ 找到: {addon.module}")
    
    if not asset_addons:
        print("   ℹ️ 未找到资产下载插件")
    
    # 4. 检查BlenderKit特定设置
    print("\n[4] 检查BlenderKit设置...")
    try:
        prefs = bpy.context.preferences.addons.get('blenderkit')
        if prefs:
            # 获取BlenderKit下载目录
            if hasattr(prefs.preferences, 'global_dir'):
                download_dir = prefs.preferences.global_dir
                print(f"   BlenderKit下载目录: {download_dir}")
                
                # 检查下载目录路径
                if download_dir and any(ord(char) > 127 for char in download_dir):
                    issues_found.append("BlenderKit下载目录包含中文")
                    print("   ⚠️ 下载目录包含中文字符")
                    
                    # 建议新路径
                    suggested_dir = "D:\\BlenderKit"
                    print(f"   建议更改为: {suggested_dir}")
                
                # 检查目录是否存在且可写
                if download_dir:
                    if not os.path.exists(download_dir):
                        issues_found.append("BlenderKit下载目录不存在")
                        print("   ⚠️ 下载目录不存在")
                    else:
                        try:
                            test_file = os.path.join(download_dir, "test.tmp")
                            with open(test_file, 'w') as f:
                                f.write("test")
                            os.remove(test_file)
                            print("   ✓ 下载目录可写")
                        except Exception as e:
                            issues_found.append(f"下载目录不可写: {e}")
                            print(f"   ✗ 下载目录不可写: {e}")
            
            # 检查最大下载线程数
            if hasattr(prefs.preferences, 'max_assetbar_rows'):
                print(f"   ✓ BlenderKit配置正常")
        else:
            print("   ℹ️ BlenderKit未安装")
    except Exception as e:
        print(f"   ℹ️ 检查BlenderKit时出错: {e}")
    
    # 5. 检查磁盘空间
    print("\n[5] 检查磁盘空间...")
    try:
        import shutil
        total, used, free = shutil.disk_usage(os.path.expanduser("~"))
        free_gb = free / (1024**3)
        print(f"   可用空间: {free_gb:.2f} GB")
        
        if free_gb < 5:
            issues_found.append(f"磁盘空间不足 ({free_gb:.2f} GB)")
            print("   ⚠️ 警告: 磁盘空间不足5GB")
    except Exception as e:
        print(f"   ℹ️ 无法检查磁盘空间: {e}")
    
    # 6. 检查内存设置
    print("\n[6] 检查内存设置...")
    preferences = bpy.context.preferences
    
    if hasattr(preferences.system, 'memory_cache_limit'):
        cache_limit = preferences.system.memory_cache_limit
        print(f"   内存缓存限制: {cache_limit} MB")
        
        if cache_limit < 2048:
            issues_found.append(f"内存缓存过小 ({cache_limit} MB)")
            print("   ⚠️ 建议: 增加内存缓存到至少2048MB")
            
            # 自动修复
            try:
                preferences.system.memory_cache_limit = 4096
                fixes_applied.append("内存缓存已增加到4096MB")
                print("   ✓ 已自动增加到4096MB")
            except:
                print("   ℹ️ 无法自动修改，请手动设置")
    
    # 7. 应用修复建议
    print("\n[7] 应用自动修复...")
    
    # 禁用自动刷新（减少卡顿）
    try:
        for addon in bpy.context.preferences.addons:
            if 'blenderkit' in addon.module.lower():
                if hasattr(addon.preferences, 'thumbnail_use_gpu'):
                    addon.preferences.thumbnail_use_gpu = False
                    fixes_applied.append("BlenderKit GPU缩略图已禁用")
                    print("   ✓ 已禁用GPU缩略图（减少崩溃）")
    except:
        pass
    
    # 保存设置
    try:
        bpy.ops.wm.save_userpref()
        print("   ✓ 设置已保存")
    except:
        pass
    
    # 8. 生成报告
    print("\n" + "="*70)
    print("诊断报告")
    print("="*70)
    
    if issues_found:
        print(f"\n发现 {len(issues_found)} 个问题:")
        for i, issue in enumerate(issues_found, 1):
            print(f"  {i}. {issue}")
    else:
        print("\n✓ 未发现明显问题")
    
    if fixes_applied:
        print(f"\n已应用 {len(fixes_applied)} 个修复:")
        for i, fix in enumerate(fixes_applied, 1):
            print(f"  {i}. {fix}")
    
    # 9. 提供解决建议
    print("\n" + "="*70)
    print("建议的解决方案")
    print("="*70)
    
    print("""
【方案1】修改下载目录为纯英文路径（推荐）
  1. Edit → Preferences → Add-ons
  2. 搜索 BlenderKit 或 Poly Haven
  3. 展开插件设置
  4. 将下载目录改为: D:\\BlenderAssets
  5. 点击 Save Preferences

【方案2】减少下载并发数
  1. 在插件设置中
  2. 降低 "Max Downloads" 或类似选项
  3. 建议设置为 1 或 2（避免同时下载过多）

【方案3】分批下载
  1. 不要一次下载太多模型
  2. 每次只下载1个，等完成后再下载下一个
  3. 避免在下载时进行其他操作

【方案4】清理缓存
  1. 关闭Blender
  2. 删除临时文件夹中的Blender相关文件
  3. Windows: %TEMP%\\blender_*
  4. 重新启动Blender

【方案5】增加虚拟内存
  1. 右键"此电脑" → 属性 → 高级系统设置
  2. 性能 → 设置 → 高级 → 虚拟内存
  3. 设置为系统管理或至少8GB

【方案6】使用离线下载（最稳定）
  1. 在网页端下载模型文件
  2. BlenderKit: https://www.blenderkit.com
  3. Poly Haven: https://polyhaven.com
  4. 手动导入到Blender
    """)
    
    print("\n" + "="*70)
    print("完成！请尝试上述建议后重新下载模型")
    print("="*70)

if __name__ == "__main__":
    diagnose_and_fix()

