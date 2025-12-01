Attribute VB_Name = "PlatformCalculations"
Option Explicit

' 常量定义 - 材料参数
Public Const CHANNEL_STEEL_14 As Double = 14.535 ' 14#槽钢理论重量 (kg/m)
Public Const RAILING_WEIGHT As Double = 2.42 ' φ32X3.5钢管理论重量 (kg/m)
Public Const FLAT_IRON_WEIGHT As Double = 0.942 ' 30X4扁铁理论重量 (kg/m)

' 材料选型函数
Public Function SelectMaterial(ByVal equipmentWeight As Double, ByVal isSquareTube As Boolean) As Variant
    Dim materialData(1 To 2, 1 To 4) As Variant ' 存储主材和次材信息
    
    ' 验证输入参数
    If equipmentWeight < 0 Then
        MsgBox "设备重量不能为负数", vbExclamation
        Exit Function
    End If
    
    ' 根据设备重量选型
    If equipmentWeight <= 1000 Then
        ' 轻型平台
        If isSquareTube Then
            materialData(1, 1) = "焊接方管": materialData(1, 2) = "100×100×4": materialData(1, 3) = 11.73 ' kg/m
            materialData(2, 1) = "焊接方管": materialData(2, 2) = "80×80×3.5": materialData(2, 3) = 8.38 ' kg/m
        Else
            materialData(1, 1) = "槽钢": materialData(1, 2) = "14#": materialData(1, 3) = 14.535 ' kg/m
            materialData(2, 1) = "槽钢": materialData(2, 2) = "12#": materialData(2, 3) = 12.059 ' kg/m
        End If
    ElseIf equipmentWeight <= 3000 Then
        ' 中型平台
        If isSquareTube Then
            materialData(1, 1) = "焊接方管": materialData(1, 2) = "120×120×5": materialData(1, 3) = 17.85 ' kg/m
            materialData(2, 1) = "焊接方管": materialData(2, 2) = "100×100×4": materialData(2, 3) = 11.73 ' kg/m
        Else
            materialData(1, 1) = "槽钢": materialData(1, 2) = "16#": materialData(1, 3) = 17.24 ' kg/m
            materialData(2, 1) = "槽钢": materialData(2, 2) = "14#": materialData(2, 3) = 14.535 ' kg/m
        End If
    Else
        ' 重型平台
        If isSquareTube Then
            materialData(1, 1) = "焊接方管": materialData(1, 2) = "150×150×6": materialData(1, 3) = 26.39 ' kg/m
            materialData(2, 1) = "焊接方管": materialData(2, 2) = "120×120×5": materialData(2, 3) = 17.85 ' kg/m
        Else
            materialData(1, 1) = "槽钢": materialData(1, 2) = "18#": materialData(1, 3) = 20.17 ' kg/m
            materialData(2, 1) = "槽钢": materialData(2, 2) = "16#": materialData(2, 3) = 17.24 ' kg/m
        End If
    End If
    
    SelectMaterial = materialData
End Function

' 平台主结构计算
Public Function CalculatePlatformStructure(ByVal length As Double, ByVal width As Double, _
                                         ByVal height As Double, ByVal equipmentWeight As Double, _
                                         ByVal isSquareTube As Boolean) As Variant
    ' 定义返回数组
    Dim materials(1 To 11, 1 To 4) As Variant
    Dim i As Integer, j As Integer
    
    ' 初始化数组
    For i = 1 To 11
        For j = 1 To 4
            materials(i, j) = ""
        Next j
    Next i
    
    ' 验证输入参数（防止无效值）
    If length <= 0 Or width <= 0 Or height <= 0 Then
        MsgBox "平台尺寸必须为正数", vbExclamation
        CalculatePlatformStructure = materials
        Exit Function
    End If
    
    ' 材料选型
    Dim materialData As Variant
    materialData = SelectMaterial(equipmentWeight, isSquareTube)
    If IsEmpty(materialData) Then
        CalculatePlatformStructure = materials
        Exit Function
    End If
    
    ' 1. 主梁计算（2根）
    Dim mainBeamLength As Double
    mainBeamLength = length * 2 ' 两根主梁
    
    materials(1, 1) = "主梁(" & materialData(1, 1) & ")"
    materials(1, 2) = materialData(1, 2)
    materials(1, 3) = Format(mainBeamLength, "0.000") & " m"
    materials(1, 4) = Format(mainBeamLength * materialData(1, 3), "0.00") & " kg"
    
    ' 2. 次梁计算（间距不超过1.2m）
    Dim secondaryBeamCount As Long
    On Error Resume Next ' 防止RoundUp出错
    secondaryBeamCount = Application.WorksheetFunction.RoundUp(width / 1.2, 0)
    On Error GoTo 0
    
    ' 确保次梁数量至少为2根
    secondaryBeamCount = IIf(secondaryBeamCount < 2, 2, secondaryBeamCount)
    
    materials(2, 1) = "次梁(" & materialData(2, 1) & ")"
    materials(2, 2) = materialData(2, 2)
    materials(2, 3) = Format(secondaryBeamCount * width, "0.000") & " m"
    materials(2, 4) = Format(secondaryBeamCount * width * materialData(2, 3), "0.00") & " kg"
    
    ' 3. 立柱计算（间距不超过2.5m）
    Dim columnCount As Long
    On Error Resume Next ' 防止RoundUp出错
    columnCount = Application.WorksheetFunction.RoundUp(length / 2.5, 0) * 2
    On Error GoTo 0
    
    ' 确保立柱数量至少为4根（矩形平台最少4角各1根）
    columnCount = IIf(columnCount < 4, 4, columnCount)
    
    materials(3, 1) = "立柱(" & materialData(1, 1) & ")"
    materials(3, 2) = materialData(1, 2)
    materials(3, 3) = columnCount & " 根, " & Format(height, "0.000") & " m/根"
    materials(3, 4) = Format(columnCount * height * materialData(1, 3), "0.00") & " kg"
    
    ' 4. 平台面板 (4mm花纹钢板)
    materials(4, 1) = "平台面板"
    materials(4, 2) = "4mm花纹钢板"
    materials(4, 3) = Format(length * width, "0.000") & " m2"
    materials(4, 4) = Format(length * width * 31.4, "0.00") & " kg" ' 4mm花纹钢板31.4kg/m2
    
    ' 5. 连接角钢 (50×50×5)
    materials(5, 1) = "连接角钢"
    materials(5, 2) = "50×50×5"
    materials(5, 3) = Format(columnCount * 0.5, "0.000") & " m" ' 每根立柱约0.5m连接角钢
    materials(5, 4) = Format(columnCount * 0.5 * 3.77, "0.00") & " kg" ' 50×50×5角钢3.77kg/m
    
    ' 计算结构总重量（不包含设备重量）
    Dim totalWeight As Double
    totalWeight = 0
    For i = 1 To 5
        If IsNumeric(Left(materials(i, 4), Len(materials(i, 4)) - 3)) Then
            totalWeight = totalWeight + Val(Left(materials(i, 4), Len(materials(i, 4)) - 3))
        End If
    Next i
    
    ' 添加设计载荷说明（设备重量的60%）
    materials(6, 1) = "设计载荷(设备60%)"
    materials(6, 2) = ""
    materials(6, 3) = Format(equipmentWeight * 0.6, "0.00") & " kg"
    materials(6, 4) = ""
    
    materials(7, 1) = "平台结构总重量"
    materials(7, 2) = "不含设备重量"
    materials(7, 3) = ""
    materials(7, 4) = Format(totalWeight, "0.00") & " kg"
    
    ' 添加数量统计
    materials(8, 1) = "数量统计"
    materials(8, 2) = ""
    materials(8, 3) = ""
    materials(8, 4) = ""
    
    materials(9, 1) = "主梁数量"
    materials(9, 2) = "2 根"
    materials(9, 3) = Format(length, "0.000") & " m/根"
    materials(9, 4) = ""
    
    materials(10, 1) = "次梁数量"
    materials(10, 2) = secondaryBeamCount & " 根"
    materials(10, 3) = Format(width, "0.000") & " m/根"
    materials(10, 4) = ""
    
    materials(11, 1) = "立柱数量"
    materials(11, 2) = columnCount & " 根"
    materials(11, 3) = Format(height, "0.000") & " m/根"
    materials(11, 4) = ""
    
    CalculatePlatformStructure = materials
End Function

' 计算钢材总重量
' 参数:
'   platformMaterials - 平台结构材料数据数组（包含重量信息）
'   guardrailMaterials - 护栏材料数据数组（包含重量信息）
'   stairWeight - 楼梯总重量(kg)
' 返回: 所有结构的总重量(kg)
Public Function CalculateTotalWeight(ByVal platformMaterials As Variant, _
                                   ByVal guardrailMaterials As Variant, _
                                   ByVal stairWeight As Double) As Double
    Dim totalWeight As Double  ' 总重量变量，用于累加各部分重量
    Dim i As Integer           ' 循环计数器
    
    ' 1. 累加平台结构重量
    ' 检查平台材料数组是否有效（非空）
    If Not IsEmpty(platformMaterials) Then
        ' 遍历平台材料数组，查找"平台结构总重量"行
        For i = 1 To UBound(platformMaterials, 1)
            ' 找到标记行时提取重量值
            If platformMaterials(i, 1) = "平台结构总重量" Then
                ' 从单元格提取数值（去除末尾的" kg"单位）并累加
                totalWeight = totalWeight + Val(Left(platformMaterials(i, 4), Len(platformMaterials(i, 4)) - 3))
                Exit For  ' 找到后退出循环，提高效率
            End If
        Next i
    End If
    
    ' 2. 累加护栏重量
    ' 检查护栏材料数组是否有效（非空）
    If Not IsEmpty(guardrailMaterials) Then
        ' 遍历护栏材料数组，查找"总计"行
        For i = 1 To UBound(guardrailMaterials, 1)
            ' 找到标记行时提取重量值
            If guardrailMaterials(i, 1) = "总计" Then
                ' 从单元格提取数值（去除末尾的" kg"单位）并累加
                totalWeight = totalWeight + Val(Left(guardrailMaterials(i, 4), Len(guardrailMaterials(i, 4)) - 3))
                Exit For  ' 找到后退出循环，提高效率
            End If
        Next i
    End If
    
    ' 3. 累加楼梯重量（直接使用传入的计算好的楼梯总重量）
    totalWeight = totalWeight + stairWeight
    
    ' 返回计算得到的总重量
    CalculateTotalWeight = totalWeight
End Function

