VERSION 5.00
Begin {C62A69F0-16DC-11CE-9E98-00AA00574A4F} frmGuardrailCalculator 
   Caption         =   "护栏钢材用量计算程序"
   ClientHeight    =   6204
   ClientLeft      =   108
   ClientTop       =   456
   ClientWidth     =   7476
   OleObjectBlob   =   "frmGuardrailCalculator.frx":0000
   StartUpPosition =   1  '所有者中心
End
Attribute VB_Name = "frmGuardrailCalculator"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit


Private Sub UserForm_Initialize()
    ' 初始化窗体
    Me.Caption = "护栏钢材用量计算程序"
    optPlatform.value = True
End Sub
Private Sub cmdCalculate_Click()
    On Error GoTo ErrorHandler
    
    ' 获取用户输入
    Dim inputLength As Double
    Dim inputHeight As Double
    Dim isPlatform As Boolean
    
    ' 验证长度输入
    If Not IsNumeric(txtLength.value) Then
        MsgBox "请输入有效的护栏长度（数字）", vbExclamation
        txtLength.SetFocus
        Exit Sub
    Else
        inputLength = CDbl(txtLength.value)
        If inputLength <= 0 Then
            MsgBox "护栏长度必须大于0", vbExclamation
            txtLength.SetFocus
            Exit Sub
        End If
    End If
    
    ' 验证高度输入
    If Not IsNumeric(txtHeight.value) Then
        MsgBox "请输入有效的护栏高度（数字）", vbExclamation
        txtHeight.SetFocus
        Exit Sub
    Else
        inputHeight = CDbl(txtHeight.value)
        If inputHeight <= 0 Then
            MsgBox "护栏高度必须大于0", vbExclamation
            txtHeight.SetFocus
            Exit Sub
        End If
        
        ' 检查高度是否符合标准
        If CheckHeightRequirement(inputHeight) Then
            If MsgBox("标准GB4053.3-2009要求护栏高度不应小于1.05m！" & vbCrLf & _
                     "是否继续使用当前高度？", vbExclamation + vbYesNo) = vbNo Then
                txtHeight.SetFocus
                Exit Sub
            End If
        End If
    End If
    
    ' 获取护栏类型
    isPlatform = (optPlatform.value = True)
    
    ' 计算材料明细
    Dim materials As Variant
    materials = CalculateGuardrailMaterials(inputLength, inputHeight, isPlatform)
    
    ' 填充列表框
    FillListBoxWithMaterials lstMaterials, materials
    
    Exit Sub
    
ErrorHandler:
    MsgBox "计算过程中出错: " & Err.description & vbCrLf & "错误代码: " & Err.Number, vbCritical
End Sub

Private Sub FillListBoxWithMaterials(lst As MSForms.ListBox, materials As Variant)
    ' 清空列表框
    lst.Clear
    lst.columnCount = 4
    lst.ColumnWidths = "60;100;100;100"
    
    ' 添加表头
    lst.AddItem
    lst.List(0, 0) = "材料名称"
    lst.List(0, 1) = "规格型号"
    lst.List(0, 2) = "数量"
    lst.List(0, 3) = "重量(kg)"
    
    ' 添加材料明细
    Dim iRow As Integer
    For iRow = 1 To UBound(materials, 1)
        lst.AddItem
        lst.List(iRow, 0) = materials(iRow, 1)
        lst.List(iRow, 1) = materials(iRow, 2)
        lst.List(iRow, 2) = materials(iRow, 3)
        lst.List(iRow, 3) = materials(iRow, 4)
    Next iRow
End Sub

Private Sub cmdClear_Click()
    ' 清空所有输入和输出
    txtLength.value = ""
    txtHeight.value = ""
    optPlatform.value = True
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

