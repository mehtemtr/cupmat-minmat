var T : text;
table : array[0..512] of byte;
i:integer;
procedure Ins(A,B:Byte);
Var I : Integer;
begin
    I:=0;
    While Table[I]<>A do Inc(I);
    Move(Table[I+1],Table[I+2],255);
    Table[I]:=B
end;
procedure Del(A:Byte);
Var I : Integer;
begin
    I:=0;
    while Table[I]<>A do Inc(I);
    inc(I);
    while Table[I]<>A do Inc(I);
    Move(Table[I+1],Table[I],255);
end;

begin
  fillchar(Table,SizeOf(Table),#0);
  for i:=0 to 255 do Table[I]:=I;
  ins(Ord('C'),Ord('Ä'));
  ins(Ord('G'),Ord('¶'));
  ins(Ord('I'),Ord('ò'));
  ins(Ord('O'),Ord('ô'));
  ins(Ord('S'),Ord('û'));
  ins(Ord('U'),Ord('ö'));
  ins(Ord('c'),Ord('á'));
  ins(Ord('g'),Ord('ß'));
  ins(Ord('h'),Ord('ç'));
  ins(Ord('o'),Ord('î'));
  ins(Ord('s'),Ord('ü'));
  ins(Ord('u'),Ord('Å'));

  del(Ord('Ä'));
  del(Ord('¶'));
  del(Ord('ò'));
  del(Ord('ô'));
  del(Ord('û'));
  del(Ord('ö'));
  del(Ord('á'));
  del(Ord('ß'));
  del(Ord('ç'));
  del(Ord('î'));
  del(Ord('ü'));
  del(Ord('Å'));
end.
  assign(T,'Hfr.txt');
  rewrite(t);
  for i:=0 to 31 do writeln(T,'#',I);

  for I:=32 to 255 do writeln(T,Char(I));
  close(T)
  end.

uses crt;
const
   HarfLen = 32;
   A:String=' !"#$%&'#39'()*+,-./0123456789:;<=>?';
ALFABESTR:STRING =' !"#$%&'#39'()*+,-./0123456789:;<=>?ABCÄDEFG¶HIòJKLMNOôPQRSûTUöVWXYZ';
Harfler:String=' !"#$%&'#39'()*+,-./0123456789:;<=>?ABCÄDEFG¶HIòJKLMNOôPQRSûTUöVWXYZabcádefgßhçijklmnoîpqrsütuÅvwxyz';
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

Var S : String; I :Integer; D : Char;t:Text;
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
Function UC(C : Char):Char;Assembler;
asm
   MOV  BX, SEG @Data
   MOV  ES, BX
   MOV  DI, OFFSET Harfler
   MOV  AL, C
   CLD
   XOR  CX, CX
   MOV  CL, 07
   REPNE  SCASB
   JNZ   @@1
   MOV  AL, ES:[DI+HarfLen]
@@1:
end;
var M,N : String; J, E:Byte; H:Char;
begin
   clrscr;
   For I:=0 to 255 do begin
       M:=char(I);N:=M;
       buyukHarf(M);
{       Encode(M);
       Decode(M);}
       if M<>N then begin
       writeln(N,' ',M);
       readln;
       end;
   end;
   end.
    assign(T,'HARFLER.TXT');
    rewrite(T);
    FillChar(HarfIndex, SizeOf(HarfIndex),#0);
    Writeln(T,'Const');
    writeln(T, 'Harf : Array[0..63] of Byte=(');
    for I:=1 to 64 do begin
        H:=Harfler[I];
        HarfIndex[I-1]:=Ord(H);
    end;
    for i:=0 to 3 do begin
        N:='                    ';
        for j:=0 to 15 do begin
           str(HarfIndex[16*I+J]:2,M);
           N:=N+M+',';
        end;
        Writeln(T,N);
    end;
    close(T)
    end.
        if HarfIndex[I]<=#32 then
           Writeln(T,HarfIndex[I],',')
        else
          Writeln(T,Chr(39),HarfIndex[I],Chr(39),',');
    close(T)
end.
    for i:=0 to 6 do D:=UC(harfler[i]);
    for I:=1 to 7 do begin
      A:=Ord(S[2*I-1]);
      B:=Ord(S[2*I]);
      writeln(A,'  ',B,'   ',A-B+20);
    end;
end.

  ALFABESTR:STRING =' !"#$%&'#39'()*+,-./0123456789:;<=>?

 Harfler : Array[0..13] of char = ('á','ß','ç','i','î','ü','Å',
                                   'Ä','¶','I','ò','ô','û','ö');

  Harfler:String='abcádefgßhçijklmnoîpqrsütuÅvwxyzABCÄDEFG¶HIòJKLMNOôPQRSûTUöVWXYZ';
  abcádefgßhçijklmnoîpqrsütuÅvwxyz

     S:='áÄß¶çIiòîôüûÅö';
    clrscr;
    for I:=1 to length(HarfLer) do begin
      D:=Harfler[I];
      E:=HarfIndex[Ord(D)];
      H:=Harfler[E+1];
      writeln(D,' ',H);
      ReadLn;
    end;
    end.
     for I:=1 to length(HarfLer) do begin
      D:=Harfler[I];
      E:=HarfIndex[Ord(D)];
      H:=Harfler[E+1];
      writeln(D,' ',H);
      ReadLn;
    end;
    end.
' !"#$%&'#39'()*+,-./0123456789:;<=>?@ABCÄDEFG¶HIòJKLMNOôPQRSûTUöVWXYZabcádefgßhçijklmnoîpqrsütuÅvwxyz';