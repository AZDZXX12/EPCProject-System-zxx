Attribute VB_Name = "LadderCalculations"
' 标准模块：LadderCalculations
Option Explicit

' 计算平台数量 - GB4053.1-2009要求
Public Function CalculatePlatformCount(ByVal height As Double) As Integer
    ' 平台均布架设，每6m设置一个平台
    If height <= 6000 Then
        CalculatePlatformCount = 0
    Else
        CalculatePlatformCount = Int(height / 6000)
    End If
End Function

' 计算平台架设高度
Public Function CalculatePlatformHeights(ByVal height As Double, ByVal platformCount As Integer) As Variant
    Dim heights() As Double
    ReDim heights(1 To platformCount)
    
    Dim i As Integer
    For i = 1 To platformCount
        heights(i) = i * 6000 ' 每6m设置一个平台
    Next i
    
    CalculatePlatformHeights = heights
End Function

' 计算踏棍间距 - GB4053.1-2009要求
Public Function CalculateRungSpacing(ByVal height As Double) As Double
    ' GB4053.1-2009规定：踏棍间距应为225mm~300mm
    ' 根据高度自动选择合适的间距
    If height <= 3000 Then
        CalculateRungSpacing = 300
    ElseIf height <= 6000 Then
        CalculateRungSpacing = 275
    Else
        CalculateRungSpacing = 250
    End If
End Function

' 计算钢材用量 - 符合GB4053.1-2009
Public Function CalculateMaterials(ByVal height As Double, ByVal width As Double, ByVal hasCage As Boolean) As Variant
    Dim materials(1 To 15, 1 To 4) As Variant ' 存储材料明细
    
    ' 计算基本参数
    Dim platformCount As Integer
    platformCount = CalculatePlatformCount(height)
    
    Dim rungSpacing As Double
    rungSpacing = CalculateRungSpacing(height)
    
    Dim rungCount As Long
    rungCount = Application.WorksheetFunction.RoundUp(height / rungSpacing, 0)
    
    ' 1. 梯梁角铁 (两侧) - 更新为角铁
    materials(1, 1) = "梯梁角铁"
    materials(1, 2) = "63×63×6"
    materials(1, 3) = Format(height / 1000 * 2, "0.000") & " m"
    materials(1, 4) = Format((height / 1000 * 2) * 5.72, "0.00") & " kg" ' 63×63×6角铁理论重量5.72kg/m
    
    ' 2. 踏棍 - φ32×3.5钢管
    Dim rungWeightPerM As Double
    rungWeightPerM = 3.13 ' φ32×3.5钢管重量：3.13 kg/m
    Dim rungTotalWeight As Double
    rungTotalWeight = rungCount * (width / 1000) * rungWeightPerM
    
    materials(2, 1) = "踏棍"
    materials(2, 2) = "φ32×3.5钢管"
    materials(2, 3) = rungCount & " 根"
    materials(2, 4) = Format(rungTotalWeight, "0.00") & " kg"
    
    ' 3. 连接角钢
    materials(3, 1) = "连接角钢"
    materials(3, 2) = "50×50×5"
    materials(3, 3) = Format((height / 1000) * 4, "0.000") & " m"
    materials(3, 4) = Format((height / 1000) * 4 * 3.77, "0.00") & " kg"
    
    ' 4. 平台材料 (使用12#槽钢)
    If platformCount > 0 Then
        ' 4.1 平台框架 (12#槽钢)
        '平台框架重量(kg) = 平台数量 × 梯宽(m) × 4 × 12.059
        materials(4, 1) = "平台框架"
        materials(4, 2) = "12#槽钢"
        materials(4, 3) = Format(platformCount * (width / 1000) * 4, "0.000") & " m" ' 4边
        materials(4, 4) = Format(platformCount * (width / 1000) * 4 * 12.059, "0.00") & " kg" ' 12#槽钢理论重量12.059kg/m
        
        ' 4.2 平台面板
        materials(5, 1) = "平台面板"
        materials(5, 2) = "4mm花纹钢板"
        materials(5, 3) = Format(platformCount * (width / 1000) * (width / 1000), "0.000") & " m2"
        materials(5, 4) = Format(platformCount * (width / 1000) * (width / 1000) * 31.4, "0.00") & " kg"
        
        ' 4.3 平台护栏立杆 (30×4扁铁)
        materials(6, 1) = "平台护栏立杆"
        materials(6, 2) = "30×4扁铁"
        materials(6, 3) = Format(platformCount * 4, "0") & " 根" ' 每个平台4根立杆
        materials(6, 4) = Format(platformCount * 4 * 1# * 0.942, "0.00") & " kg"  ' 按1m高计算
        
        ' 4.4 平台护栏横杆 (30×4扁铁)
        materials(7, 1) = "平台护栏横杆"
        materials(7, 2) = "30×4扁铁"
        materials(7, 3) = Format(platformCount * 2 * (width / 1000), "0.000") & " m" ' 每个平台2根横杆
        materials(7, 4) = Format(platformCount * 2 * (width / 1000) * 0.942, "0.00") & " kg"
    Else
        materials(4, 1) = "平台框架"
        materials(4, 2) = "无"
        materials(4, 3) = "0 m"
        materials(4, 4) = "0 kg"
        
        materials(5, 1) = "平台面板"
        materials(5, 2) = "无"
        materials(5, 3) = "0 m2"
        materials(5, 4) = "0 kg"
        
        materials(6, 1) = "平台护栏立杆"
        materials(6, 2) = "无"
        materials(6, 3) = "0 根"
        materials(6, 4) = "0 kg"
        
        materials(7, 1) = "平台护栏横杆"
        materials(7, 2) = "无"
        materials(7, 3) = "0 m"
        materials(7, 4) = "0 kg"
    End If
    
    ' 5. 护笼材料 - 30×4扁铁
    If hasCage Then
        ' 护笼高度：从2.0m开始到顶部
        Dim cageHeight As Double
        cageHeight = height - 2000
        If cageHeight < 0 Then cageHeight = 0
        
        ' 护笼立杆间距不大于300mm
        Dim cagePoleCount As Long
        cagePoleCount = Application.WorksheetFunction.RoundUp(cageHeight / 300, 0) * 2
        
        ' 30×4扁铁重量：0.942 kg/m
        Dim flatIronWeightPerM As Double
        flatIronWeightPerM = 0.942
        
        materials(8, 1) = "护笼立杆"
        materials(8, 2) = "30×4扁铁"
        materials(8, 3) = Format(cagePoleCount * (cageHeight / 1000), "0.000") & " m"
        materials(8, 4) = Format(cagePoleCount * (cageHeight / 1000) * flatIronWeightPerM, "0.00") & " kg"
        
        ' 护笼环筋间距不大于1500mm
        Dim cageRingCount As Long
        cageRingCount = Application.WorksheetFunction.RoundUp(cageHeight / 1500, 0)
        
        Dim ringLengthPerLevel As Double
        ringLengthPerLevel = (width / 1000) * 2 ' 每层环筋长度
        
        materials(9, 1) = "护笼环筋"
        materials(9, 2) = "30×4扁铁"
        materials(9, 3) = Format(cageRingCount * ringLengthPerLevel, "0.000") & " m"
        materials(9, 4) = Format(cageRingCount * ringLengthPerLevel * flatIronWeightPerM, "0.00") & " kg"
    Else
        materials(8, 1) = "护笼立杆"
        materials(8, 2) = "无"
        materials(8, 3) = "0 m"
        materials(8, 4) = "0 kg"
        
        materials(9, 1) = "护笼环筋"
        materials(9, 2) = "无"
        materials(9, 3) = "0 m"
        materials(9, 4) = "0 kg"
    End If
    
    ' 10. 其他材料
    materials(10, 1) = "连接螺栓"
    materials(10, 2) = "M16"
    materials(10, 3) = Format(rungCount * 4 + platformCount * 16, "0") & " 套"
    materials(10, 4) = "按实际计算"
    
    materials(11, 1) = "防锈漆"
    materials(11, 2) = "醇酸漆"
    materials(11, 3) = Format((height / 1000 * 2 * 0.15) + (rungCount * (width / 1000 + 0.1) * 0.05), "0.00") & " m2"
    materials(11, 4) = "按实际计算"
    
    ' 计算总重量
    Dim totalWeight As Double
    totalWeight = 0
    Dim i As Integer
    For i = 1 To 9
        If IsNumeric(Left(materials(i, 4), Len(materials(i, 4)) - 3)) Then
            totalWeight = totalWeight + Val(Left(materials(i, 4), Len(materials(i, 4)) - 3))
        End If
    Next i
    
    materials(12, 1) = "总计"
    materials(12, 2) = "所有材料"
    materials(12, 3) = ""
    materials(12, 4) = Format(totalWeight, "0.00") & " kg"
    
    ' 平台高度明细
    If platformCount > 0 Then
        Dim platformHeights As Variant
        platformHeights = CalculatePlatformHeights(height, platformCount)
        
        For i = 1 To platformCount
            materials(12 + i, 1) = "平台" & i & "高度"
            materials(12 + i, 2) = Format(platformHeights(i) / 1000, "0.000") & " m"
            materials(12 + i, 3) = ""
            materials(12 + i, 4) = ""
        Next i
    End If
    
    CalculateMaterials = materials
End Function

' 检查是否需要护笼 - GB4053.1-2009要求
Public Function CheckCageRequirement(ByVal height As Double, ByVal hasCage As Boolean) As Boolean
    ' GB4053.1-2009规定：爬梯高度超过3m时应设护笼
    If height > 3000 And Not hasCage Then
        CheckCageRequirement = True
    Else
        CheckCageRequirement = False
    End If
End Function
