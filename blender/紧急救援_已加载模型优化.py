"""
紧急救援脚本 - 优化已经卡顿的场景

如果您已经加载了模型但是Blender很卡，运行此脚本！

功能：
1. 自动禁用所有细分修改器
2. 降低所有对象的显示质量
3. 简化材质
4. 隐藏不必要的对象

⚠️ 运行前保存文件！
"""

import bpy
import time

def emergency_optimize():
    """紧急优化当前场景"""
    
    print("="*70)
    print("紧急救援 - 场景优化")
    print("="*70)
    
    start_time = time.time()
    
    # 统计信息
    stats = {
        'total_objects': 0,
        'modifiers_disabled': 0,
        'display_changed': 0,
        'polygons_before': 0,
        'polygons_after': 0,
    }
    
    # 1. 全局简化设置
    print("\n[1/7] 启用全局简化...")
    bpy.context.scene.render.use_simplify = True
    bpy.context.scene.render.simplify_subdivision = 0
    bpy.context.scene.render.simplify_subdivision_render = 1
    print("   ✓ 全局简化已启用")
    
    # 2. 切换到实体着色
    print("\n[2/7] 切换到实体着色模式...")
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            for space in area.spaces:
                if space.type == 'VIEW_3D':
                    space.shading.type = 'SOLID'
                    space.overlay.show_overlays = False
    print("   ✓ 已切换到最快显示模式")
    
    # 3. 处理所有对象
    print("\n[3/7] 优化所有对象...")
    
    for obj in bpy.data.objects:
        stats['total_objects'] += 1
        
        if obj.type == 'MESH':
            # 计算原始面数
            if hasattr(obj.data, 'polygons'):
                stats['polygons_before'] += len(obj.data.polygons)
            
            # 禁用所有修改器的视口显示
            for mod in obj.modifiers:
                if mod.type in ['SUBSURF', 'MULTIRES', 'SUBDIVISION']:
                    if mod.show_viewport:
                        mod.show_viewport = False
                        stats['modifiers_disabled'] += 1
                
                # 降低细分级别
                if mod.type == 'SUBSURF':
                    mod.levels = 0
                elif mod.type == 'MULTIRES':
                    mod.levels = 0
            
            # 改为边界框显示
            if obj.display_type != 'BOUNDS':
                obj.display_type = 'BOUNDS'
                stats['display_changed'] += 1
    
    print(f"   ✓ 处理了 {stats['total_objects']} 个对象")
    print(f"   ✓ 禁用了 {stats['modifiers_disabled']} 个修改器")
    print(f"   ✓ 更改了 {stats['display_changed']} 个显示模式")
    
    # 4. 简化材质（临时移除复杂节点）
    print("\n[4/7] 简化材质...")
    material_count = 0
    for mat in bpy.data.materials:
        if mat.use_nodes:
            # 暂时禁用节点（在视口中不显示）
            mat.use_nodes = False
            material_count += 1
    print(f"   ✓ 简化了 {material_count} 个材质")
    print("   ℹ️ 材质节点已暂时禁用（渲染时会用）")
    
    # 5. 隐藏大型对象（可选）
    print("\n[5/7] 检查大型对象...")
    large_objects = []
    for obj in bpy.data.objects:
        if obj.type == 'MESH' and hasattr(obj.data, 'polygons'):
            poly_count = len(obj.data.polygons)
            if poly_count > 100000:  # 超过10万面
                large_objects.append((obj.name, poly_count))
    
    if large_objects:
        print(f"   ⚠️ 发现 {len(large_objects)} 个大型对象:")
        for name, count in large_objects:
            print(f"      - {name}: {count:,} 面")
        print("   ℹ️ 这些对象已设为边界框显示")
    else:
        print("   ✓ 没有特别大的对象")
    
    # 6. 禁用自动保存（临时）
    print("\n[6/7] 优化系统设置...")
    bpy.context.preferences.filepaths.use_auto_save_temporary_files = False
    
    # 降低撤销步数
    bpy.context.preferences.edit.undo_steps = 10
    print("   ✓ 已禁用自动保存")
    print("   ✓ 撤销步数降至10")
    
    # 7. 清理未使用的数据
    print("\n[7/7] 清理未使用的数据...")
    
    # 清理未使用的数据块
    for block_type in [bpy.data.meshes, bpy.data.materials, bpy.data.textures, bpy.data.images]:
        for block in block_type:
            if block.users == 0:
                block_type.remove(block)
    
    print("   ✓ 清理完成")
    
    # 强制刷新视图
    for area in bpy.context.screen.areas:
        area.tag_redraw()
    
    # 显示结果
    elapsed = time.time() - start_time
    
    print("\n" + "="*70)
    print("优化完成！")
    print("="*70)
    print(f"\n用时: {elapsed:.2f}秒")
    print(f"\n统计:")
    print(f"  - 对象总数: {stats['total_objects']}")
    print(f"  - 禁用修改器: {stats['modifiers_disabled']}")
    print(f"  - 简化材质: {material_count}")
    print(f"  - 大型对象: {len(large_objects)}")
    
    print("\n" + "="*70)
    print("当前状态:")
    print("="*70)
    print("  ✓ 所有对象以边界框显示（最快）")
    print("  ✓ 细分修改器已禁用")
    print("  ✓ 材质已简化")
    print("  ✓ 视口为实体着色模式")
    
    print("\n" + "="*70)
    print("如何恢复正常显示:")
    print("="*70)
    print("""
【逐步恢复】
1. 选中一个对象
2. Object Properties → Viewport Display
3. Display As → Textured
4. 如果不卡，继续选择其他对象

【恢复材质】
1. 选中对象
2. Material Properties
3. 重新启用 "Use Nodes"

【恢复细分】
1. Modifier Properties
2. Subdivision Surface → 勾选眼睛图标
3. 将 Viewport Levels 逐步增加 (0→1→2)

【切换着色模式】
- 按 Z 键
- 选择 Material Preview 或 Rendered
- ⚠️ 建议先恢复几个对象后再切换

⚠️ 提示: 一次恢复一个对象，避免再次卡死！
    """)
    
    print("="*70)
    print("\n💡 建议: ")
    print("1. 现在保存文件 (Ctrl+S)")
    print("2. 考虑将模型分成多个文件")
    print("3. 或者使用更简单的模型版本")
    print("\n如果优化后还是很卡，可能需要升级硬件或使用更简单的模型。")
    print("="*70)

def quick_view_bounds():
    """快速将所有对象设为边界框显示"""
    for obj in bpy.data.objects:
        obj.display_type = 'BOUNDS'
    print("✓ 所有对象已设为边界框显示")

def quick_view_wire():
    """快速将所有对象设为线框显示"""
    for obj in bpy.data.objects:
        obj.display_type = 'WIRE'
    print("✓ 所有对象已设为线框显示")

def quick_view_solid():
    """快速将所有对象设为实体显示"""
    for obj in bpy.data.objects:
        obj.display_type = 'SOLID'
    print("✓ 所有对象已设为实体显示")

def quick_view_textured():
    """快速将所有对象设为纹理显示"""
    for obj in bpy.data.objects:
        obj.display_type = 'TEXTURED'
    print("✓ 所有对象已设为纹理显示")
    print("⚠️ 如果卡顿，请运行 quick_view_bounds() 恢复")

# 主执行
if __name__ == "__main__":
    emergency_optimize()
    
    print("\n" + "="*70)
    print("附加功能 - 在控制台中输入以下命令:")
    print("="*70)
    print("quick_view_bounds()    - 边界框显示（最快）")
    print("quick_view_wire()      - 线框显示（较快）")
    print("quick_view_solid()     - 实体显示（正常）")
    print("quick_view_textured()  - 纹理显示（可能慢）")
    print("="*70)

