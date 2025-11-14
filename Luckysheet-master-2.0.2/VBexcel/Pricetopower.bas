Attribute VB_Name = "Pricetopower"
' 在标准模块中（例如 modBeltSupportCalculations）添加以下代码

' 定义皮带价格和功率结构
Public Type BeltSpec
    width As Integer
    BasePrice As Currency    ' 10米基础价格
    PricePerMeter As Currency ' 每增加一米的价格
    DiscountPerMeter As Currency ' 每减少一米的折扣
    Power10m As Double       ' 10米时的功率(KW)
    Power15m As Double       ' 15米时的功率(KW)
    Power20m As Double       ' 20米时的功率(KW)
    Power30m As Double       ' 30米时的功率(KW)
End Type

' 初始化皮带规格数组
Public Function InitializeBeltSpecs() As BeltSpec()
    Dim specs(3) As BeltSpec
    
    ' B500皮带
    specs(0).width = 500
    specs(0).BasePrice = 17000
    specs(0).PricePerMeter = 600
    specs(0).DiscountPerMeter = 500
    specs(0).Power10m = 2.2
    
    ' B650皮带
    specs(1).width = 650
    specs(1).BasePrice = 19000
    specs(1).PricePerMeter = 650
    specs(1).DiscountPerMeter = 500
    specs(1).Power10m = 3
    
    ' B800皮带
    specs(2).width = 800
    specs(2).BasePrice = 23000
    specs(2).PricePerMeter = 1000
    specs(2).DiscountPerMeter = 800
    specs(2).Power10m = 4
    
    ' B1000皮带
    specs(3).width = 1000
    specs(3).BasePrice = 30000
    specs(3).PricePerMeter = 1200
    specs(3).DiscountPerMeter = 1000
    specs(3).Power10m = 5.5
    specs(3).Power15m = 7.5
    specs(3).Power20m = 11
    specs(3).Power30m = 15
    
    InitializeBeltSpecs = specs
End Function

' 获取皮带价格
Public Function GetBeltPrice(ByVal beltWidth As Integer, ByVal length As Double) As Currency
    Dim specs() As BeltSpec
    Dim i As Integer
    Dim price As Currency
    
    specs = InitializeBeltSpecs()
    
    ' 查找匹配的皮带规格
    For i = LBound(specs) To UBound(specs)
        If specs(i).width = beltWidth Then
            ' 计算价格
            If length >= 10 Then
                price = specs(i).BasePrice + (length - 10) * specs(i).PricePerMeter
            Else
                price = specs(i).BasePrice - (10 - length) * specs(i).DiscountPerMeter
            End If
            GetBeltPrice = price
            Exit Function
        End If
    Next i
    
    ' 如果没有找到匹配的规格，返回0
    GetBeltPrice = 0
End Function

' 定义标准功率规格数组
Public Function GetStandardPowers() As Variant
    GetStandardPowers = Array(0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90, 110)
End Function

' 获取下一个标准功率
Public Function GetNextStandardPower(currentPower As Double) As Double
    Dim powers() As Variant
    Dim i As Integer
    
    powers = GetStandardPowers()
    
    For i = LBound(powers) To UBound(powers)
        If powers(i) > currentPower Then
            GetNextStandardPower = powers(i)
            Exit Function
        End If
    Next i
    
    ' 如果当前功率已经大于最大标准功率，则返回最大标准功率
    GetNextStandardPower = powers(UBound(powers))
End Function

' 找到最接近的标准功率
Public Function FindClosestStandardPower(power As Double) As Double
    Dim powers() As Variant
    Dim i As Integer
    Dim closestPower As Double
    Dim minDiff As Double
    
    powers = GetStandardPowers()
    closestPower = powers(LBound(powers))
    minDiff = Abs(power - closestPower)
    
    For i = LBound(powers) + 1 To UBound(powers)
        If Abs(power - powers(i)) < minDiff Then
            minDiff = Abs(power - powers(i))
            closestPower = powers(i)
        End If
    Next i
    
    FindClosestStandardPower = closestPower
End Function

' 获取皮带功率
Public Function GetBeltPower(ByVal beltWidth As Integer, ByVal length As Double, ByVal beltAngle As Double) As Double
    Dim specs() As BeltSpec
    Dim i As Integer, j As Integer
    Dim basePower As Double
    Dim adjustedPower As Double
    
    specs = InitializeBeltSpecs()
    
    ' 查找匹配的皮带规格
    For i = LBound(specs) To UBound(specs)
        If specs(i).width = beltWidth Then
            ' 根据长度确定基础功率
            If length <= 10 Then
                basePower = specs(i).Power10m
            ElseIf length <= 15 Then
                If specs(i).Power15m > 0 Then
                    basePower = specs(i).Power15m
                Else
                    basePower = specs(i).Power10m * (1 + (length - 10) * 0.05)
                End If
            ElseIf length <= 20 Then
                If specs(i).Power20m > 0 Then
                    basePower = specs(i).Power20m
                Else
                    basePower = specs(i).Power10m * (1 + (length - 10) * 0.05)
                End If
            ElseIf length <= 30 Then
                If specs(i).Power30m > 0 Then
                    basePower = specs(i).Power30m
                Else
                    basePower = specs(i).Power10m * (1 + (length - 10) * 0.05)
                End If
            Else
                ' 超过30米
                If specs(i).Power30m > 0 Then
                    basePower = specs(i).Power30m * (1 + (length - 30) * 0.03)
                Else
                    basePower = specs(i).Power10m * (1 + (length - 10) * 0.05)
                End If
            End If
            Exit For
        End If
    Next i
    
    ' 如果没有找到匹配的规格，则使用默认值0
    If basePower = 0 Then
        ' 设置默认基础功率
        basePower = beltWidth / 1000 * 5.5 ' 例如，每毫米宽度5.5W
    End If
    
    ' 角度修正：大角度(>15°)需要加大一号功率
    If beltAngle > 15 Then
        adjustedPower = GetNextStandardPower(basePower)
    Else
        adjustedPower = basePower
    End If
    
    ' 确保功率不超过皮带最大承载能力
    Select Case beltWidth
        Case 500: adjustedPower = Application.WorksheetFunction.Min(adjustedPower, 7.5)
        Case 650: adjustedPower = Application.WorksheetFunction.Min(adjustedPower, 11)
        Case 800: adjustedPower = Application.WorksheetFunction.Min(adjustedPower, 15)
        Case 1000: adjustedPower = Application.WorksheetFunction.Min(adjustedPower, 30)
        Case 1200: adjustedPower = Application.WorksheetFunction.Min(adjustedPower, 45)
    End Select
    
    ' 返回最接近的标准功率
    GetBeltPower = FindClosestStandardPower(adjustedPower)
End Function
