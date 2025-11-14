VERSION 5.00
Begin {C62A69F0-16DC-11CE-9E98-00AA00574A4F} Air_volume 
   Caption         =   "风量计算"
   ClientHeight    =   4440
   ClientLeft      =   108
   ClientTop       =   456
   ClientWidth     =   9504.001
   OleObjectBlob   =   "Air_volume.frx":0000
   StartUpPosition =   1  '所有者中心
End
Attribute VB_Name = "Air_volume"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit
Private params As CycloneParameters

' 以下是用户窗体(AirFlowForm)的代码
Private Sub CommandButton1_Click()
    Dim diameter As Double    ' 直径
    Dim windSpeed As Double   ' 风速
    Dim airFlow As Double     ' 风量
    
    ' 验证输入
    If Not IsNumeric(TextBox1.value) Or TextBox1.value = "" Then
        MsgBox "请输入有效的管道直径数值", vbExclamation, "输入错误"
        TextBox1.SetFocus
        Exit Sub
    End If
    
    If Not IsNumeric(TextBox2.value) Or TextBox2.value = "" Then
        MsgBox "请输入有效的风速数值", vbExclamation, "输入错误"
        TextBox2.SetFocus
        Exit Sub
    End If
    
    ' 转换输入为数值
    diameter = CDbl(TextBox1.value)
    windSpeed = CDbl(TextBox2.value)
    
    ' 验证数值是否为正数
    If diameter <= 0 Then
        MsgBox "管道直径必须为正数", vbExclamation, "输入错误"
        TextBox1.SetFocus
        Exit Sub
    End If
    
    If windSpeed <= 0 Then
        MsgBox "风速必须为正数", vbExclamation, "输入错误"
        TextBox2.SetFocus
        Exit Sub
    End If
    
    ' 调用独立模块中的计算函数获取结果（立方米/小时）
    airFlow = AirFlowCalculations.CalculateAirFlow(diameter, windSpeed)
    
    ' 显示结果，保留4位小数
    Label4.Caption = Format(airFlow, "0.0000")
    
    

   params.InletAirflow = airFlow
   params.InletVelocity = Val(txtInletVelocity.value)
       Dim validationMsg As String
    validationMsg = ValidateParameters(params)
    
    If validationMsg <> "" Then
        MsgBox "参数验证错误：" & vbCrLf & validationMsg, vbExclamation, "参数错误"
        Exit Sub
    End If
       Dim results As CycloneResults
    results = CalculateCyclone(params)
    lblCylinderDiameter.Caption = Format(results.CylinderDiameter, "0.00") & " mm"
    lblTotalHeight.Caption = Format(results.totalHeight, "0.00") & " m"
    lblPressureLoss.Caption = Format(results.PressureLoss, "0") & " Pa"
   
    
End Sub




Private Sub UserForm_Initialize()
    ' 初始化窗体标题
    Me.Caption = "风量计算器"
    ' 清空输入框和结果
    TextBox1.value = ""
    TextBox2.value = ""
    Label4.Caption = ""
     ' 加载默认参数
    params = GetDefaultParameters
    
    ' 设置默认值到窗体控件
    txtInletVelocity.value = params.InletVelocity
End Sub
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

