import openpyxl
import json
import re

# 读取Excel文件
print("正在读取YJV电缆数据...")
wb = openpyxl.load_workbook('数据库.xlsx', data_only=True)
ws = wb['YJV']

# 存储解析后的电缆数据
cables = []

# 解析数据
current_cores = None
for i, row in enumerate(ws.iter_rows(values_only=True), start=1):
    # 跳过前4行表头
    if i <= 4:
        continue
    
    # 检测芯数标题行
    if row[0] and isinstance(row[0], str) and '芯' in row[0] and 'YJV' in row[0]:
        # 提取芯数: "YJV 0.6/1KV ... 1芯" -> 1
        match = re.search(r'(\d+)芯', row[0])
        if match:
            current_cores = int(match.group(1))
            print(f"\n检测到 {current_cores}芯 电缆数据")
        continue
    
    # 跳过表头和单位行
    if row[0] and isinstance(row[0], str) and ('导体' in row[0] or 'mm' in row[0].lower()):
        continue
    
    # 解析数据行
    if row[0] and current_cores:
        try:
            # 提取截面积: "1×1.5" -> 1.5
            spec_str = str(row[0])
            match = re.search(r'×([\d.]+)', spec_str)
            if not match:
                continue
            
            cross_section = float(match.group(1))
            
            # 提取电阻值: "≤ 12.1" -> 12.1
            resistance_str = str(row[6]) if row[6] else ""
            resistance_match = re.search(r'([\d.]+)', resistance_str)
            resistance = float(resistance_match.group(1)) if resistance_match else 0
            
            # 提取载流量（在空气中）
            current_air = int(row[8]) if row[8] else 0
            
            # 提取载流量（直埋）
            current_buried = int(row[9]) if row[9] else 0
            
            # 提取其他参数
            insulation_thickness = float(row[1]) if row[1] else 0
            sheath_thickness = float(row[3]) if row[3] else 0
            outer_diameter = float(row[4]) if row[4] else 0
            weight = float(row[5]) if row[5] else 0
            
            cable = {
                'type': 'YJV',
                'cores': current_cores,
                'crossSection': cross_section,
                'ratedCurrent': current_air,  # 使用空气中的载流量作为额定值
                'currentBuried': current_buried,
                'resistance': resistance,
                'reactance': 0.08,  # 默认电抗值
                'insulationThickness': insulation_thickness,
                'sheathThickness': sheath_thickness,
                'outerDiameter': outer_diameter,
                'weight': weight / 1000,  # kg/km -> kg/m
                'price': cross_section * 2.5,  # 估算价格
                'standard': 'GB/T 12706'
            }
            
            cables.append(cable)
            print(f"  {current_cores}×{cross_section}mm² - {current_air}A - {resistance}Ω/km")
            
        except Exception as e:
            print(f"  跳过第{i}行: {e}")
            continue

print(f"\n总共解析了 {len(cables)} 种电缆规格")

# 生成JavaScript文件
js_content = """// YJV电缆数据库 - 从Excel数据库.xlsx自动提取
// 数据来源: 数据库.xlsx -> YJV工作表
// 生成时间: {timestamp}

const YJV_CABLE_DATABASE = {cables_json};

// 与原有CABLE_SPECS合并
const CABLE_SPECS_FROM_EXCEL = YJV_CABLE_DATABASE;

console.log('✅ 已加载YJV电缆数据库:', YJV_CABLE_DATABASE.length, '种规格');
""".format(
    timestamp='2025-10-14',
    cables_json=json.dumps(cables, ensure_ascii=False, indent=2)
)

output_file = 'dist-refactored/yjv_cable_data.js'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"\n✅ 已生成JavaScript文件: {output_file}")
print(f"✅ 包含 {len(cables)} 种YJV电缆规格")

# 按芯数统计
from collections import Counter
core_counts = Counter(c['cores'] for c in cables)
print("\n📊 按芯数统计:")
for cores, count in sorted(core_counts.items()):
    print(f"  {cores}芯: {count}种规格")

