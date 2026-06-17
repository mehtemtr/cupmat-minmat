     LOCALS @@

     .MODEL TPASCAL
     .CODE

     PUBLIC STRIP
     PUBLIC SETBLANKZERO
     PUBLIC PARSEWORD

 ;PROCEDURE STRIP( VAR S : STRING)
 STRIP PROC FAR  S:DWORD
     LES      DI, S
     MOV      AL, ' '
     XOR      CH, CH
     MOV      CL, ES:[DI]
     MOV      BX, DI
     JCXZ     @@3
     ADD      DI, CX
     XOR      AH, AH
     STD
     REPE     SCASB
     JE       @@3
     INC      CL
     MOV      DI, BX
     INC      DI
     CLD
     REPE     SCASB
     JE       @@3
     DEC      DI
     INC      CL
     MOV      DX, DS
     MOV      AX, ES
     MOV      DS, AX
     MOV      SI, BX
     INC      SI
     MOV      AH, CL
     XCHG     SI, DI
     CLD
     REP      MOVSB
     MOV      CL, AH
     MOV      DS, DX
@@3: MOV      ES:[BX],CL
     RET
STRIP ENDP

 ;PROCEDURE SETBLANKZERO(VAR S : STRING);
 SETBLANKZERO PROC FAR S:DWORD

       LES    DI, S
       XOR    CH, CH
       MOV    CL, ES:[DI]
       JCXZ   @@3
       INC    DI
       MOV    AL,' '
 @@1:  SCASB
       JNE    @@2
       DEC    DI
       MOV    BYTE PTR ES:[DI],'0'
       INC    DI
 @@2:  LOOP   @@1
 @@3:  RET
SETBLANKZERO ENDP



;FUNCTION PARSEWORD( VAR S, ARGSTR : STRING; C : CHAR):BOOLEAN;
 PARSEWORD PROC FAR  S:DWORD,ARGSTR:DWORD, C : WORD
     PUSH     DS
     XOR      AX, AX
     LES      DI, ARGSTR
     CLD
     STOSB
     LES      DI, S
     XOR      CH, CH
     MOV      CL, ES:[DI]
     JCXZ     @@4   ; EXIT
     INC      DI
     MOV      AX, [C]
     CLD
     REPZ     SCASB
     JE       @@2   ; SET AX = 0 AND EXIT
     INC      CL
     DEC      DI
     MOV      DX, DI
     CLD
     REPNE    SCASB
     MOV      AX, 1
     MOV      BX, DI
     SUB      BX, DX
     OR       CL, CL
     JE       @@1
     DEC      BX
@@1: LDS      SI, S
     MOV      SI, DX
     MOV      BH, CL
     MOV      CL, BL
     MOV      DX, DI
     LES      DI, ARGSTR
     CLD
     MOV      ES:[DI], CL
     INC      DI
     REP      MOVSB
     INC      SI
     MOV      CL, BH
     LES      DI, S
     MOV      ES:[DI], BH
     JCXZ     @@4  ;EXIT
     INC      DI
     REP      MOVSB
     JMP      @@4
@@2: XOR      AX, AX
@@4: POP      DS
     RET
PARSEWORD ENDP


CODE ENDS
END









