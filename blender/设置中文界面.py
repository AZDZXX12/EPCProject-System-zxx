import bpy

# 设置Blender为中文界面
print("正在设置中文界面...")

prefs = bpy.context.preferences
view = prefs.view

# 设置语言为简体中文
view.language = 'zh_CN'

# 启用界面翻译
view.use_translate_interface = True  # 翻译界面
view.use_translate_tooltips = True   # 翻译工具提示
view.use_translate_new_dataname = False  # 不翻译数据名称（保持英文更专业）

# 保存设置
bpy.ops.wm.save_userpref()

print("="*60)
print("✓ 界面已切换为中文！")
print("="*60)
print("\n菜单栏将显示为：")
print("- Layout → 布局")
print("- Modeling → 建模")  
print("- Sculpting → 雕刻")
print("- UV Editing → UV编辑")
print("- Texture Paint → 纹理绘制")
print("- Shading → 着色")
print("- Animation → 动画")
print("- Rendering → 渲染")
print("- Compositing → 合成")
print("- Geometry Nodes → 几何节点")
print("- Scripting → 脚本")
print("\n" + "="*60)

