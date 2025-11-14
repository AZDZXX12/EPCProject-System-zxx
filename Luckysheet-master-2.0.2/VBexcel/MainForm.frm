VERSION 5.00
Begin {C62A69F0-16DC-11CE-9E98-00AA00574A4F} MainForm 
   Caption         =   "平台钢材用量计算程序"
   ClientHeight    =   8856.001
   ClientLeft      =   108
   ClientTop       =   456
   ClientWidth     =   11220
   OleObjectBlob   =   "MainForm.frx":0000
   StartUpPosition =   1  '所有者中心
End
Attribute VB_Name = "MainForm"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit

Private Sub lstMaterials_Click()

End Sub

Private Sub UserForm_Initialize()
    ' 初始化窗体
    Me.Caption = "平台钢材用量计算程序"
    chkGuardrail.value = True
    optChannel.value = True ' 默认选择槽钢
End Sub


Private Sub cmdCalculate_Click()
    On Error GoTo ErrorHandler
    
    ' 获取和验证输入
    Dim inputLength As Double, inputWidth As Double, inputHeight As Double
    Dim inputEquipment As Double, hasGuardrail As Boolean, isSquareTube As Boolean
    
    ' 验证长度
    If Not IsNumeric(txtLength.value) Or Val(txtLength.value) <= 0 Then
        MsgBox "请输入有效的平台长度（正数）", vbExclamation
        txtLength.SetFocus
        Exit Sub
    Else
        inputLength = CDbl(txtLength.value)
    End If
    
    ' 验证宽度
    If Not IsNumeric(txtWidth.value) Or Val(txtWidth.value) <= 0 Then
        MsgBox "请输入有效的平台宽度（正数）", vbExclamation
        txtWidth.SetFocus
        Exit Sub
    Else
        inputWidth = CDbl(txtWidth.value)
    End If
    
    ' 验证高度
    If Not IsNumeric(txtHeight.value) Or Val(txtHeight.value) <= 0 Then
        MsgBox "请输入有效的平台高度（正数）", vbExclamation
        txtHeight.SetFocus
        Exit Sub
    Else
        inputHeight = CDbl(txtHeight.value)
    End If
    
   
    ' 验证设备重量
    If txtEquipment.value < 0 Or txtEquipment.value > 10000 Then
    MsgBox "设备重量应在0-10000kg之间", vbExclamation

        txtEquipment.SetFocus
        Exit Sub
    Else
        inputEquipment = CDbl(txtEquipment.value)
    End If
    
    ' 获取选项
    isSquareTube = (optSquareTube.value = True)
    hasGuardrail = (chkGuardrail.value = True)
    
    ' 计算平台主结构
    Dim platformMaterials As Variant
    platformMaterials = CalculatePlatformStructure(inputLength, inputWidth, inputHeight, inputEquipment, isSquareTube)
    
   ' 区域功能：处理护栏材料计算与平台材料的合并逻辑
' 核心作用：根据用户是否需要护栏，决定是否计算护栏材料，并将护栏材料与平台材料合并为统一数组
' 同时计算并添加平台+护栏的结构总重量（不含设备重量）

    Dim combinedMaterials As Variant  ' 最终合并后的所有材料数据数组（平台+护栏，或仅平台）
    
    ' 判断用户是否选择需要护栏（hasGuardrail为布尔值，True=需要，False=不需要）
    If hasGuardrail Then
        Dim guardrailMaterials As Variant  ' 存储单独计算的护栏材料数据
        
        ' 1. 调用护栏计算函数，获取护栏材料明细
        ' 参数说明：
        '   inputLength：护栏长度（通常为平台周长，需提前处理单位为米）
        '   inputHeight：护栏高度（需符合GB4053.3-2009标准，通常≥1.05m）
        '   True：标记为平台护栏（需包含100×4扁铁踢脚线，非平台护栏无需）
        guardrailMaterials = CalculateGuardrailMaterials(inputLength, inputHeight, True)
        
        ' 2. 计算合并后数组的总行数，确保数组大小足够容纳所有数据
        Dim totalRows As Integer
        ' 总行数 = 平台材料非空行数 + 护栏材料非空行数 + 2（1行分隔符 + 1行总重量行）
        totalRows = GetNonEmptyRows(platformMaterials) + GetNonEmptyRows(guardrailMaterials) + 2
        
        ' 3. 初始化合并数组，维度为（1到总行数，1到4列）
        ' 4列分别对应：材料名称、材料型号、数量、重量
        ReDim combinedMaterials(1 To totalRows, 1 To 4)
        Dim currentRow As Integer: currentRow = 1  ' 合并数组的当前写入行号，初始从第1行开始
        
        ' 4. 第一步：将平台材料数据复制到合并数组
        ' 调用CopyMaterials函数完成复制，返回复制后的下一行行号（更新currentRow）
        currentRow = CopyMaterials(platformMaterials, combinedMaterials, currentRow)
        
        ' 5. 第二步：添加分隔行，用于视觉区分平台材料和护栏材料（便于阅读）
        combinedMaterials(currentRow, 1) = "-----护栏材料-----"  ' 分隔行仅在第1列填写标识
        currentRow = currentRow + 1  ' 行号后移，准备写入护栏材料
        
        ' 6. 第三步：将护栏材料数据复制到合并数组（接在分隔行之后）
        currentRow = CopyMaterials(guardrailMaterials, combinedMaterials, currentRow)
        
        ' 7. 第四步：计算并添加「平台+护栏」的结构总重量（不含设备重量）
        Dim platformWeight As Double  ' 平台结构单独总重量（从平台材料数组中提取）
        platformWeight = GetTotalWeight(platformMaterials)  ' 调用函数获取平台总重
        
        Dim guardrailWeight As Double  ' 护栏单独总重量（从护栏材料数组中提取）
        guardrailWeight = GetTotalWeight(guardrailMaterials)  ' 调用函数获取护栏总重
        
        ' 写入总重量行（当前行已指向最后一行数据后，直接填写）
        combinedMaterials(currentRow, 1) = "结构总重量"       ' 第1列：数据标识
        combinedMaterials(currentRow, 2) = "不含设备重量"     ' 第2列：备注（明确排除设备重量）
        combinedMaterials(currentRow, 3) = ""                 ' 第3列：数量列无数据，留空
        combinedMaterials(currentRow, 4) = Format(platformWeight + guardrailWeight, "0.00") & " kg" ' 第4列：总重量（保留2位小数，带单位）
    
    '  Else分支：用户不需要护栏，合并数组直接等于平台材料数组（无需额外处理）
    Else
        combinedMaterials = platformMaterials
    End If
    
    ' 填充列表框
    FillListBoxWithMaterials lstMaterials, combinedMaterials
    
    Exit Sub
    
ErrorHandler:
    MsgBox "计算过程中出错: " & Err.description & vbCrLf & "错误代码: " & Err.Number, vbCritical
End Sub

' 辅助函数：获取非空行数
Private Function GetNonEmptyRows(materials As Variant) As Integer
    Dim count As Integer: count = 0
    Dim i As Integer
    For i = 1 To UBound(materials, 1)
        If materials(i, 1) <> "" Then count = count + 1
    Next i
    GetNonEmptyRows = count
End Function

' 辅助函数：复制材料数据
Private Function CopyMaterials(source As Variant, target As Variant, startRow As Integer) As Integer
    Dim i As Integer, j As Integer
    Dim currentRow As Integer: currentRow = startRow
    
    For i = 1 To UBound(source, 1)
        If source(i, 1) <> "" Then
            For j = 1 To 4
                target(currentRow, j) = source(i, j)
            Next j
            currentRow = currentRow + 1
        End If
    Next i
    
    CopyMaterials = currentRow
End Function

' 辅助函数：获取总重量
Private Function GetTotalWeight(materials As Variant) As Double
    Dim total As Double
    total = 0
    
    ' 检查输入是否有效
    If Not IsArray(materials) Then
        GetTotalWeight = 0
        Exit Function
    End If
    
    Dim i As Long
    For i = LBound(materials, 1) To UBound(materials, 1)
        ' 检查是否为空行
        If Not IsEmpty(materials(i, 1)) Then
            ' 检查是否是重量行（包含"重量"关键字）
            If InStr(1, materials(i, 1), "重量") > 0 Then
                ' 提取重量值（处理可能包含"kg"的情况）
                Dim weightStr As String
                weightStr = materials(i, 4)
                
                ' 清理字符串中的非数字字符
                weightStr = Replace(weightStr, "kg", "")
                weightStr = Replace(weightStr, "KG", "")
                weightStr = Trim(weightStr)
                
                ' 转换为数值
                If IsNumeric(weightStr) Then
                    total = total + CDbl(weightStr)
                End If
            End If
        End If
    Next i
    
    GetTotalWeight = total
End Function

Private Sub FillListBoxWithMaterials(lst As MSForms.ListBox, materials As Variant)
    On Error GoTo ErrorHandler
    
    ' 清空列表框
    lst.Clear
    lst.columnCount = 4
    lst.ColumnWidths = "140;100;120;120"
    
    ' 添加表头
    lst.AddItem
    lst.List(0, 0) = "材料名称"
    lst.List(0, 1) = "规格型号"
    lst.List(0, 2) = "数量"
    lst.List(0, 3) = "重量(kg)"
    
    ' 添加材料明细
    Dim iRow As Integer
    For iRow = 1 To UBound(materials, 1)
        If materials(iRow, 1) <> "" Then
            lst.AddItem
            lst.List(lst.ListCount - 1, 0) = materials(iRow, 1)
            lst.List(lst.ListCount - 1, 1) = materials(iRow, 2)
            lst.List(lst.ListCount - 1, 2) = materials(iRow, 3)
            lst.List(lst.ListCount - 1, 3) = materials(iRow, 4)
        End If
    Next iRow
    
    Exit Sub
    
ErrorHandler:
    MsgBox "填充列表框时出错: " & Err.description & vbCrLf & _
           "行号: " & iRow, vbCritical
End Sub

Private Sub cmdClear_Click()
    ' 清空所有输入和输出
    txtLength.value = ""
    txtWidth.value = ""
    txtHeight.value = ""
    txtEquipment.value = ""
    optChannel.value = True
    chkGuardrail.value = True
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

