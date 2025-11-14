VERSION 5.00
Begin {C62A69F0-16DC-11CE-9E98-00AA00574A4F} frmCableCalculator 
   Caption         =   "UserForm1"
   ClientHeight    =   5640
   ClientLeft      =   108
   ClientTop       =   456
   ClientWidth     =   9192.001
   OleObjectBlob   =   "frmCableCalculator.frx":0000
   StartUpPosition =   1  '所有者中心
End
Attribute VB_Name = "frmCableCalculator"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
' frmCableCalculator 用户窗体代码
Option Explicit


Private Sub UserForm_Initialize()
    StartCableCalculator
    ' 初始化启动方式下拉框
    cmbStartMethod.AddItem "直接启动"
    cmbStartMethod.AddItem "星三角启动"
    cmbStartMethod.AddItem "变频启动"
    cmbStartMethod.value = "直接启动"
    
    ' 初始化安装方式下拉框
    cmbInstallType.AddItem "桥架铺设"
    cmbInstallType.AddItem "穿线管-钢"
    cmbInstallType.AddItem "穿线管-胶"
    cmbInstallType.value = "桥架铺设"
    
    ' 初始化电压下拉框
    cmbVoltage.AddItem "0.6"
    cmbVoltage.AddItem "6"
    cmbVoltage.value = "0.6"
    
    ' 初始化芯数下拉框
    cmbCoreType.AddItem "1芯"
    cmbCoreType.AddItem "2芯"
    cmbCoreType.AddItem "3芯"
    cmbCoreType.AddItem "4芯"
    cmbCoreType.AddItem "5芯"
    cmbCoreType.AddItem "3+1芯"
    cmbCoreType.AddItem "3+2芯"
    cmbCoreType.AddItem "4+1芯"
    cmbCoreType.value = "3芯"
    
'    ' 初始化电机功率下拉框（从电机数据中获取）
'    Dim i As Integer
'    For i = 1 To 101
'        If Not IsEmpty(motorData(i, 3)) Then
'            cmbMotorPower.AddItem motorData(i, 3)
'        End If
'    Next i
' 初始化电机功率下拉框（从电机数据中获取）
    InitializeMotorPowerComboBox
End Sub

' 初始化电机功率下拉框
Private Sub InitializeMotorPowerComboBox()
    ' 清空现有项
    cmbMotorPower.Clear
    
    ' 获取电机功率列表
    Dim powerList As Collection
    Set powerList = GetMotorPowerList()
    
    ' 添加功率值到下拉框
    Dim powerValue As Variant
    For Each powerValue In powerList
        cmbMotorPower.AddItem powerValue
    Next powerValue
    
    ' 默认选择第一个功率值
    If cmbMotorPower.ListCount > 0 Then
        cmbMotorPower.ListIndex = 0
    End If
End Sub
'    Dim i As Integer
'    Dim dict As Object
'    Dim powerList As Collection
'    Dim powerArray() As Variant
'    Dim temp As Variant
'    Dim j As Integer, k As Integer
'    Dim powerValue As Variant '
'
'    ' 初始化字典（用于去重）和集合（临时存储）
'    Set dict = CreateObject("Scripting.Dictionary")
'    Set powerList = New Collection
'
'    ' 1. 提取不重复的有效功率值
'    For i = 1 To 101
'        powerValue = motorData(i, 3)
'
'        ' 过滤空值和非数值（避免无效数据）
'        If Not IsEmpty(powerValue) And IsNumeric(powerValue) And powerValue <> "" Then
'            ' 去重逻辑：字典中不存在则添加
'            If Not dict.exists(powerValue) Then
'                dict.Add powerValue, powerValue
'                powerList.Add powerValue ' 存入集合
'            End If
'        End If
'    Next i
'
'    ' 2. 转换为数组准备排序
'    ReDim powerArray(1 To powerList.count)
'    For i = 1 To powerList.count
'        powerArray(i) = powerList(i)
'    Next i
'
'    ' 3. 冒泡排序（从大到小）
'    For j = 1 To UBound(powerArray) - 1
'        For k = j + 1 To UBound(powerArray)
'            ' 降序排列：前值 < 后值则交换
'            If powerArray(j) < powerArray(k) Then
'                temp = powerArray(j)
'                powerArray(j) = powerArray(k)
'                powerArray(k) = temp
'            End If
'        Next k
'    Next j
'
'    ' 4. 排序后的数据可用于下拉框等场景
'    ' 示例：填充下拉框
'    cmbMotorPower.Clear ' 清空原有内容
'    For i = 1 To UBound(powerArray)
'        cmbMotorPower.AddItem powerArray(i)
'    Next i
'
'    ' 释放对象
'    Set dict = Nothing
'    Set powerList = Nothing
'

Private Sub btnCalculate_Click()
    Dim cableLength As Double
    Dim motorPower As Double
    Dim startMethod As String
    Dim installType As String
    Dim voltage As Double
    Dim coreType As String
    Dim coreCount As Integer
    
    ' 验证输入
    If Not IsNumeric(txtLength.value) Then
        MsgBox "请输入有效的电缆长度"
        Exit Sub
    End If
    
    If cmbMotorPower.value = "" Then
        MsgBox "请选择电机功率"
        Exit Sub
    End If
    
    cableLength = CDbl(txtLength.value)
    motorPower = CDbl(cmbMotorPower.value)
    startMethod = cmbStartMethod.value
    installType = cmbInstallType.value
    voltage = CDbl(cmbVoltage.value)
    coreType = cmbCoreType.value
    
    ' 转换芯数类型为数字代码
    If coreType = "1芯" Then
        coreCount = 1
    ElseIf coreType = "2芯" Then
        coreCount = 2
    ElseIf coreType = "3芯" Then
        coreCount = 3
    ElseIf coreType = "4芯" Then
        coreCount = 4
    ElseIf coreType = "5芯" Then
        coreCount = 5
    ElseIf coreType = "3+1芯" Then
        coreCount = 31
    ElseIf coreType = "3+2芯" Then
        coreCount = 32
    ElseIf coreType = "4+1芯" Then
        coreCount = 41
    End If
    
    ' 计算并显示结果
    lblResult.Caption = CalculateCableSection(cableLength, motorPower, startMethod, installType, voltage, coreCount)
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
