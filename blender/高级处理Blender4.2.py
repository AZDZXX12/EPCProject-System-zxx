#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Blender 4.2 LTS 高级处理脚本
功能：下载、解压、重命名、修改PE特征、绕过加密软件

适用于：winrdlv3、sdhelper2 等加密软件环境
"""

import os
import sys
import urllib.request
import zipfile
import shutil
import struct
import time
import hashlib
from pathlib import Path


class BlenderProcessor:
    """Blender 处理器"""
    
    def __init__(self):
        self.version = "4.2.3"
        self.download_urls = [
            f"https://mirrors.tuna.tsinghua.edu.cn/blender/release/Blender4.2/blender-{self.version}-windows-x64.zip",
            f"https://mirrors.aliyun.com/blender/release/Blender4.2/blender-{self.version}-windows-x64.zip",
            f"https://download.blender.org/release/Blender4.2/blender-{self.version}-windows-x64.zip",
        ]
        self.zip_filename = f"blender-{self.version}-windows-x64.zip"
        self.extract_dir = "blender42_temp"
        self.target_dir = r"C:\MyApps\Blender42LTS"
        self.custom_name = "MyBlender42.exe"
    
    def print_header(self):
        """打印标题"""
        print("=" * 70)
        print(" " * 15 + "Blender 4.2 LTS 高级处理工具")
        print("=" * 70)
        print()
        print(f"版本: {self.version}")
        print(f"目标: {self.target_dir}")
        print(f"文件名: {self.custom_name}")
        print()
        print("功能：")
        print("  ✓ 自动下载 Blender 4.2 LTS")
        print("  ✓ 重命名避开特征识别")
        print("  ✓ 修改 PE 时间戳")
        print("  ✓ 添加垃圾数据改变哈希")
        print("  ✓ 绕过加密软件监控")
        print()
        print("=" * 70)
        print()
    
    def download_file(self, url, filename):
        """下载文件并显示进度"""
        print(f"[1/6] 下载 Blender {self.version}...")
        print(f"      URL: {url}")
        print()
        
        def reporthook(block_num, block_size, total_size):
            downloaded = block_num * block_size
            if total_size > 0:
                percent = min(downloaded * 100 / total_size, 100)
                downloaded_mb = downloaded / (1024 * 1024)
                total_mb = total_size / (1024 * 1024)
                
                bar_length = 50
                filled_length = int(bar_length * downloaded / total_size)
                bar = '█' * filled_length + '-' * (bar_length - filled_length)
                
                print(f'\r      [{bar}] {percent:.1f}% ({downloaded_mb:.1f}/{total_mb:.1f} MB)', end='')
                sys.stdout.flush()
        
        try:
            urllib.request.urlretrieve(url, filename, reporthook)
            print()
            print("      ✓ 下载完成!")
            return True
        except Exception as e:
            print()
            print(f"      ✗ 下载失败: {e}")
            return False
    
    def try_download(self):
        """尝试从多个源下载"""
        if os.path.exists(self.zip_filename):
            print(f"[✓] 发现已下载的文件: {self.zip_filename}")
            response = input("    是否使用现有文件? (y/n): ")
            if response.lower() == 'y':
                return True
            os.remove(self.zip_filename)
        
        print("尝试下载源:")
        for i, url in enumerate(self.download_urls, 1):
            print(f"  {i}. {url.split('/')[2]}")
        print()
        
        for url in self.download_urls:
            print(f"正在尝试: {url.split('/')[2]}...")
            if self.download_file(url, self.zip_filename):
                return True
            print("      切换到下一个源...")
            print()
        
        return False
    
    def extract_zip(self):
        """解压 ZIP 文件"""
        print()
        print(f"[2/6] 解压文件...")
        print(f"      目标: {self.extract_dir}")
        
        # 清理旧目录
        if os.path.exists(self.extract_dir):
            print("      清理旧文件...")
            shutil.rmtree(self.extract_dir)
        
        os.makedirs(self.extract_dir, exist_ok=True)
        
        try:
            with zipfile.ZipFile(self.zip_filename, 'r') as zip_ref:
                # 获取文件总数
                total_files = len(zip_ref.namelist())
                
                # 解压所有文件
                for i, file in enumerate(zip_ref.namelist(), 1):
                    zip_ref.extract(file, self.extract_dir)
                    
                    # 显示进度
                    if i % 100 == 0 or i == total_files:
                        percent = i * 100 / total_files
                        print(f'\r      解压进度: {percent:.1f}% ({i}/{total_files})', end='')
                        sys.stdout.flush()
            
            print()
            print("      ✓ 解压完成!")
            return True
        except Exception as e:
            print()
            print(f"      ✗ 解压失败: {e}")
            return False
    
    def find_blender_exe(self):
        """查找 blender.exe"""
        print()
        print("[3/6] 查找 blender.exe...")
        
        for root, dirs, files in os.walk(self.extract_dir):
            if "blender.exe" in files:
                exe_path = os.path.join(root, "blender.exe")
                print(f"      ✓ 找到: {exe_path}")
                return root
        
        print("      ✗ 未找到 blender.exe")
        return None
    
    def copy_files(self, source_dir):
        """复制文件到目标位置"""
        print()
        print("[4/6] 复制到安全位置...")
        print(f"      从: {source_dir}")
        print(f"      到: {self.target_dir}")
        
        # 创建目标目录
        os.makedirs(self.target_dir, exist_ok=True)
        
        try:
            # 复制所有文件
            for item in os.listdir(source_dir):
                s = os.path.join(source_dir, item)
                d = os.path.join(self.target_dir, item)
                
                if os.path.isdir(s):
                    if os.path.exists(d):
                        shutil.rmtree(d)
                    shutil.copytree(s, d)
                else:
                    shutil.copy2(s, d)
            
            print("      ✓ 文件复制完成")
            return True
        except Exception as e:
            print(f"      ✗ 复制失败: {e}")
            return False
    
    def rename_executable(self):
        """重命名可执行文件"""
        print()
        print("[5/6] 重命名可执行文件...")
        
        original_exe = os.path.join(self.target_dir, "blender.exe")
        new_exe = os.path.join(self.target_dir, self.custom_name)
        
        if not os.path.exists(original_exe):
            print(f"      ✗ 未找到: {original_exe}")
            return False
        
        # 删除旧的自定义名称文件
        if os.path.exists(new_exe):
            os.remove(new_exe)
        
        # 重命名
        os.rename(original_exe, new_exe)
        
        print(f"      blender.exe → {self.custom_name}")
        print("      ✓ 重命名完成")
        return True
    
    def modify_pe_timestamp(self, exe_path):
        """修改 PE 文件时间戳"""
        print(f"      正在修改 PE 时间戳...")
        
        try:
            with open(exe_path, 'rb') as f:
                data = bytearray(f.read())
            
            # 检查 PE 文件
            if data[0:2] != b'MZ':
                print("      ✗ 不是有效的 PE 文件")
                return False
            
            # 获取 PE 头偏移
            pe_offset = struct.unpack('<I', data[0x3C:0x40])[0]
            
            # 检查 PE 签名
            if data[pe_offset:pe_offset+4] != b'PE\x00\x00':
                print("      ✗ PE 签名无效")
                return False
            
            # 时间戳位置
            timestamp_offset = pe_offset + 8
            
            # 设置为旧时间（2020-01-01）
            new_timestamp = 1577836800
            struct.pack_into('<I', data, timestamp_offset, new_timestamp)
            
            # 保存临时文件
            temp_path = exe_path + '.temp'
            with open(temp_path, 'wb') as f:
                f.write(data)
            
            # 替换原文件
            os.remove(exe_path)
            os.rename(temp_path, exe_path)
            
            print("      ✓ PE 时间戳已修改为 2020-01-01")
            return True
        except Exception as e:
            print(f"      ✗ PE 修改失败: {e}")
            return False
    
    def add_junk_data(self, exe_path):
        """添加垃圾数据改变哈希"""
        print(f"      正在添加覆盖数据...")
        
        try:
            # 读取文件
            with open(exe_path, 'rb') as f:
                data = bytearray(f.read())
            
            # 添加 1KB 随机数据
            junk_data = os.urandom(1024)
            data.extend(junk_data)
            
            # 保存
            with open(exe_path, 'wb') as f:
                f.write(data)
            
            print("      ✓ 已添加 1KB 覆盖数据")
            return True
        except Exception as e:
            print(f"      ✗ 添加数据失败: {e}")
            return False
    
    def modify_pe_features(self):
        """修改 PE 文件特征"""
        print()
        print("[6/6] 修改 PE 文件特征...")
        
        exe_path = os.path.join(self.target_dir, self.custom_name)
        
        if not os.path.exists(exe_path):
            print(f"      ✗ 未找到: {exe_path}")
            return False
        
        # 计算原始哈希
        original_hash = self.calculate_hash(exe_path)
        print(f"      原始 SHA256: {original_hash[:16]}...")
        
        # 修改时间戳
        self.modify_pe_timestamp(exe_path)
        
        # 添加垃圾数据
        print()
        response = input("      是否添加垃圾数据改变文件哈希? (y/n): ")
        if response.lower() == 'y':
            self.add_junk_data(exe_path)
            
            # 计算新哈希
            new_hash = self.calculate_hash(exe_path)
            print(f"      新的 SHA256: {new_hash[:16]}...")
        
        print()
        print("      ✓ PE 特征修改完成")
        return True
    
    def calculate_hash(self, file_path):
        """计算文件 SHA256 哈希"""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    
    def cleanup(self):
        """清理临时文件"""
        print()
        print("[清理] 清理临时文件...")
        
        response = input("      是否删除临时文件? (y/n): ")
        if response.lower() != 'y':
            print("      已保留临时文件")
            return
        
        # 删除解压目录
        if os.path.exists(self.extract_dir):
            shutil.rmtree(self.extract_dir)
            print(f"      ✓ 已删除: {self.extract_dir}")
        
        # 询问是否删除 ZIP
        response = input("      是否也删除 ZIP 文件? (可节省 300MB) (y/n): ")
        if response.lower() == 'y':
            if os.path.exists(self.zip_filename):
                os.remove(self.zip_filename)
                print(f"      ✓ 已删除: {self.zip_filename}")
    
    def create_shortcut(self):
        """创建桌面快捷方式"""
        print()
        print("[额外] 创建桌面快捷方式...")
        
        try:
            import winshell
            from win32com.client import Dispatch
            
            desktop = winshell.desktop()
            shortcut_path = os.path.join(desktop, "Blender 4.2 LTS.lnk")
            
            shell = Dispatch('WScript.Shell')
            shortcut = shell.CreateShortCut(shortcut_path)
            shortcut.TargetPath = os.path.join(self.target_dir, self.custom_name)
            shortcut.WorkingDirectory = self.target_dir
            shortcut.Description = "Blender 4.2 LTS - 绕过加密软件版本"
            shortcut.save()
            
            print(f"      ✓ 快捷方式已创建")
        except ImportError:
            print("      ℹ️ 需要安装 pywin32 和 winshell 才能创建快捷方式")
            print("      手动安装: pip install pywin32 winshell")
        except Exception as e:
            print(f"      ℹ️ 快捷方式创建失败: {e}")
    
    def print_summary(self):
        """打印总结信息"""
        print()
        print("=" * 70)
        print(" " * 20 + "✓✓✓ 安装完成！ ✓✓✓")
        print("=" * 70)
        print()
        print("[安装信息]")
        print(f"  版本: Blender {self.version} LTS")
        print(f"  位置: {self.target_dir}")
        print(f"  可执行文件: {self.custom_name}")
        print()
        print("[启动方式]")
        print(f"  方法1: 双击桌面快捷方式 'Blender 4.2 LTS'")
        print(f"  方法2: 运行 {os.path.join(self.target_dir, self.custom_name)}")
        print()
        print("[已应用的保护措施]")
        print(f"  ✓ 文件重命名 (blender.exe → {self.custom_name})")
        print("  ✓ PE 时间戳修改（伪装成 2020 年旧文件）")
        print("  ✓ 非标准安装路径")
        print("  ✓ 可选的哈希值改变")
        print()
        print("[如果仍被加密软件拦截]")
        print(f"  1. 添加路径白名单: {self.target_dir}")
        print(f"  2. 添加进程白名单: {self.custom_name}")
        print("  3. 临时关闭加密软件")
        print("  4. 联系 IT 部门申请豁免")
        print()
        print("[下一步]")
        print("  1. 查看 '提升Blender稳定性.txt' 进行优化")
        print("  2. 查看 'HDR环境贴图完整教程.txt' 学习使用")
        print("  3. 查看 'Blender版本选择指南.txt' 了解新功能")
        print()
        print("=" * 70)
        print()
    
    def run(self):
        """运行完整流程"""
        self.print_header()
        
        # 1. 下载
        if not self.try_download():
            print("下载失败，请手动下载后重新运行")
            return False
        
        # 2. 解压
        if not self.extract_zip():
            return False
        
        # 3. 查找
        blender_dir = self.find_blender_exe()
        if not blender_dir:
            return False
        
        # 4. 复制
        if not self.copy_files(blender_dir):
            return False
        
        # 5. 重命名
        if not self.rename_executable():
            return False
        
        # 6. 修改 PE
        self.modify_pe_features()
        
        # 7. 创建快捷方式
        self.create_shortcut()
        
        # 8. 清理
        self.cleanup()
        
        # 9. 总结
        self.print_summary()
        
        # 10. 询问是否启动
        response = input("是否立即启动 Blender 4.2 LTS? (y/n): ")
        if response.lower() == 'y':
            exe_path = os.path.join(self.target_dir, self.custom_name)
            print(f"\n正在启动 {exe_path}...")
            os.startfile(exe_path)
        
        return True


def main():
    """主函数"""
    processor = BlenderProcessor()
    
    try:
        success = processor.run()
        
        if success:
            print("\n✓ 所有步骤完成！")
            print("感谢使用！")
        else:
            print("\n✗ 处理过程中出现错误")
            return 1
        
        return 0
    except KeyboardInterrupt:
        print("\n\n用户中断")
        return 1
    except Exception as e:
        print(f"\n✗ 发生错误: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())

