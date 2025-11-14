# -*- coding: utf-8 -*-
import openpyxl
import sys

sys.stdout.reconfigure(encoding='utf-8')

wb = openpyxl.load_workbook('数据库.xlsx', data_only=True)
ws = wb['YJV']

print("前10行所有列的内容:\n")
for row_idx in range(1, 11):
    print(f"第{row_idx}行:")
    for col_idx in range(1, 11):
        val = ws.cell(row_idx, col_idx).value
        if val:
            print(f"  列{chr(64+col_idx)}: {val}")
    print()

wb.close()


