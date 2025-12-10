#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修改PE文件特征，避免被加密软件识别
"""

import sys
import os
import struct
import time
import hashlib


def modify_pe_timestamp(exe_path, output_path=None):
    """修改PE文件的时间戳，让文件看起来像旧文件"""
    if output_path is None:
        output_path = exe_path.replace('.exe', '_modified.exe')
    
    print(f"[*] 读取文件: {exe_path}")
    with open(exe_path, 'rb') as f:
        data = bytearray(f.read())
    
    # 检查PE文件头
    if data[0:2] != b'MZ':
        print("[!] 错误：不是有效的PE文件")
        return False
    
    # 获取PE头偏移
    pe_offset = struct.unpack('<I', data[0x3C:0x40])[0]
    
    # 检查PE签名
    if data[pe_offset:pe_offset+4] != b'PE\x00\x00':
        print("[!] 错误：PE签名无效")
        return False
    
    # 时间戳位置在PE头+8字节
    timestamp_offset = pe_offset + 8
    
    # 原始时间戳
    original_ts = struct.unpack('<I', data[timestamp_offset:timestamp_offset+4])[0]
    original_time = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(original_ts))
    print(f"[*] 原始时间戳: {original_time}")
    
    # 设置为旧时间（2020-01-01）
    new_timestamp = 1577836800
    new_time = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(new_timestamp))
    print(f"[*] 新时间戳: {new_time}")
    
    # 修改时间戳
    struct.pack_into('<I', data, timestamp_offset, new_timestamp)
    
    # 保存修改后的文件
    print(f"[*] 保存到: {output_path}")
    with open(output_path, 'wb') as f:
        f.write(data)
    
    print("[✓] 修改完成！")
    return True


def add_junk_section(exe_path, output_path=None):
    """在PE文件末尾添加垃圾数据，改变文件哈希"""
    if output_path is None:
        output_path = exe_path.replace('.exe', '_hashed.exe')
    
    print(f"[*] 读取文件: {exe_path}")
    with open(exe_path, 'rb') as f:
        data = bytearray(f.read())
    
    # 添加随机数据段（不影响执行）
    junk_data = os.urandom(1024)  # 1KB随机数据
    data.extend(junk_data)
    
    print(f"[*] 添加了 {len(junk_data)} 字节的覆盖数据")
    
    # 保存
    with open(output_path, 'wb') as f:
        f.write(data)
    
    print("[✓] 修改完成！")
    return True


def calculate_hash(file_path):
    """计算文件哈希"""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()


def main():
    print("=" * 50)
    print("PE文件特征修改工具")
    print("用于避免加密软件的特征识别")
    print("=" * 50)
    print()
    
    if len(sys.argv) < 2:
        print("用法:")
        print(f"  {sys.argv[0]} <exe文件> [输出文件]")
        print()
        print("示例:")
        print(f"  {sys.argv[0]} blender.exe blender_safe.exe")
        return
    
    exe_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    if not os.path.exists(exe_path):
        print(f"[!] 错误：文件不存在: {exe_path}")
        return
    
    # 显示原始文件信息
    file_size = os.path.getsize(exe_path)
    file_hash = calculate_hash(exe_path)
    print(f"原始文件大小: {file_size:,} 字节")
    print(f"原始文件SHA256: {file_hash[:16]}...")
    print()
    
    # 方法选择
    print("选择修改方法:")
    print("1. 修改时间戳（推荐）")
    print("2. 添加覆盖数据")
    print("3. 两者都用")
    
    choice = input("\n请选择 (1-3): ").strip()
    
    if choice == '1':
        modify_pe_timestamp(exe_path, output_path)
    elif choice == '2':
        add_junk_section(exe_path, output_path)
    elif choice == '3':
        temp_path = exe_path + '.temp'
        modify_pe_timestamp(exe_path, temp_path)
        add_junk_section(temp_path, output_path or exe_path.replace('.exe', '_modified.exe'))
        os.remove(temp_path)
    else:
        print("[!] 无效选择")
        return
    
    # 显示修改后的文件信息
    final_output = output_path or exe_path.replace('.exe', '_modified.exe')
    if os.path.exists(final_output):
        new_size = os.path.getsize(final_output)
        new_hash = calculate_hash(final_output)
        print()
        print(f"修改后文件大小: {new_size:,} 字节")
        print(f"修改后文件SHA256: {new_hash[:16]}...")
        print()
        print("[✓] 所有操作完成！")


if __name__ == '__main__':
    main()

