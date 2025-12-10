import bpy

# Set Blender to Chinese interface
print("Setting Chinese interface...")

prefs = bpy.context.preferences
view = prefs.view

# Set language to Simplified Chinese
view.language = 'zh_CN'

# Enable interface translation
view.use_translate_interface = True
view.use_translate_tooltips = True
view.use_translate_new_dataname = False

# Save preferences
bpy.ops.wm.save_userpref()

print("="*60)
print("Chinese interface enabled!")
print("="*60)
print("\nMenu bar will show as:")
print("- Layout -> 布局")
print("- Modeling -> 建模")  
print("- Sculpting -> 雕刻")
print("- UV Editing -> UV编辑")
print("- Texture Paint -> 纹理绘制")
print("- Shading -> 着色")
print("- Animation -> 动画")
print("- Rendering -> 渲染")
print("- Compositing -> 合成")
print("- Geometry Nodes -> 几何节点")
print("- Scripting -> 脚本")
print("\n" + "="*60)

