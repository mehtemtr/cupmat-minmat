        .MODEL TPASCAL
        .CODE
        PUBLIC FLPOS
FLPOS PROC FAR A:WORD,C:WORD,D:WORD
        MOV     AX,A
        MOV     CX,C
        DEC     CX
        MUL     CX
        ADD     AX, D
        ADC     DX, 0
        RET
FLPOS ENDP
CODE ENDS
END
