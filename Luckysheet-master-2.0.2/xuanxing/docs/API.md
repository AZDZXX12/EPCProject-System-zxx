# API 接口文档

## 基础信息

**Base URL:** `http://localhost:8000/api`

**Content-Type:** `application/json`

## 接口列表

### 1. 电缆选型计算

计算推荐的电缆规格。

**请求**

```http
POST /api/calculate/
Content-Type: application/json

{
  "voltage": 380,
  "current": 100,
  "length": 50,
  "ambient_temp": 30,
  "installation": "tray"
}
```

**参数说明**

| 参数 | 类型 | 必填 | 说明 | 可选值 |
|------|------|------|------|--------|
| voltage | integer | 是 | 额定电压(V) | 220, 380, 600 |
| current | float | 是 | 负载电流(A) | >0 |
| length | float | 是 | 线路长度(m) | >0 |
| ambient_temp | integer | 是 | 环境温度(℃) | 20, 30, 40 |
| installation | string | 是 | 敷设方式 | tray, conduit, direct_burial |

**敷设方式说明**
- `tray`: 桥架敷设（校正系数0.95）
- `conduit`: 管道敷设（校正系数0.80）
- `direct_burial`: 直埋敷设（校正系数1.0）

**响应示例**

```json
[
  {
    "type": "YJV-0.6/1kV",
    "cross_section": 25.0,
    "current_rating": 109.25,
    "voltage_drop": 1.23,
    "price_per_meter": 42.5,
    "insulation_material": "XLPE",
    "shield_type": "copper",
    "insulationColor": "#2E8B57"
  },
  {
    "type": "YJV-0.6/1kV",
    "cross_section": 35.0,
    "current_rating": 137.75,
    "voltage_drop": 0.89,
    "price_per_meter": 58.0,
    "insulation_material": "XLPE",
    "shield_type": "copper",
    "insulationColor": "#2E8B57"
  }
]
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| type | string | 电缆型号 |
| cross_section | float | 截面积(mm²) |
| current_rating | float | 校正后载流量(A) |
| voltage_drop | float | 电压降(%) |
| price_per_meter | float | 单价(元/米) |
| insulation_material | string | 绝缘材料 |
| shield_type | string | 屏蔽类型 |
| insulationColor | string | 绝缘层颜色(用于3D显示) |

**错误响应**

```json
{
  "voltage": [
    "Select a valid choice. 999 is not one of the available choices."
  ]
}
```

**HTTP状态码**
- `200`: 成功
- `400`: 参数错误
- `404`: 未找到符合条件的电缆
- `500`: 服务器内部错误

---

### 2. 获取电缆规格列表

获取数据库中所有电缆规格。

**请求**

```http
GET /api/cables/
```

**响应示例**

```json
[
  {
    "id": 1,
    "type": "YJV-0.6/1kV",
    "core_count": 4,
    "cross_section": "16.00",
    "current_rating": "85.00",
    "rated_voltage": 380,
    "max_temp": 90,
    "insulation_material": "XLPE",
    "shield_type": "copper",
    "price_per_meter": "28.50",
    "voltage_drop_coef": "1.150000"
  },
  ...
]
```

---

### 3. 获取单个电缆规格

获取指定ID的电缆规格详情。

**请求**

```http
GET /api/cables/{id}/
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 电缆规格ID |

**响应示例**

```json
{
  "id": 1,
  "type": "YJV-0.6/1kV",
  "core_count": 4,
  "cross_section": "16.00",
  "current_rating": "85.00",
  "rated_voltage": 380,
  "max_temp": 90,
  "insulation_material": "XLPE",
  "shield_type": "copper",
  "price_per_meter": "28.50",
  "voltage_drop_coef": "1.150000"
}
```

## 计算公式

### 载流量校正

```
I_corrected = I_rated × k_temp × k_group
```

### 温度校正系数

```
k_temp = √[(T_max - T_ambient) / (T_max - T_base)]
```

其中：
- T_max = 90℃（XLPE绝缘最高工作温度）
- T_base = 30℃（基准温度）
- T_ambient = 环境温度

### 电压降

```
ΔU% = (√3 × I × L × (R×cosφ + X×sinφ)) / U × 100
```

其中：
- I = 负载电流(A)
- L = 线路长度(km)
- R = 电阻(Ω/km) = voltage_drop_coef / cross_section
- X = 电抗(Ω/km)，典型值0.08
- cosφ = 功率因数，默认0.85
- U = 额定电压(V)

## 使用示例

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

async function calculateCable() {
  try {
    const response = await axios.post(`${API_BASE_URL}/calculate/`, {
      voltage: 380,
      current: 100,
      length: 50,
      ambient_temp: 30,
      installation: 'tray'
    });
    
    console.log('推荐电缆:', response.data);
  } catch (error) {
    console.error('计算失败:', error);
  }
}
```

### Python

```python
import requests

API_BASE_URL = 'http://localhost:8000/api'

def calculate_cable():
    data = {
        'voltage': 380,
        'current': 100,
        'length': 50,
        'ambient_temp': 30,
        'installation': 'tray'
    }
    
    response = requests.post(f'{API_BASE_URL}/calculate/', json=data)
    
    if response.status_code == 200:
        print('推荐电缆:', response.json())
    else:
        print('错误:', response.json())
```

### cURL

```bash
curl -X POST http://localhost:8000/api/calculate/ \
  -H "Content-Type: application/json" \
  -d '{
    "voltage": 380,
    "current": 100,
    "length": 50,
    "ambient_temp": 30,
    "installation": "tray"
  }'
```

## 标准依据

- **IEC 60287-1-1**: 电缆载流量计算
- **IEC 60512**: 温度校正系数
- **IEC 60364-5-52**: 敷设方式校正系数
- **GB/T 50217**: 电力工程电缆设计规范

