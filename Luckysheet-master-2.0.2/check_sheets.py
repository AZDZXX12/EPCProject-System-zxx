# -*- coding: utf-8 -*-
import openpyxl

wb = openpyxl.load_workbook('电机电力电气计算表（11月）.xlsx', data_only=True)
print("Excel文件中的所有工作表:")
for idx, sheet_name in enumerate(wb.sheetnames, 1):
    print(f"{idx}. {sheet_name}")
wb.close()


