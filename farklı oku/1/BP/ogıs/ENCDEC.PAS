uses crt;
const
Harfler:String=' !"#$%&'#39'()*+,-./0123456789:;<=>?ABC€DEFG¦HI˜JKLMNO™PQRSžTUšVWXYZabc‡defg§hijklmno”pqrsŸtuvwxyz';
Harf : Array[0..63] of Byte=(
                    32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,
                    48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,
                    65,66,67,128,68,69,70,71,166,72,73,152,74,75,76,77,
                    78,79,153,80,81,82,83,158,84,85,154,86,87,88,89,90);
HarfIndex : Array[0..255] of Byte=(
                     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                     0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,
                    16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,
                     0,32,33,34,36,37,38,39,41,42,44,45,46,47,48,49,
                    51,52,53,54,56,57,59,60,61,62,63, 0, 0, 0, 0, 0,
                     0,32,33,34,36,37,38,39,41,43,44,45,46,47,48,49,
                    51,52,53,54,56,57,59,60,61,62,63, 0, 0, 0, 0, 0,
                    35,58, 0, 0, 0, 0, 0,35, 0, 0, 0, 0, 0,42, 0, 0,
                     0, 0, 0, 0,50, 0, 0, 0,43,50,58, 0, 0, 0,55,55,
                     0, 0, 0, 0, 0, 0,40,40, 0, 0, 0, 0, 0, 0, 0, 0,
                     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);


Procedure BuyukHarf(Var S : String);Assembler;
asm
   MOV  DX, SEG @Data
   MOV  ES, DX
   MOV  DI, OFFSET HarfIndex
   PUSH DS
   LDS  SI, S
   CLD
   LODSB
   XOR  CX, CX
   MOV  CL, AL
   JCXZ @@3
   XOR  BX, BX
@@1:
   LODSB
   MOV   BL,AL
   MOV   AL,ES:[DI+BX]
   OR    AL, AL
   JZ    @@2
   PUSH  ES
   PUSH  DI
   MOV   ES, DX
   MOV   DI, OFFSET Harf
   MOV   BL, AL
   MOV   AL, ES:[DI+BX]
   MOV   DS:[SI-1], AL
   POP   DI
   POP   ES
@@2:
   LOOP  @@1
@@3:
   POP   DS
end;
Procedure Encode(Var S : String);Assembler;
asm
   MOV  BX, SEG @Data
   MOV  ES, BX
   MOV  DI, OFFSET HarfIndex
   PUSH DS
   LDS  SI, S
   CLD
   LODSB
   XOR  CX, CX
   MOV  CL, AL
   JCXZ @@2
   XOR  BX, BX
@@1:
   LODSB
   MOV   BL,AL
   MOV   AL,ES:[DI+BX]
   MOV   DS:[SI-1], AL
   LOOP  @@1
@@2:
   POP   DS
end;
Procedure Decode(Var S : String);Assembler;
asm
   MOV  BX, SEG @Data
   MOV  ES, BX
   MOV  DI, OFFSET Harf
   PUSH DS
   LDS  SI, S
   CLD
   LODSB
   XOR  CX, CX
   MOV  CL, AL
   JCXZ @@2
   XOR  BX, BX
@@1:
   LODSB
   MOV   BL,AL
   MOV   AL,ES:[DI+BX]
   MOV   DS:[SI-1], AL
   LOOP  @@1
@@2:
   POP   DS
end;
function StrComp(Str1, Str2: String): Integer; Assembler;
asm
	PUSH    DS
	LDS     SI, Str1
	LES     DI, Str2
        XOR     CX, CX
	CLD
	LODSB
	MOV     AH,ES:[DI]
	INC     DI
	MOV     CL,AL
	CMP     CL,AH
	JBE     @@1
	MOV     CL,AH
@@1:    XOR     CH,CH
	REPE    CMPSB
	JE      @@2
	MOV     AH, DS:[SI-1]
        MOV     AL, ES:[DI-1]
        MOV     DX, SEG @Data
        MOV     ES, DX
        MOV     DI, OFFSET HarfIndex
        XOR     BX, BX
        MOV     BL,AH
        MOV     AH,ES:[DI+BX]
        MOV     BL,AL
        MOV     AL,ES:[DI+BX]
	XCHG    AL, AH
@@2:    SUB     AL,AH
	SBB     AH,AH
	POP	DS
end;

{function StrComp(S1, S2 : String):Integer;
begin
    Encode(S1);
    Encode(S2);
    StrComp:=0;
    If S1 > S2 then StrComp:=1 else if S1<S2 then StrComp:=-1;
end;}

procedure SIKISTIR(Var X; L : Integer);
Var S : String;
begin
    S[0]:=Chr(L);
    Move(X, S[1], L);
    Encode(S);
end;
var I, J, K : Integer;
  M, N : String;
  begin
     clrscr;
     For I:=1 to 64 do begin
         M:=Harfler[I];
         For J:=1 to 64 do begin
             N:=Harfler[J];
             K:=StrComp(M,N);
             if ( (I<J) and (K<0)) or ((I>J) and (K>0)) or ((I=J) and (K<>0)) then begin
                writeln('hata ',I:3,J:3,M,' ',N);
                readln;
             end;
         end;
     end;
  end.
function StrComp(Str1, Str2: String): Integer; Assembler;
asm
	PUSH    DS
	LDS     SI, Str1
	LES     DI, Str2
        XOR     CX, CX
	CLD
	LODSB
	MOV     AH,ES:[DI]
	INC     DI
	MOV     CL,AL
	CMP     CL,AH
	JBE     @@1
	MOV     CL,AH
@@1:    XOR     CH,CH
	REPE    CMPSB
	JE      @@2
	MOV     AH,DS:[SI-1]
        MOV     AL, ES:[DI-1]
        MOV     DX, SEG @Data
        MOV     ES, DX
        MOV     DI, OFFSET HarfIndex
        XOR     BX, BX
        MOV     BL,AH
        MOV     AH,ES:[DI+BX]
        MOV     BL,AL
        MOV     AL,ES:[DI+BX]
	XCHG    AL, AH
@@2:    SUB     AL,AH
	SBB     AH,AH
	POP	DS
end;