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

LptObj@StatPrt PROC FAR

@Self           EQU     (DWORD PTR [BP+6])
        PUSH    BP
        MOV     BP,SP
        LES     DI,@Self
	STATM
@@1:    POP     BP
        RETF    4
LptObj@StatPrt  ENDP

	  PUBLIC  LptObj@BytePrt

LptObj@BytePrt PROC FAR

@Self           EQU     (DWORD PTR [BP+6])
@ByteVal        EQU     (BYTE  PTR [BP+10])
        PUSH    BP
        MOV     BP,SP
        LES     DI,@Self
        XOR     AX, AX
        MOV     AL, @ByteVal
        XOR     DX, DX
        INT     17H
        MOV     ES:[DI].LptObj@Status, AH
@@1:    POP     BP
        RETF    6
LptObj@BytePrt ENDP

	  PUBLIC  LptObj@InitPrt

LptObj@InitPrt PROC FAR

@Self           EQU     (DWORD PTR [BP+6])
        PUSH    BP
        MOV     BP,SP
        LES     DI,@Self
        XOR     AX, AX
        MOV     AH, 1
        XOR     DX, DX
        INT     17H
        MOV     ES:[DI].LptObj@Status, AH
@@1:    POP     BP
        RETF    4
LptObj@InitPrt ENDP

; CONTROL CHARACTRES
; \C  CONDENSED
; \D  DOUBLE STRIKE
; \E  ENLARGE
; \F  FORMFEED
; \R  CARRIAGE RETURN
; \L  CARRIAGE RETURN AND LINE FEED
; \Sn ADD N SPACES


FINDNUM   PROC  NEAR
     XOR     AH, AH
     XOR     BH, BH
@@1: LODSB
     OR      AL, AL
     JE      @@2
     CMP     AL, '0'
     JB      @@2
     CMP     AL,'9'
     JA      @@2
     MOV     AH, BH
     SHL     BH,1
     SHL     BH,1
     SHL     BH,1
     SHL     AH,1
     ADD     BH, AH
     SUB     AL, '0'
     ADD     BH, AL
     JMP     @@1
@@2: RET
FINDNUM ENDP


AddCtr PROC NEAR
@@1:  OR BL, BL
      JE @@5
        MOV   BH, BL
        AND   BH, 3
        CMP   BH, 1
        JNE   @@2
              MOV  AL, 18
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
@@5:   RET
Addctr ENDP

DoCtr  PROC NEAR
       XOR  BX, BX
@@1:   CMP  AL,'\'
       JNE  @@9
       LODSB
       CMP  AL,'C'
       JNE  @@2
            SHL BL,1
            SHL BL,1
            OR  BL,1
            MOV AL, 15
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
@@4:  CMP  AL,'F'         ; \F  FORMFEED
      JNE  @@5
	    MOV  AL,12
	    STOSB
	    JMP @@8
@@5:  CMP  AL,'R'         ; \R  CARRIAGE RETURN
      JNE  @@6
	    MOV  AL,13
	    STOSB
	    JMP @@8

@@6:  CMP  AL,'L'           ; \L  CARRIAGE RETURN AND LINE FEED
      JNE  @@7
	    MOV  AL,13
	    STOSB
	    MOV  AL,10
	    STOSB
	    JMP @@8

@@7:  CMP  AL,'S'           ; \Sn ADD N SPACES
      JNE  @@8
	    CALL FINDNUM
            DEC  SI
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
@@9:  RET
DoCtr ENDP

        PUBLIC LptObj@LPTExpand

LptObj@LPTExpand PROC FAR
     @Self           EQU     ( DWORD PTR [BP+6])
     @S              EQU     ( DWORD PTR [BP+10])
     @ResultPtr      EQU     ( DWORD PTR [BP+14])

     PUSH            BP
     MOV             BP, SP
     PUSH            DS

     XOR             BX, BX
     LDS             SI, @S
     MOV             BL, DS:[SI]
     INC             SI
     MOV             BYTE PTR DS:[SI+BX], 0
     XOR             BX, BX

     LES             DI, @ResultPtr
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
     LES   DI,@ResultPtr
     STOSB
     POP    DS
     POP    BP
     RET    8
LptObj@LPTExpand ENDP

CODE  ENDS
END




