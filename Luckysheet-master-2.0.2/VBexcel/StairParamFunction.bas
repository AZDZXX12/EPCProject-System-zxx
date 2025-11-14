Attribute VB_Name = "StairParamFunction"
Option Explicit

' 功能：根据倾角获取踏步高和踏步宽
' 参数：
'   targetAngle - 输入的倾角(°)
'   riserHeight - 输出参数，返回踏步高(mm)
'   treadWidth  - 输出参数，返回踏步宽(mm)
' 返回值：
'   True - 表示从预设数组中获取到数据
'   False - 表示未找到匹配数据，使用公式计算得到结果
Function GetStairDimensions(ByVal targetAngle As Double, _
                           ByRef riserHeight As Double, _
                           ByRef treadWidth As Double) As Boolean
    
    ' 1. 定义并初始化预设参数数组
    Dim stairParams(1 To 10, 1 To 3) As Double  ' 1=倾角, 2=踏步高, 3=踏步宽
    stairParams(1, 1) = 30#:  stairParams(1, 2) = 160#: stairParams(1, 3) = 280#
    stairParams(2, 1) = 35#:  stairParams(2, 2) = 175#: stairParams(2, 3) = 250#
    stairParams(3, 1) = 40#:  stairParams(3, 2) = 185#: stairParams(3, 3) = 230#
    stairParams(4, 1) = 45#:  stairParams(4, 2) = 200#: stairParams(4, 3) = 200#
    stairParams(5, 1) = 50#:  stairParams(5, 2) = 210#: stairParams(5, 3) = 180#
    stairParams(6, 1) = 55#:  stairParams(6, 2) = 225#: stairParams(6, 3) = 150#
    stairParams(7, 1) = 60#:  stairParams(7, 2) = 235#: stairParams(7, 3) = 130#
    stairParams(8, 1) = 65#:  stairParams(8, 2) = 245#: stairParams(8, 3) = 110#
    stairParams(9, 1) = 70#:  stairParams(9, 2) = 255#: stairParams(9, 3) = 90#
    stairParams(10, 1) = 75#: stairParams(10, 2) = 265#: stairParams(10, 3) = 70#
    ' 确保角度在合理范围内
     If targetAngle < 20 Then targetAngle = 20
    If targetAngle > 70 Then targetAngle = 70
    ' 2. 在预设数组中查找匹配的倾角
    Dim i As Integer
    For i = 1 To UBound(stairParams, 1)
        If stairParams(i, 1) = targetAngle Then
            ' 找到匹配值，从数组获取参数
            riserHeight = stairParams(i, 2)
            treadWidth = stairParams(i, 3)
            GetStairDimensions = True
            Exit Function
        End If
    Next i
    
    ' 3. 未找到匹配值，使用公式计算
    riserHeight = Round((7 / 3) * targetAngle + 93, 0)
    treadWidth = Round((-14 / 3) * targetAngle + 414, 0)
    GetStairDimensions = False
    
End Function

