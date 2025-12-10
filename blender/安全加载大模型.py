"""
安全加载大型BlenderKit模型
专门用于加载复杂模型（如汽车、建筑等）避免卡死

使用方法：
1. 修改下面的 MODEL_PATH 为您的模型路径
2. 在空白的Blender场景中运行此脚本
3. 脚本会逐步加载，显示进度
"""

import bpy
import os
import time

# ====== 配置区域 ======
# 修改为您的模型路径
MODEL_NAME = "audi-car-on-wet-highway_d543e3b4-9ea2-4cbb-9115-a486fdb2860b.blend"

# BlenderKit默认路径（自动查找）
BLENDERKIT_DIR = None

def find_model_path():
    """自动查找模型路径"""
    global BLENDERKIT_DIR
    
    # 尝试从BlenderKit插件获取路径
    try:
        addon_prefs = bpy.context.preferences.addons.get('blenderkit')
        if addon_prefs and hasattr(addon_prefs.preferences, 'global_dir'):
            BLENDERKIT_DIR = addon_prefs.preferences.global_dir
    except:
        pass
    
    # 使用默认路径
    if not BLENDERKIT_DIR:
        appdata = os.getenv('APPDATA')
        version = f"{bpy.app.version[0]}.{bpy.app.version[1]}"
        BLENDERKIT_DIR = os.path.join(
            appdata, 'Blender Foundation', 'Blender', 
            version, 'datafiles', 'blenderkit_data', 'models'
        )
    
    # 查找模型
    for root, dirs, files in os.walk(BLENDERKIT_DIR):
        for file in files:
            if file == MODEL_NAME:
                return os.path.join(root, file)
    
    return None

# ====== 优化设置 ======
OPTIMIZATION_LEVEL = 2  # 1=轻度, 2=中度, 3=重度

OPTIMIZATIONS = {
    'disable_render': True,          # 暂时禁用渲染
    'simplify_subdivision': True,    # 简化细分
    'reduce_viewport_quality': True, # 降低视口质量
    'link_instead_append': True,     # 使用链接而非追加
    'load_collections_only': True,   # 只加载集合不展开
}

def setup_performance_mode():
    """设置性能模式"""
    print("\n[1/6] 设置性能模式...")
    
    scene = bpy.context.scene
    
    # 启用简化模式
    scene.render.use_simplify = True
    scene.render.simplify_subdivision = 0  # 视口细分级别为0
    scene.render.simplify_subdivision_render = 2
    
    # 降低视口性能消耗
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            for space in area.spaces:
                if space.type == 'VIEW_3D':
                    space.shading.type = 'SOLID'  # 切换到实体着色
                    space.overlay.show_overlays = False  # 隐藏覆盖层
    
    # 禁用自动保存（临时）
    bpy.context.preferences.filepaths.use_auto_save_temporary_files = False
    
    print("   ✓ 性能模式已启用")

def safe_load_model(model_path, use_link=True):
    """安全加载模型"""
    
    if not os.path.exists(model_path):
        print(f"✗ 模型文件不存在: {model_path}")
        return False
    
    print(f"\n[2/6] 开始加载模型...")
    print(f"   路径: {model_path}")
    print(f"   方式: {'链接(Link)' if use_link else '追加(Append)'}")
    
    try:
        start_time = time.time()
        
        # 先读取文件内容列表
        with bpy.data.libraries.load(model_path) as (data_from, data_to):
            print(f"\n[3/6] 分析模型内容...")
            print(f"   对象数量: {len(data_from.objects)}")
            print(f"   集合数量: {len(data_from.collections)}")
            print(f"   材质数量: {len(data_from.materials)}")
            
            # 优先加载集合（更高效）
            if data_from.collections:
                print(f"\n[4/6] 加载集合...")
                data_to.collections = data_from.collections
                loaded_via = "collections"
            else:
                print(f"\n[4/6] 加载对象...")
                data_to.objects = data_from.objects
                loaded_via = "objects"
        
        print(f"   ✓ 数据加载完成")
        
        # 将集合添加到场景
        print(f"\n[5/6] 添加到场景...")
        if loaded_via == "collections":
            for coll in data_to.collections:
                if coll is not None:
                    bpy.context.scene.collection.children.link(coll)
                    print(f"   ✓ 已链接集合: {coll.name}")
        else:
            for obj in data_to.objects:
                if obj is not None:
                    bpy.context.scene.collection.objects.link(obj)
        
        elapsed = time.time() - start_time
        print(f"\n[6/6] 加载完成! 用时: {elapsed:.2f}秒")
        
        return True
        
    except Exception as e:
        print(f"\n✗ 加载失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def optimize_loaded_model():
    """优化已加载的模型"""
    print("\n[优化] 应用模型优化...")
    
    optimized_count = 0
    
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH':
            # 设置为边界框显示（最快）
            obj.display_type = 'BOUNDS'
            
            # 禁用细分修改器在视口中的显示
            for mod in obj.modifiers:
                if mod.type == 'SUBSURF':
                    mod.show_viewport = False
                    optimized_count += 1
                elif mod.type == 'MULTIRES':
                    mod.show_viewport = False
                    optimized_count += 1
            
            # 暂时隐藏（可选）
            # obj.hide_viewport = True
    
    print(f"   ✓ 优化了 {optimized_count} 个修改器")
    print("   ℹ️ 对象显示为边界框（最快模式）")
    print("   ℹ️ 选中对象后可在属性中切换显示模式")

def restore_normal_mode():
    """恢复正常显示模式"""
    print("\n提示: 加载成功后，可以逐步恢复显示:")
    print("1. 选择一个对象")
    print("2. Object Properties → Viewport Display → Display As → Textured")
    print("3. 启用细分修改器: Modifiers → Subdivision → 勾选视口图标")
    print("4. 切换着色模式: Z键 → Material Preview 或 Rendered")

def main():
    """主函数"""
    print("="*70)
    print("BlenderKit 大型模型安全加载工具")
    print("="*70)
    
    # 清理当前场景（可选）
    print("\n⚠️ 准备清理当前场景...")
    response = input("确认清理场景吗? (y/n): ")
    if response.lower() == 'y':
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete()
        print("   ✓ 场景已清理")
    
    # 查找模型
    model_path = find_model_path()
    
    if not model_path:
        print(f"\n✗ 未找到模型: {MODEL_NAME}")
        print("\n请手动设置路径:")
        print("1. 找到模型的完整路径")
        print("2. 修改脚本顶部的 MODEL_NAME 或直接设置完整路径")
        
        # 提供手动输入选项
        manual_path = input("\n或者现在输入完整路径 (留空跳过): ")
        if manual_path and os.path.exists(manual_path):
            model_path = manual_path
        else:
            return
    
    print(f"\n✓ 找到模型: {model_path}")
    
    # 设置性能模式
    setup_performance_mode()
    
    # 加载模型
    success = safe_load_model(
        model_path, 
        use_link=OPTIMIZATIONS['link_instead_append']
    )
    
    if success:
        # 优化模型
        optimize_loaded_model()
        
        # 显示后续步骤
        restore_normal_mode()
        
        print("\n" + "="*70)
        print("✓ 模型已成功加载!")
        print("="*70)
    else:
        print("\n" + "="*70)
        print("✗ 加载失败，请查看上面的错误信息")
        print("="*70)

if __name__ == "__main__":
    # 如果在Blender中运行，不需要用户输入
    if bpy.app.background:
        main()
    else:
        # 在Blender GUI中，直接执行
        print("="*70)
        print("BlenderKit 大型模型安全加载工具")
        print("="*70)
        
        model_path = find_model_path()
        
        if model_path:
            print(f"\n✓ 找到模型: {model_path}")
            setup_performance_mode()
            success = safe_load_model(model_path, use_link=True)
            if success:
                optimize_loaded_model()
                restore_normal_mode()
                print("\n✓ 加载完成!")
        else:
            print(f"\n✗ 未找到模型: {MODEL_NAME}")
            print("\n请修改脚本顶部的路径，或使用以下方式手动加载:")
            print("File → Link (或 Append)")
            print(f"找到: ...\\blenderkit_data\\models\\...\\{MODEL_NAME}")

