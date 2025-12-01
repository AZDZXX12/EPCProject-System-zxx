VERSION 5.00
Begin {C62A69F0-16DC-11CE-9E98-00AA00574A4F} StartHeatSource 
   Caption         =   "烘干设备热源计算器 "
   ClientHeight    =   6168
   ClientLeft      =   108
   ClientTop       =   456
   ClientWidth     =   5100
   OleObjectBlob   =   "StartHeatSource.frx":0000
   StartUpPosition =   1  '所有者中心
End
Attribute VB_Name = "StartHeatSource"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False

Option Explicit



Private Sub UserForm_Initialize()
    ' 设置默认值
    txtTargetMoisture.value = "1"
    txtInitialTemp.value = "20"
    txtHotAirTemp.value = "180"
    
    ' 初始化列表框列标题
    With lstResults
        .columnCount = 2
        .ColumnWidths = "100 ;100"
        .AddItem
        .List(0, 0) = "热源类型"
        .List(0, 1) = "需求值"
    End With
End Sub

Private Sub btnCalculate_Click()
    ' 清除列表框内容（保留标题）
    While lstResults.ListCount > 1
        lstResults.RemoveItem 1
    Wend
    
    ' 获取输入值
    Dim throughput As Double
    Dim initialMoisture As Double
    Dim targetMoisture As Double
    Dim hotAirTemp As Double
    Dim initialTemp As Double
    
    ' 验证并转换输入
    If Not IsNumeric(txtThroughput.value) Then
        MsgBox "请输入有效的物料通过量!", vbExclamation
        Exit Sub
    Else
        throughput = CDbl(txtThroughput.value)
    End If
    
    If Not IsNumeric(txtInitialMoisture.value) Then
        MsgBox "请输入有效的初始含水率!", vbExclamation
        Exit Sub
    Else
        initialMoisture = CDbl(txtInitialMoisture.value)
    End If
    
    targetMoisture = CDbl(txtTargetMoisture.value)
    hotAirTemp = CDbl(txtHotAirTemp.value)
    initialTemp = CDbl(txtInitialTemp.value)
    
    ' 验证输入范围
    If initialMoisture >= 20 Then
        MsgBox "初始含水率应小于20%!", vbExclamation
        Exit Sub
    End If
    
    If hotAirTemp < 100 Or hotAirTemp > 300 Then
        MsgBox "热风温度应在100-300℃之间!", vbExclamation
        Exit Sub
    End If
    
    ' 调用计算函数
    Dim results As Variant
    results = CalculateHeatSource(throughput, initialMoisture, targetMoisture, hotAirTemp, initialTemp)
    
    ' 检查计算结果
    If results(0) < 0 Then
        MsgBox "计算错误：请检查输入参数!", vbCritical
        Exit Sub
    End If
    
    ' 将结果添加到列表框
    With lstResults
        .AddItem
        .List(.ListCount - 1, 0) = "总热负荷"
        .List(.ListCount - 1, 1) = Format(results(0) / 10000, "0.00") & " 万大卡/小时"
        
        .AddItem
        .List(.ListCount - 1, 0) = "生物质燃烧器"
        .List(.ListCount - 1, 1) = Format(results(1), "0.0") & " kg/h"
        
        .AddItem
        .List(.ListCount - 1, 0) = "天然气热水器"
        .List(.ListCount - 1, 1) = Format(results(2), "0.0") & " m3/h"
        
        .AddItem
        .List(.ListCount - 1, 0) = "蒸汽换热器"
        .List(.ListCount - 1, 1) = Format(results(3), "0.0") & " kg/h"
    End With
    
'    ' 添加分隔线
'    lstResults.AddItem
'    lstResults.List(lstResults.ListCount - 1, 0) = String(50, "-")
'    lstResults.List(lstResults.ListCount - 1, 1) = String(50, "-")
'
'    ' 添加计算参数摘要
'    lstResults.AddItem
'    lstResults.List(lstResults.ListCount - 1, 0) = "计算参数"
'    lstResults.List(lstResults.ListCount - 1, 1) = "值"
'
'    lstResults.AddItem
'    lstResults.List(lstResults.ListCount - 1, 0) = "物料通过量"
'    lstResults.List(lstResults.ListCount - 1, 1) = throughput & " 吨/小时"
'
'    lstResults.AddItem
'    lstResults.List(lstResults.ListCount - 1, 0) = "初始含水率"
'    lstResults.List(lstResults.ListCount - 1, 1) = initialMoisture & "%"
'
'    lstResults.AddItem
'    lstResults.List(lstResults.ListCount - 1, 0) = "目标含水率"
'    lstResults.List(lstResults.ListCount - 1, 1) = targetMoisture & "%"
'
'    lstResults.AddItem
'    lstResults.List(lstResults.ListCount - 1, 0) = "热风温度"
'    lstResults.List(lstResults.ListCount - 1, 1) = hotAirTemp & " ℃"
'
'    lstResults.AddItem
'    lstResults.List(lstResults.ListCount - 1, 0) = "初始物料温度"
'    lstResults.List(lstResults.ListCount - 1, 1) = initialTemp & " ℃"
End Sub

Private Sub btnClear_Click()
    ' 清除列表框内容
    lstResults.Clear
    
    ' 重新添加列标题
    With lstResults
        .columnCount = 2
        .ColumnWidths = "100 ;100"
        .AddItem
        .List(0, 0) = "热源类型"
        .List(0, 1) = "需求值"
    End With
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

