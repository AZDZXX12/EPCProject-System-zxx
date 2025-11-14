Attribute VB_Name = "MotorModule"
' 模块名称：MotorModule
' 功能：封装电机数据初始化和电机选型功能
' 说明：全局电机数据数组 + 公共方法，支持跨模块调用

Option Explicit

' 全局电机数据数组（101行×9列，与原数据结构一致）
' 列定义：1=序号, 2=型号, 3=功率(kW), 4=马力(hp), 5=额定电流(A), 6=转速(r/min), 7=效率(%), 8=功率因数(cosφ), 9=重量(kg)
Public motorData() As Variant
Public motorDataInitialized As Boolean
' ###########################################################################
' 公共方法1：初始化电机数据（加载101台电机的完整参数）
' ###########################################################################
Public Sub InitializeMotorData()
    ' 如果已经初始化，则退出
    If motorDataInitialized Then Exit Sub
    ' 清空原有数据
    Erase motorData
    ' 重新定义数组大小
    ReDim motorData(1 To 101, 1 To 9)
    ' 第1-26台：2极电机（Y系列-2极）
    motorData(1, 1) = 1: motorData(1, 2) = "Y80M1-2": motorData(1, 3) = 0.75: motorData(1, 4) = 1: motorData(1, 5) = 1.8: motorData(1, 6) = 2825: motorData(1, 7) = 75: motorData(1, 8) = 0.84: motorData(1, 9) = 17
    motorData(2, 1) = 2: motorData(2, 2) = "Y80M2-2": motorData(2, 3) = 1.1: motorData(2, 4) = 1.5: motorData(2, 5) = 2.5: motorData(2, 6) = 2825: motorData(2, 7) = 77: motorData(2, 8) = 0.86: motorData(2, 9) = 18
    motorData(3, 1) = 3: motorData(3, 2) = "Y90S-2": motorData(3, 3) = 1.5: motorData(3, 4) = 2: motorData(3, 5) = 3.4: motorData(3, 6) = 2840: motorData(3, 7) = 78: motorData(3, 8) = 0.85: motorData(3, 9) = 22
    motorData(4, 1) = 4: motorData(4, 2) = "Y90L-2": motorData(4, 3) = 2.2: motorData(4, 4) = 3: motorData(4, 5) = 4.8: motorData(4, 6) = 2840: motorData(4, 7) = 80.5: motorData(4, 8) = 0.86: motorData(4, 9) = 27
    motorData(5, 1) = 5: motorData(5, 2) = "Y100L-2": motorData(5, 3) = 3: motorData(5, 4) = 4: motorData(5, 5) = 6.4: motorData(5, 6) = 2880: motorData(5, 7) = 82: motorData(5, 8) = 0.87: motorData(5, 9) = 37
    motorData(6, 1) = 6: motorData(6, 2) = "Y112M-2": motorData(6, 3) = 4: motorData(6, 4) = 5.5: motorData(6, 5) = 8.2: motorData(6, 6) = 2890: motorData(6, 7) = 85.5: motorData(6, 8) = 0.87: motorData(6, 9) = 46
    motorData(7, 1) = 7: motorData(7, 2) = "Y132S1-2": motorData(7, 3) = 5.5: motorData(7, 4) = 7.5: motorData(7, 5) = 11: motorData(7, 6) = 2900: motorData(7, 7) = 85.5: motorData(7, 8) = 0.88: motorData(7, 9) = 68
    motorData(8, 1) = 8: motorData(8, 2) = "Y132S2-2": motorData(8, 3) = 7.5: motorData(8, 4) = 10: motorData(8, 5) = 15: motorData(8, 6) = 2900: motorData(8, 7) = 86.2: motorData(8, 8) = 0.88: motorData(8, 9) = 74
    motorData(9, 1) = 9: motorData(9, 2) = "Y160M1-2": motorData(9, 3) = 11: motorData(9, 4) = 15: motorData(9, 5) = 21.8: motorData(9, 6) = 2930: motorData(9, 7) = 87.2: motorData(9, 8) = 0.88: motorData(9, 9) = 116
    motorData(10, 1) = 10: motorData(10, 2) = "Y160M2-2": motorData(10, 3) = 15: motorData(10, 4) = 20: motorData(10, 5) = 29.3: motorData(10, 6) = 2930: motorData(10, 7) = 88.2: motorData(10, 8) = 0.88: motorData(10, 9) = 132
    motorData(11, 1) = 11: motorData(11, 2) = "Y160L-2": motorData(11, 3) = 18.5: motorData(11, 4) = 25: motorData(11, 5) = 35.5: motorData(11, 6) = 2930: motorData(11, 7) = 89: motorData(11, 8) = 0.89: motorData(11, 9) = 151
    motorData(12, 1) = 12: motorData(12, 2) = "Y180M-2": motorData(12, 3) = 22: motorData(12, 4) = 30: motorData(12, 5) = 42.2: motorData(12, 6) = 2940: motorData(12, 7) = 89: motorData(12, 8) = 0.89: motorData(12, 9) = 172
    motorData(13, 1) = 13: motorData(13, 2) = "Y200L1-2": motorData(13, 3) = 30: motorData(13, 4) = 40: motorData(13, 5) = 56.9: motorData(13, 6) = 2950: motorData(13, 7) = 90: motorData(13, 8) = 0.89: motorData(13, 9) = 240
    motorData(14, 1) = 14: motorData(14, 2) = "Y200L2-2": motorData(14, 3) = 37: motorData(14, 4) = 50: motorData(14, 5) = 69.8: motorData(14, 6) = 2950: motorData(14, 7) = 90.5: motorData(14, 8) = 0.89: motorData(14, 9) = 260
    motorData(15, 1) = 15: motorData(15, 2) = "Y225M-2": motorData(15, 3) = 45: motorData(15, 4) = 61: motorData(15, 5) = 84: motorData(15, 6) = 2970: motorData(15, 7) = 91.5: motorData(15, 8) = 0.89: motorData(15, 9) = 310
    motorData(16, 1) = 16: motorData(16, 2) = "Y250M-2": motorData(16, 3) = 55: motorData(16, 4) = 75: motorData(16, 5) = 102.6: motorData(16, 6) = 2970: motorData(16, 7) = 91.5: motorData(16, 8) = 0.89: motorData(16, 9) = 400
    motorData(17, 1) = 17: motorData(17, 2) = "Y280S-2": motorData(17, 3) = 75: motorData(17, 4) = 102: motorData(17, 5) = 139.2: motorData(17, 6) = 2970: motorData(17, 7) = 92: motorData(17, 8) = 0.89: motorData(17, 9) = 544
    motorData(18, 1) = 18: motorData(18, 2) = "Y280M-2": motorData(18, 3) = 90: motorData(18, 4) = 122.5: motorData(18, 5) = 166.1: motorData(18, 6) = 2970: motorData(18, 7) = 92.5: motorData(18, 8) = 0.89: motorData(18, 9) = 620
    motorData(19, 1) = 19: motorData(19, 2) = "Y315S-2": motorData(19, 3) = 110: motorData(19, 4) = 150: motorData(19, 5) = 202.3: motorData(19, 6) = 2980: motorData(19, 7) = 92.5: motorData(19, 8) = 0.89: motorData(19, 9) = 980 ' 修正原代码“2.3”为“202.3”
    motorData(20, 1) = 20: motorData(20, 2) = "Y315M-2": motorData(20, 3) = 132: motorData(20, 4) = 180: motorData(20, 5) = 242.3: motorData(20, 6) = 2980: motorData(20, 7) = 93: motorData(20, 8) = 0.89: motorData(20, 9) = 1080
    motorData(21, 1) = 21: motorData(21, 2) = "Y315L1-2": motorData(21, 3) = 160: motorData(21, 4) = 218: motorData(21, 5) = 292: motorData(21, 6) = 2980: motorData(21, 7) = 93.5: motorData(21, 8) = 0.89: motorData(21, 9) = 1160
    motorData(22, 1) = 22: motorData(22, 2) = "Y315L2-2": motorData(22, 3) = 200: motorData(22, 4) = 272: motorData(22, 5) = 365.2: motorData(22, 6) = 2980: motorData(22, 7) = 93.5: motorData(22, 8) = 0.89: motorData(22, 9) = 1190
    motorData(23, 1) = 23: motorData(23, 2) = "Y355M1-2": motorData(23, 3) = 220: motorData(23, 4) = 299: motorData(23, 5) = 396.7: motorData(23, 6) = 2981: motorData(23, 7) = 94.2: motorData(23, 8) = 0.89: motorData(23, 9) = 1750
    motorData(24, 1) = 24: motorData(24, 2) = "Y355M2-2": motorData(24, 3) = 250: motorData(24, 4) = 340: motorData(24, 5) = 446.6: motorData(24, 6) = 2981: motorData(24, 7) = 94.5: motorData(24, 8) = 0.9: motorData(24, 9) = 1770
    motorData(25, 1) = 25: motorData(25, 2) = "Y355L1-2": motorData(25, 3) = 280: motorData(25, 4) = 381: motorData(25, 5) = 499.2: motorData(25, 6) = 2981: motorData(25, 7) = 94.7: motorData(25, 8) = 0.9: motorData(25, 9) = 1830
    motorData(26, 1) = 26: motorData(26, 2) = "Y355L2-2": motorData(26, 3) = 315: motorData(26, 4) = 429: motorData(26, 5) = 559.8: motorData(26, 6) = 2981: motorData(26, 7) = 95: motorData(26, 8) = 0.9: motorData(26, 9) = 1900
    
    ' 第27-53台：4极电机（Y系列-4极）
    motorData(27, 1) = 27: motorData(27, 2) = "Y80M1-4": motorData(27, 3) = 0.55: motorData(27, 4) = 0.75: motorData(27, 5) = 1.5: motorData(27, 6) = 1390: motorData(27, 7) = 73: motorData(27, 8) = 0.76: motorData(27, 9) = 17
    motorData(28, 1) = 28: motorData(28, 2) = "Y80M2-4": motorData(28, 3) = 0.75: motorData(28, 4) = 1: motorData(28, 5) = 2: motorData(28, 6) = 1390: motorData(28, 7) = 74.5: motorData(28, 8) = 0.76: motorData(28, 9) = 18
    motorData(29, 1) = 29: motorData(29, 2) = "Y90S-4": motorData(29, 3) = 1.1: motorData(29, 4) = 1.5: motorData(29, 5) = 2.7: motorData(29, 6) = 1400: motorData(29, 7) = 78: motorData(29, 8) = 0.78: motorData(29, 9) = 23
    motorData(30, 1) = 30: motorData(30, 2) = "Y90L-4": motorData(30, 3) = 1.5: motorData(30, 4) = 2: motorData(30, 5) = 3.7: motorData(30, 6) = 1400: motorData(30, 7) = 79: motorData(30, 8) = 0.79: motorData(30, 9) = 27
    motorData(31, 1) = 31: motorData(31, 2) = "Y100L1-4": motorData(31, 3) = 2.2: motorData(31, 4) = 3: motorData(31, 5) = 5: motorData(31, 6) = 1420: motorData(31, 7) = 81: motorData(31, 8) = 0.82: motorData(31, 9) = 36
    motorData(32, 1) = 32: motorData(32, 2) = "Y100L2-4": motorData(32, 3) = 3: motorData(32, 4) = 4: motorData(32, 5) = 6.8: motorData(32, 6) = 1420: motorData(32, 7) = 82.5: motorData(32, 8) = 0.81: motorData(32, 9) = 40
    motorData(33, 1) = 33: motorData(33, 2) = "Y112M-4": motorData(33, 3) = 4: motorData(33, 4) = 5.5: motorData(33, 5) = 8.8: motorData(33, 6) = 1440: motorData(33, 7) = 84.5: motorData(33, 8) = 0.82: motorData(33, 9) = 50
    motorData(34, 1) = 34: motorData(34, 2) = "Y132S-4": motorData(34, 3) = 5.5: motorData(34, 4) = 7.5: motorData(34, 5) = 11.6: motorData(34, 6) = 1440: motorData(34, 7) = 85.5: motorData(34, 8) = 0.84: motorData(34, 9) = 70
    motorData(35, 1) = 35: motorData(35, 2) = "Y132M-4": motorData(35, 3) = 7.5: motorData(35, 4) = 10: motorData(35, 5) = 15.4: motorData(35, 6) = 1440: motorData(35, 7) = 87: motorData(35, 8) = 0.85: motorData(35, 9) = 86
    motorData(36, 1) = 36: motorData(36, 2) = "Y160M-4": motorData(36, 3) = 11: motorData(36, 4) = 15: motorData(36, 5) = 22.6: motorData(36, 6) = 1460: motorData(36, 7) = 88: motorData(36, 8) = 0.84: motorData(36, 9) = 126
    motorData(37, 1) = 37: motorData(37, 2) = "Y160L-4": motorData(37, 3) = 15: motorData(37, 4) = 20: motorData(37, 5) = 30.3: motorData(37, 6) = 1460: motorData(37, 7) = 88.5: motorData(37, 8) = 0.85: motorData(37, 9) = 146
    motorData(38, 1) = 38: motorData(38, 2) = "Y180M-4": motorData(38, 3) = 18.5: motorData(38, 4) = 25: motorData(38, 5) = 35.9: motorData(38, 6) = 1470: motorData(38, 7) = 91: motorData(38, 8) = 0.86: motorData(38, 9) = 172
    motorData(39, 1) = 39: motorData(39, 2) = "Y180L-4": motorData(39, 3) = 22: motorData(39, 4) = 30: motorData(39, 5) = 42.5: motorData(39, 6) = 1470: motorData(39, 7) = 91.5: motorData(39, 8) = 0.86: motorData(39, 9) = 196
    motorData(40, 1) = 40: motorData(40, 2) = "Y200L-4": motorData(40, 3) = 30: motorData(40, 4) = 40: motorData(40, 5) = 56.8: motorData(40, 6) = 1470: motorData(40, 7) = 92.2: motorData(40, 8) = 0.87: motorData(40, 9) = 270
    motorData(41, 1) = 41: motorData(41, 2) = "Y225S-4": motorData(41, 3) = 37: motorData(41, 4) = 50: motorData(41, 5) = 70.4: motorData(41, 6) = 1480: motorData(41, 7) = 91.8: motorData(41, 8) = 0.87: motorData(41, 9) = 300
    motorData(42, 1) = 42: motorData(42, 2) = "Y225M-4": motorData(42, 3) = 45: motorData(42, 4) = 61: motorData(42, 5) = 84.2: motorData(42, 6) = 1480: motorData(42, 7) = 92.3: motorData(42, 8) = 0.88: motorData(42, 9) = 320
    motorData(43, 1) = 43: motorData(43, 2) = "Y250M-4": motorData(43, 3) = 55: motorData(43, 4) = 75: motorData(43, 5) = 102.6: motorData(43, 6) = 1480: motorData(43, 7) = 92.6: motorData(43, 8) = 0.88: motorData(43, 9) = 427
    motorData(44, 1) = 44: motorData(44, 2) = "Y280S-4": motorData(44, 3) = 75: motorData(44, 4) = 102: motorData(44, 5) = 139.7: motorData(44, 6) = 1480: motorData(44, 7) = 92.7: motorData(44, 8) = 0.88: motorData(44, 9) = 562
    motorData(45, 1) = 45: motorData(45, 2) = "Y280M-4": motorData(45, 3) = 90: motorData(45, 4) = 122.5: motorData(45, 5) = 164.3: motorData(45, 6) = 1480: motorData(45, 7) = 93.5: motorData(45, 8) = 0.89: motorData(45, 9) = 667
    motorData(46, 1) = 46: motorData(46, 2) = "Y315S-4": motorData(46, 3) = 110: motorData(46, 4) = 150: motorData(46, 5) = 201: motorData(46, 6) = 1480: motorData(46, 7) = 93.5: motorData(46, 8) = 0.89: motorData(46, 9) = 1000
    motorData(47, 1) = 47: motorData(47, 2) = "Y315M-4": motorData(47, 3) = 132: motorData(47, 4) = 180: motorData(47, 5) = 240: motorData(47, 6) = 1490: motorData(47, 7) = 94: motorData(47, 8) = 0.89: motorData(47, 9) = 1100
    motorData(48, 1) = 48: motorData(48, 2) = "Y315L1-4": motorData(48, 3) = 160: motorData(48, 4) = 218: motorData(48, 5) = 289: motorData(48, 6) = 1490: motorData(48, 7) = 94.5: motorData(48, 8) = 0.89: motorData(48, 9) = 1160
    motorData(49, 1) = 49: motorData(49, 2) = "Y315L2-4": motorData(49, 3) = 200: motorData(49, 4) = 272: motorData(49, 5) = 361: motorData(49, 6) = 1490: motorData(49, 7) = 94.5: motorData(49, 8) = 0.89: motorData(49, 9) = 1270
    motorData(50, 1) = 50: motorData(50, 2) = "Y355M1-4": motorData(50, 3) = 220: motorData(50, 4) = 299: motorData(50, 5) = 407: motorData(50, 6) = 1489: motorData(50, 7) = 94.4: motorData(50, 8) = 0.87: motorData(50, 9) = 1790
    motorData(51, 1) = 51: motorData(51, 2) = "Y355M2-4": motorData(51, 3) = 250: motorData(51, 4) = 340: motorData(51, 5) = 461: motorData(51, 6) = 1489: motorData(51, 7) = 94.7: motorData(51, 8) = 0.87: motorData(51, 9) = 1800
    motorData(52, 1) = 52: motorData(52, 2) = "Y355L1-4": motorData(52, 3) = 280: motorData(52, 4) = 381: motorData(52, 5) = 515.3: motorData(52, 6) = 1489: motorData(52, 7) = 94.9: motorData(52, 8) = 0.87: motorData(52, 9) = 1880
    motorData(53, 1) = 53: motorData(53, 2) = "Y355L2-4": motorData(53, 3) = 315: motorData(53, 4) = 429: motorData(53, 5) = 577.9: motorData(53, 6) = 1489: motorData(53, 7) = 95.2: motorData(53, 8) = 0.87: motorData(53, 9) = 1940
    
    ' 第54-78台：6极电机（Y系列-6极）
    motorData(54, 1) = 54: motorData(54, 2) = "Y90S-6": motorData(54, 3) = 0.75: motorData(54, 4) = 1: motorData(54, 5) = 2.2: motorData(54, 6) = 910: motorData(54, 7) = 72.5: motorData(54, 8) = 0.7: motorData(54, 9) = 23
    motorData(55, 1) = 55: motorData(55, 2) = "Y90L-6": motorData(55, 3) = 1.1: motorData(55, 4) = 1.5: motorData(55, 5) = 3.2: motorData(55, 6) = 910: motorData(55, 7) = 73.5: motorData(55, 8) = 0.72: motorData(55, 9) = 27
    motorData(56, 1) = 56: motorData(56, 2) = "Y100L-6": motorData(56, 3) = 1.5: motorData(56, 4) = 2: motorData(56, 5) = 4: motorData(56, 6) = 940: motorData(56, 7) = 77.5: motorData(56, 8) = 0.74: motorData(56, 9) = 36
    motorData(57, 1) = 57: motorData(57, 2) = "Y112M-6": motorData(57, 3) = 2.2: motorData(57, 4) = 3: motorData(57, 5) = 5.6: motorData(57, 6) = 940: motorData(57, 7) = 80.5: motorData(57, 8) = 0.74: motorData(57, 9) = 46
    motorData(58, 1) = 58: motorData(58, 2) = "Y132S-6": motorData(58, 3) = 3: motorData(58, 4) = 4: motorData(58, 5) = 7.2: motorData(58, 6) = 960: motorData(58, 7) = 83: motorData(58, 8) = 0.76: motorData(58, 9) = 67
    motorData(59, 1) = 59: motorData(59, 2) = "Y132M1-6": motorData(59, 3) = 4: motorData(59, 4) = 5.5: motorData(59, 5) = 9.4: motorData(59, 6) = 960: motorData(59, 7) = 84: motorData(59, 8) = 0.77: motorData(59, 9) = 77
    motorData(60, 1) = 60: motorData(60, 2) = "Y132M2-6": motorData(60, 3) = 5.5: motorData(60, 4) = 7.5: motorData(60, 5) = 12.6: motorData(60, 6) = 960: motorData(60, 7) = 85.3: motorData(60, 8) = 0.78: motorData(60, 9) = 87
    motorData(61, 1) = 61: motorData(61, 2) = "Y160M-6": motorData(61, 3) = 7.5: motorData(61, 4) = 10: motorData(61, 5) = 17: motorData(61, 6) = 970: motorData(61, 7) = 86: motorData(61, 8) = 0.78: motorData(61, 9) = 120
    motorData(62, 1) = 62: motorData(62, 2) = "Y160L-6": motorData(62, 3) = 11: motorData(62, 4) = 15: motorData(62, 5) = 24.6: motorData(62, 6) = 970: motorData(62, 7) = 87: motorData(62, 8) = 0.78: motorData(62, 9) = 146
    motorData(63, 1) = 63: motorData(63, 2) = "Y180L-6": motorData(63, 3) = 15: motorData(63, 4) = 20: motorData(63, 5) = 31.4: motorData(63, 6) = 970: motorData(63, 7) = 89.5: motorData(63, 8) = 0.81: motorData(63, 9) = 183
    motorData(64, 1) = 64: motorData(64, 2) = "Y200L1-6": motorData(64, 3) = 18.5: motorData(64, 4) = 25: motorData(64, 5) = 37.7: motorData(64, 6) = 970: motorData(64, 7) = 89.8: motorData(64, 8) = 0.83: motorData(64, 9) = 220
    motorData(65, 1) = 65: motorData(65, 2) = "Y200L2-6": motorData(65, 3) = 22: motorData(65, 4) = 30: motorData(65, 5) = 44.6: motorData(65, 6) = 970: motorData(65, 7) = 90.2: motorData(65, 8) = 0.83: motorData(65, 9) = 250
    motorData(66, 1) = 66: motorData(66, 2) = "Y225M-6": motorData(66, 3) = 30: motorData(66, 4) = 40: motorData(66, 5) = 59.5: motorData(66, 6) = 980: motorData(66, 7) = 90.2: motorData(66, 8) = 0.85: motorData(66, 9) = 300
    motorData(67, 1) = 67: motorData(67, 2) = "Y250M-6": motorData(67, 3) = 37: motorData(67, 4) = 50: motorData(67, 5) = 72: motorData(67, 6) = 980: motorData(67, 7) = 90.8: motorData(67, 8) = 0.86: motorData(67, 9) = 410
    motorData(68, 1) = 68: motorData(68, 2) = "Y280S-6": motorData(68, 3) = 45: motorData(68, 4) = 61: motorData(68, 5) = 85.4: motorData(68, 6) = 980: motorData(68, 7) = 92: motorData(68, 8) = 0.87: motorData(68, 9) = 536
    motorData(69, 1) = 69: motorData(69, 2) = "Y280M-6": motorData(69, 3) = 55: motorData(69, 4) = 75: motorData(69, 5) = 104.4: motorData(69, 6) = 980: motorData(69, 7) = 92: motorData(69, 8) = 0.87: motorData(69, 9) = 595
    motorData(70, 1) = 70: motorData(70, 2) = "Y315S-6": motorData(70, 3) = 75: motorData(70, 4) = 102: motorData(70, 5) = 141: motorData(70, 6) = 990: motorData(70, 7) = 92.8: motorData(70, 8) = 0.87: motorData(70, 9) = 1000
    motorData(71, 1) = 71: motorData(71, 2) = "Y315M-6": motorData(71, 3) = 90: motorData(71, 4) = 122.5: motorData(71, 5) = 168.6: motorData(71, 6) = 990: motorData(71, 7) = 93.2: motorData(71, 8) = 0.87: motorData(71, 9) = 1080
    motorData(72, 1) = 72: motorData(72, 2) = "Y315L1-6": motorData(72, 3) = 110: motorData(72, 4) = 150: motorData(72, 5) = 205.5: motorData(72, 6) = 990: motorData(72, 7) = 93.5: motorData(72, 8) = 0.87: motorData(72, 9) = 1150 ' 修正原代码“极”为“1”
    motorData(73, 1) = 73: motorData(73, 2) = "Y315L2-6": motorData(73, 3) = 132: motorData(73, 4) = 180: motorData(73, 5) = 245.6: motorData(73, 6) = 990: motorData(73, 7) = 93.8: motorData(73, 8) = 0.87: motorData(73, 9) = 1210
    motorData(74, 1) = 74: motorData(74, 2) = "Y355M1-6": motorData(74, 3) = 160: motorData(74, 4) = 218: motorData(74, 5) = 300.4: motorData(74, 6) = 990: motorData(74, 7) = 94.1: motorData(74, 8) = 0.86: motorData(74, 9) = 1590 ' 修正原代码“极”为“6”
    motorData(75, 1) = 75: motorData(75, 2) = "Y355M2-6": motorData(75, 3) = 185: motorData(75, 4) = 272: motorData(75, 5) = 346.6: motorData(75, 6) = 990: motorData(75, 7) = 94.3: motorData(75, 8) = 0.86: motorData(75, 9) = 1670 ' 修正原代码“极.3”为“94.3”
    motorData(76, 1) = 76: motorData(76, 2) = "Y355M3-6": motorData(76, 3) = 200: motorData(76, 4) = 299: motorData(76, 5) = 374.7: motorData(76, 6) = 990: motorData(76, 7) = 94.3: motorData(76, 8) = 0.86: motorData(76, 9) = 1750 ' 修正原代码“Y极M3-6”为“Y355M3-6”
    motorData(77, 1) = 77: motorData(77, 2) = "Y355L2-6": motorData(77, 3) = 220: motorData(77, 4) = 340: motorData(77, 5) = 411.3: motorData(77, 6) = 991: motorData(77, 7) = 94.5: motorData(77, 8) = 0.86: motorData(77, 9) = 1870
    motorData(78, 1) = 78: motorData(78, 2) = "Y355L1-6": motorData(78, 3) = 250: motorData(78, 4) = 381: motorData(78, 5) = 466.4: motorData(78, 6) = 991: motorData(78, 7) = 94.7: motorData(78, 8) = 0.86: motorData(78, 9) = 1990 ' 修正原代码“极.86”为“0.86”
    
    ' 第79-98台：8极电机（Y系列-8极）
    motorData(79, 1) = 79: motorData(79, 2) = "Y132S-8": motorData(79, 3) = 2.2: motorData(79, 4) = 3: motorData(79, 5) = 5.6: motorData(79, 6) = 710: motorData(79, 7) = 80.5: motorData(79, 8) = 0.71: motorData(79, 9) = 65 ' 修正原代码“极”为“7”
    motorData(80, 1) = 80: motorData(80, 2) = "Y132M-8": motorData(80, 3) = 3: motorData(80, 4) = 4: motorData(80, 5) = 7.7: motorData(80, 6) = 710: motorData(80, 7) = 82: motorData(80, 8) = 0.72: motorData(80, 9) = 76 ' 修正原代码“极6”为“76”
    motorData(81, 1) = 81: motorData(81, 2) = "Y160M1-8": motorData(81, 3) = 4: motorData(81, 4) = 5.5: motorData(81, 5) = 9.9: motorData(81, 6) = 720: motorData(81, 7) = 84: motorData(81, 8) = 0.73: motorData(81, 9) = 110
    motorData(82, 1) = 82: motorData(82, 2) = "Y160M2-8": motorData(82, 3) = 5.5: motorData(82, 4) = 7.5: motorData(82, 5) = 13.3: motorData(82, 6) = 720: motorData(82, 7) = 85: motorData(82, 8) = 0.74: motorData(82, 9) = 110 ' 修正原代码“极”为“2”
    motorData(83, 1) = 83: motorData(83, 2) = "Y160L-8": motorData(83, 3) = 7.5: motorData(83, 4) = 10: motorData(83, 5) = 17.1: motorData(83, 6) = 720: motorData(83, 7) = 86: motorData(83, 8) = 0.75: motorData(83, 9) = 140
    motorData(84, 1) = 84: motorData(84, 2) = "Y180L-8": motorData(84, 3) = 11: motorData(84, 4) = 15: motorData(84, 5) = 24.8: motorData(84, 6) = 730: motorData(84, 7) = 87.5: motorData(84, 8) = 0.77: motorData(84, 9) = 185
    motorData(85, 1) = 85: motorData(85, 2) = "Y200L-8": motorData(85, 3) = 15: motorData(85, 4) = 20: motorData(85, 5) = 34: motorData(85, 6) = 730: motorData(85, 7) = 88: motorData(85, 8) = 0.76: motorData(85, 9) = 235
    motorData(86, 1) = 86: motorData(86, 2) = "Y225S-8": motorData(86, 3) = 18.5: motorData(86, 4) = 25: motorData(86, 5) = 41.3: motorData(86, 6) = 730: motorData(86, 7) = 89.5: motorData(86, 8) = 0.76: motorData(86, 9) = 276 ' 修正原代码“极6”为“86”
    motorData(87, 1) = 87: motorData(87, 2) = "Y225M-8": motorData(87, 3) = 22: motorData(87, 4) = 30: motorData(87, 5) = 47.6: motorData(87, 6) = 730: motorData(87, 7) = 90: motorData(87, 8) = 0.78: motorData(87, 9) = 303
    motorData(88, 1) = 88: motorData(88, 2) = "Y250M-8": motorData(88, 3) = 30: motorData(88, 4) = 40: motorData(88, 5) = 63: motorData(88, 6) = 730: motorData(88, 7) = 90.5: motorData(88, 8) = 0.8: motorData(88, 9) = 402 ' 修正原代码“motor极”为“motorData”
    motorData(89, 1) = 89: motorData(89, 2) = "Y280S-8": motorData(89, 3) = 37: motorData(89, 4) = 50: motorData(89, 5) = 78.2: motorData(89, 6) = 740: motorData(89, 7) = 91: motorData(89, 8) = 0.79: motorData(89, 9) = 520
    motorData(90, 1) = 90: motorData(90, 2) = "Y280M-8": motorData(90, 3) = 45: motorData(90, 4) = 61: motorData(90, 5) = 93.2: motorData(90, 6) = 730: motorData(90, 7) = 91.7: motorData(90, 8) = 0.8: motorData(90, 9) = 592
    motorData(91, 1) = 91: motorData(91, 2) = "Y315S-8": motorData(91, 3) = 55: motorData(91, 4) = 75: motorData(91, 5) = 113.5: motorData(91, 6) = 740: motorData(91, 7) = 92: motorData(91, 8) = 0.8: motorData(91, 9) = 1100 ' 修正原代码“极”为“4”
    motorData(92, 1) = 92: motorData(92, 2) = "Y315M-8": motorData(92, 3) = 75: motorData(92, 4) = 102: motorData(92, 5) = 152: motorData(92, 6) = 740: motorData(92, 7) = 92.5: motorData(92, 8) = 0.81: motorData(92, 9) = 1160
    motorData(93, 1) = 93: motorData(93, 2) = "Y315L1-8": motorData(93, 3) = 90: motorData(93, 4) = 122.5: motorData(93, 5) = 179: motorData(93, 6) = 740: motorData(93, 7) = 93: motorData(93, 8) = 0.82: motorData(93, 9) = 1230
    motorData(94, 1) = 94: motorData(94, 2) = "Y315L2-8": motorData(94, 3) = 110: motorData(94, 4) = 150: motorData(94, 5) = 218.5: motorData(94, 6) = 740: motorData(94, 7) = 93.3: motorData(94, 8) = 0.82: motorData(94, 9) = 1380
    motorData(95, 1) = 95: motorData(95, 2) = "Y355M1-8": motorData(95, 3) = 132: motorData(95, 4) = 180: motorData(95, 5) = 264: motorData(95, 6) = 742: motorData(95, 7) = 93.8: motorData(95, 8) = 0.81: motorData(95, 9) = 1660
    motorData(96, 1) = 96: motorData(96, 2) = "Y355M2-8": motorData(96, 3) = 160: motorData(96, 4) = 218: motorData(96, 5) = 319.3: motorData(96, 6) = 742: motorData(96, 7) = 94: motorData(96, 8) = 0.81: motorData(96, 9) = 1740 ' 修正原代码“极”为“7”和“9”
    motorData(97, 1) = 97: motorData(97, 2) = "Y355L1-8": motorData(97, 3) = 185: motorData(97, 4) = 272: motorData(97, 5) = 368.4: motorData(97, 6) = 742: motorData(97, 7) = 94.2: motorData(97, 8) = 0.81: motorData(97, 9) = 1880
    motorData(98, 1) = 98: motorData(98, 2) = "Y355L2-8": motorData(98, 3) = 200: motorData(98, 4) = 299: motorData(98, 5) = 397.8: motorData(98, 6) = 742: motorData(98, 7) = 94.3: motorData(98, 8) = 0.81: motorData(98, 9) = 1980
    
    ' 第99-101台：10极电机（Y系列-10极）
    motorData(99, 1) = 99: motorData(99, 2) = "Y355M1-10": motorData(99, 3) = 90: motorData(99, 4) = 122.5: motorData(99, 5) = 191: motorData(99, 6) = 592: motorData(99, 7) = 93: motorData(99, 8) = 0.77: motorData(99, 9) = 1590
    motorData(100, 1) = 100: motorData(100, 2) = "Y355M2-10": motorData(100, 3) = 110: motorData(100, 4) = 150: motorData(100, 5) = 229.9: motorData(100, 6) = 592: motorData(100, 7) = 93.2: motorData(100, 8) = 0.78: motorData(100, 9) = 1720 ' 修正原代码“极50”为“150”
    motorData(101, 1) = 101: motorData(101, 2) = "Y355L-10": motorData(101, 3) = 132: motorData(101, 4) = 180: motorData(101, 5) = 275: motorData(101, 6) = 592: motorData(101, 7) = 93.5: motorData(101, 8) = 0.78: motorData(101, 9) = 1890
    ' 标记为已初始化
    motorDataInitialized = True
End Sub

' ###########################################################################
' 公共方法2：根据风机功率选型电机（选择功率≥风机功率的最小电机）
' 输入：fanPower - 风机功率（kW）
' 输出：Variant数组 - 选中电机的完整参数（1=序号,2=型号,...,9=重量）
' ###########################################################################
Public Function SelectMotor(fanPower As Double) As Variant
    Dim i As Integer, j As Integer
    Dim selectedMotor(1 To 9) As Variant ' 存储选中电机的9项参数
    
    ' 初始化：默认选择第1台电机（防止无匹配时返回空值）
    For j = 1 To 9
        selectedMotor(j) = motorData(1, j)
    Next j
    
    ' 遍历电机数据，选择“功率≥风机功率”的最小电机（按序号升序，确保最小匹配）
    For i = 1 To 101
        If IsNumeric(motorData(i, 3)) And motorData(i, 3) >= fanPower Then
            For j = 1 To 9
                selectedMotor(j) = motorData(i, j)
            Next j
            Exit For ' 找到第一个匹配项即退出（确保最小功率）
        End If
    Next i
    
    ' 特殊情况：若风机功率超过所有电机，选择最大功率电机（第101台）
    If fanPower > motorData(101, 3) Then
        For j = 1 To 9
            selectedMotor(j) = motorData(101, j)
        Next j
    End If
    
    SelectMotor = selectedMotor
End Function

' 根据功率获取电机的功率因数和效率
Public Function GetMotorEfficiencyAndPowerFactor(ByVal motorPower As Double) As Variant
    Dim i As Integer
    Dim efficiency As Double
    Dim powerFactor As Double
    
    ' 默认值
    efficiency = 0.85
    powerFactor = 0.8
    
    ' 查找匹配的电机功率
    For i = 1 To 101
        If motorData(i, 3) = motorPower Then
            efficiency = motorData(i, 7) / 100 ' 转换为小数
            powerFactor = motorData(i, 8)
            Exit For
        End If
    Next i
    
    GetMotorEfficiencyAndPowerFactor = Array(efficiency, powerFactor)
End Function

' 获取所有电机功率列表（用于下拉框）
Public Function GetMotorPowerList() As Collection
    ' 确保电机数据已初始化
    If Not motorDataInitialized Then
        InitializeMotorData
    End If
    
    Dim powerList As New Collection
    Dim i As Integer
    Dim powerValue As Double
    
    ' 使用字典来确保功率值唯一
    Dim dict As Object
    Set dict = CreateObject("Scripting.Dictionary")
    
    For i = 1 To 101
        powerValue = motorData(i, 3)
        If Not dict.exists(powerValue) Then
            dict.Add powerValue, powerValue
            powerList.Add powerValue
        End If
    Next i
    
    Set GetMotorPowerList = powerList
End Function
