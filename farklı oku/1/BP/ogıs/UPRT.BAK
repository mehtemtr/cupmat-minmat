
unit UPrt;

interface
  uses UBase, Win,Dos, printer;
Const
    _TIMEOUT_PRT      =   $01;	               { Printer timeout		}
    _IOERROR_PRT      =   $08;	       { I/O error			}
    _ONLINE_PRT       =   $10;	       { Printer is online		}
    _NOPAPER_PRT      =   $20;	       { Printer is out of paper	}
    _ACK_PRT	      =   $40;	       { Printer acknowledged		}
    _NOTBUSY_PRT      =   $80;	       { Printer is not busy		}


ERRORSTAT = _TIMEOUT_PRT + _IOERROR_PRT + _NOPAPER_PRT;
Type
      LptObj = Object(Base)
         Status      : Byte;
         Constructor Init;
         Procedure   StatPrt;
         Function    WaitPrt:Boolean;
         procedure   BytePrt(ByteVal : byte);
         procedure   InitPrt;
         procedure   WritePrt(Str : string);
         Function    LPTExpand(S:String):String;
         Procedure   WriteLnPrt(Str : string);
      end;
Var Lpt : LptObj;
implementation
Constructor LptObj.Init;
begin
  Status:=0;
end;
{$F+}
Procedure LptObj.StatPrt;assembler;
asm
        LES     DI, Self
	MOV     AH, 2
        XOR     DX, DX
        INT     17H
        MOV     ES:[DI].LptObj.Status, AH
end;

procedure LptObj.BytePrt(ByteVal : byte);assembler;
asm
        LES     DI,Self
        XOR     AX, AX
        MOV     AL, ByteVal
        XOR     DX, DX
        INT     17H
        MOV     ES:[DI].LptObj.Status, AH
end;
procedure LptObj.InitPrt;assembler;
asm
        LES     DI,Self
        XOR     AX, AX
        MOV     AH, 1
        XOR     DX, DX
        INT     17H
        MOV     ES:[DI].LptObj.Status, AH
end;
procedure AddCtr;near;assembler;
asm
@@1:  OR BL, BL
      JE @@5
        MOV   BH, BL
        AND   BH, 3
        CMP   BH, 1
        JNE   @@2
              MOV  AL, 18     {27
              STOSB
              MOV  AL, 'P'}
              STOSB
              JMP  @@4
@@2:    CMP   BH, 2
        JNE  @@3
             MOV   AL, 27
             STOSB
             MOV   AL, 'H'
             STOSB
             JMP   @@4
@@3:   CMP   BH, 3
       JNE   @@4
             MOV  AL, 27
             STOSB
             MOV  AL,'W'
             STOSB
             MOV  AL,'0'
             STOSB
@@4:   SHR   BL,1
       SHR   BL,1
       JMP   @@1

@@5:   end;
procedure DoCtr;near;assembler;
asm
       XOR  BX, BX
@@1:   CMP  AL,'\'
       JNE  @@9
       LODSB
       CMP  AL,'C'
       JNE  @@2
            SHL BL,1
            SHL BL,1
	    OR  BL,1
            MOV  AL, 15 {27
            STOSB
	    MOV  AL,'g'}
            STOSB
	    JMP @@8
@@2:   CMP  AL,'D'
       JNE  @@3
            SHL  BL,1
            SHL  BL,1
            OR   BL,2
            MOV  AL,27
            STOSB
            MOV   AL,'G'
            STOSB
	    JMP @@8
@@3:   CMP  AL,'E'
       JNE  @@4
            SHL  BL,1
            SHL  BL,1
            OR   BL, 3
            MOV  AL,27
            STOSB
            MOV   AL,'W'
            STOSB
            MOV   AL,1
	    STOSB
@@4:  CMP  AL,'F'         { \F  FORMFEED}
      JNE  @@5
	    MOV  AL,12
	    STOSB
	    JMP @@8
@@5:  CMP  AL,'R'         { \R  CARRIAGE RETURN}
      JNE  @@6
	    MOV  AL,13
	    STOSB
	    JMP @@8

@@6:  CMP  AL,'L'           { \L  CARRIAGE RETURN AND LINE FEED}
      JNE  @@7
	    {MOV  AL,13
	    STOSB
	    MOV  AL,10
	    STOSB}
	    JMP @@8

@@7:  CMP  AL,'S'           { \Sn ADD N SPACES}
      JNE  @@8
              XOR     AH, AH
              XOR     BH, BH
@@111:        LODSB
              OR      AL, AL
              JE      @@222
              CMP     AL, '0'
              JB      @@222
              CMP     AL,'9'
              JA      @@222
              MOV     AH, BH
              SHL     BH,1
              SHL     BH,1
              SHL     BH,1
              SHL     AH,1
              ADD     BH, AH
              SUB     AL, '0'
              ADD     BH, AL
              JMP     @@111
@@222:    DEC  SI
	  XOR  CX, CX
	  MOV  CL, BH
	  JCXZ @@8
	  CLD
	  MOV  AL,' '
	  REP  STOSB
@@8:    OR AL, AL
	JE @@9
	LODSB
        JMP @@1
@@9:  end;

Function  LptObj.LPTExpand(S:String):String;assembler;
asm

     PUSH            DS

     XOR             BX, BX
     LDS             SI, S
     MOV             BL, DS:[SI]
     INC             SI
     MOV             BYTE PTR DS:[SI+BX], 0
     XOR             BX, BX

     LES             DI, @Result
     MOV             DX, DI
     INC             DI
     CLD
     LODSB
@@1: OR    AL, AL
     JE    @@4
     CMP   AL,'\'
     JNE   @@2
	 CALL AddCtr
	 MOV  AL,'\'
	 CALL DoCtr
@@2: OR AL, AL
     JE @@4
     STOSB
     LODSB
     JMP @@1
@@4: CALL AddCtr
     SUB   DI,DX
     MOV   AX, DI
     DEC   AX
     LES   DI,@Result
     STOSB
     POP    DS
end;

Function  LPTObj.WaitPrt:Boolean;
Var TC:Char;
begin
   WaitPrt:=True;
   if  (Status and _ONLINE_PRT) = 0 then begin
          Message('YAZICI KONTROL',
          'YAZICI A€IK DE¦˜L@LšTFEN YAZICIYI A€INIZ@ESC:VAZGE€@ENTER:G˜R',
          [ESC,CR], TC);
          WaitPrt:=(TC=CR);
          exit;
    end else
    If ((Status and _NOPAPER_PRT) <> 0)  then begin
          Message('YAZICI KONTROL',
         'YAZICIDA KA¦IT YOK. LšTFEN@YAZICIYA KA¦IT TAKINIZ@ESC:VAZGE€@ENTER:G˜R',
          [ESC,CR], TC);
          WaitPrt:=(TC=CR);
          exit;
   end else
   If ((Status and _IOERROR_PRT) <> 0)  then begin
           Complain('YAZICIDA HATA');
           WaitPrt:=False;
           exit;
   end;
end;
Procedure  LptObj.WriteLnPrt(Str : string);
  Var T : String;
  begin
    T:=LPTExpand(Str+'\L');
    Writeln(Lst,T);
  end;
procedure LPTObj.WritePrt(Str : string);
  var
    LenStr,I	: byte;
  begin {__WrtPrt}

     StatPrt;
     if ( ((Status and _ONLINE_PRT) = 0) or
				  ((Status and _NOPAPER_PRT) <> 0) ) then
        If Not WaitPrt then Exit;
    LenStr	:= Length(Str);
    for I := 1 to LenStr do
      begin
	repeat
	  StatPrt;
	  if ((Status and ErrorStat) <> 0) then
                 If Not WaitPrt then Exit;
	until ((Status and _NOTBUSY_PRT) <> 0);
	BytePrt(Byte(Str[I]));
	if ((Status and ErrorStat) <> 0) then
                If Not WaitPrt then Exit;
      end;
  end;
begin
  LPT.Init
end.
{$L LPT.OBJ}
include Object.inc

STATM MACRO
    MOV     AH, 2
    XOR     DX, DX
    INT     17H
    MOV     ES:[DI].LptObj@Status, AH
ENDM


; Base object type

OBJECT Base
  METHOD Done

OBJECT LptObj,Base
  FIELD Status,BYTE,1

    LOCALS  @@
    _TIMEOUT_PRT      EQU   01H;                { Printer timeout                }
    _IOERROR_PRT      EQU   08H;	       { I/O error			}
    _ONLINE_PRT       EQU   10H;	       { Printer is online		}
    _NOPAPER_PRT      EQU   20H;	       { Printer is out of paper	}
    _ACK_PRT	      EQU   40H;	       { Printer acknowledged		}
    _NOTBUSY_PRT      EQU   80H;	       { Printer is not busy		}


ERRORSTAT EQU _TIMEOUT_PRT + _IOERROR_PRT + _NOPAPER_PRT;

CODE    SEGMENT BYTE PUBLIC

        ASSUME  CS:CODE
        PUBLIC  LptObj@StatPrt


	  PUBLIC  LptObj@BytePrt

LptObj@BytePrt PROC FAR

@Self           EQU     (DWORD PTR [BP+6])
@ByteVal        EQU     (BYTE  PTR [BP+10])


; CONTROL CHARACTRES
; \C  CONDENSED
; \D  DOUBLE STRIKE
; \E  ENLARGE
; \F  FORMFEED
; \R  CARRIAGE RETURN
; \L  CARRIAGE RETURN AND LINE FEED
; \Sn ADD N SPACES






CODE  ENDS
END






