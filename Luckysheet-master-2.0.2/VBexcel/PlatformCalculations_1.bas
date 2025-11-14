Attribute VB_Name = "PlatformCalculations_1"

' ========================
' 模块名称: PlatformCalculations_1
' 更新：禁用单元格标号，使用有意义的变量名
' ========================
Public Function CalculatePlatformMaterials(diameter As Double, length As Double, width As Double) As Variant
    Dim results(1 To 16) As Variant ' 扩展结果数组以包含重量信息
    
    ' 1. 计算平台横撑数量
    Dim numCrossBracing As Integer
    numCrossBracing = Application.WorksheetFunction.RoundUp((length + 700) / 900, 0) + 1
    
    ' 2. 计算两边平台槽钢用量
    Dim sideChannelLength As Double
    Dim diagonalFactor As Double: diagonalFactor = Sqr(width ^ 2 * 2)
    Dim lengthFactor As Integer: lengthFactor = Application.WorksheetFunction.Round(length / 3000 + 1, 0)
    sideChannelLength = numCrossBracing * width + (length + 800) + diagonalFactor * lengthFactor * 2
    
    ' 3. 计算两边平台角铁用量
    Dim sideAngleLength As Double: sideAngleLength = numCrossBracing * width
    
    ' 4. 计算前平台槽钢用量
    Dim frontPlatformWidth As Double: frontPlatformWidth = diameter + 300 + width * 2
    Dim frontChannelLength As Double
    frontChannelLength = Application.WorksheetFunction.RoundUp(frontPlatformWidth / 500, 0) * 700 + frontPlatformWidth
    
    ' 5. 计算后平台槽钢用量
    Dim rearChannelLength As Double
    Dim rearSupportFactor As Double: rearSupportFactor = (Sqr(diameter) / 4 * 100 + 1000)
    Dim rearSupportCount As Integer: rearSupportCount = Application.WorksheetFunction.RoundUp(frontPlatformWidth / 700 + 1, 0)
    rearChannelLength = frontPlatformWidth * 3 + rearSupportFactor * rearSupportCount + _
                       Sqr(Application.WorksheetFunction.SumSq(diameter / 2, rearSupportFactor)) * 4
    
    ' 6. 计算花纹板面积
    Dim plateArea As Double
    Dim rearPlatformArea As Double: rearPlatformArea = frontPlatformWidth * rearSupportFactor
    plateArea = ((length + 800) * width * 2 + frontPlatformWidth * 700 + rearPlatformArea) / 1000000
    
    ' 7. 计算材料重量 (单位: kg)
    Const channelUnitWeight As Double = 12.059 ' 12#槽钢单位重量 (kg/m)
    Const angleUnitWeight As Double = 3.77     ' L50×5角钢单位重量 (kg/m)
    Const plateUnitWeight As Double = 25.6     ' 3mm花纹板单位重量 (kg/m2)
    
    Dim sideChannelWeight As Double: sideChannelWeight = (sideChannelLength / 1000) * channelUnitWeight
    Dim sideAngleWeight As Double: sideAngleWeight = (sideAngleLength / 1000) * angleUnitWeight
    Dim frontChannelWeight As Double: frontChannelWeight = (frontChannelLength / 1000) * channelUnitWeight
    Dim rearChannelWeight As Double: rearChannelWeight = (rearChannelLength / 1000) * channelUnitWeight
    Dim plateWeight As Double: plateWeight = plateArea * plateUnitWeight
    
    ' 计算平台总重量
    Dim platformTotalWeight As Double
    platformTotalWeight = sideChannelWeight + sideAngleWeight + frontChannelWeight + _
                          rearChannelWeight + plateWeight
    
    ' 返回结果数组
    results(1) = numCrossBracing
    results(2) = Format(sideChannelLength / 1000, "0.00") & " m"
    results(3) = Format(sideAngleLength / 1000, "0.00") & " m"
    results(4) = Format(frontChannelLength / 1000, "0.00") & " m"
    results(5) = Format(rearChannelLength / 1000, "0.00") & " m"
    results(6) = Format(plateArea, "0.00") & " m2"
    
    ' 材料规格
    results(7) = "槽钢 [12]"        ' 主梁材料更新为12#
    results(8) = "角钢 [L50×5]"
    results(9) = "花纹板 δ=3mm"
    results(10) = "Q235B"
    
    ' 重量信息
    results(11) = Format(sideChannelWeight, "0.00") & " kg"
    results(12) = Format(sideAngleWeight, "0.00") & " kg"
    results(13) = Format(frontChannelWeight, "0.00") & " kg"
    results(14) = Format(rearChannelWeight, "0.00") & " kg"
    results(15) = Format(plateWeight, "0.00") & " kg"
    results(16) = Format(platformTotalWeight, "0.00") & " kg"
    
    CalculatePlatformMaterials = results
End Function


