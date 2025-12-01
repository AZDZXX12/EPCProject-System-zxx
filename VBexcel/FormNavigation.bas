Attribute VB_Name = "FormNavigation"
' 模块名称：FormNavigation
' 功能：窗口跳转程序
Option Explicit

' 全局变量存储上一个窗体的名称
Private m_prevFormName As String

' 跳转到指定窗体，并关闭当前窗体
' 参数:
'   currentForm - 当前窗体对象
'   targetFormName - 目标窗体名称(字符串)
Sub NavigateTo(currentForm As Object, targetFormName As String)
    ' 记录当前窗体名称作为上一个窗体
    m_prevFormName = currentForm.Name
'     MsgBox m_prevFormName
    
    ' 隐藏当前窗体(避免闪烁)
    currentForm.Hide
    
    ' 显示目标窗体
    Select Case targetFormName
        Case "Air_volume"
            Air_volume.Show 0
        Case "选项卡"
            选项卡.Show 0
        Case "Cyclone"
            Cyclone.Show 0
        Case "frmStairCalculator"
            frmStairCalculator.Show 0
        Case "frmLadderCalculator"
            frmLadderCalculator.Show 0
        Case "frmGuardrailCalculator"
             frmGuardrailCalculator.Show 0
        Case "MainForm"
             MainForm.Show 0
        Case "frmBeltSupport"
             frmBeltSupport.Show 0
        Case "frmRollingScreen"
             frmRollingScreen.Show 0
        Case "StartHeatSource"
             StartHeatSource.Show 0
        Case "ShowPipeCalculator"
             ShowPipeCalculator.Show 0
        Case "frmCableCalculator"
             frmCableCalculator.Show 0
             
    End Select
    
    
    ' 关闭当前窗体
    Unload currentForm
End Sub

' 返回上一个窗体
' 参数:
'   currentForm - 当前窗体对象
Sub GoBack(currentForm As Object)
    If m_prevFormName = "" Then
'        ' 如果没有上一个窗体，询问是否退出
'        If MsgBox("确定要退出程序吗?", vbYesNo + vbQuestion) = vbYes Then
'            Unload currentForm
'            End ' 结束应用程序
'        End If
        Unload currentForm
        选项卡.Show 0
        Exit Sub
    End If
    
    ' 隐藏当前窗体
    currentForm.Hide
'    MsgBox m_prevFormName
    
    ' 显示上一个窗体
    Select Case m_prevFormName
          Case "Air_volume"
            Air_volume.Show 0
        Case "选项卡"
            选项卡.Show 0
        Case "Cyclone"
            Cyclone.Show 0
        Case "frmStairCalculator"
            frmStairCalculator.Show 0
        Case "frmLadderCalculator"
            frmLadderCalculator.Show 0
        Case "frmGuardrailCalculator"
             frmGuardrailCalculator.Show 0
        Case "MainForm"
             MainForm.Show 0
        Case "frmBeltSupport"
             frmBeltSupport.Show 0
        Case "frmRollingScreen"
             frmRollingScreen.Show 0
        Case "StartHeatSource"
             StartHeatSource.Show 0
        Case "ShowPipeCalculator"
             ShowPipeCalculator.Show 0
        Case "frmCableCalculator"
             frmCableCalculator.Show 0
    End Select
    
    ' 关闭当前窗体
    Unload currentForm
    
    ' 清除上一个窗体记录(避免重复返回)
    m_prevFormName = ""
End Sub

'  处理普通窗体的关闭事件（非选项卡）
' 参数:
'   currentForm - 当前窗体对象
'   Cancel - 是否取消关闭操作
Public Sub HandleFormClose(currentForm As Object, ByRef Cancel As Integer)
    ' 主窗体有自己的关闭逻辑，这里只处理其他窗体
    If currentForm.Name = "选项卡" Then Exit Sub
    If TypeName(currentForm) <> "UserForm" Then
        Cancel = True ' 取消直接关闭
        GoBack currentForm ' 返回上一级
    End If
End Sub

