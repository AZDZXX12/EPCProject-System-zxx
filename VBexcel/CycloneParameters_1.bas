Attribute VB_Name = "CycloneParameters_1"
Option Explicit


' 旋风除尘器计算核心模块
' 功能：独立处理所有计算逻辑，不依赖任何界面元素

' 数据结构定义
Public Type CycloneParameters
    ' 输入参数
    InletAirflow As Double ' 进口风量 m3/h
    InletVelocity As Double ' 进口风速 m/s
    
    ' 比例参数（可调）
    CylinderLengthRatio As Double ' 直筒长X简体直径
    ConeLengthRatio As Double ' 椎体长X简体直径
    OutletDiameterRatio As Double ' 出口直径X简体直径
    InnerCylinderLengthRatio As Double ' 内筒长X简体直径
    InletHeightRatio As Double ' 入口高X简体直径
    DustOutletRatio As Double ' 灰尘出口直径X简体直径
    InletWidthRatio As Double ' 入口宽X入口高
End Type

Public Type CycloneResults
    ' 计算结果
    InletHeight As Double ' 进口高度 mm
    OutletDiameter As Double ' 出口直径 mm
    OutletInsertionDepth As Double ' 出口插入深度 mm
    InletWidth As Double ' 进宽度 mm
    CylinderDiameter As Double ' 简体直径 mm
    totalHeight As Double ' 设备高度 m
    StraightSectionHeight As Double ' 直段高度 mm
    DustOutletDiameter As Double ' 排灰口直径 mm
    PressureLoss As Double ' 压力损失 Pa
    ConeHeight As Double ' 椎体高度 m
End Type

' 获取默认参数
Public Function GetDefaultParameters() As CycloneParameters
    Dim params As CycloneParameters
    
    ' 设置行业标准默认比例参数
    With params
        .CylinderLengthRatio = 2
        .ConeLengthRatio = 2
        .OutletDiameterRatio = 0.5
        .InnerCylinderLengthRatio = 0.25
        .InletHeightRatio = 0.5
        .DustOutletRatio = 0.25
        .InletWidthRatio = 0.5
        
        ' 默认输入参数
        .InletAirflow = 10000
        .InletVelocity = 18
    End With
    
    GetDefaultParameters = params
End Function

' 执行计算的核心函数
Public Function CalculateCyclone(params As CycloneParameters) As CycloneResults
    Dim results As CycloneResults
    Dim inletArea As Double ' 进口面积 m2
    Dim airDensity As Double ' 空气密度 kg/m3
    Dim resistanceCoefficient As Double ' 阻力系数
    
    ' 验证输入参数有效性
    If params.InletVelocity <= 0 Then
        Err.Raise 1001, "CalculateCyclone", "进口风速必须大于0"
    End If
    
    If params.InletAirflow <= 0 Then
        Err.Raise 1002, "CalculateCyclone", "进口风量必须大于0"
    End If
    
    ' 计算进口面积 (m2) = 风量 (m3/h) / (风速 (m/s) * 3600)
    inletArea = params.InletAirflow / (params.InletVelocity * 3600)
    
    ' 计算各参数
    With results
        ' 进口高度和宽度
        .InletHeight = Sqr(inletArea / params.InletWidthRatio) * 1000 ' 转换为mm
        .InletWidth = .InletHeight * params.InletWidthRatio ' mm
        
        ' 筒体直径
        .CylinderDiameter = .InletHeight / params.InletHeightRatio ' mm
        
        ' 出口直径
        .OutletDiameter = .CylinderDiameter * params.OutletDiameterRatio ' mm
        
        ' 出口插入深度
        .OutletInsertionDepth = .CylinderDiameter * params.InnerCylinderLengthRatio ' mm
        
        ' 直段高度
        .StraightSectionHeight = .CylinderDiameter * params.CylinderLengthRatio ' mm
        
        ' 椎体高度
        .ConeHeight = (.CylinderDiameter * params.ConeLengthRatio) / 1000 'm
        
        ' 排灰口直径
        .DustOutletDiameter = .CylinderDiameter * params.DustOutletRatio ' mm
        
        ' 设备总高度
        .totalHeight = (.StraightSectionHeight / 1000) + .ConeHeight + _
                      (.OutletInsertionDepth / 1000) ' 转换为m
        
        ' 计算压力损失 (Pa)
        airDensity = 1.2 ' 空气密度 kg/m3
        resistanceCoefficient = 16 * (inletArea / (3.1416 * (results.OutletDiameter / 2000) ^ 2))
        .PressureLoss = resistanceCoefficient * airDensity * (params.InletVelocity ^ 2) / 2
    End With
    
    CalculateCyclone = results
End Function

' 验证参数范围是否合理
Public Function ValidateParameters(params As CycloneParameters) As String
    Dim errorMsg As String
    
    errorMsg = ""
    
    ' 验证比例参数范围
    If params.CylinderLengthRatio < 1 Or params.CylinderLengthRatio > 3 Then
        errorMsg = errorMsg & "直筒长/简体直径应在1-3之间" & vbCrLf
    End If
    
    If params.ConeLengthRatio < 1.5 Or params.ConeLengthRatio > 4 Then
        errorMsg = errorMsg & "椎体长/简体直径应在1.5-4之间" & vbCrLf
    End If
    
    If params.OutletDiameterRatio < 0.4 Or params.OutletDiameterRatio > 0.7 Then
        errorMsg = errorMsg & "出口直径/简体直径应在0.4-0.7之间" & vbCrLf
    End If
    
    ' 验证输入参数
    If params.InletVelocity < 10 Or params.InletVelocity > 30 Then
        errorMsg = errorMsg & "进口风速建议在10-30 m/s之间" & vbCrLf
    End If
    
    ValidateParameters = errorMsg
End Function


