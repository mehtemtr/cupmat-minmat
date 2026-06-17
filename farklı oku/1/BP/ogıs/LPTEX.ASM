include Object.inc
include Object.inc

; Base object type

OBJECT Base
  METHOD Done

OBJECT LptObj,Base
  FIELD Status,BYTE,1


	LOCALS  @@

CODE    SEGMENT BYTE PUBLIC

	ASSUME  CS:CODE


; CONTROL CHARACTRES
; \C  CONDENSED
; \D  DOUBLE STRIKE
; \E  ENLARGE
; \F  FORMFEED
; \R  CARRIAGE RETURN
; \L  CARRIAGE RETURN AND LINE FEED
; \Sn ADD N SPACES

GetCH PROC NEAR
      XOR  AL, AL
      OR   CL, CL
      JE   @@1
      DEC  CL
      LODSB
@@1:  RET
GetCH ENDP

FINDNUM   PROC  NEAR
     XOR     AH, AH
     XOR     BH, BH
@@1: CALL    GETCH
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
       CALL GetCH
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
            OR   CX, CX
            JE   @@Y
            INC  CX
            DEC  SI
@@Y:	    PUSH CX
	    XOR  CX, CX
	    MOV  CL, BH
	    JCXZ @@X
	    CLD
	    MOV  AL,' '
	    REP  STOSB
@@X:        POP  CX
@@8:    CALL GETCH
        JMP @@1
@@9:  RET
DoCtr ENDP
       PUBLIC  LptObj@LPTExpand

LptObj@LPTExpand PROC FAR
     @Self           EQU     ( DWORD PTR [BP+6])
     @S              EQU     ( DWORD PTR [BP+10])
     @ResultPtr      EQU     ( DWORD PTR [BP+14])

     PUSH            BP
     MOV             BP, SP
     PUSH            DS

     XOR             CX, CX
     XOR             BX, BX
     LDS             SI, @S
     LES             DI, @ResultPtr
     MOV             DX, DI
     INC             DI
     MOV             CL, DS:[SI]
     INC             SI
     JCXZ            @@4
     CALL   GetCH
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
     CALL GETCH
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



