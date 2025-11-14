VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "RecordCls"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit


' 类模块 RecordCls
' 用于存储每条记录的数据
Public PipeType As String      ' 管道类型（圆形或矩形）
Public FlowRate As Double      ' 风量（m3/h）
Public length As Double        ' 管道长度（m）
Public Bends As Integer        ' 弯头数量
Public Size1 As Double         ' 主要尺寸（圆形为直径，矩形为宽度）
Public Size2 As Double         ' 次要尺寸（矩形为高度，圆形为0）
Public Resistance As Double    ' 阻力（Pa）
'

' 获取记录的显示字符串
Public Function GetDisplayString() As String
    If PipeType = "圆管" Then
        ' 圆形管道显示格式
        GetDisplayString = "风量: " & Format(FlowRate, "0.0") & " m3/h, 类型: " & PipeType & _
                           ", 规格: " & Format(Size1, "0.0") & " mm,长度: " & Format(length, "0.0") & " mm,阻力: " & _
                           Format(Resistance, "0.0") & " Pa"
    Else
        ' 矩形管道显示格式
        GetDisplayString = "风量: " & Format(FlowRate, "0.0") & " m3/h, 类型: " & PipeType & _
                           ", 规格: " & Format(Size1, "0.0") & "x" & Format(Size2, "0.0") & _
                           " mm, 长度: " & Format(length, "0.0") & " mm,阻力: " & Format(Resistance, "0.0") & " Pa"
    End If
End Function


'' 获取记录的显示字符串
'Public Function GetDisplayString() As String
'    If PipeType = "Circle" Then
'        ' 圆形管道显示格式
'        GetDisplayString = "Flow: " & Format(FlowRate, "0.0") & " m3/h, Pipe: " & PipeType & _
'                           ", Diameter: " & Format(Size1, "0.0") & " mm, Resistance: " & _
'                           Format(Resistance, "0.0") & " Pa"
'    Else
'        ' 矩形管道显示格式
'        GetDisplayString = "Flow: " & Format(FlowRate, "0.0") & " m3/h, Pipe: " & PipeType & _
'                           ", Size: " & Format(Size1, "0.0") & "x" & Format(Size2, "0.0") & _
'                           " mm, Resistance: " & Format(Resistance, "0.0") & " Pa"
'    End If
'End Function
'
