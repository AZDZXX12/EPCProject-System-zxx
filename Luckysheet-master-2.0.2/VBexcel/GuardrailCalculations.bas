Attribute VB_Name = "GuardrailCalculations"
'GuardrailCalculations模块
Option Explicit

' 计算立柱数量
Public Function CalculatePostCount(ByVal length As Double) As Long
    ' GB4053.3-2009规定：立柱间距不应大于1.1m
    CalculatePostCount = Application.WorksheetFunction.RoundUp(length / 1.1, 0) + 1
End Function

' 计算横杆数量
Public Function CalculateRailCount(ByVal height As Double) As Long
    ' GB4053.3-2009规定：
    ' 当护栏高度≤1.05m时，至少设置2道横杆
    ' 当护栏高度>1.05m时，至少设置3道横杆
    If height <= 1.05 Then
        CalculateRailCount = 2
    Else
        CalculateRailCount = 3
    End If
End Function

' 计算钢材用量
Public Function CalculateGuardrailMaterials(ByVal length As Double, _
                                           ByVal height As Double, _
                                           ByVal isPlatform As Boolean) As Variant
    Dim materials(1 To 5, 1 To 4) As Variant
    
    ' 计算基本参数
    Dim postCount As Long
    postCount = CalculatePostCount(length)
    
    Dim railCount As Long
    railCount = CalculateRailCount(height)
    
    ' 1. 立柱 (φ32×3.5钢管)
    materials(1, 1) = "立柱"
    materials(1, 2) = "φ32×3.5钢管"
    materials(1, 3) = Format(postCount * height, "0.000") & " m"
    materials(1, 4) = Format(postCount * height * 3.13, "0.00") & " kg" ' φ32×3.5钢管3.13kg/m
    
    ' 2. 横杆 (φ32×3.5钢管)
    materials(2, 1) = "横杆"
    materials(2, 2) = "φ32×3.5钢管"
    materials(2, 3) = Format(railCount * length, "0.000") & " m"
    materials(2, 4) = Format(railCount * length * 3.13, "0.00") & " kg"
    
    ' 3. 连接扁铁 (30×4扁铁)
    Dim connectionLength As Double
    connectionLength = postCount * 0.2 * railCount ' 每个连接点约0.2m
    
    materials(3, 1) = "连接扁铁"
    materials(3, 2) = "30×4扁铁"
    materials(3, 3) = Format(connectionLength, "0.000") & " m"
    materials(3, 4) = Format(connectionLength * 0.942, "0.00") & " kg" ' 30×4扁铁0.942kg/m
    
    ' 4. 踢脚线 (仅平台护栏需要)
    If isPlatform Then
        materials(4, 1) = "踢脚线"
        materials(4, 2) = "100×4扁铁"
        materials(4, 3) = Format(length, "0.000") & " m"
        materials(4, 4) = Format(length * 3.14, "0.00") & " kg" ' 100×4扁铁3.14kg/m
    Else
        materials(4, 1) = "踢脚线"
        materials(4, 2) = "无"
        materials(4, 3) = "0 m"
        materials(4, 4) = "0 kg"
    End If
    
    ' 5. 其他连接件
    'materials(5, 1) = "连接螺栓"
    'materials(5, 2) = "M12"
    'materials(5, 3) = postCount * railCount * 2 & " 套"
   ' materials(5, 4) = "按实际计算"
    
    ' 计算总重量
    Dim totalWeight As Double
    totalWeight = 0
    Dim i As Integer
    For i = 1 To 4
        If IsNumeric(Left(materials(i, 4), Len(materials(i, 4)) - 3)) Then
            totalWeight = totalWeight + Val(Left(materials(i, 4), Len(materials(i, 4)) - 3))
        End If
    Next i
    
    materials(5, 1) = "总计"
    materials(5, 2) = "所有材料"
    materials(5, 3) = ""
    materials(5, 4) = Format(totalWeight, "0.00") & " kg"
    
    CalculateGuardrailMaterials = materials
End Function

' 检查护栏高度是否符合标准
Public Function CheckHeightRequirement(ByVal height As Double) As Boolean
    ' GB4053.3-2009规定：护栏高度不应小于1.05m
    If height < 1.05 Then
        CheckHeightRequirement = True ' 需要提示
    Else
        CheckHeightRequirement = False
    End If
End Function

