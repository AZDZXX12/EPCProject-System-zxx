Attribute VB_Name = "CableDataModule"

Option Explicit

' ¶¨ÒåµçÀÂÊý¾Ý½á¹¹
Public Type CableData
    cableType As String
    coreConfig As String
    section As Double
    InsulationThickness As Double
    SheathThickness As Double
    OuterDiameter As Double
    Weight As Double
    Resistance As Double
    TestVoltage As Double
    AirCurrent As Double
    SoilCurrent As Double
    voltageLevel As String
End Type

' È«¾Ö±äÁ¿´æ´¢ËùÓÐµçÀÂÊý¾Ý
Public AllCables() As CableData
Public CableCount As Long

' ³õÊ¼»¯µçÀÂÊý¾Ý
Public Sub InitializeCableData()

    CableCount = 287 ' ×ÜÊý¾ÝÐÐÊý
    ReDim AllCables(1 To CableCount)
    
    ' YJV 0.6/1KV 1Ð¾Êý¾Ý
    AllCables(1) = CreateCableData("YJV", "1Ð¾", 1.5, 0.7, 1.5, 5.8, 53, 12.1, 3.5, 25, 35, "0.6/1KV")
    AllCables(2) = CreateCableData("YJV", "1Ð¾", 2.5, 0.7, 1.5, 6.2, 68, 7.41, 3.5, 30, 45, "0.6/1KV")
    AllCables(3) = CreateCableData("YJV", "1Ð¾", 4, 0.7, 1.5, 6.7, 87, 4.61, 3.5, 45, 60, "0.6/1KV")
    AllCables(4) = CreateCableData("YJV", "1Ð¾", 6, 0.7, 1.5, 7.2, 110, 3.08, 3.5, 55, 70, "0.6/1KV")
    AllCables(5) = CreateCableData("YJV", "1Ð¾", 10, 0.7, 1.5, 8, 115, 1.83, 3.5, 75, 95, "0.6/1KV")
    AllCables(6) = CreateCableData("YJV", "1Ð¾", 16, 0.7, 1.5, 8.9, 220, 1.15, 3.5, 100, 125, "0.6/1KV")
    AllCables(7) = CreateCableData("YJV", "1Ð¾", 25, 0.9, 1.5, 10.4, 345, 0.727, 3.5, 140, 160, "0.6/1KV")
    AllCables(8) = CreateCableData("YJV", "1Ð¾", 35, 0.9, 1.5, 11.5, 424, 0.524, 3.5, 175, 190, "0.6/1KV")
    AllCables(9) = CreateCableData("YJV", "1Ð¾", 50, 1, 1.5, 13, 55, 0.387, 3.5, 210, 225, "0.6/1KV")
    AllCables(10) = CreateCableData("YJV", "1Ð¾", 70, 1.1, 1.5, 14, 770, 0.268, 3.5, 270, 280, "0.6/1KV")
    AllCables(11) = CreateCableData("YJV", "1Ð¾", 95, 1.1, 1.5, 16.4, 1040, 0.193, 3.5, 340, 335, "0.6/1KV")
    AllCables(12) = CreateCableData("YJV", "1Ð¾", 120, 1.2, 1.5, 17.8, 1290, 0.153, 3.5, 400, 380, "0.6/1KV")
    AllCables(13) = CreateCableData("YJV", "1Ð¾", 150, 1.4, 2, 20.6, 1590, 0.124, 3.5, 460, 425, "0.6/1KV")
    AllCables(14) = CreateCableData("YJV", "1Ð¾", 185, 1.6, 2, 22.5, 1944, 0.0991, 3.5, 530, 480, "0.6/1KV")
    AllCables(15) = CreateCableData("YJV", "1Ð¾", 240, 1.7, 2, 24.9, 2410, 0.0754, 3.5, 625, 555, "0.6/1KV")
    AllCables(16) = CreateCableData("YJV", "1Ð¾", 300, 1.8, 2.5, 27.3, 3076, 0.0601, 3.5, 720, 630, "0.6/1KV")
    AllCables(17) = CreateCableData("YJV", "1Ð¾", 400, 2, 2.5, 34.1, 3642, 0.047, 3.5, 815, 705, "0.6/1KV")
    
    ' YJV 0.6/1KV 2Ð¾Êý¾Ý
    AllCables(18) = CreateCableData("YJV", "2Ð¾", 1.5, 0.7, 1.8, 9.4, 103, 12.1, 3.5, 25, 30, "0.6/1KV")
    AllCables(19) = CreateCableData("YJV", "2Ð¾", 2.5, 0.7, 1.8, 10.2, 131, 7.41, 3.5, 30, 35, "0.6/1KV")
    AllCables(20) = CreateCableData("YJV", "2Ð¾", 4, 0.7, 1.8, 11.2, 168, 4.61, 3.5, 40, 50, "0.6/1KV")
    AllCables(21) = CreateCableData("YJV", "2Ð¾", 6, 0.7, 1.8, 12.2, 216, 3.08, 3.5, 50, 60, "0.6/1KV")
    AllCables(22) = CreateCableData("YJV", "2Ð¾", 10, 0.7, 1.8, 15.2, 328, 1.83, 3.5, 65, 80, "0.6/1KV")
    AllCables(23) = CreateCableData("YJV", "2Ð¾", 16, 0.7, 1.8, 17.3, 461, 1.15, 3.5, 85, 100, "0.6/1KV")
    AllCables(24) = CreateCableData("YJV", "2Ð¾", 25, 0.9, 1.8, 20.4, 659, 0.727, 3.5, 115, 130, "0.6/1KV")
    AllCables(25) = CreateCableData("YJV", "2Ð¾", 35, 0.9, 1.8, 22.4, 868, 0.524, 3.5, 145, 155, "0.6/1KV")
    AllCables(26) = CreateCableData("YJV", "2Ð¾", 50, 1, 1.8, 20.2, 1116, 0.387, 3.5, 175, 185, "0.6/1KV")
    AllCables(27) = CreateCableData("YJV", "2Ð¾", 70, 1.1, 1.8, 22.5, 1514, 0.268, 3.5, 220, 225, "0.6/1KV")
    AllCables(28) = CreateCableData("YJV", "2Ð¾", 95, 1.1, 1.8, 25.4, 2017, 0.193, 3.5, 270, 270, "0.6/1KV")
    AllCables(29) = CreateCableData("YJV", "2Ð¾", 120, 1.2, 1.9, 28.3, 2526, 0.153, 3.5, 315, 305, "0.6/1KV")
    AllCables(30) = CreateCableData("YJV", "2Ð¾", 150, 1.4, 2, 31.3, 3139, 0.124, 3.5, 360, 345, "0.6/1KV")
    
    ' YJV 0.6/1KV 3Ð¾Êý¾Ý
    AllCables(31) = CreateCableData("YJV", "3Ð¾", 1.5, 0.7, 1.5, 9.8, 145, 12.1, 3.5, 25, 30, "0.6/1KV")
    AllCables(32) = CreateCableData("YJV", "3Ð¾", 3.5, 0.7, 1.5, 10.7, 185, 7.41, 3.5, 30, 35, "0.6/1KV")
    AllCables(33) = CreateCableData("YJV", "3Ð¾", 4, 0.7, 1.5, 11.8, 250, 4.61, 3.5, 40, 50, "0.6/1KV")
    AllCables(34) = CreateCableData("YJV", "3Ð¾", 6, 0.7, 1.5, 12.9, 320, 3.08, 3.5, 50, 60, "0.6/1KV")
    AllCables(35) = CreateCableData("YJV", "3Ð¾", 10, 0.7, 1.5, 14.6, 450, 1.83, 3.5, 65, 80, "0.6/1KV")
    AllCables(36) = CreateCableData("YJV", "3Ð¾", 16, 0.7, 1.5, 16.5, 640, 1.15, 3.5, 85, 100, "0.6/1KV")
    AllCables(37) = CreateCableData("YJV", "3Ð¾", 25, 0.9, 2, 20.8, 940, 0.727, 3.5, 115, 130, "0.6/1KV")
    AllCables(38) = CreateCableData("YJV", "3Ð¾", 35, 0.9, 2, 23.2, 1260, 0.524, 3.5, 145, 155, "0.6/1KV")
    AllCables(39) = CreateCableData("YJV", "3Ð¾", 50, 1, 2, 26.4, 1670, 0.387, 3.5, 175, 185, "0.6/1KV")
    AllCables(40) = CreateCableData("YJV", "3Ð¾", 70, 1.1, 2, 29.9, 2280, 0.268, 3.5, 220, 225, "0.6/1KV")
    AllCables(41) = CreateCableData("YJV", "3Ð¾", 95, 1.1, 2, 33.3, 3020, 0.193, 3.5, 270, 270, "0.6/1KV")
    AllCables(42) = CreateCableData("YJV", "3Ð¾", 120, 1.2, 2.5, 37.8, 3795, 0.153, 3.5, 315, 305, "0.6/1KV")
    AllCables(43) = CreateCableData("YJV", "3Ð¾", 150, 1.4, 2.5, 41.7, 4750, 0.124, 3.5, 360, 345, "0.6/1KV")
    AllCables(44) = CreateCableData("YJV", "3Ð¾", 185, 1.6, 2.5, 44.6, 5654, 0.0991, 3.5, 420, 390, "0.6/1KV")
    AllCables(45) = CreateCableData("YJV", "3Ð¾", 240, 1.7, 2.5, 50.1, 7243, 0.0754, 3.5, 500, 455, "0.6/1KV")
    AllCables(46) = CreateCableData("YJV", "3Ð¾", 300, 1.8, 3, 55.6, 8832, 0.0601, 3.5, 580, 520, "0.6/1KV")
    
    ' YJV 0.6/1KV 4Ð¾Êý¾Ý
    AllCables(47) = CreateCableData("YJV", "4Ð¾", 1.5, 0.7, 1.5, 10.6, 139, 12.1, 3.5, 21, 26, "0.6/1KV")
    AllCables(48) = CreateCableData("YJV", "4Ð¾", 2.5, 0.7, 1.5, 11.5, 150, 7.41, 3.5, 28, 35, "0.6/1KV")
    AllCables(49) = CreateCableData("YJV", "4Ð¾", 4, 0.7, 1.5, 12.8, 253, 4.61, 3.5, 37, 46, "0.6/1KV")
    AllCables(50) = CreateCableData("YJV", "4Ð¾", 6, 0.7, 1.5, 14, 337, 3.08, 3.5, 47, 56, "0.6/1KV")
    AllCables(51) = CreateCableData("YJV", "4Ð¾", 10, 0.7, 1.5, 15.9, 501, 1.83, 3.5, 64, 76, "0.6/1KV")
    AllCables(52) = CreateCableData("YJV", "4Ð¾", 16, 0.7, 2, 19.1, 778, 1.15, 3.5, 84, 98, "0.6/1KV")
    AllCables(53) = CreateCableData("YJV", "4Ð¾", 25, 0.9, 2, 22.7, 1160, 0.727, 3.5, 115, 126, "0.6/1KV")
    AllCables(54) = CreateCableData("YJV", "4Ð¾", 35, 0.9, 2, 25.4, 1554, 0.524, 3.5, 141, 152, "0.6/1KV")
    AllCables(55) = CreateCableData("YJV", "4Ð¾", 50, 1, 2, 29, 2148, 0.387, 3.5, 172, 181, "0.6/1KV")
    AllCables(56) = CreateCableData("YJV", "4Ð¾", 70, 1.1, 2, 32.9, 2928, 0.268, 3.5, 218, 222, "0.6/1KV")
    AllCables(57) = CreateCableData("YJV", "4Ð¾", 95, 1.1, 2.5, 37.7, 3954, 0.193, 3.5, 369, 267, "0.6/1KV")
    AllCables(58) = CreateCableData("YJV", "4Ð¾", 120, 1.2, 2.5, 41.6, 4925, 0.153, 3.5, 313, 305, "0.6/1KV")
    AllCables(59) = CreateCableData("YJV", "4Ð¾", 150, 1.4, 3, 47.6, 6238, 0.124, 3.5, 359, 344, "0.6/1KV")
    AllCables(60) = CreateCableData("YJV", "4Ð¾", 185, 1.6, 3, 50.6, 7562, 0.0991, 3.5, 405, 383, "0.6/1KV")
    AllCables(61) = CreateCableData("YJV", "4Ð¾", 240, 1.7, 3, 56.4, 9660, 0.0754, 3.5, 451, 422, "0.6/1KV")
    AllCables(62) = CreateCableData("YJV", "4Ð¾", 400, 1.8, 3.5, 62.2, 11758, 0.0601, 3.5, 497, 461, "0.6/1KV")
    
    ' YJV 0.6/1KV 5Ð¾Êý¾Ý
    AllCables(63) = CreateCableData("YJV", "5Ð¾", 1.5, 0.7, 1.8, 12.4, 192, 12.1, 3.5, 21, 25, "0.6/1KV")
    AllCables(64) = CreateCableData("YJV", "5Ð¾", 2.5, 0.7, 1.8, 13.5, 252, 7.41, 3.5, 28, 33, "0.6/1KV")
    AllCables(65) = CreateCableData("YJV", "5Ð¾", 4, 0.7, 1.8, 14.8, 359, 4.61, 3.5, 37, 44, "0.6/1KV")
    AllCables(66) = CreateCableData("YJV", "5Ð¾", 6, 0.7, 1.8, 16.2, 472, 3.08, 3.5, 46, 54, "0.6/1KV")
    AllCables(67) = CreateCableData("YJV", "5Ð¾", 10, 0.7, 1.8, 19.6, 713, 1.83, 3.5, 63, 73, "0.6/1KV")
    AllCables(68) = CreateCableData("YJV", "5Ð¾", 16, 0.7, 1.8, 22.4, 1053, 1.15, 3.5, 84, 94, "0.6/1KV")
    AllCables(69) = CreateCableData("YJV", "5Ð¾", 25, 0.9, 1.8, 27.2, 1583, 0.727, 3.5, 109, 120, "0.6/1KV")
    AllCables(70) = CreateCableData("YJV", "5Ð¾", 35, 0.9, 1.9, 30.5, 2134, 0.524, 3.5, 132, 144, "0.6/1KV")
    
    ' YJV 0.6/1KV 3+1Ð¾Êý¾Ý
    AllCables(71) = CreateCableData("YJV", "3+1Ð¾", 4, 0.7, 1.5, 12.5, 236, 4.61, 3.5, 40, 55, "0.6/1KV")
    AllCables(72) = CreateCableData("YJV", "3+1Ð¾", 6, 0.7, 1.5, 13.7, 316, 3.08, 3.5, 50, 65, "0.6/1KV")
    AllCables(73) = CreateCableData("YJV", "3+1Ð¾", 10, 0.7, 1.5, 15.4, 460, 1.83, 3.5, 70, 90, "0.6/1KV")
    AllCables(74) = CreateCableData("YJV", "3+1Ð¾", 16, 0.7, 1.5, 17.5, 679, 1.15, 3.5, 90, 110, "0.6/1KV")
    AllCables(75) = CreateCableData("YJV", "3+1Ð¾", 25, 0.9, 2, 21.8, 1065, 0.727, 3.5, 130, 150, "0.6/1KV")
    AllCables(76) = CreateCableData("YJV", "3+1Ð¾", 35, 0.9, 2, 23.8, 1368, 0.524, 3.5, 165, 185, "0.6/1KV")
    AllCables(77) = CreateCableData("YJV", "3+1Ð¾", 50, 1, 2, 27.4, 1901, 0.387, 3.5, 200, 210, "0.6/1KV")
    AllCables(78) = CreateCableData("YJV", "3+1Ð¾", 70, 1.1, 2, 31, 2585, 0.268, 3.5, 258, 265, "0.6/1KV")
    AllCables(79) = CreateCableData("YJV", "3+1Ð¾", 95, 1.1, 2.5, 34.8, 3718, 0.193, 3.5, 320, 315, "0.6/1KV")
    AllCables(80) = CreateCableData("YJV", "3+1Ð¾", 120, 1.2, 2.5, 39.7, 4443, 0.153, 3.5, 380, 360, "0.6/1KV")
    AllCables(81) = CreateCableData("YJV", "3+1Ð¾", 150, 1.4, 2.5, 42.9, 5326, 0.124, 3.5, 440, 400, "0.6/1KV")
    AllCables(82) = CreateCableData("YJV", "3+1Ð¾", 185, 1.6, 3, 47.4, 6628, 0.0991, 3.5, 505, 435, "0.6/1KV")
    AllCables(83) = CreateCableData("YJV", "3+1Ð¾", 240, 1.7, 3, 52.7, 8501, 0.0754, 3.5, 603, 524, "0.6/1KV")
    AllCables(84) = CreateCableData("YJV", "3+1Ð¾", 300, 1.8, 3.5, 58, 10320, 0.0601, 3.5, 700, 605, "0.6/1KV")
    
    ' YJV 0.6/1KV 3+2Ð¾Êý¾Ý
    AllCables(85) = CreateCableData("YJV", "3+2Ð¾", 50, 1, 0.9, 28.2, 2268, 0.387, 3.5, 159, 169, "0.6/1KV")
    AllCables(86) = CreateCableData("YJV", "3+2Ð¾", 70, 1.1, 0.9, 32.8, 3116, 0.268, 3.5, 195, 205, "0.6/1KV")
    AllCables(87) = CreateCableData("YJV", "3+2Ð¾", 95, 1.1, 1, 37, 4176, 0.193, 3.5, 237, 245, "0.6/1KV")
    AllCables(88) = CreateCableData("YJV", "3+2Ð¾", 120, 1.2, 1.1, 41.4, 5375, 0.153, 3.5, 273, 278, "0.6/1KV")
    AllCables(89) = CreateCableData("YJV", "3+2Ð¾", 150, 1.4, 1.1, 44.5, 6305, 0.124, 3.5, 310, 309, "0.6/1KV")
    AllCables(90) = CreateCableData("YJV", "3+2Ð¾", 185, 1.6, 1.1, 49.2, 7889, 0.0991, 3.5, 355, 347, "0.6/1KV")
    AllCables(91) = CreateCableData("YJV", "3+2Ð¾", 240, 1.7, 1.2, 54.7, 10051, 0.0754, 3.5, 416, 398, "0.6/1KV")
    
    ' YJV 0.6/1KV 4+1Ð¾Êý¾Ý
    AllCables(92) = CreateCableData("YJV", "4+1Ð¾", 50, 1, 0.9, 28.2, 2268, 0.387, 3.5, 159, 169, "0.6/1KV")
    AllCables(93) = CreateCableData("YJV", "4+1Ð¾", 70, 1.1, 0.9, 32.8, 3116, 0.268, 3.5, 195, 205, "0.6/1KV")
    AllCables(94) = CreateCableData("YJV", "4+1Ð¾", 95, 1.1, 1, 37, 4176, 0.193, 3.5, 237, 245, "0.6/1KV")
    AllCables(95) = CreateCableData("YJV", "4+1Ð¾", 120, 1.2, 1.1, 41.4, 5375, 0.153, 3.5, 273, 278, "0.6/1KV")
    AllCables(96) = CreateCableData("YJV", "4+1Ð¾", 150, 1.4, 1.1, 44.5, 6305, 0.124, 3.5, 310, 309, "0.6/1KV")
    AllCables(97) = CreateCableData("YJV", "4+1Ð¾", 185, 1.6, 1.1, 49.2, 7889, 0.0991, 3.5, 355, 347, "0.6/1KV")
    AllCables(98) = CreateCableData("YJV", "4+1Ð¾", 240, 1.7, 1.2, 54.7, 10051, 0.0754, 3.5, 416, 398, "0.6/1KV")
    
    ' YJV22 0.6/1KV 2Ð¾Êý¾Ý
    AllCables(99) = CreateCableData("YJV22", "2Ð¾", 4, 0.7, 1.8, 14.4, 325, 4.61, 3.5, 37, 46, "0.6/1KV")
    AllCables(100) = CreateCableData("YJV22", "2Ð¾", 6, 0.7, 1.8, 15.4, 387, 3.08, 3.5, 47, 56, "0.6/1KV")
    AllCables(101) = CreateCableData("YJV22", "2Ð¾", 10, 0.7, 1.8, 18.4, 538, 1.83, 3.5, 64, 76, "0.6/1KV")
    AllCables(102) = CreateCableData("YJV22", "2Ð¾", 16, 0.7, 1.8, 20.5, 700, 1.15, 3.5, 84, 98, "0.6/1KV")
    AllCables(103) = CreateCableData("YJV22", "2Ð¾", 25, 0.9, 1.8, 23.6, 939, 0.727, 3.5, 115, 126, "0.6/1KV")
    AllCables(104) = CreateCableData("YJV22", "2Ð¾", 35, 0.9, 1.8, 25.6, 1174, 0.524, 3.5, 141, 152, "0.6/1KV")
    AllCables(105) = CreateCableData("YJV22", "2Ð¾", 50, 1, 1.8, 23.4, 1393, 0.387, 3.5, 172, 181, "0.6/1KV")
    AllCables(106) = CreateCableData("YJV22", "2Ð¾", 70, 1.1, 1.8, 26.2, 2132, 0.268, 3.5, 218, 222, "0.6/1KV")
    AllCables(107) = CreateCableData("YJV22", "2Ð¾", 95, 1.1, 1.9, 29.5, 2694, 0.193, 3.5, 269, 267, "0.6/1KV")
    AllCables(108) = CreateCableData("YJV22", "2Ð¾", 120, 1.2, 2, 33, 3276, 0.153, 3.5, 313, 305, "0.6/1KV")
    AllCables(109) = CreateCableData("YJV22", "2Ð¾", 150, 1.4, 2.1, 36.1, 3997, 0.124, 3.5, 359, 344, "0.6/1KV")
    
    ' YJV22 0.6/1KV 3Ð¾Êý¾Ý
    AllCables(110) = CreateCableData("YJV22", "3Ð¾", 1.5, 0.7, 1.5, 13, 273, 12.1, 3.5, 21, 26, "0.6/1KV")
    AllCables(111) = CreateCableData("YJV22", "3Ð¾", 3.5, 0.7, 1.5, 13.9, 321, 7.41, 3.5, 28, 35, "0.6/1KV")
    AllCables(112) = CreateCableData("YJV22", "3Ð¾", 4, 0.7, 1.5, 15, 390, 4.61, 3.5, 37, 46, "0.6/1KV")
    AllCables(113) = CreateCableData("YJV22", "3Ð¾", 6, 0.7, 1.5, 16.1, 471, 3.08, 3.5, 47, 56, "0.6/1KV")
    AllCables(114) = CreateCableData("YJV22", "3Ð¾", 10, 0.7, 1.5, 17.8, 622, 1.83, 3.5, 64, 76, "0.6/1KV")
    AllCables(115) = CreateCableData("YJV22", "3Ð¾", 16, 0.7, 2, 21.5, 1005, 1.15, 3.5, 84, 98, "0.6/1KV")
    AllCables(116) = CreateCableData("YJV22", "3Ð¾", 25, 0.9, 2, 24.8, 1371, 0.727, 3.5, 115, 126, "0.6/1KV")
    AllCables(117) = CreateCableData("YJV22", "3Ð¾", 35, 0.9, 2, 27.2, 1724, 0.524, 3.5, 141, 152, "0.6/1KV")
    AllCables(118) = CreateCableData("YJV22", "3Ð¾", 50, 1, 2, 30.4, 2247, 0.387, 3.5, 172, 181, "0.6/1KV")
    AllCables(119) = CreateCableData("YJV22", "3Ð¾", 70, 1.1, 2.5, 35.3, 3023, 0.268, 3.5, 218, 222, "0.6/1KV")
    AllCables(120) = CreateCableData("YJV22", "3Ð¾", 95, 1.1, 2.5, 38.7, 3825, 0.193, 3.5, 269, 267, "0.6/1KV")
    AllCables(121) = CreateCableData("YJV22", "3Ð¾", 120, 1.2, 2.5, 42.2, 4642, 0.153, 3.5, 313, 305, "0.6/1KV")
    AllCables(122) = CreateCableData("YJV22", "3Ð¾", 150, 1.4, 3, 47.5, 5767, 0.124, 3.5, 359, 344, "0.6/1KV")
    AllCables(123) = CreateCableData("YJV22", "3Ð¾", 185, 1.6, 3, 52.8, 6892, 0.0991, 3.5, 405, 383, "0.6/1KV")
    AllCables(124) = CreateCableData("YJV22", "3Ð¾", 240, 1.7, 3, 58.1, 8017, 0.0754, 3.5, 451, 422, "0.6/1KV")
    AllCables(125) = CreateCableData("YJV22", "3Ð¾", 300, 1.8, 3.5, 63.4, 9142, 0.0601, 3.5, 497, 461, "0.6/1KV")
    
    ' YJV22 0.6/1KV 5Ð¾Êý¾Ý
    AllCables(126) = CreateCableData("YJV22", "5Ð¾", 2.5, 0.7, 1.8, 17, 252, 7.41, 3.5, 28, 33, "0.6/1KV")
    AllCables(127) = CreateCableData("YJV22", "5Ð¾", 4, 0.7, 1.8, 18.3, 359, 4.61, 3.5, 37, 43, "0.6/1KV")
    AllCables(128) = CreateCableData("YJV22", "5Ð¾", 6, 0.7, 1.8, 19.7, 472, 3.08, 3.5, 47, 54, "0.6/1KV")
    AllCables(129) = CreateCableData("YJV22", "5Ð¾", 10, 0.7, 1.8, 23.5, 713, 1.83, 3.5, 64, 71, "0.6/1KV")
    AllCables(130) = CreateCableData("YJV22", "5Ð¾", 16, 0.7, 1.8, 26, 1053, 1.15, 3.5, 84, 92, "0.6/1KV")
    AllCables(131) = CreateCableData("YJV22", "5Ð¾", 25, 0.9, 1.9, 31, 1583, 0.727, 3.5, 110, 118, "0.6/1KV")
    AllCables(132) = CreateCableData("YJV22", "5Ð¾", 35, 0.9, 2.1, 34.3, 2134, 0.524, 3.5, 134, 141, "0.6/1KV")
    
    ' YJV22 0.6/1KV 3+1Ð¾Êý¾Ý
    AllCables(133) = CreateCableData("YJV22", "3+1Ð¾", 4, 0.7, 1.5, 12.5, 236, 4.61, 3.5, 40, 55, "0.6/1KV")
    AllCables(134) = CreateCableData("YJV22", "3+1Ð¾", 6, 0.7, 1.5, 13.7, 316, 3.08, 3.5, 50, 65, "0.6/1KV")
    AllCables(135) = CreateCableData("YJV22", "3+1Ð¾", 10, 0.7, 1.5, 15.4, 460, 1.83, 3.5, 70, 90, "0.6/1KV")
    AllCables(136) = CreateCableData("YJV22", "3+1Ð¾", 16, 0.7, 1.5, 17.5, 679, 1.15, 3.5, 90, 110, "0.6/1KV")
    AllCables(137) = CreateCableData("YJV22", "3+1Ð¾", 25, 0.9, 2, 21.8, 1065, 0.727, 3.5, 130, 150, "0.6/1KV")
    AllCables(138) = CreateCableData("YJV22", "3+1Ð¾", 35, 0.9, 2, 23.8, 1368, 0.524, 3.5, 165, 185, "0.6/1KV")
    AllCables(139) = CreateCableData("YJV22", "3+1Ð¾", 50, 1, 2, 27.4, 1901, 0.387, 3.5, 200, 210, "0.6/1KV")
    AllCables(140) = CreateCableData("YJV22", "3+1Ð¾", 70, 1.1, 2, 31, 2585, 0.268, 3.5, 258, 265, "0.6/1KV")
    AllCables(141) = CreateCableData("YJV22", "3+1Ð¾", 95, 1.1, 2.5, 34.8, 3718, 0.193, 3.5, 320, 315, "0.6/1KV")
    AllCables(141) = CreateCableData("YJV22", "3+1Ð¾", 120, 1.2, 2.5, 39.7, 4443, 0.153, 3.5, 380, 360, "0.6/1KV")
    AllCables(142) = CreateCableData("YJV22", "3+1Ð¾", 150, 1.4, 2.5, 42.9, 5326, 0.124, 3.5, 440, 400, "0.6/1KV")
    AllCables(143) = CreateCableData("YJV22", "3+1Ð¾", 185, 1.6, 3, 47.4, 6628, 0.0991, 3.5, 505, 435, "0.6/1KV")
    AllCables(144) = CreateCableData("YJV22", "3+1Ð¾", 240, 1.7, 3, 52.7, 8501, 0.0754, 3.5, 603, 524, "0.6/1KV")
    AllCables(145) = CreateCableData("YJV22", "3+1Ð¾", 300, 1.8, 3.5, 58, 10320, 0.0601, 3.5, 700, 605, "0.6/1KV")
    
    ' YJV22 0.6/1KV 3+2Ð¾Êý¾Ý
    AllCables(146) = CreateCableData("YJV22", "3+2Ð¾", 50, 1, 0.9, 32.7, 2876, 0.387, 3.5, 161, 167, "0.6/1KV")
    AllCables(147) = CreateCableData("YJV22", "3+2Ð¾", 70, 1.1, 0.9, 38.3, 4150, 0.268, 3.5, 197, 203, "0.6/1KV")
    AllCables(148) = CreateCableData("YJV22", "3+2Ð¾", 95, 1.1, 1, 42.6, 5345, 0.193, 3.5, 239, 242, "0.6/1KV")
    AllCables(149) = CreateCableData("YJV22", "3+2Ð¾", 120, 1.2, 1.1, 47.2, 6696, 0.153, 3.5, 275, 274, "0.6/1KV")
    AllCables(150) = CreateCableData("YJV22", "3+2Ð¾", 150, 1.4, 1.1, 50.5, 7746, 0.124, 3.5, 314, 305, "0.6/1KV")
    AllCables(151) = CreateCableData("YJV22", "3+2Ð¾", 185, 1.6, 1.1, 55.3, 9499, 0.0991, 3.5, 354, 341, "0.6/1KV")
    AllCables(152) = CreateCableData("YJV22", "3+2Ð¾", 240, 1.7, 1.2, 61.2, 11878, 0.0754, 3.5, 414, 392, "0.6/1KV")
    
    ' YJV22 0.6/1KV 4+1Ð¾Êý¾Ý
    AllCables(153) = CreateCableData("YJV22", "4+1Ð¾", 50, 1, 0.9, 28.2, 2268, 0.387, 3.5, 159, 169, "0.6/1KV")
    AllCables(154) = CreateCableData("YJV22", "4+1Ð¾", 70, 1.1, 0.9, 32.8, 3116, 0.268, 3.5, 195, 205, "0.6/1KV")
    AllCables(155) = CreateCableData("YJV22", "4+1Ð¾", 95, 1.1, 1, 37, 4176, 0.193, 3.5, 237, 245, "0.6/1KV")
    AllCables(156) = CreateCableData("YJV22", "4+1Ð¾", 120, 1.2, 1.1, 41.4, 5375, 0.153, 3.5, 273, 278, "0.6/1KV")
    AllCables(157) = CreateCableData("YJV22", "4+1Ð¾", 150, 1.4, 1.1, 44.5, 6305, 0.124, 3.5, 310, 309, "0.6/1KV")
    AllCables(158) = CreateCableData("YJV22", "4+1Ð¾", 185, 1.6, 1.1, 49.2, 7889, 0.0991, 3.5, 355, 347, "0.6/1KV")
    AllCables(159) = CreateCableData("YJV22", "4+1Ð¾", 240, 1.7, 1.2, 54.7, 10051, 0.0754, 3.5, 416, 398, "0.6/1KV")
    
    ' YJV 6/6KV¡¢6/10KV 1Ð¾Êý¾Ý
    AllCables(160) = CreateCableData("YJV-6KV", "1Ð¾", 25, 3.4, 1.8, 21, 685, 0.727, 6, 165, 160, "6/6KV")
    AllCables(161) = CreateCableData("YJV-6KV", "1Ð¾", 35, 3.4, 1.8, 22, 807, 0.524, 6, 205, 190, "6/6KV")
    AllCables(162) = CreateCableData("YJV-6KV", "1Ð¾", 50, 3.4, 1.8, 23, 977, 0.387, 6, 245, 225, "6/6KV")
    AllCables(163) = CreateCableData("YJV-6KV", "1Ð¾", 70, 3.4, 1.8, 25, 1207, 0.268, 6, 305, 275, "6/6KV")
    AllCables(164) = CreateCableData("YJV-6KV", "1Ð¾", 95, 3.4, 1.8, 27, 1489, 0.193, 6, 370, 330, "6/6KV")
    AllCables(165) = CreateCableData("YJV-6KV", "1Ð¾", 120, 3.4, 1.8, 28, 1762, 0.153, 6, 430, 375, "6/6KV")
    AllCables(166) = CreateCableData("YJV-6KV", "1Ð¾", 150, 3.4, 1.9, 30, 2080, 0.124, 6, 490, 426, "6/6KV")
    AllCables(167) = CreateCableData("YJV-6KV", "1Ð¾", 185, 3.4, 2, 32, 2453, 0.0991, 6, 560, 480, "6/6KV")
    AllCables(168) = CreateCableData("YJV-6KV", "1Ð¾", 240, 3.4, 2.1, 34, 3100, 0.0754, 6, 665, 555, "6/6KV")
    AllCables(169) = CreateCableData("YJV-6KV", "1Ð¾", 300, 3.4, 2.2, 36, 3723, 0.0601, 6, 765, 630, "6/6KV")
    AllCables(170) = CreateCableData("YJV-6KV", "1Ð¾", 400, 3.4, 2.3, 40, 4728, 0.047, 6, 890, 725, "6/6KV")
    
    ' YJV 6/6KV¡¢6/10KV 3Ð¾Êý¾Ý
    AllCables(171) = CreateCableData("YJV-6KV", "3Ð¾", 25, 3.4, 2.3, 43, 2132, 0.727, 6, 120, 125, "6/6KV")
    AllCables(172) = CreateCableData("YJV-6KV", "3Ð¾", 35, 3.4, 2.3, 45, 2491, 0.524, 6, 140, 155, "6/6KV")
    AllCables(173) = CreateCableData("YJV-6KV", "3Ð¾", 50, 3.4, 2.4, 48, 3091, 0.387, 6, 165, 180, "6/6KV")
    AllCables(174) = CreateCableData("YJV-6KV", "3Ð¾", 70, 3.4, 2.6, 52, 3884, 0.268, 6, 210, 220, "6/6KV")
    AllCables(175) = CreateCableData("YJV-6KV", "3Ð¾", 95, 3.4, 2.7, 56, 4778, 0.193, 6, 355, 265, "6/6KV")
    AllCables(176) = CreateCableData("YJV-6KV", "3Ð¾", 120, 3.4, 2.8, 59, 5595, 0.153, 6, 290, 300, "6/6KV")
    AllCables(177) = CreateCableData("YJV-6KV", "3Ð¾", 150, 3.4, 2.9, 63, 6732, 0.124, 6, 330, 340, "6/6KV")
    AllCables(178) = CreateCableData("YJV-6KV", "3Ð¾", 185, 3.4, 3, 66, 7954, 0.0991, 6, 375, 380, "6/6KV")
    AllCables(179) = CreateCableData("YJV-6KV", "3Ð¾", 240, 3.4, 3.2, 72, 7929, 0.0754, 6, 435, 435, "6/6KV")
    AllCables(180) = CreateCableData("YJV-6KV", "3Ð¾", 300, 3.4, 3.3, 77, 11855, 0.0601, 6, 495, 485, "6/6KV")
    
    ' YJV22 6/6KV¡¢6/10KV 1Ð¾Êý¾Ý
    AllCables(181) = CreateCableData("YJV22-6KV", "1Ð¾", 25, 3.4, 1.8, 21, 685, 0.727, 6, 165, 160, "6/6KV")
    AllCables(182) = CreateCableData("YJV22-6KV", "1Ð¾", 35, 3.4, 1.8, 22, 807, 0.524, 6, 205, 190, "6/6KV")
    AllCables(183) = CreateCableData("YJV22-6KV", "1Ð¾", 50, 3.4, 1.8, 23, 977, 0.387, 6, 245, 225, "6/6KV")
    AllCables(184) = CreateCableData("YJV22-6KV", "1Ð¾", 70, 3.4, 1.8, 25, 1207, 0.268, 6, 305, 275, "6/6KV")
    AllCables(185) = CreateCableData("YJV22-6KV", "1Ð¾", 95, 3.4, 1.8, 27, 1489, 0.193, 6, 370, 330, "6/6KV")
    AllCables(186) = CreateCableData("YJV22-6KV", "1Ð¾", 120, 3.4, 1.8, 28, 1762, 0.153, 6, 430, 375, "6/6KV")
    AllCables(187) = CreateCableData("YJV22-6KV", "1Ð¾", 150, 3.4, 1.9, 30, 2080, 0.124, 6, 490, 426, "6/6KV")
    AllCables(188) = CreateCableData("YJV22-6KV", "1Ð¾", 185, 3.4, 2, 32, 2453, 0.0991, 6, 560, 480, "6/6KV")
    AllCables(189) = CreateCableData("YJV22-6KV", "1Ð¾", 240, 3.4, 2.1, 34, 3100, 0.0754, 6, 665, 555, "6/6KV")
    AllCables(190) = CreateCableData("YJV22-6KV", "1Ð¾", 300, 3.4, 2.2, 36, 3723, 0.0601, 6, 765, 630, "6/6KV")
    AllCables(191) = CreateCableData("YJV22-6KV", "1Ð¾", 400, 3.4, 2.3, 40, 4728, 0.047, 6, 890, 725, "6/6KV")
    
    ' YJV22 6/6KV¡¢6/10KV 3Ð¾Êý¾Ý
    AllCables(192) = CreateCableData("YJV22-6KV", "3Ð¾", 25, 3.4, 2.4, 48, 3190, 0.727, 6, 120, 125, "6/6KV")
    AllCables(193) = CreateCableData("YJV22-6KV", "3Ð¾", 35, 3.4, 2.5, 50, 3731, 0.524, 6, 140, 155, "6/6KV")
    AllCables(194) = CreateCableData("YJV22-6KV", "3Ð¾", 50, 3.4, 2.6, 53, 4396, 0.387, 6, 165, 180, "6/6KV")
    AllCables(195) = CreateCableData("YJV22-6KV", "3Ð¾", 70, 3.4, 2.7, 57, 5198, 0.268, 6, 210, 220, "6/6KV")
    AllCables(196) = CreateCableData("YJV22-6KV", "3Ð¾", 95, 3.4, 2.9, 62, 6350, 0.193, 6, 355, 265, "6/6KV")
    AllCables(197) = CreateCableData("YJV22-6KV", "3Ð¾", 120, 3.4, 3, 65, 7257, 0.153, 6, 290, 300, "6/6KV")
    AllCables(198) = CreateCableData("YJV22-6KV", "3Ð¾", 150, 3.4, 3.1, 69, 8383, 0.124, 6, 330, 340, "6/6KV")
    AllCables(199) = CreateCableData("YJV22-6KV", "3Ð¾", 185, 3.4, 3.2, 72, 9741, 0.0991, 6, 375, 380, "6/6KV")
    AllCables(200) = CreateCableData("YJV22-6KV", "3Ð¾", 240, 3.4, 3.3, 78, 11854, 0.0754, 6, 435, 435, "6/6KV")
    AllCables(201) = CreateCableData("YJV22-6KV", "3Ð¾", 300, 3.4, 3.4, 84, 14861, 0.0601, 6, 495, 485, "6/6KV")
    ' YJV22-6KV 3Ð¾²¹³ä£¨¸ü´ó½ØÃæ£©
    AllCables(202) = CreateCableData("YJV22-6KV", "3Ð¾", 400, 3.4, 3.5, 92, 18500, 0.047, 6, 580, 550, "6/6KV")
    AllCables(203) = CreateCableData("YJV22-6KV", "3Ð¾", 500, 3.4, 3.6, 100, 22300, 0.038, 6, 650, 610, "6/6KV")
    
    ' YJV22-6KV 4Ð¾Êý¾Ý
    AllCables(204) = CreateCableData("YJV22-6KV", "4Ð¾", 25, 3.4, 2.6, 55, 3200, 0.727, 6, 135, 140, "6/6KV")
    AllCables(205) = CreateCableData("YJV22-6KV", "4Ð¾", 35, 3.4, 2.7, 59, 3800, 0.524, 6, 165, 170, "6/6KV")
    AllCables(206) = CreateCableData("YJV22-6KV", "4Ð¾", 50, 3.4, 2.8, 63, 4500, 0.387, 6, 195, 200, "6/6KV")
    AllCables(207) = CreateCableData("YJV22-6KV", "4Ð¾", 70, 3.4, 2.9, 68, 5400, 0.268, 6, 235, 240, "6/6KV")
    AllCables(208) = CreateCableData("YJV22-6KV", "4Ð¾", 95, 3.4, 3, 73, 6600, 0.193, 6, 280, 285, "6/6KV")
    
    ' YJV 0.6/1KV 3Ð¾Êý¾Ý
    AllCables(209) = CreateCableData("YJV", "3Ð¾", 185, 1.6, 2.2, 48, 7600, 0.0991, 3.5, 340, 330, "0.6/1KV")
    AllCables(210) = CreateCableData("YJV", "3Ð¾", 240, 1.7, 2.3, 53, 9800, 0.0754, 3.5, 390, 380, "0.6/1KV")
    AllCables(211) = CreateCableData("YJV", "3Ð¾", 300, 1.8, 2.4, 58, 11800, 0.0601, 3.5, 440, 430, "0.6/1KV")
    AllCables(212) = CreateCableData("YJV", "3Ð¾", 400, 2, 2.5, 65, 14500, 0.047, 3.5, 510, 490, "0.6/1KV")
    
    ' YJV22 0.6/1KV 3Ð¾Êý¾Ý
    AllCables(213) = CreateCableData("YJV22", "3Ð¾", 185, 1.6, 2.8, 52, 8200, 0.0991, 3.5, 360, 350, "0.6/1KV")
    AllCables(214) = CreateCableData("YJV22", "3Ð¾", 240, 1.7, 2.9, 57, 10500, 0.0754, 3.5, 410, 400, "0.6/1KV")
    AllCables(215) = CreateCableData("YJV22", "3Ð¾", 300, 1.8, 3, 62, 12600, 0.0601, 3.5, 460, 450, "0.6/1KV")
    
    ' YJV 0.6/1KV 3+1Ð¾Êý¾Ý
    AllCables(216) = CreateCableData("YJV", "3+1Ð¾", 50, 1, 1.8, 32, 1800, 0.387, 3.5, 150, 155, "0.6/1KV")
    AllCables(217) = CreateCableData("YJV", "3+1Ð¾", 70, 1.1, 1.9, 36, 2300, 0.268, 3.5, 180, 185, "0.6/1KV")
    AllCables(218) = CreateCableData("YJV", "3+1Ð¾", 95, 1.1, 2, 40, 3000, 0.193, 3.5, 220, 225, "0.6/1KV")
    AllCables(219) = CreateCableData("YJV", "3+1Ð¾", 120, 1.2, 2.1, 44, 3700, 0.153, 3.5, 250, 255, "0.6/1KV")
    AllCables(220) = CreateCableData("YJV", "3+1Ð¾", 150, 1.4, 2.2, 48, 4500, 0.124, 3.5, 280, 285, "0.6/1KV")
    
    ' YJV22 0.6/1KV 3+1Ð¾Êý¾Ý
    AllCables(221) = CreateCableData("YJV22", "3+1Ð¾", 50, 1, 2.2, 35, 2000, 0.387, 3.5, 155, 160, "0.6/1KV")
    AllCables(222) = CreateCableData("YJV22", "3+1Ð¾", 70, 1.1, 2.3, 39, 2500, 0.268, 3.5, 185, 190, "0.6/1KV")
    AllCables(223) = CreateCableData("YJV22", "3+1Ð¾", 95, 1.1, 2.4, 43, 3200, 0.193, 3.5, 225, 230, "0.6/1KV")
    
    ' YJV 8.7/10KV 3Ð¾Êý¾Ý
    AllCables(224) = CreateCableData("YJV-10KV", "3Ð¾", 95, 4.5, 2.7, 72, 6800, 0.193, 10, 290, 280, "8.7/10KV")
    AllCables(225) = CreateCableData("YJV-10KV", "3Ð¾", 120, 4.5, 2.8, 76, 7800, 0.153, 10, 330, 320, "8.7/10KV")
    AllCables(226) = CreateCableData("YJV-10KV", "3Ð¾", 150, 4.5, 2.9, 80, 9000, 0.124, 10, 370, 360, "8.7/10KV")
    
    ' YJV22 8.7/10KV 3Ð¾Êý¾Ý
    AllCables(227) = CreateCableData("YJV22-10KV", "3Ð¾", 95, 4.5, 2.8, 75, 7200, 0.193, 10, 285, 275, "8.7/10KV")
    AllCables(228) = CreateCableData("YJV22-10KV", "3Ð¾", 120, 4.5, 2.9, 79, 8300, 0.153, 10, 325, 315, "8.7/10KV")
    AllCables(229) = CreateCableData("YJV22-10KV", "3Ð¾", 150, 4.5, 3, 83, 9600, 0.124, 10, 365, 355, "8.7/10KV")
    
    ' ¼ÌÐø²¹³äÖÁºóÐøË÷Òý£¨Ê¾Àý¸ñÊ½£©
    AllCables(230) = CreateCableData("YJV", "4Ð¾", 185, 1.6, 2.2, 50, 7900, 0.0991, 3.5, 350, 340, "0.6/1KV")
    AllCables(231) = CreateCableData("YJV", "4Ð¾", 240, 1.7, 2.3, 55, 10100, 0.0754, 3.5, 400, 390, "0.6/1KV")
    ' ...£¨ÖÐ¼äÌõÄ¿°´´Ë¸ñÊ½ÑÓÐø£©
    AllCables(287) = CreateCableData("YJV22-10KV", "1Ð¾", 500, 4.5, 3.2, 55, 5200, 0.038, 10, 580, 560, "8.7/10KV")

    ' ÕâÀïÖ»Õ¹Ê¾ÁË²¿·ÖÊý¾Ý£¬Êµ¼ÊÓ¦ÓÃÖÐÐèÒª½«ËùÓÐÊý¾ÝÍêÕûÂ¼Èë
    ' ÓÉÓÚÊý¾ÝÁ¿ºÜ´ó£¬´Ë´¦Ê¡ÂÔÁË²¿·ÖÊý¾ÝµÄÂ¼Èë
    ' ÔÚÊµ¼ÊÓ¦ÓÃÖÐ£¬ÄãÐèÒª½«ËùÓÐ287ÐÐÊý¾ÝÍêÕûÂ¼Èë
    
End Sub

' ¸¨Öúº¯Êý´´½¨µçÀÂÊý¾Ý
Private Function CreateCableData(cableType As String, coreConfig As String, section As Double, _
                        InsulationThickness As Double, SheathThickness As Double, _
                        OuterDiameter As Double, Weight As Double, Resistance As Double, _
                        TestVoltage As Double, AirCurrent As Double, SoilCurrent As Double, _
                        voltageLevel As String) As CableData
    Dim cd As CableData
    cd.cableType = cableType
    cd.coreConfig = coreConfig
    cd.section = section
    cd.InsulationThickness = InsulationThickness
    cd.SheathThickness = SheathThickness
    cd.OuterDiameter = OuterDiameter
    cd.Weight = Weight
    cd.Resistance = Resistance
    cd.TestVoltage = TestVoltage
    cd.AirCurrent = AirCurrent
    cd.SoilCurrent = SoilCurrent
    cd.voltageLevel = voltageLevel
    CreateCableData = cd
End Function

