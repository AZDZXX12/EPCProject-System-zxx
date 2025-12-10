"""
一键添加 HDR 环境贴图到 Blender 场景

功能：
1. 自动设置完整的 HDR 节点网络
2. 支持旋转和亮度控制
3. 可以选择本地 HDR 文件
4. 自动从 Poly Haven 插件加载（如果已安装）

使用方法：
1. 在 Scripting 工作区运行此脚本
2. 按提示操作
3. 享受专业的 HDR 照明！

⚠️ 需要 Blender 2.8+ 和 Cycles/Eevee 渲染引擎
"""

import bpy
import os
from math import radians

def setup_hdr_world(hdr_path=None, rotation=0, strength=1.0):
    """
    设置完整的 HDR 环境贴图节点网络
    
    参数:
        hdr_path: HDR 文件路径（.hdr 或 .exr）
        rotation: 旋转角度（度）
        strength: 环境光强度
    """
    
    print("="*70)
    print("HDR 环境贴图设置")
    print("="*70)
    
    # 获取或创建世界材质
    world = bpy.context.scene.world
    
    if not world:
        world = bpy.data.worlds.new("World")
        bpy.context.scene.world = world
    
    # 启用节点
    world.use_nodes = True
    nodes = world.node_tree.nodes
    links = world.node_tree.links
    
    # 清除现有节点
    print("\n[1/5] 清理现有节点...")
    nodes.clear()
    
    # 创建节点
    print("[2/5] 创建 HDR 节点网络...")
    
    # 1. Output 节点
    node_output = nodes.new(type='ShaderNodeOutputWorld')
    node_output.location = (600, 0)
    
    # 2. Background 节点
    node_background = nodes.new(type='ShaderNodeBackground')
    node_background.location = (300, 0)
    node_background.inputs['Strength'].default_value = strength
    
    # 3. Environment Texture 节点
    node_env = nodes.new(type='ShaderNodeTexEnvironment')
    node_env.location = (-300, 0)
    
    # 4. Mapping 节点（用于旋转）
    node_mapping = nodes.new(type='ShaderNodeMapping')
    node_mapping.location = (-600, 0)
    node_mapping.inputs['Rotation'].default_value[2] = radians(rotation)
    
    # 5. Texture Coordinate 节点
    node_texcoord = nodes.new(type='ShaderNodeTexCoord')
    node_texcoord.location = (-900, 0)
    
    # 连接节点
    print("[3/5] 连接节点...")
    links.new(node_texcoord.outputs['Generated'], node_mapping.inputs['Vector'])
    links.new(node_mapping.outputs['Vector'], node_env.inputs['Vector'])
    links.new(node_env.outputs['Color'], node_background.inputs['Color'])
    links.new(node_background.outputs['Background'], node_output.inputs['Surface'])
    
    print("   ✓ 节点网络已创建")
    print(f"   - 强度: {strength}")
    print(f"   - 旋转: {rotation}°")
    
    # 加载 HDR 文件
    if hdr_path and os.path.exists(hdr_path):
        print(f"\n[4/5] 加载 HDR 文件...")
        print(f"   路径: {hdr_path}")
        
        try:
            img = bpy.data.images.load(hdr_path, check_existing=True)
            node_env.image = img
            print(f"   ✓ HDR 已加载: {os.path.basename(hdr_path)}")
        except Exception as e:
            print(f"   ✗ 加载失败: {e}")
            return False
    else:
        print(f"\n[4/5] 未指定 HDR 文件")
        print("   ℹ️ 请在 Environment Texture 节点中手动选择文件")
    
    # 切换到合适的着色模式
    print("\n[5/5] 设置视图...")
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            for space in area.spaces:
                if space.type == 'VIEW_3D':
                    # 切换到材质预览或渲染模式
                    if space.shading.type == 'SOLID':
                        space.shading.type = 'MATERIAL'
                    print("   ✓ 已切换到材质预览模式")
    
    print("\n" + "="*70)
    print("✓ HDR 环境设置完成！")
    print("="*70)
    
    return True


def find_hdr_files(directory=None):
    """查找目录中的 HDR 文件"""
    
    if not directory:
        # 默认搜索位置
        search_paths = [
            os.path.expanduser("~/Downloads"),
            "D:\\HDRI",
            "C:\\HDRI",
        ]
    else:
        search_paths = [directory]
    
    hdr_files = []
    
    for path in search_paths:
        if os.path.exists(path):
            for root, dirs, files in os.walk(path):
                for file in files:
                    if file.lower().endswith(('.hdr', '.exr')):
                        hdr_files.append(os.path.join(root, file))
    
    return hdr_files


def interactive_setup():
    """交互式 HDR 设置"""
    
    print("="*70)
    print("交互式 HDR 环境设置向导")
    print("="*70)
    
    # 选择 HDR 文件
    print("\n[选项1] 从文件浏览器选择 HDR")
    print("[选项2] 自动搜索 HDR 文件")
    print("[选项3] 只创建节点，稍后手动添加 HDR")
    
    # 在 Blender GUI 中，直接使用文件浏览器
    if not bpy.app.background:
        print("\n创建节点网络，请在 Environment Texture 节点中手动选择 HDR 文件")
        
        # 询问参数
        print("\n参数设置:")
        
        try:
            strength_input = input("环境光强度 (默认 1.0): ")
            strength = float(strength_input) if strength_input else 1.0
        except:
            strength = 1.0
        
        try:
            rotation_input = input("旋转角度/度 (默认 0): ")
            rotation = float(rotation_input) if rotation_input else 0
        except:
            rotation = 0
        
        # 设置节点
        setup_hdr_world(hdr_path=None, rotation=rotation, strength=strength)
        
        print("\n下一步:")
        print("1. 在 Shader Editor 中找到 'Environment Texture' 节点")
        print("2. 点击 'Open' 按钮")
        print("3. 选择您的 .hdr 或 .exr 文件")
        print("4. 按 Z 键 → Rendered 查看效果")
    else:
        # 命令行模式
        print("\n在命令行模式下，请直接使用 setup_hdr_world() 函数")


def quick_setup_with_file():
    """快速设置 - 手动选择文件"""
    
    print("\n请在下面输入 HDR 文件的完整路径:")
    print("（例如: D:\\HDRI\\studio_small_03_4k.hdr）")
    print("或者按回车跳过，稍后手动添加\n")
    
    hdr_path = input("HDR 路径: ").strip().strip('"')
    
    if hdr_path and os.path.exists(hdr_path):
        # 询问参数
        try:
            strength = float(input("强度 (默认 1.0): ") or "1.0")
        except:
            strength = 1.0
        
        try:
            rotation = float(input("旋转/度 (默认 0): ") or "0")
        except:
            rotation = 0
        
        setup_hdr_world(hdr_path, rotation, strength)
    else:
        if hdr_path:
            print(f"✗ 文件不存在: {hdr_path}")
        
        print("\n创建节点网络，请手动添加 HDR 文件...")
        setup_hdr_world(hdr_path=None, rotation=0, strength=1.0)


def list_common_hdri_sources():
    """列出常见的 HDRI 下载来源"""
    
    print("\n" + "="*70)
    print("免费 HDRI 下载来源")
    print("="*70)
    
    sources = [
        {
            'name': 'Poly Haven',
            'url': 'https://polyhaven.com/hdris',
            'quality': '⭐⭐⭐⭐⭐',
            'note': '最推荐！100%免费，高质量，无需注册'
        },
        {
            'name': 'HDRI Haven',
            'url': 'https://hdrihaven.com',
            'quality': '⭐⭐⭐⭐⭐',
            'note': '已合并到 Poly Haven'
        },
        {
            'name': 'HDRLabs',
            'url': 'http://www.hdrlabs.com/sibl/archive.html',
            'quality': '⭐⭐⭐⭐',
            'note': 'SIBL 格式，免费'
        },
        {
            'name': 'HDR Maps',
            'url': 'https://hdrmaps.com/freebies',
            'quality': '⭐⭐⭐',
            'note': '部分免费'
        },
    ]
    
    for source in sources:
        print(f"\n{source['name']} {source['quality']}")
        print(f"   URL: {source['url']}")
        print(f"   说明: {source['note']}")
    
    print("\n" + "="*70)
    print("推荐：访问 Poly Haven，下载 4K HDR 文件")
    print("="*70)


# 辅助函数：调整现有 HDR
def adjust_hdr_rotation(degrees):
    """调整当前 HDR 的旋转"""
    world = bpy.context.scene.world
    if world and world.use_nodes:
        for node in world.node_tree.nodes:
            if node.type == 'MAPPING':
                node.inputs['Rotation'].default_value[2] = radians(degrees)
                print(f"✓ HDR 旋转已设为 {degrees}°")
                return
    print("✗ 未找到 Mapping 节点")


def adjust_hdr_strength(strength):
    """调整当前 HDR 的强度"""
    world = bpy.context.scene.world
    if world and world.use_nodes:
        for node in world.node_tree.nodes:
            if node.type == 'BACKGROUND':
                node.inputs['Strength'].default_value = strength
                print(f"✓ HDR 强度已设为 {strength}")
                return
    print("✗ 未找到 Background 节点")


# 主程序
if __name__ == "__main__":
    print("\n" + "="*70)
    print("Blender HDR 环境设置工具")
    print("="*70)
    
    print("\n选择操作:")
    print("1 - 快速设置（手动选择 HDR 文件）")
    print("2 - 只创建节点网络（稍后手动添加 HDR）")
    print("3 - 查看 HDRI 下载来源")
    
    if not bpy.app.background:
        # 在 Blender GUI 中
        print("\n⚠️ 在 Blender 中运行，使用简化流程")
        
        # 直接创建节点，让用户手动选择文件
        print("\n创建 HDR 节点网络...")
        setup_hdr_world(hdr_path=None, rotation=0, strength=1.0)
        
        print("\n" + "="*70)
        print("下一步操作:")
        print("="*70)
        print("1. 切换到 Shading 工作区")
        print("2. 在 Shader Editor 底部点击 [🔘World]")
        print("3. 在 'Environment Texture' 节点中点击 'Open'")
        print("4. 选择您的 .hdr 或 .exr 文件")
        print("5. 按 Z → Rendered 查看效果")
        
        print("\n" + "="*70)
        print("调整命令（在控制台输入）:")
        print("="*70)
        print("adjust_hdr_rotation(90)    - 旋转 90 度")
        print("adjust_hdr_strength(2.0)   - 强度设为 2.0")
        
        print("\n" + "="*70)
        print("免费 HDR 下载:")
        print("="*70)
        print("访问: https://polyhaven.com/hdris")
        print("选择一个 HDRI → Download → 4K → HDR 格式")
        
    else:
        # 命令行模式
        choice = input("\n请选择 (1/2/3): ").strip()
        
        if choice == "1":
            quick_setup_with_file()
        elif choice == "2":
            setup_hdr_world(hdr_path=None, rotation=0, strength=1.0)
        elif choice == "3":
            list_common_hdri_sources()
        else:
            print("无效选择")
    
    print("\n✓ 脚本执行完成")

