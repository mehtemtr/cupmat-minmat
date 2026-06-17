	LOCALS  @@


DATA    SEGMENT WORD PUBLIC

	EXTRN   ALFABESTR:BYTE

DATA    ENDS

CODE    SEGMENT BYTE PUBLIC

	ASSUME  CS:CODE,DS:DATA

PLACE   PROC NEAR
     PUSH     ES
     PUSH     DI
     PUSH     CX
     MOV      BX, SEG DATA
     MOV      ES, BX
     MOV      DI, OFFSET ALFABESTR
     XOR      CH, CH
     MOV      CL, ES:[DI]
     INC      DI
     MOV      BX, DI
     CLD
     REPNE    SCASB
     JNE      @@1
     SUB      DI, BX
     MOV      AX, DI
     DEC      AX
     JMP      @@2
@@1: XOR      AX, AX
@@2: POP      CX
     POP      DI
     POP      ES
     RET
PLACE ENDP

            PUBLIC     Encode
            ;Encode(S:String) : String;

Encode    PROC FAR

@S              EQU     (DWORD PTR [BP+6])
@ResultPtr      EQU     (DWORD PTR [BP+10])

        PUSH    BP
        MOV     BP,SP
        PUSH    DS


        LDS     SI,@S
        LES     DI,@ResultPtr

        CLD
	LODSB
        STOSB
        OR     AL, AL
        JE     @@2
        XOR    CX, CX
        MOV    CL, AL
@@1:    LODSB
	CALL   PLACE
	STOSB
	LOOP   @@1
@@2:    POP     DS
        POP     BP
	RETF    4
Encode ENDP

	    PUBLIC     Decode
	    ;Decode(S:String) : String;

Decode    PROC FAR

@S              EQU     (DWORD PTR [BP+6])
@ResultPtr      EQU     (DWORD PTR [BP+10])

	PUSH    BP
	MOV     BP,SP
	PUSH    DS


	LDS     SI,@S
	LES     DI,@ResultPtr

	CLD
	LODSB
	STOSB
	OR     AL, AL
	JE     @@3
	XOR    CX, CX
	MOV    CL, AL
	XOR    AX, AX
@@1:    LODSB
	PUSH   DS
        PUSH   SI
	MOV    BX, SEG DATA
	MOV    DS, BX
	MOV    SI, OFFSET ALFABESTR
	ADD    SI, AX
        INC    SI
	LODSB
        POP    SI
	POP    DS
        STOSB
	LOOP   @@1
@@3:    POP     DS
	POP     BP
	RETF    4
Decode ENDP



CODE    ENDS

	END

