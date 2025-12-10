"""
快速导出Blender模型到Web项目
自动导出当前场景中的所有模型为GLB格式
"""

import bpy
import os

# 配置
PROJECT_ROOT = r"C:\Users\Administrator\Desktop\xiangmu2.0"
EXPORT_DIR = os.path.join(PROJECT_ROOT, "public", "models")

# 创建导出目录
categories = ["industrial", "mechanical", "environment"]
for category in categories:
    category_dir = os.path.join(EXPORT_DIR, category)
    os.makedirs(category_dir, exist_ok=True)

def export_object(obj, category="industrial"):
    """导出单个对象为GLB"""
    # 取消所有选择
    bpy.ops.object.select_all(action='DESELECT')
    
    # 选中当前对象
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    
    # 生成文件名
    filename = f"{obj.name.lower().replace(' ', '_')}.glb"
    filepath = os.path.join(EXPORT_DIR, category, filename)
    
    # 导出设置
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        use_selection=True,
        export_format='GLB',
        export_apply=True,  # 应用修改器
        export_yup=True,    # Y轴向上
        export_texcoords=True,
        export_normals=True,
        export_materials='EXPORT',
        export_colors=True,
        export_cameras=False,
        export_lights=False,
        export_draco_mesh_compression_enable=True,  # Draco压缩
        export_draco_mesh_compression_level=6
    )
    
    print(f"✅ 导出成功: {category}/{filename}")
    return filepath

def main():
    """主函数"""
    print("=" * 60)
    print("🎨 Blender模型快速导出工具")
    print("=" * 60)
    print(f"📁 导出目录: {EXPORT_DIR}")
    print()
    
    # 统计
    exported_count = 0
    
    # 遍历所有网格对象
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            # 根据对象名称判断类别
            category = "industrial"
            name_lower = obj.name.lower()
            
            if any(word in name_lower for word in ['gear', 'motor', 'pump', 'valve']):
                category = "mechanical"
            elif any(word in name_lower for word in ['floor', 'wall', 'ground', 'sky']):
                category = "environment"
            
            # 导出
            try:
                export_object(obj, category)
                exported_count += 1
            except Exception as e:
                print(f"❌ 导出失败 {obj.name}: {e}")
    
    print()
    print("=" * 60)
    print(f"✨ 完成！共导出 {exported_count} 个模型")
    print("=" * 60)
    print()
    print("📝 下一步:")
    print("1. 在数字孪生系统中使用这些模型")
    print("2. 路径: /models/industrial/xxx.glb")
    print("3. 示例代码:")
    print()
    print("   import { useGLTF } from '@react-three/drei';")
    print("   const { scene } = useGLTF('/models/industrial/tank.glb');")
    print("   return <primitive object={scene} />;")
    print()

if __name__ == "__main__":
    main()
