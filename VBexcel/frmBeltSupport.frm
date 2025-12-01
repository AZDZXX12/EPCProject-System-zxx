VERSION 5.00
Begin {C62A69F0-16DC-11CE-9E98-00AA00574A4F} frmBeltSupport 
   Caption         =   "皮带架材料计算"
   ClientHeight    =   10044
   ClientLeft      =   108
   ClientTop       =   456
   ClientWidth     =   9540.001
   OleObjectBlob   =   "frmBeltSupport.frx":0000
   StartUpPosition =   1  '所有者中心
End
Attribute VB_Name = "frmBeltSupport"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
' 用户窗体名称: frmBeltSupport
Option Explicit


Private Sub lstResults_Click()

End Sub

' 初始化用户窗体
Private Sub UserForm_Initialize()
    InitializeFormControls
End Sub

' 初始化窗体控件
Private Sub InitializeFormControls()
    ' 初始化皮带宽度选项
    With Me.cmbWidth
        .Clear
        .AddItem "500"
        .AddItem "650"
        .AddItem "800"
        .AddItem "1000"
        .AddItem "1200"
        .ListIndex = 0
    End With
    
    ' 初始化挡边数量
    With Me.cmbEdgeCount
        .Clear
        .AddItem "1"
        .AddItem "2"
        .ListIndex = 0
    End With
    
    ' 初始隐藏重叠相关控件
    ToggleOverlapControls False
    
    ' 设置列表框列宽
    With Me.lstResults
        .columnCount = 2
        .ColumnWidths = "120 ;150 "
    End With
    
    ' 设置默认值
    Me.txtMinHeight.Text = "0.5" ' 默认最低点高度
    Me.txtLength.Text = "10"     ' 默认皮带长度
End Sub

' 切换重叠相关控件可见性
Private Sub chkOverlap_Click()
    ToggleOverlapControls (Me.chkOverlap.value)
End Sub

' 控制重叠相关控件显示
Private Sub ToggleOverlapControls(visible As Boolean)
    Me.lblOverlap.visible = visible
    Me.txtOverlap.visible = visible
    Me.lblEdgeCount.visible = visible
    Me.cmbEdgeCount.visible = visible
End Sub

' 计算按钮点击事件
Private Sub cmdCalculate_Click()
    ' 验证输入
    Dim OverlapDist As Double
    If Me.chkOverlap.value Then
        OverlapDist = Val(Me.txtOverlap.Text)
    Else
        OverlapDist = 0
    End If
    
    If Not ValidateBeltSupportInputs( _
        CDbl(Val(Me.txtAngle.Text)), _
        CDbl(Val(Me.txtMinHeight.Text)), _
        CDbl(Val(Me.txtLength.Text)), _
        CBool(Me.chkOverlap.value), _
        CDbl(OverlapDist)) Then Exit Sub
    
    ' 清空列表框
    Me.lstResults.Clear
    
    ' 获取输入参数
    Dim beltAngle As Double, beltWidth As Double
    Dim MinHeight As Double, beltLength As Double
    Dim HasOverlap As Boolean, EdgeCount As Integer
    
    beltAngle = CDbl(Val(Me.txtAngle.Text))
    beltWidth = CDbl(Val(Me.cmbWidth.Text))
    MinHeight = CDbl(Val(Me.txtMinHeight.Text))
    beltLength = CDbl(Val(Me.txtLength.Text))
    HasOverlap = CBool(Me.chkOverlap.value)
    EdgeCount = CInt(Val(Me.cmbEdgeCount.Text))
    
    ' 执行计算
    Dim output As BeltSupportOutput
    output = CalculateBeltSupport(beltAngle, beltWidth, MinHeight, beltLength, _
                                HasOverlap, OverlapDist, EdgeCount)
    
    ' 显示结果
    DisplayResults output
End Sub

' 验证输入参数 (调用标准模块中的函数)
Private Function ValidateBeltSupportInputs( _
    ByVal Angle As Double, _
    ByVal MinHeight As Double, _
    ByVal length As Double, _
    ByVal HasOverlap As Boolean, _
    ByVal OverlapDist As Double) As Boolean
    
    ValidateBeltSupportInputs = modBeltSupportCalculations.ValidateBeltSupportInputs( _
        Angle, MinHeight, length, HasOverlap, OverlapDist)
End Function

' 执行计算 (调用标准模块中的函数)
Private Function CalculateBeltSupport( _
    ByVal beltAngle As Double, _
    ByVal beltWidth As Double, _
    ByVal MinHeight As Double, _
    ByVal beltLength As Double, _
    ByVal HasOverlap As Boolean, _
    ByVal OverlapDist As Double, _
    ByVal EdgeCount As Integer) As BeltSupportOutput
    
    CalculateBeltSupport = modBeltSupportCalculations.CalculateBeltSupport( _
        beltAngle, beltWidth, MinHeight, beltLength, _
        HasOverlap, OverlapDist, EdgeCount)
End Function


Private Sub DisplayResults(output As BeltSupportOutput)
    ' 获取皮带价格和功率
    Dim beltPrice As Currency
    Dim beltPower As Double
    Dim beltWidth As Integer
    Dim beltLength As Double
    Dim beltAngle As Double
    
    beltWidth = CDbl(Me.cmbWidth.Text)
    beltLength = CDbl(Val(Me.txtLength.Text))
    beltAngle = CDbl(Val(Me.txtAngle.Text))
    
    ' 使用标准模块中的函数获取价格和功率
    beltPrice = GetBeltPrice(beltWidth, beltLength)
    beltPower = GetBeltPower(beltWidth, beltLength, beltAngle)
    
    With output
        ' 添加计算结果到列表框
        AddResultItem "皮带末端高度", Format(.EndHeight, "0.00") & " m"
        AddResultItem "支腿平均间距", Format(.AvgSpacing, "0.0") & " m"
        AddResultItem "支腿数量", CStr(.legCount)
        AddResultItem "支腿详情", .legInfo
        AddResultItem "斜拉杆数量", CStr(.DiagonalCount)
        AddResultItem "挡边支腿数量", CStr(.EdgeLegCount) & " (含额外2个)"
        AddResultItem "挡边横梁长度", Format(.EdgeBeamLength, "0.00") & " m (角铁)"
        AddResultItem "槽钢总长度", Format(.TotalChannelSteel, "0.00") & " m"
        AddResultItem "角铁总长度", Format(.TotalAngleIron, "0.00") & " m"
        AddResultItem "槽钢总重量", Format(.ChannelWeight, "0.00") & " kg"
        AddResultItem "角铁总重量", Format(.AngleWeight, "0.00") & " kg"
        AddResultItem "焊条预估用量", Format(.WeldingRodWeight, "0.00") & " kg"
        AddResultItem "钢材总重量", Format(.ChannelWeight + .AngleWeight, "0.00") & " kg"
        
        ' 添加价格和功率信息
        AddResultItem "皮带价格", Format(beltPrice, "￥#,##0")
        AddResultItem "皮带功率", Format(beltPower, "0.0") & " KW"
        
        ' 添加功率计算说明
        If beltAngle > 15 Then
            Dim basePower As Double
            ' 获取不考虑角度的功率
            basePower = GetBeltPower(beltWidth, beltLength, 0)
            AddResultItem "功率说明", "因角度>" & "15" & "°，功率从" & Format(basePower, "0.0") & _
                         "KW调整为" & Format(beltPower, "0.0") & "KW"
        End If
        
        ' 添加皮带长度说明
        If beltWidth = 1000 And beltLength > 30 Then
            AddResultItem "皮带说明", "B1000皮带超过30米，功率按比例增加"
        End If
    End With
End Sub

' 添加结果项到列表框
Private Sub AddResultItem(description As String, value As String)
    With Me.lstResults
        .AddItem
        .List(.ListCount - 1, 0) = description
        .List(.ListCount - 1, 1) = value
    End With
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
