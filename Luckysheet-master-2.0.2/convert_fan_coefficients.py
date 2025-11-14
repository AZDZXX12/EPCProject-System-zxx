# -*- coding: utf-8 -*-
"""
将离心风机系数转换为JavaScript格式
"""

import json

# 读取提取的数据
with open('database_离心风机系数.json', 'r', encoding='utf-8') as f:
    fan_data = json.load(f)

# 转换为更友好的格式
fan_coefficients = {}

for row in fan_data:
    model = row.get('风机名称')
    if not model:
        continue
    
    fan_coefficients[model] = {
        'model': model,
        'flow_coefficients': [
            row.get('流量系数1'),
            row.get('流量系数2'),
            row.get('流量系数3'),
            row.get('流量系数4'),
            row.get('流量系数5'),
            row.get('流量系数6'),
            row.get('流量系数7')
        ],
        'pressure_coefficients': [
            row.get('全压系数1'),
            row.get('全压系数2'),
            row.get('全压系数3'),
            row.get('全压系数4'),
            row.get('全压系数5'),
            row.get('全压系数6'),
            row.get('全压系数7')
        ],
        'efficiency': [
            row.get('内效率1'),
            row.get('内效率2'),
            row.get('内效率3'),
            row.get('内效率4'),
            row.get('内效率5'),
            row.get('内效率6', 0),  # 有些可能没有第6、7组
            row.get('内效率7', 0)
        ]
    }

# 生成JavaScript文件
js_content = """// 离心风机系数数据库
// 数据来源: 数据库.xlsx - 离心风机系数工作表
// 共62种风机型号

const FAN_COEFFICIENTS_DATABASE = """ + json.dumps(fan_coefficients, ensure_ascii=False, indent=2) + """;

// 获取风机型号列表
function getFanModelList() {
    return Object.keys(FAN_COEFFICIENTS_DATABASE);
}

// 根据型号获取风机系数
function getFanCoefficients(model) {
    return FAN_COEFFICIENTS_DATABASE[model] || null;
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FAN_COEFFICIENTS_DATABASE, getFanModelList, getFanCoefficients };
}
"""

# 保存JavaScript文件
with open('dist-refactored/fan_coefficients_database.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"成功生成 fan_coefficients_database.js")
print(f"包含 {len(fan_coefficients)} 种风机型号")
print(f"\n风机型号列表:")
for i, model in enumerate(fan_coefficients.keys(), 1):
    print(f"  {i}. {model}")


