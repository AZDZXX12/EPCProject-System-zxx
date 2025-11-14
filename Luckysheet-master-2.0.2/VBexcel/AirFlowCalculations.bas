Attribute VB_Name = "AirFlowCalculations"
' 模块名称：AirFlowCalculations
' 功能：包含风量计算相关的函数

Option Explicit

' 风量计算函数
' 功能：根据直径和风速计算风量（转换为立方米/小时）
' 参数：
'   diameter - 管道直径(米)
'   windSpeed - 风速(米/秒)
' 返回值：风量(立方米/小时)
Public Function CalculateAirFlow(diameter As Double, windSpeed As Double) As Double
    Dim crossArea As Double   ' 横截面积
    
    ' 计算横截面积 (π×r2，r为直径/2)
    crossArea = WorksheetFunction.PI() * (diameter / 2) ^ 2
    
    ' 计算风量：先得到立方米/秒，再乘以3600转换为立方米/小时
    CalculateAirFlow = crossArea * windSpeed * 3600
End Function
