REM [Header]
@ECHO OFF
  
REM [CD-ROM Drive]

REM MSCDEX.EXE /D:OEMCD001 /L:Z

REM [Display]

REM MODE CON: COLS=80 LINES=25

REM [Sound, MIDI, or Video Capture Card]

REM SOUNDTST.COM

REM [Mouse]

REM MOUSE.COM

mode con codepage prepare=((857) C:\WINDOWS\COMMAND\ega2.cpi)
mode con codepage select=857
keyb tr,,C:\WINDOWS\COMMAND\keybrd2.sys /id:179
