VERSION 5.00
Begin {C62A69F0-16DC-11CE-9E98-00AA00574A4F} frmRollingScreen 
   Caption         =   "滚动筛分机材料计算"
   ClientHeight    =   9516.001
   ClientLeft      =   108
   ClientTop       =   456
   ClientWidth     =   10308
   OleObjectBlob   =   "frmRollingScreen.frx":0000
   StartUpPosition =   1  '所有者中心
End
Attribute VB_Name = "frmRollingScreen"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
'========================
' 用户窗体: frmRollingScreen
' ========================
' 窗体控件:
'   txtAngle: 筛分机架设角度
'   cmbDiameter: 筛分机滚筒直径 (组合框)
'   cmbLength: 筛分机滚筒长度 (组合框)
'   txtHeight: 筛分架设高度
'   txtWidth: 工作平台宽度
'   txtLegCount: 支腿架设数目
'   txtGuardrail: 护栏高度
'   txtOutput: 输出结果 (多行文本框)
'   cmdCalculate: 计算按钮
'   cmdClear: 清除按钮
'   cmdClose: 关闭按钮
Option Explicit


Private Sub InitializeComboBoxes()
    ' 初始化滚筒直径选项
    Dim i As Double
    For i = 1.2 To 2.8 Step 0.2
        cmbDiameter.AddItem Format(i, "0.0")
    Next i
    cmbDiameter.ListIndex = 2 ' 默认选择1.6米
    
    ' 初始化滚筒长度选项
    For i = 4 To 9
        cmbLength.AddItem CStr(i)
    Next i
    cmbLength.ListIndex = 2 ' 默认选择6米
End Sub

Private Sub FormatListBox()
    ' 清空列表框并设置列标题
    lstOutput.Clear
    With lstOutput
        .columnCount = 4
        .ColumnWidths = "100;160;100;100"
    End With
    lstOutput.AddItem
    lstOutput.List(0, 0) = "项目"
    lstOutput.List(0, 1) = "规格/描述"
    lstOutput.List(0, 2) = "用量"
    lstOutput.List(0, 3) = "重量"
End Sub


Private Sub UserForm_Initialize()
Dim i As Integer
    ' 初始化滚筒直径选项 (1.2-2.8米，间隔0.2米)
    For i = 12 To 28 Step 2
        cmbDiameter.AddItem Format(i / 10, "0.0")
    Next i
    cmbDiameter.ListIndex = 2
    
    ' 初始化滚筒长度选项 (4-9米间隔1米)
    For i = 4 To 9
        cmbLength.AddItem CStr(i)
    Next i
    cmbLength.ListIndex = 2
    
    ' 设置默认值
    txtAngle.value = "4"
    txtHeight.value = "3500"
    txtWidth.value = "700"
    txtLegCount.value = "4"
    txtGuardrail.value = "1200"
    FormatListBox ' 清空列表框
End Sub

Private Sub cmdCalculate_Click()
' 验证输入
    If Not ValidateInputs Then Exit Sub
    
    ' 获取输入值
    Dim diameter As Double: diameter = CDbl(cmbDiameter.value) * 1000
    Dim length As Double: length = CDbl(cmbLength.value) * 1000
    Dim height As Double: height = CDbl(txtHeight.value)
    Dim width As Double: width = CDbl(txtWidth.value)
    Dim legCount As Integer: legCount = CInt(txtLegCount.value)
    Dim guardrailHeight As Double: guardrailHeight = CDbl(txtGuardrail.value)
    
    ' 计算材料
    Dim legMaterials As Variant
    legMaterials = CalculateLegMaterials(legCount, height, diameter)
    
    Dim platformMaterials As Variant
    platformMaterials = CalculatePlatformMaterials(diameter, length, width)
    
    Dim guardrailMaterials As Variant
    guardrailMaterials = CalculateGuardrailMaterials( _
        (length + 800 + width * 4 + diameter * 2) / 1000, _
        guardrailHeight / 1000, _
        True)
    
    ' 格式化列表框
    FormatListBox
   ' 添加设备参数到列表框
    With lstOutput
     ' 计算并显示整个项目的总重量
    Dim legTotalWeight As Double
    ' 提取支腿总重量（去掉单位）
    legTotalWeight = Val(Replace(Replace(legMaterials(4), " kg", ""), " ", ""))
    
    Dim platformTotalWeight As Double
    ' 提取平台总重量（去掉单位）
    platformTotalWeight = Val(Replace(Replace(platformMaterials(16), " kg", ""), " ", ""))
    
    Dim guardrailTotalWeight As Double
    ' 提取护栏总重量（去掉单位）
    ' 注意：总计在数组的第5行第4列
    guardrailTotalWeight = Val(Replace(Replace(guardrailMaterials(5, 4), " kg", ""), " ", ""))
    
    Dim projectTotalWeight As Double
    projectTotalWeight = legTotalWeight + platformTotalWeight + guardrailTotalWeight
    
    ' 在列表框中添加总重量部分
    With lstOutput
'        .AddItem
        .AddItem
        .List(.ListCount - 1, 0) = "【项目总重量】"
        
        .AddItem
        .List(.ListCount - 1, 0) = "支腿总重量"
        .List(.ListCount - 1, 3) = legMaterials(4)  ' 原始带单位字符串
        
        .AddItem
        .List(.ListCount - 1, 0) = "平台总重量"
        .List(.ListCount - 1, 3) = platformMaterials(16)  ' 原始带单位字符串
        
        .AddItem
        .List(.ListCount - 1, 0) = "护栏总重量"
        .List(.ListCount - 1, 3) = guardrailMaterials(5, 4)  ' 原始带单位字符串
        
        .AddItem
        .List(.ListCount - 1, 0) = "合计总重量"
        .List(.ListCount - 1, 3) = Format(projectTotalWeight, "0.00") & " kg"
    End With
    
'        .AddItem
'        .List(.ListCount - 1, 0) = "【设备参数】"
'
'        .AddItem
'        .List(.ListCount - 1, 0) = "滚筒直径"
'        .List(.ListCount - 1, 1) = cmbDiameter.value & " m"
'
'        .AddItem
'        .List(.ListCount - 1, 0) = "滚筒长度"
'        .List(.ListCount - 1, 1) = cmbLength.value & " m"
'
'        .AddItem
'        .List(.ListCount - 1, 0) = "架设高度"
'        .List(.ListCount - 1, 1) = txtHeight.value & " mm"
'
'        .AddItem
'        .List(.ListCount - 1, 0) = "平台宽度"
'        .List(.ListCount - 1, 1) = txtWidth.value & " mm"
'
'        .AddItem
'        .List(.ListCount - 1, 0) = "支腿数量"
'        .List(.ListCount - 1, 1) = txtLegCount.value
'
'        .AddItem
'        .List(.ListCount - 1, 0) = "护栏高度"
'        .List(.ListCount - 1, 1) = txtGuardrail.value & " mm"
'
        ' 添加支腿材料
        .AddItem
        .AddItem
        .List(.ListCount - 1, 0) = "【支腿材料】"
        
       .AddItem
        .List(.ListCount - 1, 0) = "选型逻辑"
        .List(.ListCount - 1, 1) = legMaterials(5)
        .List(.ListCount - 1, 2) = "" ' 清空第三列
        .List(.ListCount - 1, 3) = "" ' 清空第四列
        
        .AddItem
        .List(.ListCount - 1, 0) = "型号"
        .List(.ListCount - 1, 1) = legMaterials(1)
        
        .AddItem
        .List(.ListCount - 1, 0) = "总长度"
        .List(.ListCount - 1, 2) = legMaterials(2)
        
        .AddItem
        .List(.ListCount - 1, 0) = "单位重量"
        .List(.ListCount - 1, 3) = legMaterials(3)
        
        .AddItem
        .List(.ListCount - 1, 0) = "总重量"
        .List(.ListCount - 1, 3) = legMaterials(4)
        ' 添加平台材料
        .AddItem
        .AddItem
        .List(.ListCount - 1, 0) = "【平台材料】"
        
        .AddItem
        .List(.ListCount - 1, 0) = "横撑数量"
        .List(.ListCount - 1, 2) = platformMaterials(1)
        
        .AddItem
        .List(.ListCount - 1, 0) = "两边平台槽钢"
        .List(.ListCount - 1, 1) = platformMaterials(7) ' 显示材料规格
        .List(.ListCount - 1, 2) = platformMaterials(2) ' 显示长度
        .List(.ListCount - 1, 3) = platformMaterials(11) ' 显示重量
        
        .AddItem
        .List(.ListCount - 1, 0) = "两边平台角铁"
        .List(.ListCount - 1, 1) = platformMaterials(8)
        .List(.ListCount - 1, 2) = platformMaterials(3)
        .List(.ListCount - 1, 3) = platformMaterials(12)
        
        .AddItem
        .List(.ListCount - 1, 0) = "前平台槽钢"
        .List(.ListCount - 1, 1) = platformMaterials(7)
        .List(.ListCount - 1, 2) = platformMaterials(4)
        .List(.ListCount - 1, 3) = platformMaterials(13)
        
        .AddItem
        .List(.ListCount - 1, 0) = "后平台槽钢"
        .List(.ListCount - 1, 1) = platformMaterials(7)
        .List(.ListCount - 1, 2) = platformMaterials(5)
        .List(.ListCount - 1, 3) = platformMaterials(14)
        
        .AddItem
        .List(.ListCount - 1, 0) = "花纹板"
        .List(.ListCount - 1, 1) = platformMaterials(9)
        .List(.ListCount - 1, 2) = platformMaterials(6)
        .List(.ListCount - 1, 3) = platformMaterials(15)
        
        ' 添加平台总重量
        .AddItem
        .List(.ListCount - 1, 0) = "平台总重量"
        .List(.ListCount - 1, 3) = platformMaterials(16)
        
        
        ' 添加护栏材料
        .AddItem
        .AddItem
        .List(.ListCount - 1, 0) = "【护栏材料】"
        
        Dim i As Integer
        For i = 1 To UBound(guardrailMaterials, 1)
            .AddItem
            .List(.ListCount - 1, 0) = guardrailMaterials(i, 1)
            .List(.ListCount - 1, 1) = guardrailMaterials(i, 2)
            .List(.ListCount - 1, 2) = guardrailMaterials(i, 3)
            .List(.ListCount - 1, 3) = guardrailMaterials(i, 4)
        Next i
        
        ' 添加安全警告
        If CheckHeightRequirement(guardrailHeight / 1000) Then
            .AddItem
            .AddItem
            .List(.ListCount - 1, 0) = "【安全警告】"
            .List(.ListCount - 1, 1) = "护栏高度不符合GB4053.3-2009标准要求(≥1050mm)!"
        End If
  
     End With
End Sub


Private Sub cmdClear_Click()
    ' 清除所有输入
    cmbDiameter.ListIndex = 2
    cmbLength.ListIndex = 2
    txtAngle.value = "4"
    txtHeight.value = "3500"
    txtWidth.value = "700"
    txtLegCount.value = "4"
    txtGuardrail.value = "1200"
    FormatListBox ' 清空列表框
End Sub



Private Function ValidateInputs() As Boolean
    ValidateInputs = True
    Dim msg As String
    
    ' 检查支腿数量
    If Not IsNumeric(txtLegCount.value) Or Val(txtLegCount.value) <= 0 Then
        msg = "请输入有效的支腿架设数目(4,6,8等)!"
    ElseIf Not (txtLegCount.value = "4" Or txtLegCount.value = "6" Or txtLegCount.value = "8") Then
        msg = "支腿数量建议为4,6或8条!"
    ' 检查高度范围 (2-7米)
    ElseIf Not IsNumeric(txtHeight.value) Or Val(txtHeight.value) < 2000 Or Val(txtHeight.value) > 7000 Then
        msg = "架设高度需在2000-7000mm之间!"
    ' 检查滚筒直径
    ElseIf cmbDiameter.value = "" Then
        msg = "请选择滚筒直径(1.2-2.8米)!"
    ' 检查滚筒长度
    ElseIf cmbLength.value = "" Then
        msg = "请选择滚筒长度(4-9米)!"
    ' 检查平台宽度
    ElseIf Not IsNumeric(txtWidth.value) Or Val(txtWidth.value) <= 0 Then
        msg = "请输入有效的工作平台宽度!"
    ' 检查护栏高度
    ElseIf Not IsNumeric(txtGuardrail.value) Or Val(txtGuardrail.value) <= 0 Then
        msg = "请输入有效的护栏高度!"
    End If
    
    ' 显示错误消息
    If msg <> "" Then
        MsgBox msg, vbExclamation, "输入错误"
        ValidateInputs = False
    End If
End Function

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
