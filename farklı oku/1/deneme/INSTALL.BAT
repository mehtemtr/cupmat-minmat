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
COPY A:\inst31.exe C:\opl3temp
COPY A:\winst95.exe C:\opl3temp
cls
C:
CD C:\opl3temp
inst31
winst95

:INSTALL
INSTALL %1 %2

IF ERRORLEVEL 1 GOTO L_ERROR
GOTO DEL

:L_ERROR
CD C:\
echo ==========================================
echo The directory "c:\OPL3TEMP" is temporary.
echo ==========================================
DELTREE c:\OPL3TEMP
cls
GOTO END

:DEL
CD C:\
echo ==========================================
echo The directory "c:\OPL3TEMP" is temporary.
echo ==========================================
DELTREE c:\OPL3TEMP
cls

echo ======================================================================
echo OPL3SAx Installation has been completed.
echo ======================================================================
@echo on

:END
@echo on
