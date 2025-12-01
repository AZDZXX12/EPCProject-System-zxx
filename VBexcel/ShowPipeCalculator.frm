VERSION 5.00
Begin {C62A69F0-16DC-11CE-9E98-00AA00574A4F} ShowPipeCalculator 
   Caption         =   "风机功率"
   ClientHeight    =   6816
   ClientLeft      =   108
   ClientTop       =   456
   ClientWidth     =   10932
   OleObjectBlob   =   "ShowPipeCalculator.frx":0000
   StartUpPosition =   1  '所有者中心
End
Attribute VB_Name = "ShowPipeCalculator"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
' 用户窗体 UserForm1 代码
' 使用封装的管道计算模块

Private colRecords As New Collection  ' 存储所有记录的集合
Private currentFlowRate As Double    ' 当前风量
Private currentLength As Double      ' 当前管道长度
Private currentVelocity As Double    ' 当前风速
Private currentBends As Integer      ' 当前弯头数量
Private currentDiameter As Double    ' 当前圆管直径
Private currentWidth As Double       ' 当前矩形管宽度
Private currentHeight As Double      ' 当前矩形管高度
Private currentResCircle As Double   ' 当前圆管阻力
Private currentResRect As Double     ' 当前矩形管阻力


' 窗体初始化事件
Private Sub UserForm_Initialize()
    ' 初始化当前变量
    currentFlowRate = 0
    currentLength = 0
    currentVelocity = 0
    currentBends = 0
    currentDiameter = 0
    currentWidth = 0
    currentHeight = 0
    currentResCircle = 0
    currentResRect = 0
    
    ' 设置默认设备阻力
    txtEquipmentResistance.value = "2000"
    MotorModule.InitializeMotorData
End Sub

' 计算按钮点击事件
Private Sub btnCalculate_Click()
    Dim L As Double      ' 管道长度
    Dim Q As Double      ' 风量 (m3/h)
    Dim V As Double      ' 风速 (m/s)
    Dim N As Integer     ' 弯头数量
    
      ' 验证输入 - 管道长度
    If Not IsNumeric(txtLength.value) Then
        MsgBox "请输入有效的管道长度"
        Exit Sub
    End If
    L = CDbl(txtLength.value)
    If L <= 0 Or L >= 500 Then
        MsgBox "管道长度必须大于0且小于500米"
        Exit Sub
    End If
    
    ' 验证输入 - 风量
    If Not IsNumeric(txtFlowRate.value) Then
        MsgBox "请输入有效的风量"
        Exit Sub
    End If
    Q = CDbl(txtFlowRate.value) ' m3/h
    If Q <= 100 Then
        MsgBox "风量必须大于100 m3/h"
        Exit Sub
    End If
    
    ' 验证输入 - 风速
    If Not IsNumeric(txtVelocity.value) Then
        MsgBox "请输入有效的风速"
        Exit Sub
    End If
    V = CDbl(txtVelocity.value) ' m/s
    If V <= 0 Or V >= 40 Then
        MsgBox "风速必须大于0且小于40米/秒"
        Exit Sub
    End If
    
    ' 验证输入 - 弯头数量
    If Not IsNumeric(txtBends.value) Then
        MsgBox "请输入有效的弯头数量"
        Exit Sub
    End If
    N = CInt(txtBends.value)
    If N < 0 Then
        MsgBox "弯头数量必须为非负整数"
        Exit Sub
    End If
    
    ' 使用模块中的函数执行完整计算
    Dim result As Variant
    result = PerformCompleteCalculation(L, Q, V, N)
    
    ' 存储当前值
    currentFlowRate = Q
    currentLength = L
    currentVelocity = V
    currentBends = N
    currentDiameter = result(1)
    currentWidth = result(2)
    currentHeight = result(3)
    currentResCircle = result(4)
    currentResRect = result(5)
    
    ' 显示结果 (转换为毫米显示)
    txtDiameter.Caption = Format(currentDiameter * 1000, "0.0")
    txtWidth.Caption = Format(currentWidth * 1000, "0.0")
    txtHeight.Caption = Format(currentHeight * 1000, "0.0")
    txtCircleResistance.Caption = Format(currentResCircle, "0.0")
    txtRectResistance.Caption = Format(currentResRect, "0.0")
End Sub

' 记录圆管按钮点击事件
Private Sub btnRecordCircle_Click()
        btnCalculate_Click
    If currentResCircle = 0 Then
        Exit Sub
    End If
    ' 检查是否已进行计算
'    If currentFlowRate = 0 Then
'        MsgBox "请先进行计算"
'        Exit Sub
'    End If
'    If currentResCircle = 0 Then
'        MsgBox "请先进行计算"
'        Exit Sub
'    End If
    
    ' 创建新记录
    Dim rec As New RecordCls
    rec.PipeType = "圆管"
    rec.FlowRate = currentFlowRate
    rec.length = currentLength
    rec.Bends = currentBends
    rec.Size1 = currentDiameter * 1000  ' 转换为毫米
    rec.Size2 = 0
    rec.Resistance = currentResCircle
    
    ' 添加到记录集合
    colRecords.Add rec
    
    ' 更新列表框显示
    UpdateListBox
End Sub

' 记录矩形管按钮点击事件
Private Sub btnRecordRect_Click()
        btnCalculate_Click
            If currentResCircle = 0 Then
        Exit Sub
    End If
'    ' 检查是否已进行计算
'    If currentFlowRate = 0 Then
'        MsgBox "请先进行计算"
'        Exit Sub
'    End If
'    If currentResCircle = 0 Then
'        MsgBox "请先进行计算"
'        Exit Sub
'    End If
    ' 创建新记录
    Dim rec As New RecordCls
    rec.PipeType = "矩形管"
    rec.FlowRate = currentFlowRate
    rec.length = currentLength
    rec.Bends = currentBends
    rec.Size1 = currentWidth * 1000     ' 转换为毫米
    rec.Size2 = currentHeight * 1000    ' 转换为毫米
    rec.Resistance = currentResRect
    
    ' 添加到记录集合
    colRecords.Add rec
    
    ' 更新列表框显示
    UpdateListBox
End Sub

' 更新列表框显示
Private Sub UpdateListBox()
    ' 清空列表框
    lstRecords.Clear
    
    ' 遍历所有记录并添加到列表框
    Dim i As Integer
    For i = 1 To colRecords.count
        Dim rec As RecordCls
        Set rec = colRecords(i)
        lstRecords.AddItem rec.GetDisplayString
    Next i
End Sub

' 清空记录按钮点击事件
Private Sub btnClearRecords_Click()
    ' 创建新的空集合
    Set colRecords = New Collection
    
    ' 更新列表框显示
    UpdateListBox
End Sub

' 删除选中记录按钮点击事件
Private Sub btnDeleteRecord_Click()
    ' 检查是否选中了记录
    If lstRecords.ListIndex = -1 Then
        MsgBox "请选择要删除的记录"
        Exit Sub
    End If
    
    ' 获取选中记录的索引
    Dim index As Integer
    index = lstRecords.ListIndex + 1  ' 列表框索引从0开始，集合索引从1开始
    
    ' 从集合中移除记录
    colRecords.Remove index
    
    ' 更新列表框显示
    UpdateListBox
End Sub


Private Sub CommandButton3_Click()
 '  ' 验证输入 - 风量
    If Not IsNumeric(txtFlowRate.value) Then
        MsgBox "请输入有效的风量"
        Exit Sub
    End If
    Q = CDbl(txtFlowRate.value) ' m3/h
    If Q <= 100 Then
        MsgBox "风量必须大于100 m3/h"
        Exit Sub
    End If
    currentFlowRate = Q
     ' 验证设备阻力输入
    Dim equipmentResistance As Double
    If Not IsNumeric(txtEquipmentResistance.value) Then
        MsgBox "请输入有效的设备阻力"
        Exit Sub
    End If
    equipmentResistance = CDbl(txtEquipmentResistance.value)
 ' 使用模块函数计算系统风量、系统风压和风机功率
    Dim fanPowerResults_1 As Variant
    fanPowerResults_1 = CalculateFanPower(currentFlowRate, CLng(0), equipmentResistance)
    
    Dim systemFlow As Double      ' 系统风量
    Dim systemPressure As Double  ' 系统风压
    Dim fanPower As Double        ' 风机功率
    
    systemFlow = fanPowerResults_1(1)
    systemPressure = fanPowerResults_1(2)
    fanPower = fanPowerResults_1(3)
    
   ' 【关键修改】调用封装的电机模块选型
    Dim selectedMotor As Variant
    selectedMotor = MotorModule.SelectMotor(fanPower) ' fanPower为之前计算的风机功率
    Dim summary As String
     
    summary = summary & "风量: " & Format(currentFlowRate, "0.0") & " m3/h" & vbCrLf
    summary = summary & "风压: " & Format(systemPressure, "0.0") & " Pa" & vbCrLf
    summary = summary & "风机功率: " & Format(fanPower, "0.0") & " kW" & vbCrLf & vbCrLf
    
    summary = summary & "推荐电机型号: " & selectedMotor(2) & vbCrLf
    summary = summary & "电机功率: " & Format(selectedMotor(3), "0.0") & " kW" & vbCrLf
    summary = summary & "额定电流: " & Format(selectedMotor(5), "0.0") & " A" & vbCrLf
    summary = summary & "转速: " & Format(selectedMotor(6), "0") & " r/min" & vbCrLf
    summary = summary & "重量: " & Format(selectedMotor(9), "0") & " kg" & vbCrLf & vbCrLf
    ' 显示统计信息
    MsgBox summary
    
End Sub
' 累计统计按钮点击事件
Private Sub btnSummary_Click()
    Dim totalRecords As Integer    ' 记录总数
    Dim totalFlow As Double       ' 累计风量
    Dim totalResistance As Double ' 累计阻力
    Dim i As Integer
    
     ' 验证输入 - 风量
    If Not IsNumeric(txtFlowRate.value) Then
        MsgBox "请输入有效的风量"
        Exit Sub
    End If
    Q = CDbl(txtFlowRate.value) ' m3/h
    If Q <= 100 Then
        MsgBox "风量必须大于100 m3/h"
        Exit Sub
    End If
    currentFlowRate = Q
    ' 验证设备阻力输入
    Dim equipmentResistance As Double
    If Not IsNumeric(txtEquipmentResistance.value) Then
        MsgBox "请输入有效的设备阻力"
        Exit Sub
    End If
    equipmentResistance = CDbl(txtEquipmentResistance.value)
        ' 计算统计值
        totalRecords = colRecords.count
        For i = 1 To colRecords.count
            Dim rec As RecordCls
            Set rec = colRecords(i)
            totalFlow = totalFlow + rec.FlowRate
            totalResistance = totalResistance + rec.Resistance
        Next i
    Dim systemFlow As Double      ' 系统风量
    Dim systemPressure As Double  ' 系统风压
    Dim fanPower As Double        ' 风机功率
    If totalFlow <> 0 Then
        btnCalculate_Click
    Else
    End If
   
    If totalFlow = 0 Then
        ' 使用模块函数计算系统风量、系统风压和风机功率
            Dim fanPowerResults_1 As Variant
            fanPowerResults_1 = CalculateFanPower(currentFlowRate, CLng(0), equipmentResistance)
            systemFlow = fanPowerResults_1(1)
            systemPressure = fanPowerResults_1(2)
            fanPower = fanPowerResults_1(3)
      Else
       ' 使用模块函数计算系统风量、系统风压和风机功率
            Dim fanPowerResults As Variant
            fanPowerResults = CalculateFanPower(totalFlow, totalResistance, equipmentResistance)
            systemFlow = fanPowerResults(1)
            systemPressure = fanPowerResults(2)
            fanPower = fanPowerResults(3)
      End If
     
   ' 【关键修改】调用封装的电机模块选型
    Dim selectedMotor As Variant
    selectedMotor = MotorModule.SelectMotor(fanPower) ' fanPower为之前计算的风机功率
    
    ' 构建统计信息字符串
    Dim summary As String
    If totalFlow = 0 Then
        summary = summary & "风量: " & Format(currentFlowRate, "0.0") & " m3/h" & vbCrLf
        summary = summary & "风压: " & Format(systemPressure, "0.0") & " Pa" & vbCrLf
        summary = summary & "风机功率: " & Format(fanPower, "0.0") & " kW" & vbCrLf & vbCrLf
    
    Else
        summary = "记录总数: " & totalRecords & vbCrLf
        summary = summary & "累计风量: " & Format(totalFlow, "0.0") & " m3/h" & vbCrLf
        summary = summary & "累计阻力: " & Format(totalResistance, "0.0") & " Pa" & vbCrLf & vbCrLf
        
        summary = summary & "系统风量: " & Format(systemFlow, "0.0") & " m3/h" & vbCrLf
        summary = summary & "系统风压: " & Format(systemPressure, "0.0") & " Pa" & vbCrLf
        summary = summary & "风机功率: " & Format(fanPower, "0.0") & " kW" & vbCrLf & vbCrLf
    End If
    summary = summary & "推荐电机型号: " & selectedMotor(2) & vbCrLf
    summary = summary & "电机功率: " & Format(selectedMotor(3), "0.0") & " kW" & vbCrLf
    summary = summary & "额定电流: " & Format(selectedMotor(5), "0.0") & " A" & vbCrLf
    summary = summary & "转速: " & Format(selectedMotor(6), "0") & " r/min" & vbCrLf
    summary = summary & "重量: " & Format(selectedMotor(9), "0") & " kg" & vbCrLf & vbCrLf
    
    If totalFlow <> 0 Then
    summary = summary & "每个记录的管道类型、长度和弯头数量:" & vbCrLf
    ' 添加每个记录的详细信息
    For i = 1 To colRecords.count
        Set rec = colRecords(i)
        If rec.PipeType = "圆管" Then
        summary = summary & "记录" & i & ": 类型-" & rec.PipeType & _
                  " ,规格-" & Format(rec.Size1, "0.0") & " mm, 长度-" & rec.length & " m, 弯头-" & rec.Bends & "个" & vbCrLf
                  
        Else
            summary = summary & "记录" & i & ": 类型-" & rec.PipeType & _
                  " ,规格-" & Format(rec.Size1, "0.0") & "x" & Format(rec.Size2, "0.0") & " mm, 长度-" & rec.length & " m, 弯头-" & rec.Bends & "个" & vbCrLf
                    
        End If
        If rec.length = 0 Then
        MsgBox "数据无效"
        Exit Sub
        End If
        Next i
        End If
    ' 显示统计信息
    MsgBox summary
End Sub


' 关闭按钮事件
Private Sub CommandButton2_Click()
    FormNavigation.GoBack Me
End Sub

' 处理关闭事件
Private Sub UserForm_QueryClose(Cancel As Integer, CloseMode As Integer)
    ' 如果是用户点击关闭按钮
    If CloseMode = vbFormControlMenu Then
        FormNavigation.HandleFormClose Me, Cancel
    End If
End Sub
