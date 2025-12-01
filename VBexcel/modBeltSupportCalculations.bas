Attribute VB_Name = "modBeltSupportCalculations"
Option Explicit

' 定义自定义数据类型存储计算结果
Public Type BeltSupportOutput
    EndHeight As Double            ' 皮带末端高度(m)
    AvgSpacing As Double           ' 支腿平均间距(m)
    legCount As Integer            ' 支腿数量
    legInfo As String              ' 支腿详细信息
    CrossCount As Integer          ' 横撑总数量
    DiagonalCount As Integer       ' 斜拉杆数量
    EdgeLegCount As Integer        ' 挡边支腿数量
    EdgeBeamLength As Double       ' 挡边横梁长度(m)
    TotalChannelSteel As Double    ' 槽钢总长度(m)
    TotalAngleIron As Double       ' 角铁总长度(m)
    ChannelWeight As Double        ' 槽钢总重量(kg)
    AngleWeight As Double          ' 角铁总重量(kg)
    WeldingRodWeight As Double     ' 焊条预估用量(kg)
End Type

' 常量定义
Private Const PI As Double = 3.14159265358979
Private Const FRAME_WIDTH_EXTENSION As Double = 0.4   ' 支架宽度扩展量(m)
Private Const MIN_LEG_COUNT As Integer = 2            ' 最小支腿数量
Private Const MAX_SPACING As Double = 6               ' 最大支腿间距(m)
Private Const MIN_SPACING As Double = 3               ' 最小支腿间距(m)
Private Const LEG_BASE_HEIGHT As Double = 0.05        ' 支腿基础高度(5cm)
Private Const CROSS_SPACING As Double = 1.5           ' 横撑间距(m)
Private Const EDGE_LEG_SPACING As Double = 1.3        ' 挡边支腿间距(m)
Private Const EDGE_LEG_HEIGHT As Double = 0.8         ' 挡边支腿高度(m)
Private Const CHANNEL_DENSITY As Double = 7.85        ' 槽钢密度(kg/m)
Private Const ANGLE_DENSITY As Double = 3.77          ' 角铁密度(kg/m)
Private Const WELDING_ROD_PER_METER As Double = 0.3   ' 每米材料焊条用量(kg/m)
Private Const MIN_BELT_LENGTH As Double = 3           ' 皮带最小长度(m)

' 主计算函数
Public Function CalculateBeltSupport( _
    ByVal beltAngle As Double, _
    ByVal beltWidth As Double, _
    ByVal MinHeight As Double, _
    ByVal beltLength As Double, _
    ByVal HasOverlap As Boolean, _
    ByVal OverlapDist As Double, _
    ByVal EdgeCount As Integer) As BeltSupportOutput
    
    Dim output As BeltSupportOutput
    Dim theta As Double, Lh As Double, Hd As Double
    Dim frameWidth As Double
    Dim legHeights() As Double
    Dim i As Integer, x As Double
    Dim totalLegLength As Double, totalCrossLength As Double
    Dim totalDiagLength As Double, diagLength As Double
    Dim nTiers As Integer
    Dim maxH As Double
    Dim tanTheta As Double
    Dim legInfo As String
    Dim legCrossCount() As Integer ' 每个支腿的横撑数量
    
    ' 确保皮带长度至少为最小值
    If beltLength < MIN_BELT_LENGTH Then beltLength = MIN_BELT_LENGTH
    
    ' 1. 基本参数计算
    theta = beltAngle * PI / 180
    
    ' 处理0°情况
    If Abs(beltAngle) < 0.001 Then ' 接近0°的角度
        Lh = beltLength
        Hd = 0
        tanTheta = 0
    Else
        Lh = beltLength * Cos(theta) ' 水平投影长度
        Hd = beltLength * Sin(theta) ' 高度差
        tanTheta = Tan(theta)
    End If
    
    output.EndHeight = MinHeight + Hd ' 末端高度
    frameWidth = (beltWidth / 1000) + FRAME_WIDTH_EXTENSION ' 支架宽度(m)
    
    ' 2. 支腿计算 (间距在3-6米之间)
    output.legCount = Round(Lh / ((MIN_SPACING + MAX_SPACING) / 2), 0) ' 按平均间距估算数量
    If output.legCount < MIN_LEG_COUNT Then output.legCount = MIN_LEG_COUNT
    
    ' 调整间距在3-6米之间
    output.AvgSpacing = Lh / (output.legCount - 1)
    If output.AvgSpacing > MAX_SPACING Then
        output.legCount = output.legCount + 1
        output.AvgSpacing = Lh / (output.legCount - 1)
    ElseIf output.AvgSpacing < MIN_SPACING Then
        output.legCount = output.legCount - 1
        If output.legCount < MIN_LEG_COUNT Then output.legCount = MIN_LEG_COUNT
        output.AvgSpacing = Lh / (output.legCount - 1)
    End If
    output.AvgSpacing = Round(output.AvgSpacing, 1)
    
    ReDim legHeights(0 To output.legCount - 1)
    ReDim legCrossCount(0 To output.legCount - 1)
    
    ' 3. 计算每个支腿的高度和横撑数
    For i = 0 To output.legCount - 1
        If output.legCount > 1 Then
            x = i * output.AvgSpacing ' 支腿水平位置
        Else
            x = 0 ' 单支腿位置在起点
        End If
        
        ' 支腿高度 = 最低点高度 + 位置高度 + 5cm基础高度
        legHeights(i) = MinHeight + x * tanTheta + LEG_BASE_HEIGHT
        
        ' 计算该支腿所需的横撑层数
        nTiers = Application.WorksheetFunction.Ceiling(legHeights(i) / CROSS_SPACING, 1)
        legCrossCount(i) = nTiers
        output.CrossCount = output.CrossCount + nTiers
        
        ' 添加到支腿信息
        If legInfo <> "" Then legInfo = legInfo & ", "
        legInfo = legInfo & Format(legHeights(i), "0.00") & "m"
        legInfo = legInfo & "(" & nTiers & "横撑)"
    Next i
    output.legInfo = legInfo
    
    ' 4. 斜拉杆计算
    diagLength = Sqr((frameWidth / 2) ^ 2 + CROSS_SPACING ^ 2) ' 斜拉杆长度
    
    ' 计算跨距间的斜拉杆
    If output.legCount > 1 Then
        For i = 0 To output.legCount - 2
            ' 取相邻支腿的最大高度
            maxH = Application.WorksheetFunction.Max(legHeights(i), legHeights(i + 1))
            
            ' 计算跨距的横撑层数(取两侧支腿的最大层数)
            nTiers = Application.WorksheetFunction.Ceiling(maxH / CROSS_SPACING, 1)
            
            ' 计算斜拉杆(从第二层开始)
            If nTiers > 2 Then
                output.DiagonalCount = output.DiagonalCount + (nTiers - 1) * 2  ' 每层2根
                totalDiagLength = totalDiagLength + (diagLength * (nTiers - 1) * 2)
            End If
        Next i
    End If
    
    ' 5. 挡边计算 (关键修改)
    If HasOverlap Then
        ' 挡边横梁长度 = 重叠距离
        output.EdgeBeamLength = OverlapDist
        
        ' 计算单个挡边的支腿数量: 每1.3米一个支腿 + 两端支腿
        Dim singleEdgeLegCount As Integer
        singleEdgeLegCount = Round(OverlapDist / EDGE_LEG_SPACING, 0) + 2
        
        ' 总挡边支腿数量 = (单个挡边支腿数量 × 挡边数量) + 2
        output.EdgeLegCount = (singleEdgeLegCount * EdgeCount) + 2
    Else
        ' 挡边横梁长度 = 支架宽度
        output.EdgeBeamLength = frameWidth
        
        ' 计算单个挡边的支腿数量: 每1.3米一个支腿 + 两端支腿
        singleEdgeLegCount = Round(frameWidth / EDGE_LEG_SPACING, 0) + 2
        
        ' 总挡边支腿数量 = (单个挡边支腿数量 × 挡边数量) + 2
        output.EdgeLegCount = (singleEdgeLegCount * EdgeCount) + 2
    End If
    
    ' 6. 材料总计 (关键修改 - 挡边横梁使用角铁)
    ' 支腿总长度
    For i = 0 To output.legCount - 1
        totalLegLength = totalLegLength + legHeights(i)
    Next i
    
    ' 横撑总长度 (每个支腿的横撑数 * 支架宽度)
    totalCrossLength = output.CrossCount * frameWidth
    
    ' 槽钢: 支腿 + 横撑
    output.TotalChannelSteel = totalLegLength + totalCrossLength
    
    ' 角铁: 斜拉杆 + 挡边支腿 + 挡边横梁
    output.TotalAngleIron = totalDiagLength + (output.EdgeLegCount * EDGE_LEG_HEIGHT) + output.EdgeBeamLength
    
    ' 7. 计算重量
    output.ChannelWeight = output.TotalChannelSteel * CHANNEL_DENSITY
    output.AngleWeight = output.TotalAngleIron * ANGLE_DENSITY
    
    ' 8. 焊条用量预估 (基于总材料长度)
    output.WeldingRodWeight = (output.TotalChannelSteel + output.TotalAngleIron) * WELDING_ROD_PER_METER
    
    CalculateBeltSupport = output
End Function

' 验证输入参数
Public Function ValidateBeltSupportInputs( _
    ByVal Angle As Double, _
    ByVal MinHeight As Double, _
    ByVal length As Double, _
    ByVal HasOverlap As Boolean, _
    ByVal OverlapDist As Double) As Boolean
    
    ' 确保皮带长度至少为最小值
    If length < MIN_BELT_LENGTH Then
        MsgBox "皮带长度最小为 " & MIN_BELT_LENGTH & " 米！", vbExclamation
        ValidateBeltSupportInputs = False
        Exit Function
    End If
    
    ' 允许角度为0°（水平皮带）
    If Angle < 0 Then
        MsgBox "皮带角度不能为负数！", vbExclamation
        ValidateBeltSupportInputs = False
        Exit Function
    End If
    
    If MinHeight <= 0 Then
        MsgBox "最低点高度必须大于0！", vbExclamation
        ValidateBeltSupportInputs = False
        Exit Function
    End If
    
    If length <= 0 Then
        MsgBox "皮带长度必须大于0！", vbExclamation
        ValidateBeltSupportInputs = False
        Exit Function
    End If
    
    If HasOverlap Then
        If OverlapDist <= 0 Then
            MsgBox "重叠距离必须大于0！", vbExclamation
            ValidateBeltSupportInputs = False
            Exit Function
        End If
    End If
    
    ValidateBeltSupportInputs = True
End Function

