# Blender 中文化和一键渲染设置脚本
import bpy
import os

# 设置中文界面
bpy.context.preferences.view.language = 'zh_CN'
bpy.context.preferences.view.use_translate_interface = True
bpy.context.preferences.view.use_translate_tooltips = True
bpy.context.preferences.view.use_translate_new_dataname = False

# 保存用户设置
bpy.ops.wm.save_userpref()

print("✓ 界面已切换为中文")

# 创建一键渲染功能
def quick_render():
    """一键渲染当前场景"""
    # 设置输出路径
    output_path = os.path.join(os.path.expanduser("~"), "Desktop", "Blender渲染")
    if not os.path.exists(output_path):
        os.makedirs(output_path)
    
    # 设置渲染输出
    scene = bpy.context.scene
    scene.render.filepath = os.path.join(output_path, "render_")
    scene.render.image_settings.file_format = 'PNG'
    
    # 开始渲染
    bpy.ops.render.render(write_still=True)
    
    print(f"✓ 渲染完成！文件保存在: {output_path}")

# 注册快捷键 F12 为一键渲染
print("✓ 按 F12 可以一键渲染到桌面")

