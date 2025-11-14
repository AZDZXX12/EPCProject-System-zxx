Attribute VB_Name = "LegCalculations"
Public Function CalculateLegMaterials(legCount As Integer, height As Double, diameter As Double) As Variant
    Dim materials(1 To 5) As Variant
    Dim legModel As String
    Dim unitWeight As Double
    Dim selectionLogic As String
    
    ' 根据支腿数量确定基础型号
    Dim baseModel As String
    Select Case legCount
        Case 4: baseModel = "重型"
        Case 6: baseModel = "中型"
        Case 8: baseModel = "标准型"
        Case Else: baseModel = "中型"
    End Select
    
    ' 根据高度确定型号增强
    Dim heightFactor As Integer
    heightFactor = 0
    If height > 4000 Then
        heightFactor = Int((height - 4000) / 1000)
    End If
    
    ' 根据滚筒直径确定型号增强
    Dim diameterFactor As Integer
    Select Case diameter
        Case 1200 To 1800: diameterFactor = 0
        Case 2000 To 2400: diameterFactor = 1
        Case 2600 To 2800: diameterFactor = 2
        Case Else: diameterFactor = 0
    End Select
    
    ' 总级别 = 基础型号 + 高度因子 + 直径因子
    Dim totalLevel As Integer: totalLevel = heightFactor + diameterFactor
    
    ' 最终型号选择
    Select Case baseModel
        Case "重型"
            Select Case totalLevel
                Case 0: legModel = "150×150×6"
                Case 1: legModel = "180×180×8"
                Case 2: legModel = "200×200×10"
                Case Else: legModel = "200×200×10"
            End Select
        Case "中型"
            Select Case totalLevel
                Case 0: legModel = "120×120×4"
                Case 1: legModel = "150×150×5"
                Case 2: legModel = "180×180×6"
                Case Else: legModel = "180×180×6"
            End Select
        Case "标准型"
            Select Case totalLevel
                Case 0: legModel = "100×100×4"
                Case 1: legModel = "120×120×5"
                Case 2: legModel = "150×150×6"
                Case Else: legModel = "150×150×6"
            End Select
    End Select
    
    ' 方管单位重量 (kg/m)
    Select Case legModel
        Case "100×100×4": unitWeight = 11.75
        Case "120×120×4": unitWeight = 14.1
        Case "120×120×5": unitWeight = 17.2
        Case "150×150×5": unitWeight = 22.8
        Case "150×150×6": unitWeight = 27.2
        Case "180×180×6": unitWeight = 33#
        Case "180×180×8": unitWeight = 43.2
        Case "200×200×10": unitWeight = 59.5
    End Select
    
    Dim totalLength As Double: totalLength = legCount * height / 1000
    Dim totalWeight As Double: totalWeight = totalLength * unitWeight
    
    ' 构建选型逻辑说明
    selectionLogic = legCount & "条支腿(" & baseModel & "), "
    'selectionLogic = selectionLogic & "高度" & Format(height / 1000, "0.0") & "m"
    'If height > 4000 Then
        'selectionLogic = selectionLogic & "(+" & heightFactor & "级)"
    'End If
    'selectionLogic = selectionLogic & ", 直径" & Format(diameter / 1000, "0.0") & "m"
    'If diameterFactor > 0 Then
        'selectionLogic = selectionLogic & "(+" & diameterFactor & "级)"
    'End If
    
    materials(1) = legModel
    materials(2) = Format(totalLength, "0.00") & " m"
    materials(3) = Format(unitWeight, "0.00") & " kg/m"
    materials(4) = Format(totalWeight, "0.00") & " kg"
    materials(5) = selectionLogic
    
    CalculateLegMaterials = materials
End Function



