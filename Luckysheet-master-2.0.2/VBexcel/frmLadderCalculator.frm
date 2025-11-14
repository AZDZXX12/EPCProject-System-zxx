VERSION 5.00
Begin {C62A69F0-16DC-11CE-9E98-00AA00574A4F} frmLadderCalculator 
   Caption         =   "爬梯钢材用量计算程序"
   ClientHeight    =   9768.001
   ClientLeft      =   108
   ClientTop       =   456
   ClientWidth     =   7884
   OleObjectBlob   =   "frmLadderCalculator.frx":0000
   StartUpPosition =   1  '所有者中心
End
Attribute VB_Name = "frmLadderCalculator"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
' 用户窗体模块：frmLadderCalculator
Option Explicit


' 自定义函数：填充列表框并增加行高
Private Sub FillListBoxWithMaterials(lst As MSForms.ListBox, materials As Variant)
    ' 清空列表框
    lst.Clear
    lst.columnCount = 4
    lst.ColumnWidths = "80;110;80;80"
    
    ' 添加表头
    lst.AddItem
    lst.List(0, 0) = "材料名称"
    lst.List(0, 1) = "规格型号"
    lst.List(0, 2) = "数量"
    lst.List(0, 3) = "重量(kg)"
    
    ' 添加材料明细
    Dim iRow As Integer
    For iRow = 1 To UBound(materials, 1)
        ' 跳过空行
        If materials(iRow, 1) <> "" Then
            lst.AddItem
            lst.List(lst.ListCount - 1, 0) = materials(iRow, 1)
            lst.List(lst.ListCount - 1, 1) = materials(iRow, 2)
            lst.List(lst.ListCount - 1, 2) = materials(iRow, 3)
            lst.List(lst.ListCount - 1, 3) = materials(iRow, 4)
        End If
    Next iRow
End Sub




Private Sub UserForm_Initialize()
    ' 初始化窗体
    Me.Caption = "爬梯钢材用量计算程序"
    chkCage.value = True
End Sub
Private Sub cmdCalculate_Click()
    On Error GoTo ErrorHandler
    
    ' 获取用户输入
    Dim inputHeight As Double
    Dim inputWidth As Double
    Dim hasCage As Boolean
    
    ' 验证高度输入
    If Not IsNumeric(txtHeight.value) Then
        MsgBox "请输入有效的爬梯高度（数字）", vbExclamation
        txtHeight.SetFocus
        Exit Sub
    Else
        inputHeight = CDbl(txtHeight.value)
        If inputHeight <= 0 Then
            MsgBox "爬梯高度必须大于0", vbExclamation
            txtHeight.SetFocus
            Exit Sub
        End If
    End If
    
    ' 验证梯宽输入
    If Not IsNumeric(txtWidth.value) Then
        MsgBox "请输入有效的梯宽（数字）", vbExclamation
        txtWidth.SetFocus
        Exit Sub
    Else
        inputWidth = CDbl(txtWidth.value)
        If inputWidth <= 0 Then
            MsgBox "梯宽必须大于0", vbExclamation
            txtWidth.SetFocus
            Exit Sub
        End If
        
        ' GB4053.1-2009要求梯宽在400-600mm之间
        If inputWidth < 400 Or inputWidth > 600 Then
            If MsgBox("标准GB4053.1-2009要求梯宽在400-600mm之间，是否继续使用当前值？", _
                      vbQuestion + vbYesNo) = vbNo Then
                txtWidth.SetFocus
                Exit Sub
            End If
        End If
    End If
    
    ' 获取是否设笼
    hasCage = (chkCage.value = True)
    
    ' 检查护笼要求 (GB4053.1-2009)
    If CheckCageRequirement(inputHeight, hasCage) Then
        If MsgBox("根据GB4053.1-2009标准，爬梯高度超过3m应设置护笼！" & vbCrLf & _
                 "是否要添加护笼？", vbExclamation + vbYesNo) = vbYes Then
            chkCage.value = True
            hasCage = True
        End If
    End If
    
    ' 计算平台数量 (每6m设置一个平台)
    Dim platformCount As Integer
    platformCount = CalculatePlatformCount(inputHeight)
    txtPlatforms.Caption = platformCount
    
    ' 计算平台高度
    Dim platformHeights As Variant
    If platformCount > 0 Then
        platformHeights = CalculatePlatformHeights(inputHeight, platformCount)
        
        Dim heightList As String
        Dim i As Integer
        For i = LBound(platformHeights) To UBound(platformHeights)
            heightList = heightList & Format(platformHeights(i) / 1000, "0.0") & "m"
            If i < UBound(platformHeights) Then heightList = heightList & ", "
        Next i
        txtPlatformHeights.Caption = heightList
    Else
        txtPlatformHeights.Caption = "无"
    End If
    
    ' 计算踏棍间距 (GB4053.1-2009要求)
    Dim rungSpacing As Double
    rungSpacing = CalculateRungSpacing(inputHeight)
    txtRungSpacing.Caption = Format(rungSpacing, "0") & " mm"
    
    ' 计算材料明细
    Dim materials As Variant
    materials = CalculateMaterials(inputHeight, inputWidth, hasCage)
    
    ' 填充列表框
    FillListBoxWithMaterials lstMaterials, materials
    
    ' 显示总重量
    txtTotalWeight.Caption = materials(12, 4)
    
    Exit Sub
    
ErrorHandler:
    MsgBox "计算过程中出错: " & Err.description & vbCrLf & "错误代码: " & Err.Number, vbCritical
End Sub

Private Sub cmdClear_Click()
    ' 清空所有输入和输出
    txtHeight.value = ""
    txtWidth.value = ""
    chkCage.value = True
    txtPlatforms.Caption = ""
    txtPlatformHeights.Caption = ""
    txtRungSpacing.Caption = ""
    txtTotalWeight.Caption = ""
    lstMaterials.Clear
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

