#Requires AutoHotkey v2.0
#SingleInstance Force
#Warn

; Pause/Break controls Murmur only while Murmur is running.
; Leave Murmur's built-in recording shortcut at Ctrl+Shift+Space.
; No Windows voice-typing shortcuts are sent.
SetWorkingDir A_ScriptDir

#HotIf ProcessExist("Murmur.exe")
Pause::{
    static lastPress := 0
    if (A_TickCount - lastPress < 400)
        return
    lastPress := A_TickCount
    SendEvent "^+{Space}"
    FileAppend FormatTime(, "yyyy-MM-dd HH:mm:ss") " PB -> Murmur`n", A_ScriptDir "\pb-hotkey-events.log", "UTF-8"
}
#HotIf
