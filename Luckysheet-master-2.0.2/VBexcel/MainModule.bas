Attribute VB_Name = "MainModule"
' MainModule.bas
Option Explicit

' 主计算函数 - 基于运行电流选择电缆，验证启动电压降
Public Function CalculateCableSection(cableLength As Double, motorPower As Double, startMethod As String, _
                              installationType As String, voltage As Double, coreCount As Integer) As String
    ' 验证启动方式是否适合电机功率
    Dim startMethodValid As Boolean
    startMethodValid = ValidateStartMethod(motorPower, startMethod)
    
    If Not startMethodValid Then
        CalculateCableSection = "启动方式与电机功率不匹配：" & GetStartMethodRecommendation(motorPower)
        Exit Function
    End If
    
    ' 获取电机的功率因数和效率
    Dim motorParams As Variant
    motorParams = GetMotorEfficiencyAndPowerFactor(motorPower)
    Dim efficiency As Double: efficiency = motorParams(0)
    Dim powerFactor As Double: powerFactor = motorParams(1)
    
    ' 计算额定电流
    Dim ratedCurrent As Double
    Dim voltage_1 As Double
    If voltage = 0.6 Then
        voltage_1 = 0.4
    Else
        voltage_1 = 6
    End If
    ratedCurrent = motorPower * 1000 / (voltage_1 * 1000 * 1.732 * powerFactor * efficiency)
    
 ' 根据启动方式计算启动电流（用于验证电压降）
    Dim startCurrent As Double
    Select Case startMethod
        Case "直接启动"
            startCurrent = ratedCurrent * 6 ' 直接启动电流为额定电流的6倍
        Case "星三角启动"
            startCurrent = ratedCurrent * 2 ' 星三角启动电流为额定电流的2倍
        Case "变频启动"
            startCurrent = ratedCurrent * 1.5 ' 变频启动电流为额定电流的1.5倍
    End Select
    
    ' 根据安装方式确定使用空气中还是土壤中的载流量
    Dim useAirCurrent As Boolean
    If installationType = "桥架铺设" Then
        useAirCurrent = True
    Else
        useAirCurrent = False
    End If
    
    ' 确定电压等级字符串
    Dim voltageLevel As String
    If voltage = 0.6 Then
        voltageLevel = "0.6/1KV"
    Else
        voltageLevel = "6/6KV"
    End If
    
    ' 确定芯数配置字符串
    Dim coreConfig As String
    If coreCount = 1 Then
        coreConfig = "1芯"
    ElseIf coreCount = 2 Then
        coreConfig = "2芯"
    ElseIf coreCount = 3 Then
        coreConfig = "3芯"
    ElseIf coreCount = 4 Then
        coreConfig = "4芯"
    ElseIf coreCount = 5 Then
        coreConfig = "5芯"
    ElseIf coreCount = 31 Then
        coreConfig = "3+1芯"
    ElseIf coreCount = 32 Then
        coreConfig = "3+2芯"
    ElseIf coreCount = 41 Then
        coreConfig = "4+1芯"
    End If
    
    ' 查找合适的电缆 - 基于运行电流选择
    Dim i As Long
    Dim selectedSection As Double
    selectedSection = 0
    Dim cableType As String
    cableType = "YJV" ' 默认类型
    
    ' 记录所有可能的电缆选项的索引
    Dim possibleOptions As Collection
    Set possibleOptions = New Collection
    
    ' 记录所有满足电流需求但被经验校验排除的电缆
    Dim excludedByExperience As Collection
    Set excludedByExperience = New Collection
    
    ' 记录所有不满足电流需求的电缆
    Dim insufficientCurrent As Collection
    Set insufficientCurrent = New Collection
    
    ' 首先根据运行电流需求选择电缆
    For i = 1 To CableCount
        If AllCables(i).voltageLevel = voltageLevel And _
           AllCables(i).coreConfig = coreConfig Then
           
            Dim currentCapacity As Double
            If useAirCurrent Then
                currentCapacity = AllCables(i).AirCurrent
            Else
                currentCapacity = AllCables(i).SoilCurrent
            End If
            
            ' 记录所有可能的选项
            If currentCapacity >= ratedCurrent Then
                possibleOptions.Add i ' 存储索引而不是对象
                
                ' 应用经验校验：确保选择的电缆截面符合工程实践
                If IsSectionReasonable(motorPower, AllCables(i).section) Then
                    If selectedSection = 0 Or AllCables(i).section < selectedSection Then
                        selectedSection = AllCables(i).section
                        cableType = AllCables(i).cableType
                    End If
                Else
                    ' 记录被经验校验排除的电缆
                    excludedByExperience.Add i
                End If
            Else
                ' 记录不满足电流需求的电缆
                insufficientCurrent.Add i
            End If
        End If
    Next i
  
    ' 如果找到了满足运行电流需求的电缆，检查启动电压降
    If selectedSection > 0 Then
        ' 提升电缆规格一个等级
        selectedSection = UpgradeCableSection(selectedSection)
        
        ' 计算启动电压降
        Dim startVoltageDrop As Double
        startVoltageDrop = CalculateVoltageDrop(cableLength, startCurrent, selectedSection, powerFactor, voltage)
        
        ' 计算运行电压降
        Dim runVoltageDrop As Double
        runVoltageDrop = CalculateVoltageDrop(cableLength, ratedCurrent, selectedSection, powerFactor, voltage)
        
        ' 根据启动方式设置不同的电压降允许值
        Dim maxVoltageDrop As Double
        Select Case startMethod
            Case "直接启动"
                maxVoltageDrop = 0.15 ' 直接启动允许15%的电压降
            Case "星三角启动"
                maxVoltageDrop = 0.1  ' 星三角启动允许10%的电压降
            Case "变频启动"
                maxVoltageDrop = 0.05 ' 变频启动允许5%的电压降
        End Select
        
        ' 如果启动电压降超过允许值，选择更大的截面
        If startVoltageDrop > maxVoltageDrop Then
            Dim largerSection As Double
            largerSection = FindLargerSectionForVoltageDrop(cableLength, startCurrent, selectedSection, powerFactor, voltage, voltageLevel, coreConfig, maxVoltageDrop)
            
            If largerSection > 0 Then
                selectedSection = largerSection
                ' 重新计算电压降
                startVoltageDrop = CalculateVoltageDrop(cableLength, startCurrent, selectedSection, powerFactor, voltage)
                runVoltageDrop = CalculateVoltageDrop(cableLength, ratedCurrent, selectedSection, powerFactor, voltage)
            Else
                ' 生成详细错误信息
                Dim errorMsg As String
                errorMsg = "启动电压降(" & Format(startVoltageDrop * 100, "0.00") & "%)超过允许值(" & Format(maxVoltageDrop * 100, "0.00") & "%)。" & vbCrLf & _
                          "计算参数：" & vbCrLf & _
                          "- 电机功率: " & motorPower & "kW" & vbCrLf & _
                          "- 额定电流: " & Format(ratedCurrent, "0.0") & "A" & vbCrLf & _
                          "- 启动电流: " & Format(startCurrent, "0.0") & "A (" & startMethod & ")" & vbCrLf & _
                          "- 安装方式: " & installationType & vbCrLf & _
                          "- 电压等级: " & voltage & "kV" & vbCrLf & _
                          "- 芯数配置: " & coreConfig & vbCrLf & _
                          "建议: 缩短电缆长度、增加电缆截面积或更改启动方式"
                
                CalculateCableSection = errorMsg
                Exit Function
            End If
        End If
    End If
    
    If selectedSection = 0 Then
        ' 生成详细错误信息，包括计算出的电流需求和可能的电缆截面
        Dim noCableMsg As String
        noCableMsg = "未找到合适的电缆。" & vbCrLf & _
                    "计算参数：" & vbCrLf & _
                    "- 电机功率: " & motorPower & "kW" & vbCrLf & _
                    "- 额定电流: " & Format(ratedCurrent, "0.0") & "A" & vbCrLf & _
                    "- 启动电流: " & Format(startCurrent, "0.0") & "A (" & startMethod & ")" & vbCrLf & _
                    "- 安装方式: " & installationType & vbCrLf & _
                    "- 电压等级: " & voltage & "kV" & vbCrLf & _
                    "- 芯数配置: " & coreConfig & vbCrLf & _
                    "建议的电缆截面范围: " & GetRecommendedSectionRange(motorPower) & "mm2"
        
        ' 添加详细诊断信息
        noCableMsg = noCableMsg & vbCrLf & vbCrLf & "诊断信息:"
        
        ' 如果有可能的选项（但截面不合理），也显示出来
        If possibleOptions.count > 0 Then
            noCableMsg = noCableMsg & vbCrLf & "可能的电缆选项（满足电流需求但截面可能过大）: "
            For i = 1 To possibleOptions.count
                Dim cableIndex As Long
                cableIndex = possibleOptions(i)
                noCableMsg = noCableMsg & FormatCableModelSimple(coreConfig, AllCables(cableIndex).section, voltageLevel, AllCables(cableIndex).cableType)
                If i < possibleOptions.count Then noCableMsg = noCableMsg & ", "
            Next i
        End If
        
        ' 显示被经验校验排除的电缆
        If excludedByExperience.count > 0 Then
            noCableMsg = noCableMsg & vbCrLf & "被经验校验排除的电缆: "
            For i = 1 To excludedByExperience.count
                cableIndex = excludedByExperience(i)
                noCableMsg = noCableMsg & FormatCableModelSimple(coreConfig, AllCables(cableIndex).section, voltageLevel, AllCables(cableIndex).cableType)
                If i < excludedByExperience.count Then noCableMsg = noCableMsg & ", "
            Next i
        End If
        
        ' 显示不满足电流需求的电缆
        If insufficientCurrent.count > 0 Then
            noCableMsg = noCableMsg & vbCrLf & "不满足电流需求的电缆: "
            For i = 1 To insufficientCurrent.count
                cableIndex = insufficientCurrent(i)
                noCableMsg = noCableMsg & FormatCableModelSimple(coreConfig, AllCables(cableIndex).section, voltageLevel, AllCables(cableIndex).cableType) & _
                            " (载流量: " & IIf(useAirCurrent, AllCables(cableIndex).AirCurrent, AllCables(cableIndex).SoilCurrent) & "A)"
                If i < insufficientCurrent.count Then noCableMsg = noCableMsg & ", "
            Next i
        End If
        
        ' 显示数据库中所有匹配电压等级和芯数配置的电缆
        noCableMsg = noCableMsg & vbCrLf & "数据库中匹配的电缆: "
        Dim matchCount As Integer
        matchCount = 0
        For i = 1 To CableCount
            If AllCables(i).voltageLevel = voltageLevel And _
               AllCables(i).coreConfig = coreConfig Then
                matchCount = matchCount + 1
                noCableMsg = noCableMsg & FormatCableModelSimple(coreConfig, AllCables(i).section, voltageLevel, AllCables(i).cableType)
                If matchCount < 5 Then ' 限制显示数量，避免信息过长
                    noCableMsg = noCableMsg & ", "
                Else
                    noCableMsg = noCableMsg & "..."
                    Exit For
                End If
            End If
        Next i
        
        CalculateCableSection = noCableMsg
    Else
        ' 格式化输出电缆型号
        Dim cableModel As String
        cableModel = FormatCableModel(coreConfig, selectedSection, voltageLevel, cableType)
        
        ' 重新计算电压降（确保使用最新的截面）
        startVoltageDrop = CalculateVoltageDrop(cableLength, startCurrent, selectedSection, powerFactor, voltage)
        runVoltageDrop = CalculateVoltageDrop(cableLength, ratedCurrent, selectedSection, powerFactor, voltage)
        
        CalculateCableSection = "推荐电缆: " & cableModel & _
                               " (长度: " & cableLength & "m)" & _
                               vbCrLf & "电压降分析：" & _
                               vbCrLf & "- 运行电压降: " & Format(runVoltageDrop * 100, "0.00") & "%" & _
                               vbCrLf & "- 启动电压降: " & Format(startVoltageDrop * 100, "0.00") & "% (" & startMethod & ")" & _
                               vbCrLf & "计算参数：" & _
                               vbCrLf & "- 电机功率: " & motorPower & "kW" & _
                               vbCrLf & "- 额定电流: " & Format(ratedCurrent, "0.0") & "A" & _
                               vbCrLf & "- 启动电流: " & Format(startCurrent, "0.0") & "A" & _
                               vbCrLf & "- 安装方式: " & installationType
    End If
End Function

' 简化电缆型号格式化函数（用于诊断信息）
Private Function FormatCableModelSimple(coreConfig As String, section As Double, voltageLevel As String, cableType As String) As String
    Dim model As String
    
    ' 根据芯数配置格式化输出
    Select Case coreConfig
        Case "1芯"
            model = cableType & " " & voltageLevel & " 1×" & section
        Case "2芯"
            model = cableType & " " & voltageLevel & " 2×" & section
        Case "3芯"
            model = cableType & " " & voltageLevel & " 3×" & section
        Case "4芯"
            model = cableType & " " & voltageLevel & " 4×" & section
        Case "5芯"
            model = cableType & " " & voltageLevel & " 5×" & section
        Case "3+1芯"
            ' 对于3+1芯电缆，需要确定零线截面（通常为主线的50-60%）
            Dim mainSection As Double
            Dim neutralSection As Double
            mainSection = section
            neutralSection = DetermineNeutralSection(mainSection)
            model = cableType & " " & voltageLevel & " 3×" & mainSection & "+1×" & neutralSection
        Case "3+2芯"
            ' 对于3+2芯电缆，需要确定零线和地线截面
            mainSection = section
            neutralSection = DetermineNeutralSection(mainSection)
            Dim earthSection As Double
            earthSection = DetermineEarthSection(mainSection)
            model = cableType & " " & voltageLevel & " 3×" & mainSection & "+2×" & neutralSection
        Case "4+1芯"
            ' 对于4+1芯电缆，需要确定零线截面
            mainSection = section
            neutralSection = DetermineNeutralSection(mainSection)
            model = cableType & " " & voltageLevel & " 4×" & mainSection & "+1×" & neutralSection
        Case Else
            model = cableType & " " & voltageLevel & " " & coreConfig & " " & section & "mm2"
    End Select
    
    FormatCableModelSimple = model
End Function
' 提升电缆规格一个等级
Private Function UpgradeCableSection(currentSection As Double) As Double
    ' 标准电缆截面序列
    Dim standardSections() As Variant
    standardSections = Array(1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400)
    
    Dim i As Integer
    For i = 0 To UBound(standardSections) - 1
        If currentSection = standardSections(i) Then
            UpgradeCableSection = standardSections(i + 1)
            Exit Function
        End If
    Next i
    
    ' 如果已经是最大规格，保持原样
    UpgradeCableSection = currentSection
End Function
' 验证启动方式是否适合电机功率
Private Function ValidateStartMethod(motorPower As Double, startMethod As String) As Boolean
    ValidateStartMethod = True
    
    Select Case startMethod
        Case "直接启动"
            If motorPower > 30 Then
                ValidateStartMethod = False
            End If
        Case "星三角启动"
            If motorPower < 15 Then
                ValidateStartMethod = False
            End If
        Case "变频启动"
            ' 无限制
        Case Else
            ValidateStartMethod = False
    End Select
End Function

' 获取启动方式推荐
Private Function GetStartMethodRecommendation(motorPower As Double) As String
    If motorPower <= 30 Then
        GetStartMethodRecommendation = "30kW以下电机推荐使用直接启动"
    ElseIf motorPower > 30 Then
        GetStartMethodRecommendation = "15kW以上电机推荐使用星三角启动或变频启动"
    Else
        GetStartMethodRecommendation = "请选择合适的启动方式"
    End If
End Function

' 查找满足电压降要求的更大截面电缆
Private Function FindLargerSectionForVoltageDrop(cableLength As Double, current As Double, currentSection As Double, _
                                                powerFactor As Double, voltage As Double, voltageLevel As String, _
                                                coreConfig As String, maxVoltageDrop As Double) As Double
    Dim i As Long
    Dim minSection As Double
    minSection = 0
    
    For i = 1 To CableCount
        If AllCables(i).voltageLevel = voltageLevel And _
           AllCables(i).coreConfig = coreConfig And _
           AllCables(i).section > currentSection Then
           
            Dim voltageDrop As Double
            voltageDrop = CalculateVoltageDrop(cableLength, current, AllCables(i).section, powerFactor, voltage)
            
            If voltageDrop <= maxVoltageDrop Then ' 电压降不超过允许值
                If minSection = 0 Or AllCables(i).section < minSection Then
                    minSection = AllCables(i).section
                End If
            End If
        End If
    Next i
    
    FindLargerSectionForVoltageDrop = minSection
End Function

' 获取推荐的电缆截面范围（根据电机功率和经验值）
Private Function GetRecommendedSectionRange(motorPower As Double) As String
    ' 根据电机功率和经验值推荐电缆截面范围
    Select Case motorPower
        Case 0 To 3
            GetRecommendedSectionRange = "1.5-4"
        Case 3.1 To 7.5
            GetRecommendedSectionRange = "2.5-6"
        Case 7.6 To 15
            GetRecommendedSectionRange = "6-10"
        Case 15.1 To 22
            GetRecommendedSectionRange = "10-16"
        Case 22.1 To 37
            GetRecommendedSectionRange = "16-25"
        Case 37.1 To 55
            GetRecommendedSectionRange = "25-35"
        Case 55.1 To 75
            GetRecommendedSectionRange = "35-50"
        Case 75.1 To 90
            GetRecommendedSectionRange = "50-70"
        Case 90.1 To 110
            GetRecommendedSectionRange = "70-95"
        Case 110.1 To 132
            GetRecommendedSectionRange = "95-120"
        Case 132.1 To 160
            GetRecommendedSectionRange = "120-150"
        Case 160.1 To 200
            GetRecommendedSectionRange = "150-185"
        Case Else
            GetRecommendedSectionRange = "185+"
    End Select
End Function

' 校验电缆截面是否合理（根据电机功率和经验值）
Private Function IsSectionReasonable(motorPower As Double, cableSection As Double) As Boolean
    ' 默认认为合理
    IsSectionReasonable = True
    
    ' 根据电机功率和经验值校验电缆截面
    Select Case motorPower
        Case 0 To 3
            ' 0-3kW电机通常使用1.5-4mm2电缆
            If cableSection > 4 Then IsSectionReasonable = False
        Case 3.1 To 7.5
            ' 3.1-7.5kW电机通常使用2.5-6mm2电缆
            If cableSection > 10 Then IsSectionReasonable = False
        Case 7.6 To 15
            ' 7.6-15kW电机通常使用6-10mm2电缆
            If cableSection > 16 Then IsSectionReasonable = False
        Case 15.1 To 22
            ' 15.1-22kW电机通常使用10-16mm2电缆
            If cableSection > 25 Then IsSectionReasonable = False
        Case 22.1 To 37
            ' 22.1-37kW电机通常使用16-25mm2电缆
            If cableSection > 35 Then IsSectionReasonable = False
        Case 37.1 To 55
            ' 37.1-55kW电机通常使用25-35mm2电缆
            If cableSection > 50 Then IsSectionReasonable = False
        Case 55.1 To 75
            ' 55.1-75kW电机通常使用35-50mm2电缆
            If cableSection > 70 Then IsSectionReasonable = False
        Case 75.1 To 90
            ' 75.1-90kW电机通常使用50-70mm2电缆
            If cableSection > 95 Then IsSectionReasonable = False
        Case 90.1 To 110
            ' 90.1-110kW电机通常使用70-95mm2电缆
            If cableSection > 120 Then IsSectionReasonable = False
        Case 110.1 To 132
            ' 110.1-132kW电机通常使用95-120mm2电缆
            If cableSection > 150 Then IsSectionReasonable = False
        Case 132.1 To 160
            ' 132.1-160kW电机通常使用120-150mm2电缆
            If cableSection > 185 Then IsSectionReasonable = False
        Case 160.1 To 200
            ' 160.1-200kW电机通常使用150-185mm2电缆
            If cableSection > 240 Then IsSectionReasonable = False
        Case Else
            ' 大于200kW电机，不做限制
    End Select
End Function

' 格式化电缆型号输出
Private Function FormatCableModel(coreConfig As String, section As Double, voltageLevel As String, cableType As String) As String
    Dim model As String
    
    ' 根据芯数配置格式化输出
    Select Case coreConfig
        Case "1芯"
            model = cableType & " " & voltageLevel & " 1×" & section
        Case "2芯"
            model = cableType & " " & voltageLevel & " 2×" & section
        Case "3芯"
            model = cableType & " " & voltageLevel & " 3×" & section
        Case "4芯"
            model = cableType & " " & voltageLevel & " 4×" & section
        Case "5芯"
            model = cableType & " " & voltageLevel & " 5×" & section
        Case "3+1芯"
            ' 对于3+1芯电缆，需要确定零线截面（通常为主线的50-60%）
            Dim mainSection As Double
            Dim neutralSection As Double
            mainSection = section
            neutralSection = DetermineNeutralSection(mainSection)
            model = cableType & " " & voltageLevel & " 3×" & mainSection & "+1×" & neutralSection
        Case "3+2芯"
            ' 对于3+2芯电缆，需要确定零线和地线截面
            mainSection = section
            neutralSection = DetermineNeutralSection(mainSection)
            Dim earthSection As Double
            earthSection = DetermineEarthSection(mainSection)
            model = cableType & " " & voltageLevel & " 3×" & mainSection & "+2×" & neutralSection
        Case "4+1芯"
            ' 对于4+1芯电缆，需要确定零线截面
            mainSection = section
            neutralSection = DetermineNeutralSection(mainSection)
            model = cableType & " " & voltageLevel & " 4×" & mainSection & "+1×" & neutralSection
        Case Else
            model = cableType & " " & voltageLevel & " " & coreConfig & " " & section & "mm2"
    End Select
    
    FormatCableModel = model
End Function

' 确定零线截面（根据主线截面）
Private Function DetermineNeutralSection(mainSection As Double) As Double
    ' 根据电气设计规范，零线截面通常为主线的50-60%
    ' 这里我们选择最接近的标准截面
    Dim neutralSection As Double
    neutralSection = mainSection * 0.6
    
    ' 取最接近的标准截面
    DetermineNeutralSection = RoundToStandardSection(neutralSection)
End Function

' 确定地线截面（根据主线截面）
Private Function DetermineEarthSection(mainSection As Double) As Double
    ' 根据电气设计规范，地线截面通常为主线的50%
    ' 这里我们选择最接近的标准截面
    Dim earthSection As Double
    earthSection = mainSection * 0.5
    
    ' 取最接近的标准截面
    DetermineEarthSection = RoundToStandardSection(earthSection)
End Function

' 取最接近的标准电缆截面
Private Function RoundToStandardSection(section As Double) As Double
    ' 标准电缆截面序列
    Dim standardSections() As Variant
    standardSections = Array(1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400)
    
    Dim i As Integer
    Dim closestSection As Double
    closestSection = standardSections(0)
    
    For i = 0 To UBound(standardSections)
        If Abs(standardSections(i) - section) < Abs(closestSection - section) Then
            closestSection = standardSections(i)
        End If
    Next i
    
    RoundToStandardSection = closestSection
End Function

' 计算电压降
Private Function CalculateVoltageDrop(cableLength As Double, current As Double, section As Double, _
                                     powerFactor As Double, voltage As Double) As Double
    ' 查找电缆的电阻值
    Dim cableResistance As Double
    cableResistance = FindCableResistance(section, voltage)
    
    If cableResistance = 0 Then
        CalculateVoltageDrop = 0
        Exit Function
    End If
    
    ' 简化的电压降计算公式：ΔU = √3 * I * L * R * (cosφ + X * sinφ) / U
    ' 其中 X 是电抗，通常取0.08
    Dim reactance As Double
    reactance = 0.08 ' 典型电抗值
    
    Dim sinPhi As Double
    sinPhi = Sqr(1 - powerFactor * powerFactor)
    
    ' 计算电压降（标幺值）
    Dim voltageDrop As Double
    voltageDrop = (1.732 * current * cableLength * cableResistance * (powerFactor + reactance * sinPhi)) / (voltage * 1000 * 1000)
    
    CalculateVoltageDrop = voltageDrop
End Function

' 查找电缆的电阻值
Private Function FindCableResistance(section As Double, voltage As Double) As Double
    Dim i As Long
    Dim voltageLevel As String
    
    If voltage = 0.6 Then
        voltageLevel = "0.6/1KV"
    Else
        voltageLevel = "6/6KV"
    End If
    
    For i = 1 To CableCount
        If AllCables(i).section = section And AllCables(i).voltageLevel = voltageLevel Then
            FindCableResistance = AllCables(i).Resistance
            Exit Function
        End If
    Next i
    
    FindCableResistance = 0
End Function

' 启动程序
Public Sub StartCableCalculator()
    InitializeMotorData   ' 初始化电机数据
    InitializeCableData   ' 初始化电缆数据
End Sub

