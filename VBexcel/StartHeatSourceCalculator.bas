Attribute VB_Name = "StartHeatSourceCalculator"
' 计算模块
Public Function CalculateHeatSource(ByVal throughput As Double, _
                                   ByVal initialMoisture As Double, _
                                   ByVal targetMoisture As Double, _
                                   ByVal hotAirTemp As Double, _
                                   ByVal initialTemp As Double) As Variant
    ' 常量定义
    Const SPECIFIC_HEAT As Double = 0.3      ' 物料比热 (kcal/kg·℃)
    Const SYSTEM_EFFICIENCY As Double = 0.6   ' 系统热效率
    Const WATER_EVAP_HEAT As Double = 595     ' 水蒸发潜热 (kcal/kg)
    Const STEAM_HEAT_VALUE As Double = 600    ' 蒸汽热值 (kcal/kg)
    Const BIOMASS_HEAT_VALUE As Double = 4000 ' 生物质热值 (kcal/kg)
    Const GAS_HEAT_VALUE As Double = 8500     ' 天然气热值 (kcal/m3)
    
    ' 输入验证
    If throughput <= 0 Or initialMoisture <= 0 Or hotAirTemp < 100 Or hotAirTemp > 300 Then
        CalculateHeatSource = Array(-1, -1, -1, -1)
        Exit Function
    End If
    
    ' 单位转换 (吨/小时 → kg/h)
    throughput = throughput * 1000
    
    ' 计算蒸发水量
    Dim waterEvap As Double
    waterEvap = throughput * ((initialMoisture / 100 - targetMoisture / 100) / (1 - targetMoisture / 100))
    
    ' 计算干物料量
    Dim dryMaterial As Double
    dryMaterial = throughput - waterEvap
    
    ' 计算蒸发水分所需热量 (Q1)
    Dim Q1 As Double
    Q1 = waterEvap * (WATER_EVAP_HEAT + 0.45 * hotAirTemp - initialTemp)
    
    ' 计算加热物料所需热量 (Q2)
    Dim Q2 As Double
    Q2 = dryMaterial * SPECIFIC_HEAT * (hotAirTemp - initialTemp)
    
    ' 计算总热负荷 (考虑热效率)
    Dim totalHeat As Double
    totalHeat = (Q1 + Q2) / SYSTEM_EFFICIENCY
    
    ' 计算不同热源需求
    Dim biomass As Double    ' 生物质燃料量 (kg/h)
    Dim gas As Double        ' 天然气耗量 (m3/h)
    Dim steam As Double      ' 蒸汽耗量 (kg/h)
    
    biomass = totalHeat / BIOMASS_HEAT_VALUE
    gas = totalHeat / GAS_HEAT_VALUE
    steam = totalHeat / STEAM_HEAT_VALUE
    
    ' 返回结果数组 [总热负荷, 生物质, 天然气, 蒸汽]
    CalculateHeatSource = Array(totalHeat, biomass, gas, steam)
End Function

