include object.inc

OBJECT Base
  METHOD Done

OBJECT TCollection,Base
  FIELD Items,DWORD,1
  FIELD Count,WORD,1
  FIELD Limit,WORD,1
  FIELD Delta,WORD,1

  METHOD Error
  METHOD FreeItem
  METHOD GetItem
  METHOD IndexOf
  METHOD Insert
  METHOD PutItem
  METHOD SetLimit

WordRec         STRUC
w0              DW      ?
w2              DW      ?
w4              DW      ?
w6              DW      ?
WordRec         ENDS

          LOCALS  @@
DATA    SEGMENT BYTE PUBLIC

DATA    ENDS

CODE    SEGMENT BYTE PUBLIC

        ASSUME  CS:CODE, DS:DATA

CollectionError PROC near
	PUSH    AX
	PUSH    BX
	PUSH    ES
	PUSH    DI
	MOV     DI,ES:[DI]
	CALL    DWORD PTR [DI].TCollection$Error
RET
CollectionError ENDP

        PUBLIC  TCollection@At

TCollection@At PROC FAR

@Self           EQU     (DWORD PTR [BP+6])
@Index          EQU     ( WORD PTR [BP+10])
        PUSH    BP
        MOV     BP,SP
	LES     DI,@Self
	MOV     BX,@Index
	OR      BX,BX
	JL      @@1
	CMP     BX,ES:[DI].TCollection@Count
	JGE     @@1
	LES     DI,ES:[DI].TCollection@Items
	SHL     BX,1
	SHL     BX,1
	MOV     AX,ES:[DI+BX]
	MOV     DX,ES:[DI+BX+2]
	JMP     @@2
@@1:    MOV     AX, -1
	CALL    CollectionError
	XOR     AX,AX
	MOV     DX,AX
@@2:    POP     BP
        RET 6
TCollection@At ENDP


              PUBLIC TCollection@AtDelete
TCollection@AtDelete PROC FAR
@Self           EQU     (DWORD PTR [BP+6])
@Index          EQU     ( WORD PTR [BP+10])
        PUSH    BP
        MOV     BP,SP
	LES     DI,@Self
        MOV     BX,@Index
	OR      BX,BX
	JL      @@1
	CMP     BX,ES:[DI].TCollection@Count
	JGE     @@1
	DEC     ES:[DI].TCollection@Count
	MOV     CX,ES:[DI].TCollection@Count
	SUB     CX,BX
	JE      @@2
	CLD
	LES     DI,ES:[DI].TCollection@Items
	SHL     BX,1
	SHL     BX,1
	ADD     DI,BX
	LEA     SI,[DI+4]
	SHL     CX,1
	PUSH    DS
	PUSH    ES
	POP     DS
	REP     MOVSW
	POP     DS
	JMP     @@2
@@1:    MOV     AX,-1
	CALL    CollectionError
@@2:    POP     BP
        RET 6
TCollection@AtDelete ENDP

         PUBLIC TCollection@AtInsert

TCollection@AtInsert PROC FAR
@Self           EQU     (DWORD PTR [BP+6])
@Item           EQU     (DWORD PTR [BP+10])
@Index          EQU     ( WORD PTR [BP+14])

        PUSH    BP
        MOV     BP, SP
	LES     DI,@Self
	MOV     BX,@Index
	OR      BX,BX
	JL      @@3
	MOV     CX,ES:[DI].TCollection@Count
	CMP     BX,CX
	JG      @@3
	CMP     CX,ES:[DI].TCollection@Limit
	JNE     @@1
	PUSH    CX
	PUSH    BX
	ADD     CX,ES:[DI].TCollection@Delta
	PUSH    CX
	PUSH    ES
	PUSH    DI
	MOV     DI,ES:[DI]
	CALL    DWORD PTR [DI].TCollection$SetLimit
	POP     BX
	POP     CX
	LES     DI,@Self
	CMP     CX,ES:[DI].TCollection@Limit
	JE      @@4
@@1:    INC     ES:[DI].TCollection@Count
	STD
	LES     DI,ES:[DI].TCollection@Items
	SHL     CX,1
	ADD     DI,CX
	ADD     DI,CX
	INC     DI
	INC     DI
	SHL     BX,1
	SUB     CX,BX
	JE      @@2
	LEA     SI,[DI-4]
	PUSH    DS
	PUSH    ES
	POP     DS
	REP     MOVSW
	POP     DS
@@2:    MOV     AX,WORD PTR [@Item+2]
	STOSW
	MOV     AX,WORD PTR [@Item]
	STOSW
	CLD
	JMP     @@6
@@3:    MOV     AX,-1
	JMP     @@5
@@4:    MOV     AX,-2
	MOV     BX,CX
@@5:    CALL    CollectionError
@@6:    POP     BP
        RET     10
TCollection@AtInsert ENDP

         PUBLIC TCollection@AtPut

TCollection@AtPut PROC FAR
@Self           EQU     (DWORD PTR [BP+6])
@Item           EQU     (DWORD PTR [BP+10])
@Index          EQU     ( WORD PTR [BP+14])

        PUSH    BP
        MOV     BP, SP
	LES     DI,@Self
	MOV     AX,@Item.W0
	MOV     DX,@Item.W2
	LES     DI,@Self
	MOV     BX,@Index
	OR      BX,BX
	JL      @@1
	CMP     BX,ES:[DI].TCollection@Count
	JGE     @@1
	LES     DI,ES:[DI].TCollection@Items
	SHL     BX,1
	SHL     BX,1
	MOV     ES:[DI+BX],AX
	MOV     ES:[DI+BX+2],DX
	JMP     @@2
@@1:    MOV     AX,-1
	CALL    CollectionError
@@2:    POP     BP
        RET     10
TCollection@AtPut ENDP

         PUBLIC TCollection@FirstThat

TCollection@FirstThat PROC FAR
@Self           EQU     (DWORD PTR [BP+6])
@Test           EQU     (DWORD PTR [BP+10])
        PUSH    BP
        MOV     BP, SP
	LES     DI,@Self
	MOV     CX,ES:[DI].TCollection@Count
	JCXZ    @@2
	LES     DI,ES:[DI].TCollection@Items
@@1:    PUSH    ES
	PUSH    DI
	PUSH    CX
	PUSH    WORD PTR ES:[DI+2]
	PUSH    WORD PTR ES:[DI]
	PUSH    WORD PTR [BP]
	CALL    @Test
	POP     CX
	POP     DI
	POP     ES
	OR      AL,AL
	JNE     @@3
	ADD     DI,4
	LOOP    @@1
@@2:    XOR     AX,AX
	MOV     DX,AX
	JMP     @@4
@@3:    MOV     AX,ES:[DI]
	MOV     DX,ES:[DI+2]
@@4:    POP     BP
        RET     8
TCollection@FirstThat  ENDP

         PUBLIC TCollection@ForEach

TCollection@ForEach PROC FAR
@Self           EQU     (DWORD PTR [BP+6])
@Action         EQU     (DWORD PTR [BP+10])
        PUSH    BP
        MOV     BP, SP
	LES     DI,@Self
	MOV     CX,ES:[DI].TCollection@Count
	JCXZ    @@2
	LES     DI,ES:[DI].TCollection@Items
@@1:    PUSH    ES
	PUSH    DI
	PUSH    CX
	PUSH    WORD PTR ES:[DI+2]
	PUSH    WORD PTR ES:[DI]
	PUSH    WORD PTR [BP]
	CALL    @Action
	POP     CX
	POP     DI
	POP     ES
	ADD     DI,4
	LOOP    @@1
@@2:    POP     BP
        RET     8
TCollection@ForEach ENDP

         PUBLIC TCollection@IndexOf

TCollection@IndexOf PROC FAR
@Self           EQU     (DWORD PTR [BP+6])
@Item           EQU     (DWORD PTR [BP+10])
        PUSH    BP
        MOV     BP, SP
	LES     DI,@Self
	MOV     AX,@Item.W0
	MOV     DX,@Item.W2
	LES     DI,@Self
	MOV     CX,ES:[DI].TCollection@Count
	JCXZ    @@3
	LES     DI,ES:[DI].TCollection@Items
	MOV     BX,DI
	SHL     CX,1
	CLD
@@1:    REPNE   SCASW
	JCXZ    @@3
	TEST    CX,1
	JE      @@1
	XCHG    AX,DX
	SCASW
	XCHG    AX,DX
	LOOPNE  @@1
	JNE     @@3
	MOV     AX,DI
	SUB     AX,BX
	SHR     AX,1
	SHR     AX,1
	DEC     AX
	JMP     @@2
@@3:    MOV     AX,-1
@@2:    POP     BP
        RET  8
TCollection@IndexOf ENDP

         PUBLIC TCollection@LastThat

TCollection@LastThat PROC FAR
@Self           EQU     (DWORD PTR [BP+6])
@Test           EQU     (DWORD PTR [BP+10])
        PUSH    BP
        MOV     BP, SP
	LES     DI,@Self
	MOV     CX,ES:[DI].TCollection@Count
	JCXZ    @@2
	LES     DI,ES:[DI].TCollection@Items
	MOV     AX,CX
	SHL     AX,1
	SHL     AX,1
	ADD     DI,AX
@@1:    SUB     DI,4
	PUSH    ES
	PUSH    DI
	PUSH    CX
	PUSH    WORD PTR ES:[DI+2]
	PUSH    WORD PTR ES:[DI]
	PUSH    WORD PTR [BP]
	CALL    @Test
	POP     CX
	POP     DI
	POP     ES
	OR      AL,AL
	JNE     @@3
	LOOP    @@1
@@2:    XOR     AX,AX
	MOV     DX,AX
	JMP     @@4
@@3:    MOV     AX,ES:[DI]
	MOV     DX,ES:[DI+2]
@@4:    POP     BP
        RET 8
TCollection@LastThat ENDP


         PUBLIC TCollection@Pack

TCollection@Pack PROC FAR
@Self           EQU     (DWORD PTR [BP+6])
        PUSH    BP
        MOV     BP, SP
	LES     DI,@Self
	MOV     CX,ES:[DI].TCollection@Count
	JCXZ    @@3
	LES     DI,ES:[DI].TCollection@Items
	MOV     SI,DI
	PUSH    DS
	PUSH    ES
	POP     DS
	CLD
@@1:    LODSW
	XCHG    AX,DX
	LODSW
	MOV     BX,AX
	OR      BX,DX
	JE      @@2
	XCHG    AX,DX
	STOSW
	XCHG    AX,DX
	STOSW
@@2:    LOOP    @@1
	POP     DS
	LES     BX,@Self
	SUB     DI,WORD PTR ES:[BX].TCollection@Items
	SHR     DI,1
	SHR     DI,1
	MOV     ES:[BX].TCollection@Count,DI
@@3:    POP     BP
        RET     4
TCollection@Pack ENDP

CODE  ENDS
END

