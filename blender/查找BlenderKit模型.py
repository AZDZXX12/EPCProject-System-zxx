"""
BlenderKit模型位置查找脚本

功能：
1. 自动找到BlenderKit模型存储位置
2. 列出所有已下载的模型
3. 显示磁盘占用情况
4. 在文件浏览器中打开文件夹

使用方法：
1. 在Blender脚本编辑器中打开此文件
2. 点击运行
3. 查看控制台输出
"""

import bpy
import os
import sys

def find_blenderkit_models():
    """查找BlenderKit模型位置"""
    
    print("="*70)
    print("BlenderKit 模型位置查找")
    print("="*70)
    
    # 1. 获取BlenderKit下载目录
    print("\n[1] 查找BlenderKit下载目录...")
    
    blenderkit_dir = None
    
    # 方法1: 从插件设置获取
    try:
        addon_prefs = bpy.context.preferences.addons.get('blenderkit')
        if addon_prefs:
            if hasattr(addon_prefs.preferences, 'global_dir'):
                blenderkit_dir = addon_prefs.preferences.global_dir
                print(f"   ✓ 从插件设置获取: {blenderkit_dir}")
    except Exception as e:
        print(f"   ℹ️ 无法从插件获取: {e}")
    
    # 方法2: 使用默认位置
    if not blenderkit_dir or not os.path.exists(blenderkit_dir):
        version = bpy.app.version_string.split('.')[0] + '.' + bpy.app.version_string.split('.')[1]
        default_dir = os.path.join(
            bpy.utils.resource_path('USER'),
            version,
            'datafiles',
            'blenderkit_data'
        )
        
        if os.path.exists(default_dir):
            blenderkit_dir = default_dir
            print(f"   ✓ 使用默认位置: {blenderkit_dir}")
        else:
            print(f"   ℹ️ 默认位置不存在: {default_dir}")
    
    # 方法3: 搜索常见位置
    if not blenderkit_dir or not os.path.exists(blenderkit_dir):
        appdata = os.getenv('APPDATA')
        if appdata:
            possible_paths = [
                os.path.join(appdata, 'Blender Foundation', 'Blender', '3.0', 'datafiles', 'blenderkit_data'),
                os.path.join(appdata, 'Blender Foundation', 'Blender', '3.1', 'datafiles', 'blenderkit_data'),
                os.path.join(appdata, 'Blender Foundation', 'Blender', '3.2', 'datafiles', 'blenderkit_data'),
                os.path.join(appdata, 'Blender Foundation', 'Blender', '3.3', 'datafiles', 'blenderkit_data'),
                os.path.join(appdata, 'Blender Foundation', 'Blender', '3.6', 'datafiles', 'blenderkit_data'),
                os.path.join(appdata, 'Blender Foundation', 'Blender', '4.0', 'datafiles', 'blenderkit_data'),
                os.path.join(appdata, 'Blender Foundation', 'Blender', '4.1', 'datafiles', 'blenderkit_data'),
                os.path.join(appdata, 'Blender Foundation', 'Blender', '4.2', 'datafiles', 'blenderkit_data'),
            ]
            
            print("\n   搜索可能的位置:")
            for path in possible_paths:
                if os.path.exists(path):
                    blenderkit_dir = path
                    print(f"   ✓ 找到: {path}")
                    break
                else:
                    print(f"   ✗ 不存在: {path}")
    
    if not blenderkit_dir or not os.path.exists(blenderkit_dir):
        print("\n   ✗ 未找到BlenderKit下载目录!")
        print("   可能原因:")
        print("   1. BlenderKit插件未安装")
        print("   2. 还没有下载任何模型")
        print("   3. 自定义了下载路径")
        return
    
    print(f"\n{'='*70}")
    print(f"BlenderKit 数据目录: {blenderkit_dir}")
    print(f"{'='*70}")
    
    # 2. 分析文件夹内容
    print("\n[2] 分析文件夹内容...")
    
    categories = {
        'models': '模型',
        'materials': '材质',
        'scenes': '场景',
        'hdrs': 'HDRI环境',
        'brushes': '笔刷'
    }
    
    total_size = 0
    category_stats = {}
    
    for category_dir, category_name in categories.items():
        category_path = os.path.join(blenderkit_dir, category_dir)
        
        if os.path.exists(category_path):
            # 统计文件数量和大小
            count = 0
            size = 0
            
            try:
                for root, dirs, files in os.walk(category_path):
                    count += len([d for d in dirs if os.path.isdir(os.path.join(root, d))])
                    for file in files:
                        file_path = os.path.join(root, file)
                        try:
                            size += os.path.getsize(file_path)
                        except:
                            pass
                
                category_stats[category_name] = {
                    'count': count,
                    'size': size,
                    'path': category_path
                }
                total_size += size
                
                size_mb = size / (1024**2)
                print(f"\n   {category_name}:")
                print(f"   - 数量: {count} 个")
                print(f"   - 大小: {size_mb:.2f} MB")
                print(f"   - 路径: {category_path}")
            except Exception as e:
                print(f"   ✗ 分析 {category_name} 时出错: {e}")
        else:
            print(f"\n   {category_name}: 文件夹不存在")
    
    # 3. 显示总计
    print(f"\n{'='*70}")
    print("统计总计")
    print(f"{'='*70}")
    total_mb = total_size / (1024**2)
    total_gb = total_size / (1024**3)
    
    print(f"\n   总下载大小: {total_mb:.2f} MB ({total_gb:.2f} GB)")
    
    total_items = sum(stat['count'] for stat in category_stats.values())
    print(f"   总资产数量: {total_items} 个")
    
    # 4. 列出最近下载的模型
    print(f"\n{'='*70}")
    print("最近下载的模型（最多显示10个）")
    print(f"{'='*70}")
    
    models_dir = os.path.join(blenderkit_dir, 'models')
    if os.path.exists(models_dir):
        try:
            # 获取所有子文件夹
            model_folders = []
            for item in os.listdir(models_dir):
                item_path = os.path.join(models_dir, item)
                if os.path.isdir(item_path):
                    # 获取修改时间
                    mtime = os.path.getmtime(item_path)
                    model_folders.append((item, item_path, mtime))
            
            # 按修改时间排序
            model_folders.sort(key=lambda x: x[2], reverse=True)
            
            # 显示前10个
            for i, (name, path, mtime) in enumerate(model_folders[:10], 1):
                # 查找.blend文件
                blend_files = [f for f in os.listdir(path) if f.endswith('.blend')]
                
                if blend_files:
                    blend_file = blend_files[0]
                    blend_path = os.path.join(path, blend_file)
                    
                    try:
                        size = os.path.getsize(blend_path)
                        size_mb = size / (1024**2)
                        
                        import datetime
                        mod_time = datetime.datetime.fromtimestamp(mtime)
                        
                        print(f"\n   {i}. {blend_file}")
                        print(f"      路径: {blend_path}")
                        print(f"      大小: {size_mb:.2f} MB")
                        print(f"      时间: {mod_time.strftime('%Y-%m-%d %H:%M:%S')}")
                    except Exception as e:
                        print(f"   {i}. {name} (无法读取详情)")
        except Exception as e:
            print(f"   ✗ 列出模型时出错: {e}")
    
    # 5. 提供快捷操作
    print(f"\n{'='*70}")
    print("快速操作")
    print(f"{'='*70}")
    
    print("\n   复制以下路径到文件资源管理器可直接打开:")
    print(f"   {blenderkit_dir}")
    
    print("\n   在Windows中按 Win+R 运行以下命令:")
    print(f"   explorer \"{blenderkit_dir}\"")
    
    # 尝试在文件浏览器中打开
    print("\n   正在尝试自动打开文件夹...")
    try:
        if sys.platform == 'win32':
            os.startfile(blenderkit_dir)
            print("   ✓ 已在文件资源管理器中打开!")
        elif sys.platform == 'darwin':
            os.system(f'open "{blenderkit_dir}"')
            print("   ✓ 已在Finder中打开!")
        else:
            os.system(f'xdg-open "{blenderkit_dir}"')
            print("   ✓ 已在文件管理器中打开!")
    except Exception as e:
        print(f"   ℹ️ 无法自动打开: {e}")
        print(f"   请手动打开: {blenderkit_dir}")
    
    # 6. 使用建议
    print(f"\n{'='*70}")
    print("使用建议")
    print(f"{'='*70}")
    
    print("""
    【导入模型】
    1. File → Append
    2. 浏览到上述models文件夹
    3. 选择.blend文件
    4. 进入 Object 或 Collection
    5. 选择对象 → Append
    
    【在BlenderKit面板中使用】
    1. 按 N 键打开侧边栏
    2. 找到 BlenderKit 标签
    3. 在 "Downloaded" 中查看已下载模型
    4. 点击缩略图直接导入
    
    【备份模型】
    - 定期备份整个 blenderkit_data 文件夹
    - 换电脑时可以直接复制过去
    
    【释放空间】
    - 删除不需要的模型子文件夹
    - 或在BlenderKit设置中清理缓存
    """)
    
    print(f"\n{'='*70}")
    print("完成！")
    print(f"{'='*70}")

if __name__ == "__main__":
    find_blenderkit_models()

