VERSION 5.00
Begin {C62A69F0-16DC-11CE-9E98-00AA00574A4F} Cyclone 
   Caption         =   "旋风除尘器选型计算"
   ClientHeight    =   7140
   ClientLeft      =   108
   ClientTop       =   456
   ClientWidth     =   9912.001
   OleObjectBlob   =   "Cyclone.frx":0000
   StartUpPosition =   1  '所有者中心
End
Attribute VB_Name = "Cyclone"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit

Private params As CycloneParameters
Private Sub UserForm_Initialize()
    ' 加载默认参数
    params = GetDefaultParameters
    
    ' 设置默认值到窗体控件
    txtInletAirflow.value = params.InletAirflow
    txtInletVelocity.value = params.InletVelocity
    txtCylinderLengthRatio.value = params.CylinderLengthRatio
    txtConeLengthRatio.value = params.ConeLengthRatio
    txtOutletDiameterRatio.value = params.OutletDiameterRatio
    txtInnerCylinderLengthRatio.value = params.InnerCylinderLengthRatio
    txtInletHeightRatio.value = params.InletHeightRatio
    txtDustOutletRatio.value = params.DustOutletRatio
    txtInletWidthRatio.value = params.InletWidthRatio
End Sub

   
  
Private Sub cmdCalculate_Click()
    On Error GoTo ErrorHandler
    
    ' 从窗体获取参数
    params.InletAirflow = Val(txtInletAirflow.value)
    params.InletVelocity = Val(txtInletVelocity.value)
    params.CylinderLengthRatio = Val(txtCylinderLengthRatio.value)
    params.ConeLengthRatio = Val(txtConeLengthRatio.value)
    params.OutletDiameterRatio = Val(txtOutletDiameterRatio.value)
    params.InnerCylinderLengthRatio = Val(txtInnerCylinderLengthRatio.value)
    params.InletHeightRatio = Val(txtInletHeightRatio.value)
    params.DustOutletRatio = Val(txtDustOutletRatio.value)
    params.InletWidthRatio = Val(txtInletWidthRatio.value)
    
    ' 验证参数
    Dim validationMsg As String
    validationMsg = ValidateParameters(params)
    
    If validationMsg <> "" Then
        MsgBox "参数验证错误：" & vbCrLf & validationMsg, vbExclamation, "参数错误"
        Exit Sub
    End If
    
    ' 执行计算
    Dim results As CycloneResults
    results = CalculateCyclone(params)
    
    ' 显示计算结果
    lblInletHeight.Caption = Format(results.InletHeight, "0.00") & " mm"
    lblInletWidth.Caption = Format(results.InletWidth, "0.00") & " mm"
    lblCylinderDiameter.Caption = Format(results.CylinderDiameter, "0.00") & " mm"
    lblOutletDiameter.Caption = Format(results.OutletDiameter, "0.00") & " mm"
    lblOutletInsertionDepth.Caption = Format(results.OutletInsertionDepth, "0.00") & " mm"
    lblStraightSectionHeight.Caption = Format(results.StraightSectionHeight, "0.00") & " mm"
    lblConeHeight.Caption = Format(results.ConeHeight, "0.00") & " m"
    lblTotalHeight.Caption = Format(results.totalHeight, "0.00") & " m"
    lblDustOutletDiameter.Caption = Format(results.DustOutletDiameter, "0.00") & " mm"
    lblPressureLoss.Caption = Format(results.PressureLoss, "0.00") & " Pa"
    
    Exit Sub
    
ErrorHandler:
    MsgBox "计算错误: " & Err.description, vbCritical, "错误"
End Sub

Private Sub cmdDefaults_Click()
    ' 重置为默认参数
    params = GetDefaultParameters
    
    txtInletAirflow.value = params.InletAirflow
    txtInletVelocity.value = params.InletVelocity
    txtCylinderLengthRatio.value = params.CylinderLengthRatio
    txtConeLengthRatio.value = params.ConeLengthRatio
    txtOutletDiameterRatio.value = params.OutletDiameterRatio
    txtInnerCylinderLengthRatio.value = params.InnerCylinderLengthRatio
    txtInletHeightRatio.value = params.InletHeightRatio
    txtDustOutletRatio.value = params.DustOutletRatio
    txtInletWidthRatio.value = params.InletWidthRatio
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

