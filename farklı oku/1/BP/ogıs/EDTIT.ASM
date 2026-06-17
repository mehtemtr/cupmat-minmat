    LOCALS   @@

    .MODEL TPASCAL
    .DATA
	EXTRN Form : Byte;
     DATA ENDS

    .CODE
     PUBLIC EDTIT

FINDNUM   PROC  NEAR
     XOR      BX, BX
@@1: LODSB
     CMP     AL, '0'
     JB      @@2
     CMP     AL,'9'
     JA      @@2
     MOV     BH, BL
     SHL     BH, 1
     SHL     BL,1
     SHL     BL,1
     SHL     BL,1
     ADD     BL, BH
     SUB     AL, '0'
     ADD     BL, AL
     JMP     @@1
@@2: RET
FINDNUM ENDP

FINDSTR  PROC  NEAR
     XOR     DH, DH
@@3: LODSB
     CMP     AL,'@'
     JE      @@4
     INC     DH
     JMP     @@3
@@4: XOR     AX, AX
     MOV     AL, DH
     SUB     SI, AX
     DEC     SI
     MOV     BH, DH
     CMP     BH, BL
     JAE     @@5
     MOV     BH, BL
@@5: MOV     AX, SI
     INC     WORD PTR [BP-4]
     XOR     SI, SI
     SUB     SI, WORD PTR [BP-4]
     SHL     SI, 1
     SUB     SI, 4
     MOV     WORD PTR [BP+SI], BX
     MOV     SI, AX
     MOV     CL, BH
     SUB     CL, DH
     SHR     CL, 1
     XOR     CH, CH
     MOV     AL,'@'
     STOSB
     INC     DL
     JCXZ    @@6
     ADD     DL, CL
     SUB     BH, CL
     MOV     AL,' '
     CLD
     REP     STOSB
@@6: MOV     CL, DH
     JCXZ    @@7
     ADD     DL, CL
     SUB     BH, CL
     CLD
     REP     MOVSB
@@7: MOV     CL, BH
     ADD     DL, CL
     JCXZ    @@8
     MOV     AL,' '
     CLD
     REP     STOSB
@@8: RET
FINDSTR ENDP


EDTIT PROC FAR  SSS:DWORD, EDT:DWORD

     SUB      SP, 24
     PUSH     DS
     MOV      WORD PTR [BP-2],0
     MOV      WORD PTR [BP-4],0
     XOR      DX, DX
     LDS      SI, SSS
     LES      DI, EDT
     XOR      CH, CH
     CLD
     MOVSB
     MOV      CL, BYTE PTR DS:[SI-1]
     JCXZ     @@6
     ADD      SI, CX
     MOV      BYTE PTR DS:[SI],'@'
     MOV      BYTE PTR DS:[SI+1],0
     SUB      SI, CX

     ; SSS[0]:=CHR(LENGTH(SSS)+2);
     ; EDT[0]:=CHR(255);
@@1: CALL     FINDNUM
     CMP      AL,'@'
     JNE      @@2
     CALL     FINDSTR
     INC      SI
@@2: CMP      BYTE PTR DS:[SI],0
     JNE      @@1
     INC      DL

     LDS      SI, EDT
     LES      DI, SSS
     MOV      BL, DL
     XOR      BH, BH
     MOV      BYTE PTR DS:[SI+BX],'@'
     MOV      AL, DL
     STOSB
     MOV      BYTE PTR DS:[SI], DL
     INC      SI
     MOV      CL, DL
     XOR      CH, CH
     JCXZ     @@6


@@3: LODSB
     CMP      AL,'@'
     JNE      @@4
     MOV      AL,' '
     STOSB
     MOV      BYTE PTR DS:[SI-1],AL
     JMP      @@5
@@4: MOV      AL,'Ä'
     STOSB
@@5: LOOP     @@3
@@6: POP      DS
     MOV      CX, WORD PTR [BP-4]
     JCXZ     @@10
     MOV      WORD PTR [BP-2], 2
     XOR      BX, BX
     XOR      SI, SI
     SUB      SI, 6
@@7: MOV      AX, WORD PTR [BP+SI]
     MOV      BYTE PTR DS:[BX+1].Form, AL
     MOV      DX, AX
     SUB      AH, AL
     SHR      AH, 1
     ADD      AH, BYTE PTR [BP-2]
     MOV      BYTE PTR DS:[BX+11].Form, AH
     INC      BX
     DEC      SI
     DEC      SI
     INC      DH
     ADD      BYTE PTR [BP-2], DH
     LOOP @@7
     MOV      BYTE PTR DS:Form, BL

@@10: MOV      SP, BP
      RET
EDTIT ENDP
CODE ENDS
END

