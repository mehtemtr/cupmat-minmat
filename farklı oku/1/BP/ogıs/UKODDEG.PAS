Unit ukoddeg;
Interface
uses Crt, GenUtil, StrIn, NSR, UOG, BLUNGR, UPrt, DFile, Exist, UIndex;
Const Bes = 20*18;
type
   TBasarisiz = Record
       Adres:Integer;
       Dn   : Byte;
       Ind  : Byte;
   end;
   PBasArr = ^TBasArr;
   TBasArr = Array[1..Bes+1] of TBasarisiz;
   PBasarisizOgr = ^TBasarisizOgr;
   TBasarisizOgr = Record
       OgrAdr : Integer;
       BasSay : Byte;
       BasPtr : PBasArr;
   end;
   PBasOgrArr = ^TBasOgrArr;
   TBasOgrArr = Array[1..MaxOgr] of PBasarisizOgr;

Var

       Ed       : Word;
       EditRow  : Byte;
       Say5     : Word;
       BasOgr   : PBasOgrArr;

       Procedure   Init(S : String);
       Procedure   Done;
       Procedure   ShowLine;
       Procedure   EditNotBes;
       Procedure   PrintOgr;
       Procedure   PrintBesNot;

Procedure GetDrsInfo(Var SI, SA : String; Q : TBasArr; K : Byte);
Procedure FindBasarisiz(Var Q : TBasArr; Var S : Integer);
Procedure InitProg;

Procedure QuitProg;
procedure WriteUniv;

Procedure ReadUniv;

Implementation
procedure WriteUniv;
Var T : TextFile;
begin
   With T do begin
     OpenToWrite('UNIVFAK.DAT');
     WriteText(Univ);
     WriteText(Fakulte);
     CloseFile;
   end;
end;
Procedure ReadUniv;
Var T : TextFile;
begin
   If not Exists('UNIVFAK.DAT') then WriteUniv;
   With T do begin
     OpenToRead('UNIVFAK.DAT');
     Univ:=ReadText;
     Fakulte:=ReadText;
     CloseFile;
   end;
end;
Procedure InitProg;
begin
  Univ:='€UKUROVA šN˜VERS˜TES˜';
  Fakulte:='';
  Bolum.init;
  Grad.iNIT;
  Yariyil.Init;
  Ogr^.Open;
  Drs^.Open;
  YYDrs^.Open;
  ReadUniv;
  ShowBolYil;
  Say5:=0;
end;

Procedure QuitProg;
begin
  While EDSP<>0 do CloseEdit;
  Done;
  Drs^.DFile.CloseFile;
  Ogr^.DFile.CloseFile;
  YYDrs^.DFile.CloseFile;
  Drs^.done;
  Ogr^.done;
  YYdrs^.Done;
  Uye^.Done;
  Yariyil.done;
  clrscr;
  Halt;
end;
Procedure GetDrsInfo(Var SI, SA : String; Q : TBasArr; K : Byte);
begin
   With Drs^ do begin
     DFile.GetRec(Q[K].Adres, Is);
     SI:=GetIs; SA:=GetAd;
     SA:=SA+Spaces(MaxAdLen); SA:=Copy(Sa,1, MaxAdLen);
   end;
end;
Function KayitYaptirmadi(A:integer):Boolean;
 Var K, L, V : Integer; U : AnaRecType;
     B:Boolean;
 begin
     KayitYaptirmadi:=False;
 with Ogr^ do begin
        for K:=1 to YYCount do
         for L:=1 to Donem[K].CNT do begin
               if (A = AnaKay[K,L].DrsPtr)
                  and (GRAD.Grade[AnaKay[K,L].Grd].Basari) then exit;
        end;
        {o halde bu dersten basarisiz oldu. acaba dersin kodu mu de§iŸti?}
        B:=False;K:=1;
        while (not B) and (K<=3) do begin
            L:=1;
            while (not B) and (L<=Kac[K]) do begin
                if (Ders[K,L].DrsPtr = A) and
                   (GRAD.Grade[Ders[K,L].Grd].Basari) then B:=True;
                Inc(L);
            end;
            Inc(K)
        end;
        KayitYaptirmadi:=not B;
 end;
end;
Procedure FindBasarisiz(Var Q : TBasArr; Var S : Integer);
 Var
     I, J, A, B : Integer;
 Function Ara:integer;
 Var K : Integer;
 begin
     Q[S+1].Adres:=A;
     K:=1;
     While Q[K].Adres<>A do Inc(K);
     Ara:=K
 end;

 begin
     FillChar(Q, SizeOf(TBasArr), #0);
     S:=0;
     with Ogr^ do begin
       for I:=1 to YYCount do
         For J:=1 to Donem[I].CNT do begin
               A:=AnaKay[I,J].DrsPtr;
               If (not GRAD.Grade[AnaKay[I,J].Grd].Basari) and
                  (KayitYaptirmadi(A))
                then begin
                  B:=Ara;
		  IF B > S THEN begin
                     Inc(S);
                     B:=S
                  end;
                  with Q[B] do begin
                       Dn:=I; Ind:=J; Adres:=A
                  end;
               end;
         end;
     end;
 end;
Function Ortala(M:Byte; S : String):String;
Var L :byte;
begin
   STRIP(S);
   L:=(M - Length(S)) div 2;
   Ortala:=Spaces(L)+S;
end;
Procedure EraseExtra(Var S : String);
Var Extra:Word;
begin
   For Extra:=1 to Length(S) do
      If S[Extra] in ['+','-','*','='] then S[Extra]:=' ';
end;
Procedure PrintBesNot;
Const
       TIT ='    NO         ADI VE SOYADI        ';
       AR  =' -------- ------------------------- ';
       MaxBas = 52;
Var

    I, M, J, N :Word;
    Basilan     : Word;
    Sayfa       : Byte;
    SIs, SAd, DIs, DAd : String;
    SayfaBasi   : Boolean;

Procedure PrintHader(Sayfa:Byte);
Var UyeInfo, DrsInfo, M, S : String;
    Mev                    : Word;
begin
   LPT.WriteLnPrt('\E\C'+Ortala(60,UNIV));
   LPT.WriteLnPrt('\E\C'+Ortala(60,Fakulte+' '+Bolum.KodAd(ActBol)) );
   LPT.WriteLnPrt('\E\C'+ Ortala(60,'KOD DE¦˜ž˜KL˜¦˜ NEDEN˜YLE BAžARISIZ ™¦RENC˜LER'));
   STR(Sayfa:2,S);
   LPT.WriteLnPrt( 'S60SAYFA : '+S);
   LPT.WriteLnPrt(' ');
   LPT.WriteLnPrt('\C    NO         ADI VE SOYADI        DERS˜N KODU         DERS˜N ADI        ');
   LPT.WriteLnPrt('\C -------- ------------------------- ----------- ------------------------- ');
end;
Procedure FormFeed;
Var L : Word;
begin
   Basilan:=0;
   LPT.WriteLnPrt('\F ');
   Inc(sayfa);
   SayfaBasi:=False;
end;
begin
   Basilan:=0; Sayfa:=1;
   PrintHader(Sayfa);
   For I:=1 to Say5 do begin
       N:=BasOgr^[I]^.BasSay;
       M:=Basilan+N+1;
       IF M > MaxBas THEN begin
          FormFeed;
          PrintHader(Sayfa);
       end;
       Basilan:=Basilan+N+1;
       SayfaBasi:=True;
       With Ogr^ do begin
          Dfile.GetRec(BasOgr^[I]^.OgrAdr,Is);
          SIs:=GetIs; SAd:=GetAd;
       end;
       GetDrsInfo(DIs, DAd, BasOgr^[I]^.BasPtr^, 1);
       LPT.WriteLnPrt(' '+SIs+' '+SAd+'   '+DIs+'    '+DAd);
       SIs:=Spaces(Length(SIs)); SAd:=Spaces(Length(SAd));
       For J:=2 to BasOgr^[I]^.BasSay do begin
           If Basilan=MaxBas then FormFeed;
           If Basilan=0 then PrintHader(Sayfa);
           GetDrsInfo(DIs, DAd, BasOgr^[I]^.BasPtr^, J);
           LPT.WriteLnPrt(' '+Spaces(OgrKeyL)+' '+Spaces(MaxAdLen)+'   '+DIs+'    '+DAd);
       end;
       LPT.WriteLnPrt(' ');
   end;
   if SayfaBasi then FormFeed;
end;
procedure Init(S : String);
Var I , M, N : Integer;
    Q : TBasArr;
    A : String;
begin

       Say5     :=0;
       N:=0;
       BasOgr:=Nil;
       GetMem(BasOgr, SizeOf(TBasOgrArr));
       FillChar(BasOgr^, SizeOf(TBasOgrArr), #0);
       With Ogr^ do begin
          For I:=1 to Say do begin
             M:=GetAdr(I);
             DFile.GetRec(M, Is);
             A:=GetIs;
	     IF Copy(A, 1, Length(S)) <= S THEN begin
                 FindBasarisiz(Q, N);
		 IF (N>0) then begin
                    Inc(Say5);
                    GetMem(BasOgr^[Say5], SizeOf(TBasarisizOgr));
                    With BasOgr^[Say5]^ do begin
                      OgrAdr:=M;
                      BasSay:=N;
                      GetMem(BasPtr,N*SizeOf(TBasarisiz));
                      Move(Q,BasPtr^,N*SizeOf(TBasarisiz));
                    end;
                 end;
             end;
          end;
       end;
end;
Procedure   ShowLine;
Var S : String; C : Char;
begin
     With Ogr^ do begin
       DFile.GetRec(BasOgr^[Ed]^.OgrAdr, Is);
       S:=GetIs+' '+GetAd;
     end;
     If (Ogr^.YKK and $FF = $FF) then
       WriteStr(Form.FieldKol[1],EditRow,S, CmdColor)
     ELSE
       WriteStr(Form.FieldKol[1],EditRow,S, NormalAttr);
end;

Procedure EditNotBes;
Var TC  : Char;

Procedure GoDown;
begin
    IF (Ed >= Say5) THEN begin
      beep;
      exit
    end;
    IF (EditRow = WinLastRow) THEN
      ScrollupWin
    ELSE
       Inc(EditRow);
    Inc(Ed);
end;
Procedure GoUp;
begin
    IF Ed <= 1 THEN begin
       beep;
       exit
    end;
    if (EditRow=1) then ScrollDownWin;
    If EditRow > 1 then Dec(EditRow);
    Dec(Ed);
end;
Var J, Row : Integer;
   DIs, DAd, SIs, SAd, S : String;
begin
    OpenEditWindow('KOD DE¦˜ž˜KL˜¦˜ NEDEN˜YLE BAžARISIZ ™¦RENC˜LER',
	'8@™GR. NO@25@™GRENC˜N˜N ADI, SOYADI',
	'F9:DERSLER˜ G™STER@CR : ™GRENC˜ SE€@ESC:VAZGE€',
         [F10,ESC, F9, UPKEY, DOWNKEY],
         [],3, Say5);
   PrintOgr;
   HideCursor;
   repeat
     ShowLine;
     WriteChar(1,EditRow, 1, Chr(26), CmdColor);
     TC:=GetKeyCmd;
     WriteStr(1, EditRow, ' ' , NormalAttr);
     Case TC of
         ESC    : begin CloseEdit; ShowCursor; exit end;
F9: begin
                    With Ogr^ do begin
                       Dfile.GetRec(BasOgr^[Ed]^.OgrAdr,Is);
                       SIs:=GetIs; SAd:=GetAd;
                    end;
                       OpenEditWindow(SIs+' '+SAd+' DERSLER',
			 '6@DERS˜N KODU@25@DERS˜N ADI@13@D™NEM',
			 'ESC:TAMAM',[ESC],[],10, BasOgr^[Ed]^.BasSay);
                       Row:=1;
                    For J:=1 to BasOgr^[Ed]^.BasSay do begin
                       GetDrsInfo(DIs, DAd, BasOgr^[Ed]^.BasPtr^, J);
                       With Ogr^.Donem[BasOgr^[Ed]^.BasPtr^[J].Dn] do
                           S:=YilStr(YL,YY);
                       S:=DIs+'    '+DAd+' '+S;
                       WriteStr(Form.FieldKol[1],Row,S,NormalAttr);
                       Inc(Row);
                    end;
		    repeat
                        TC:=GetKeyCmd;
                    until TC=ESC;
                    CloseEdit;
                  end;

         Upkey  : GoUp;
         DownKey: GoDown;
     else DoEvent(EventKey);
     end;
   until False;
end;

procedure PrintOgr;
Var BasEd, Say5Ed, I, L, M, Basla, Bitir : Word;
begin
    ClrScr;
    Ed:=1; EditRow:=1;
    While (EditRow<=WinLastRow) do begin
        if Ed<=Say5 then ShowLine;
        Inc(EditRow);
	Inc (Ed)
    end;
    Ed:=1; EditRow:=1;
end;
procedure Done;
Var I : Integer;
begin
   IF BasOgr <> nil THEN begin
      For I:=1 to Say5 do begin
           FreeMem(BasOgr^[I]^.BasPtr, BasOgr^[I]^.BasSay*SizeOf(TBasarisiz));
           FreeMem(BasOgr^[I],SizeOf(TBasarisizOgr));
      end;
      FreeMem(BasOgr, SizeOf(TBasOgrArr));
   end;
end;
begin
end.
