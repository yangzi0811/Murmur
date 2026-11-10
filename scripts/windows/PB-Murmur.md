# Windows Pause/Break recording shortcut

This optional AutoHotkey v2 mapping lets Pause/Break start or stop Murmur recording. Murmur's own setting remains **Ctrl+Shift+Space**, because its current shortcut recorder does not accept a bare Pause key.

- Run `PB-Murmur.ahk` with the official AutoHotkey v2 interpreter.
- Put a shortcut to that command in the current user's Startup folder to keep it after signing in.
- Pause/Break is intercepted only while `Murmur.exe` is running. It passes through normally otherwise.
- A 400 ms guard prevents duplicate triggers.
- No Win+H or Windows voice-typing commands are emitted.
- `pb-hotkey-events.log` beside the deployed script records timestamps of forwarded presses only. It contains no audio or transcript.
- To undo, exit this script from its tray menu and remove its Startup shortcut.

Do not run an older Pause/Break voice-typing mapping at the same time.
