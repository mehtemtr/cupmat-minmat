@echo off
cls
echo ================================================================
echo This program makes the temporary directory named "OPL3TEMP".
echo ================================================================

IF EXIST C:\OPL3TEMP\*.* GOTO OVERWRITE?
IF NOT EXIST C:\OPL3TEMP\*.* GOTO PROCESS1

:OVERWRITE?
CHOICE /C:YN Directory already exists. Overwrite?
IF ERRORLEVEL 2 GOTO END
IF ERRORLEVEL 1 GOTO PROCESS1

:PROCESS1
CHOICE /C:YN Start making the directory and copying the files?
IF ERRORLEVEL 2 GOTO END
IF ERRORLEVEL 1 GOTO PROCESS2

:PROCESS2
C:
MD C:\opl3temp
echo Copying files to C:\OPL3TEMP... 
@echo off
COPY A:\winst95.exe C:\opl3temp
cls
C:
CD C:\opl3temp

winst95

INSTALL  -s %1 %2

IF ERRORLEVEL 2 GOTO DEL
IF ERRORLEVEL 1 GOTO L_WINST
GOTO DEL

:L_WINST
WINSTALL
GOTO DEL

:DEL

CD C:\
echo ==========================================
echo The directory "c:\OPL3TEMP" is temporary.
echo ==========================================
DELTREE c:\OPL3TEMP
cls
:END
@echo on
exit

