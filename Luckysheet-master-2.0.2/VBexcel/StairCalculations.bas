Attribute VB_Name = "StairCalculations"
' 标准模块：StairCalculations
Option Explicit

' 常量定义 - 材料参数
Private Const STEEL_DENSITY As Double = 7.85 ' 钢材密度 (g/cm3)
Private Const CHANNEL_STEEL_14_WEIGHT As Double = 14.535 ' 14#槽钢理论重量 (kg/m)
Private Const RAILING_WEIGHT As Double = 2.42 ' φ32X3.5钢管理论重量 (kg/m)
Private Const FLAT_IRON_WEIGHT As Double = 0.942 ' 30X4扁铁理论重量 (kg/m)



' 计算踏步数量函数
' 参数: stairHeight - 楼梯高度(mm), riserHeight - 踏步高度(mm)
' 返回: 向上取整的踏步数量
Public Function CalculateStepsCount(ByVal stairHeight As Double, _
                                   ByVal riserHeight As Double) As Long
    ' 公式: ROUNDUP(楼梯高度 / 踏步高度, 0)
    CalculateStepsCount = Application.WorksheetFunction.RoundUp(stairHeight / riserHeight, 0)
End Function

' 计算槽钢长度函数
' 参数: stairHeight - 楼梯高度(mm), stairAngle - 楼梯角度(度)
' 返回: 槽钢长度(米)
Public Function CalculateChannelLength(ByVal stairHeight As Double, _
                                      ByVal stairAngle As Double) As Double
    ' 公式: 楼梯高度 / SIN(弧度(楼梯角度)) * 2 / 1000
    ' 注意: Excel的SIN函数使用弧度，所以需要转换
    CalculateChannelLength = (stairHeight / Sin(Application.WorksheetFunction.Radians(stairAngle))) * 2 / 1000
End Function

' 计算栏杆长度函数
' 参数: channelLength - 槽钢长度(米), guardrailHeight - 护栏高度(mm)
' 返回: 栏杆长度(米)
Public Function CalculateRailingLength(ByVal channelLength As Double, _
                                      ByVal guardrailHeight As Double) As Double
    ' 公式: ROUNDUP(ROUNDUP(14#槽钢(M)*1000/500+2,0)*护栏高度(MM)+14#槽钢(M),0)*IF(护栏高度(MM)>2000,0,1)/1000
    
    ' 计算基础数量: ROUNDUP(槽钢长度(m)*1000/500) + 2
    Dim baseCount As Long
    baseCount = Application.WorksheetFunction.RoundUp(channelLength * 1000 / 500, 0) + 2
    
    ' 计算原始长度: baseCount * 护栏高度 + 槽钢长度(mm)
    Dim rawLength As Double
    rawLength = baseCount * guardrailHeight + channelLength * 1000
    
    ' 向上取整
    Dim roundedLength As Double
    roundedLength = Application.WorksheetFunction.RoundUp(rawLength, 0)
    
    ' 应用条件: 如果护栏高度 > 2000mm 则返回0，否则返回计算值(转换为米)
    If guardrailHeight > 2000 Then
        CalculateRailingLength = 0
    Else
        CalculateRailingLength = roundedLength / 1000
    End If
End Function

' 计算扁铁系数函数 (辅助函数)
' 参数: guardrailHeight - 护栏高度(mm)
' 返回: 根据高度范围确定的系数
Public Function GetFlatIronFactor(ByVal guardrailHeight As Double) As Double
    ' 根据护栏高度返回不同的系数
    Select Case guardrailHeight
        Case Is > 2000
            GetFlatIronFactor = 0
        Case Is >= 1800
            GetFlatIronFactor = 4
        Case Is >= 1400
            GetFlatIronFactor = 3
        Case Is > 1050
            GetFlatIronFactor = 2
        Case Else ' <= 1050
            GetFlatIronFactor = 1
    End Select
End Function

' 计算扁铁长度函数
' 参数: channelLength - 槽钢长度(米), guardrailHeight - 护栏高度(mm)
' 返回: 扁铁长度(米)
Public Function CalculateFlatIronLength(ByVal channelLength As Double, _
                                       ByVal guardrailHeight As Double) As Double
    ' 公式: ROUNDUP(14#槽钢(M)*1000,0) * 系数 / 1000
    Dim roundedChannel As Double
    roundedChannel = Application.WorksheetFunction.RoundUp(channelLength * 1000, 0)
    
    CalculateFlatIronLength = roundedChannel * GetFlatIronFactor(guardrailHeight) / 1000
End Function

' 计算材料总重量函数
' 参数: channelLength - 槽钢长度(m), stepsCount - 踏步数量,
'       railingLength - 栏杆长度(m), flatIronLength - 扁铁长度(m)
' 返回: 总重量(kg)
Public Function CalculateTotalWeight(ByVal channelLength As Double, _
                                    ByVal stepsCount As Long, _
                                    ByVal railingLength As Double, _
                                    ByVal flatIronLength As Double) As Double
    ' 公式: 14#槽钢(M)*14.535 + 楼梯踏步(块)*6.804 +
    '       栏杆φ32X3.5(M)*2.46 + 30X4扁铁(M)*0.94
    CalculateTotalWeight = channelLength * CHANNEL_STEEL_14_WEIGHT + _
                          stepsCount * 6.804 + _
                          railingLength * RAILING_WEIGHT + _
                          flatIronLength * FLAT_IRON_WEIGHT
End Function

' 主计算过程
Public Sub CalculateStairResults( _
    ByVal stairAngle As Double, _
    ByVal stairHeight As Double, _
    ByVal guardrailHeight As Double, _
    ByRef stepsCount As Long, _
    ByRef channelLength As Double, _
    ByRef railingLength As Double, _
    ByRef flatIronLength As Double, _
    ByRef totalWeight As Double)
    
    ' 获取踏步尺寸参数
    Dim riserHeight As Double  ' 踏步高度(mm)
    Dim treadWidth As Double   ' 踏步宽度(mm)
    GetStairDimensions stairAngle, riserHeight, treadWidth
    
    ' 1. 计算踏步数量
    stepsCount = CalculateStepsCount(stairHeight, riserHeight)
    
    ' 2. 计算槽钢长度
    channelLength = CalculateChannelLength(stairHeight, stairAngle)
    
    ' 3. 计算栏杆长度
    railingLength = CalculateRailingLength(channelLength, guardrailHeight)
    
    ' 4. 计算扁铁长度
    flatIronLength = CalculateFlatIronLength(channelLength, guardrailHeight)
    
    ' 5. 计算总重量
    totalWeight = CalculateTotalWeight(channelLength, stepsCount, railingLength, flatIronLength)
End Sub
