Attribute VB_Name = "PipeCalculations"
' 管道计算模块
' 包含所有管道尺寸和阻力计算的函数

Option Explicit

' 定义常量
Public Const rho As Double = 1.2            ' 空气密度 (kg/m3)
Public Const nu As Double = 0.000015        ' 空气运动粘度 (m2/s)
Public Const epsilon As Double = 0.00015    ' 管道粗糙度 (m)
Public Const K_bend As Double = 0.3         ' 弯头阻力系数
Public Const PI As Double = 3.14159265358979 ' 圆周率

' 计算圆形管道直径
' 输入: Q - 风量 (m3/h), V - 风速 (m/s)
' 输出: 直径 (m)
Public Function CalculateCircleDiameter(Q As Double, V As Double) As Double
    Dim Q_m3s As Double  ' 风量 (m3/s)
    Dim A As Double      ' 管道横截面积 (m2)
    
    ' 将风量从 m3/h 转换为 m3/s
    Q_m3s = Q / 3600
    
    ' 计算管道横截面积 A = Q / V
    A = Q_m3s / V
    
    ' 计算圆管直径 D = √(4A/π)
    CalculateCircleDiameter = Sqr(4 * A / PI)
End Function

' 计算矩形管道尺寸
' 输入: Q - 风量 (m3/h), V - 风速 (m/s), aspectRatio - 宽高比 (默认4)
' 输出: 包含宽度和高度的数组 (m)
Public Function CalculateRectangleDimensions(Q As Double, V As Double, Optional aspectRatio As Double = 4) As Variant
    Dim Q_m3s As Double  ' 风量 (m3/s)
    Dim A As Double      ' 管道横截面积 (m2)
    Dim result(1 To 2) As Double ' 结果数组: 1=宽度, 2=高度
    
    ' 将风量从 m3/h 转换为 m3/s
    Q_m3s = Q / 3600
    
    ' 计算管道横截面积 A = Q / V
    A = Q_m3s / V
    
    ' 计算矩形管道尺寸 (假设宽高比为4:1)
    result(2) = Sqr(A / aspectRatio)    ' 高度 H = √(A/AR)
    result(1) = aspectRatio * result(2) ' 宽度 W = AR * H
    
    CalculateRectangleDimensions = result
End Function

' 计算矩形管当量直径
' 输入: width - 宽度 (m), height - 高度 (m)
' 输出: 当量直径 (m)
Public Function CalculateEquivalentDiameter(width As Double, height As Double) As Double
    ' 计算矩形管当量直径 D_e = 2WH/(W+H)
    CalculateEquivalentDiameter = 2 * width * height / (width + height)
End Function

' 计算雷诺数
' 输入: V - 风速 (m/s), D - 直径或当量直径 (m)
' 输出: 雷诺数
Public Function CalculateReynoldsNumber(V As Double, D As Double) As Double
    ' 计算雷诺数 Re = VD/ν
    CalculateReynoldsNumber = V * D / nu
End Function

' 计算摩擦系数 (使用 Haaland 公式)
' 输入: Re - 雷诺数, RelativeRoughness - 相对粗糙度 (ε/D)
' 输出: 摩擦系数
Public Function CalculateFrictionFactor(Re As Double, RelativeRoughness As Double) As Double
    Dim term As Double
    
    ' Haaland 公式: 1/√f = -1.8 log[((ε/D)/3.7)^1.11 + 6.9/Re]
    term = (RelativeRoughness / 3.7) ^ 1.11 + 6.9 / Re
    
    ' 防止对数参数为负或零
    If term <= 0 Then
        CalculateFrictionFactor = 0.02  ' 默认值
    Else
        ' 计算摩擦系数 f = [ -1.8 * log10(term) ]^(-2)
        CalculateFrictionFactor = 1# / (-1.8 * Log(term) / Log(10#)) ^ 2
    End If
End Function

' 计算沿程阻力
' 输入: f - 摩擦系数, L - 管道长度 (m), D - 直径或当量直径 (m), V - 风速 (m/s)
' 输出: 沿程阻力 (Pa)
Public Function CalculateLinearResistance(f As Double, L As Double, D As Double, V As Double) As Double
    ' 计算沿程阻力 ΔP_f = f(L/D)(ρV2/2)
    CalculateLinearResistance = f * (L / D) * (rho * V ^ 2 / 2)
End Function

' 计算局部阻力
' 输入: N - 弯头数量, V - 风速 (m/s)
' 输出: 局部阻力 (Pa)
Public Function CalculateLocalResistance(N As Integer, V As Double) As Double
    ' 计算局部阻力 ΔP_l = K_bend * N * (ρV2/2)
    CalculateLocalResistance = K_bend * N * (rho * V ^ 2 / 2)
End Function

' 计算圆形管道总阻力
' 输入: L - 管道长度 (m), Q - 风量 (m3/h), V - 风速 (m/s), N - 弯头数量
' 输出: 总阻力 (Pa)
Public Function CalculateCircleResistance(L As Double, Q As Double, V As Double, N As Integer) As Double
    Dim D As Double          ' 直径 (m)
    Dim Re As Double         ' 雷诺数
    Dim RelRough As Double   ' 相对粗糙度
    Dim f As Double          ' 摩擦系数
    Dim deltaP_f As Double   ' 沿程阻力
    Dim deltaP_l As Double   ' 局部阻力
    
    ' 计算圆管直径
    D = CalculateCircleDiameter(Q, V)
    
    ' 计算雷诺数
    Re = CalculateReynoldsNumber(V, D)
    
    ' 计算相对粗糙度
    RelRough = epsilon / D
    
    ' 计算摩擦系数
    f = CalculateFrictionFactor(Re, RelRough)
    
    ' 计算沿程阻力
    deltaP_f = CalculateLinearResistance(f, L, D, V)
    
    ' 计算局部阻力
    deltaP_l = CalculateLocalResistance(N, V)
    
    ' 计算总阻力
    CalculateCircleResistance = deltaP_f + deltaP_l
End Function

' 计算矩形管道总阻力
' 输入: L - 管道长度 (m), Q - 风量 (m3/h), V - 风速 (m/s), N - 弯头数量
' 输出: 总阻力 (Pa)
Public Function CalculateRectangleResistance(L As Double, Q As Double, V As Double, N As Integer) As Double
    Dim dims As Variant      ' 矩形尺寸数组
    Dim W As Double          ' 宽度 (m)
    Dim H As Double          ' 高度 (m)
    Dim D_e As Double        ' 当量直径 (m)
    Dim Re As Double         ' 雷诺数
    Dim RelRough As Double   ' 相对粗糙度
    Dim f As Double          ' 摩擦系数
    Dim deltaP_f As Double   ' 沿程阻力
    Dim deltaP_l As Double   ' 局部阻力
    
    ' 计算矩形管道尺寸
    dims = CalculateRectangleDimensions(Q, V)
    W = dims(1)
    H = dims(2)
    
    ' 计算当量直径
    D_e = CalculateEquivalentDiameter(W, H)
    
    ' 计算雷诺数
    Re = CalculateReynoldsNumber(V, D_e)
    
    ' 计算相对粗糙度
    RelRough = epsilon / D_e
    
    ' 计算摩擦系数
    f = CalculateFrictionFactor(Re, RelRough)
    
    ' 计算沿程阻力
    deltaP_f = CalculateLinearResistance(f, L, D_e, V)
    
    ' 计算局部阻力
    deltaP_l = CalculateLocalResistance(N, V)
    
    ' 计算总阻力
    CalculateRectangleResistance = deltaP_f + deltaP_l
End Function

' 执行完整计算
' 输入: L - 管道长度 (m), Q - 风量 (m3/h), V - 风速 (m/s), N - 弯头数量
' 输出: 包含所有计算结果的数组
Public Function PerformCompleteCalculation(L As Double, Q As Double, V As Double, N As Integer) As Variant
    Dim result(1 To 5) As Double ' 结果数组: 1=圆管直径, 2=矩形宽度, 3=矩形高度, 4=圆管阻力, 5=矩形管阻力
    
    ' 计算圆管直径
    result(1) = CalculateCircleDiameter(Q, V)
    
    ' 计算矩形管道尺寸
    Dim dims As Variant
    dims = CalculateRectangleDimensions(Q, V)
    result(2) = dims(1)
    result(3) = dims(2)
    
    ' 计算圆管阻力
    result(4) = CalculateCircleResistance(L, Q, V, N)
    
    ' 计算矩形管阻力
    result(5) = CalculateRectangleResistance(L, Q, V, N)
    
    PerformCompleteCalculation = result
End Function

' 计算风机功率
' 输入: totalFlow - 累计风量 (m3/h), totalResistance - 累计阻力 (Pa), equipmentResistance - 设备阻力 (Pa)
' 输出: 包含系统风量、系统风压和风机功率的数组
Public Function CalculateFanPower(totalFlow As Double, totalResistance As Double, equipmentResistance As Double) As Variant
    Dim result(1 To 3) As Double ' 结果数组: 1=系统风量, 2=系统风压, 3=风机功率
    
    ' 定义系数
    Const airLeakageRate As Double = 1.05       ' 漏风率
    Const dustAccumulationRate As Double = 1.1   ' 积尘阻力系数
    Const safetyMargin As Double = 1.15          ' 安全余量
    Const mechanicalEfficiency As Double = 0.95  ' 机械效率
    Const fanEfficiency As Double = 0.8          ' 风机内效率
    Const safetyFactor As Double = 1.3           ' 安全系数
    
    ' 系统风量 = 累计风量 * 漏风率
    result(1) = totalFlow * airLeakageRate
    
    ' 系统风压 = 累计阻力 * 积尘阻力 * 安全余量 + 设备阻力
    result(2) = totalResistance * dustAccumulationRate * safetyMargin + equipmentResistance
    
    ' 修复的风机功率计算公式
    ' 风机功率 = (系统风量 * 系统风压 * 安全系数) / (3600 * 1000 * 机械效率 * 风机内效率)
    ' 系统风量单位: m3/h -> 转换为 m3/s (除以3600)
    ' 功率单位: W -> 转换为 kW (除以1000)
    result(3) = result(1) / (CLng(3600) * CLng(1000) * mechanicalEfficiency * fanEfficiency) * result(2) * safetyFactor
    CalculateFanPower = result
End Function
