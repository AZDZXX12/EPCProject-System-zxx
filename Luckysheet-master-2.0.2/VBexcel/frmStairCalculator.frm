VERSION 5.00
Begin {C62A69F0-16DC-11CE-9E98-00AA00574A4F} frmStairCalculator 
   Caption         =   "楼梯材料表"
   ClientHeight    =   3300
   ClientLeft      =   108
   ClientTop       =   456
   ClientWidth     =   9288.001
   OleObjectBlob   =   "frmStairCalculator.frx":0000
   StartUpPosition =   1  '所有者中心
End
Attribute VB_Name = "frmStairCalculator"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
' 模块：frmStairCalculator
Option Explicit

Private Sub cmdCalculate_Click()
    On Error GoTo ErrorHandler
    
    ' 获取用户输入
    Dim stairAngle As Double
    Dim stairHeight As Double
    Dim guardrailHeight As Double
    
    stairAngle = Val(txtAngle.value)
    stairHeight = Val(txtHeight.value)
    guardrailHeight = Val(txtGuardrailHeight.value)
    
    ' 验证输入
    If stairAngle <= 0 Or stairAngle >= 90 Then
        MsgBox "楼梯角度必须在0-90度之间", vbExclamation
        Exit Sub
    End If
    If stairHeight <= 0 Then
        MsgBox "楼梯高度必须大于0", vbExclamation
        Exit Sub
    End If
    If guardrailHeight <= 0 Then
        MsgBox "护栏高度必须大于0", vbExclamation
        Exit Sub
    End If
    
    ' 声明结果变量
    Dim stepsCount As Long
    Dim channelLength As Double
    Dim railingLength As Double
    Dim flatIronLength As Double
    Dim totalWeight As Double
    
    ' 执行计算
    CalculateStairResults stairAngle, stairHeight, guardrailHeight, _
                          stepsCount, channelLength, railingLength, _
                          flatIronLength, totalWeight
    
    ' 显示结果
    txtSteps.Caption = Format(stepsCount, "0")
    txtChannel.Caption = Format(channelLength, "0.000")
    txtRailing.Caption = Format(railingLength, "0.000")
    txtFlatIron.Caption = Format(flatIronLength, "0.000")
    txtWeight.Caption = Format(totalWeight, "0.00")
    
    Exit Sub
    
ErrorHandler:
    MsgBox "计算时出错: " & Err.description, vbCritical
End Sub


Private Sub UserForm_Initialize()
    ' 初始化窗体标题
    Me.Caption = "楼梯材料表"
    txtAngle.value = "45"
    txtHeight.value = "3000"
    txtGuardrailHeight.value = "1200"
    txtSteps.Caption = ""
    txtChannel.Caption = ""
    txtRailing.Caption = ""
    txtFlatIron.Caption = ""
    txtWeight.Caption = ""
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

