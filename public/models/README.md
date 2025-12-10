# 3D模型资源库

## 📁 目录结构

```
models/
├── industrial/      # 工业设备模型
│   ├── tank.glb    # 储罐
│   ├── pipe.glb    # 管道
│   └── valve.glb   # 阀门
├── mechanical/      # 机械部件模型
│   ├── gear.glb    # 齿轮
│   ├── motor.glb   # 电机
│   └── pump.glb    # 泵
└── environment/     # 环境元素模型
    ├── floor.glb   # 地面
    └── wall.glb    # 墙壁
```

## 🎨 从Blender导出模型

### 方法1：使用自动化脚本（推荐）

```batch
# 在Blender中打开模型后
cd blender
导出模型到Web.bat
```

### 方法2：手动导出

1. 在Blender中打开模型
2. 选择要导出的对象
3. `File → Export → glTF 2.0 (.glb)`
4. 设置：
   - Format: `glTF Binary (.glb)`
   - Include: `Selected Objects`
   - Transform: `+Y Up`
   - Geometry: `Apply Modifiers`
   - Compression: `Draco` (可选)
5. 保存到对应目录

## 💻 在代码中使用

### React Three Fiber

```typescript
import { useGLTF } from '@react-three/drei';

function MyModel() {
  const { scene } = useGLTF('/models/industrial/tank.glb');
  return <primitive object={scene} position={[0, 0, 0]} />;
}
```

### 预加载模型

```typescript
useGLTF.preload('/models/industrial/tank.glb');
```

### 批量加载

```typescript
const models = [
  '/models/industrial/tank.glb',
  '/models/mechanical/gear.glb',
  '/models/environment/floor.glb'
];

models.forEach(url => useGLTF.preload(url));
```

## 🔧 模型优化建议

### 文件大小
- ✅ 使用Draco压缩（减小50-70%）
- ✅ 优化纹理分辨率（1024x1024或更小）
- ✅ 减少多边形数量（LOD）

### 性能
- ✅ 合并材质
- ✅ 使用实例化（相同模型）
- ✅ 移除不可见面

### 质量
- ✅ 使用PBR材质
- ✅ 添加法线贴图
- ✅ 正确的UV展开

## 📦 推荐的Blender导出设置

```
Format: glTF Binary (.glb)
Include:
  ✅ Selected Objects
  ✅ Custom Properties
  ✅ Cameras (如需要)
  ✅ Punctual Lights (如需要)

Transform:
  ✅ +Y Up

Geometry:
  ✅ Apply Modifiers
  ✅ UVs
  ✅ Normals
  ✅ Tangents
  ✅ Vertex Colors

Materials:
  ✅ Export: Materials
  ✅ Images: Automatic

Compression:
  ✅ Draco Mesh Compression
  Level: 6
```

## 🎯 模型命名规范

### 文件命名
- 使用小写字母
- 用下划线分隔单词
- 描述性名称

```
✅ industrial_tank_large.glb
✅ gear_assembly_v2.glb
❌ Tank1.glb
❌ model.glb
```

### 对象命名（Blender内）
```
Tank_Body
Tank_Lid
Tank_Valve_01
Pipe_Main
Pipe_Support
```

## 📚 资源来源

### 免费模型库
1. **BlenderKit** - Blender内置插件
2. **PolyHaven** - 高质量免费资源
3. **Sketchfab** - 大量免费模型
4. **TurboSquid Free** - 部分免费模型

### 自己创建
使用Blender建模工具创建定制模型

## 🚀 快速开始

### 1. 下载示例模型
```batch
cd blender
启动Blender.bat

# 在Blender中
Edit → Preferences → Add-ons
启用 BlenderKit
搜索 "industrial" 下载模型
```

### 2. 导出到项目
```batch
File → Export → glTF 2.0
保存到: public/models/industrial/
```

### 3. 在代码中使用
```typescript
// Scene.tsx
import { useGLTF } from '@react-three/drei';

function IndustrialScene() {
  const tank = useGLTF('/models/industrial/tank.glb');
  return <primitive object={tank.scene} />;
}
```

## 💡 提示

- 🎨 使用Blender的材质预览查看效果
- 📏 注意模型的尺寸和比例
- 🔄 导出前应用所有变换（Ctrl+A）
- 💾 定期备份重要模型
- 🎯 为不同LOD创建多个版本

## 🐛 常见问题

### 模型太大？
- 启用Draco压缩
- 减少多边形数量
- 优化纹理分辨率

### 材质不正确？
- 使用Principled BSDF
- 确保纹理已打包
- 检查UV映射

### 模型方向错误？
- 导出时选择 +Y Up
- 在Blender中旋转对象
- 在代码中调整rotation

---

**开始创建你的3D模型库吧！** 🎨✨
