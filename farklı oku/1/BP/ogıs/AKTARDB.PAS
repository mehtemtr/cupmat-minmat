uses win, GenUtil, blUnGr, uog, Strin;

function ChgCh1(D : Char):Char;
Var C, E : Char;
begin

    Case D of
      'á' : C:= #231;
      'û' : C:='ﬁ';
      'ü' : C:='ﬁ';
      'ò' : C:='›';
      'ç' : C:='˝';
      '¶' : C:='–';
      'ß' : C:='';
      'ô' : C:='÷';
      'î' : C:='ˆ';
      'ö' : C:='‹';
      'Å' : C:='¸';
      'Ä' : C:='«';
    else C:=D;

    end;
    ChgCh1:=C
end;
function ChgCh2(D : Char):Char;
Var C : Char;
begin
    Case D of
      'û' : C:=#158;
      'ü' : C:=#159;
      'ò' : C:=#152;
      'ç' : C:=#141;
      '¶' : C:=#166;
      'ß' : C:=#167;
      'ô' : C:=#153;
      'î' : C:=#148;
      'ö' : C:=#154;
      'Å' : C:=#129;
      'Ä' : C:=#128;
      'á' : C:=#135;
    else C:=D;
    end;
    ChgCh2:=C
end;
Function Prdx(S : String):String;
var I : integer;
begin
    for I:=1 To Length(S) do S[I]:=ChgCh1(S[I]);
    Prdx:=S
end;
function  AdjustDrsKredi:String;
 Var S, T : string; I : integer;
 begin
    Str(Drs^.Kredi:5:2,S);
    SetBlankZero(S);
    AdjustDrsKredi:=S;
 end;
function  AdjustDrsSaat:String;
 Var S, T : string; I : integer;
 begin
    Str(Drs^.Saat:2,S);
    SetBlankZero(S);
    AdjustDrsSaat:=S;
 end;
function  AdjustDrsKod:String;
 Var S, T : string; I,P : integer;
 begin
    S:=Drs^.GetIs;
    Strip(S);
    T:='      '+S;
    S:=Copy(T,Length(T)-2,3);
    P:=Pos(S,T);
    T:=Copy(T,P-3,3);
    Strip(T);
    T:=T+'   ';
    T:=Copy(T,1,3);
    S:=T+S;
    for P := 1 to Length(S) do
     S[P] := UpCase(S[P]);
    S:=Prdx(S);
    AdjustDrsKod:=S;
 end;
procedure Split(Var S : String);
Var  PT, T, W : String; I : integer;
begin
      Strip(S);
      S:=LowCaseStr(S);
      W:='';
      While ParseWord(S, T, '.') do begin
          W:=W+T+' ';
      end;
      S:=W;
      W:='';
      While ParseWord(S, T, ' ') do begin
          Pt:=T;
          Pt[1]:=BuyukHarf(Pt[1]);
          W:=W+Pt+' ';
      end;
      S:=W;
      Strip(S);
end;
function  AdjustAd( S : String):String;
 begin
    Strip(S);
    Split(S);
    S:=S+Spaces(25);
    S:=Copy(S,1,25);
    S:=Prdx(S);
    AdjustAd:=S;
end;
Procedure ReadDrs;
var T : Text; S:String;
  J, I:integer;
  begin
     Assign(T,'DERS.TXT');
     ReWrite(T);
     for I:=1 to Drs^.Say do begin
         Drs^.DFile.GetRec(Drs^.GetAdr(I),Drs^.Is);
         Writeln(T,AdjustDrsKod);
         Writeln(T,AdjustAd(Drs^.Ad));
         Writeln(T,AdjustDrsSaat);
         Str(Drs^.Kredi,S);
         J:=Pos('.',S); if J<>0 then S[J]:=',';
         Writeln(T,S);
     end;
  close(T);
end;
Procedure ReadYYDrs;
var T : Text; S:String;
  J, I:integer;
  begin
     Assign(T,'YYDERS.TXT');
     ReWrite(T);
     for I:=1 to Drs^.Say do begin
         Drs^.DFile.GetRec(Drs^.GetAdr(I),Drs^.Is);
         Writeln(T,AdjustDrsKod);
         Writeln(T,AdjustAd(Drs^.Ad));
         Writeln(T,AdjustDrsSaat);
         Str(Drs^.Kredi,S);
         J:=Pos('.',S); if J<>0 then S[J]:=',';
         Writeln(T,S);
     end;
  close(T);
end;

Procedure ReadUye;
var T : Text; S:String;
  J, I:integer;
  begin
     Assign(T,'UYE.TXT');
     ReWrite(T);
     for I:=1 to Uye^.Say do begin
         Uye^.DFile.GetRec(Uye^.GetAdr(I),Uye^.Is);
         Writeln(T, Prdx(Uye^.GetIs));
         Writeln(T, AdjustAd(Uye^.Ad));
         Writeln(T, Prdx(Unvan.Kod(Uye^.UnvKd)) );
     end;
  close(T);
end;
Procedure ReadUnvan;
var T : Text;V : String;
  I:integer;
  begin
     Assign(T,'UNVAN.TXT');
     ReWrite(T);
     for I:=1 to Unvan.NuKod do begin
         V:=Unvan.Kod(I);
         Writeln(T,Prdx(V));
         V:=Unvan.KodAd(I);
         Split(V);
         Writeln(T,Prdx(V));
     end;
  close(T);
end;
Procedure ReadBolum;
var T : Text;V : String;
  I:integer;
  begin
     Assign(T,'BOLUM.TXT');
     ReWrite(T);
     for I:=1 to Bolum.NuKod do begin
         V:=Bolum.Kod(I);
         Writeln(T,Prdx(V));
         V:=Bolum.KodAd(I);
         Split(V);
         Writeln(T,Prdx(V));
     end;
  close(T);
end;
procedure BolumDeg(Bol : integer);
begin
  with Ogr^ do begin
    DFile.CloseFile;
    WriteNdx;
    FillChar(KodPtr^,(KeyL+2)*(MaxKay+1),#0);
    Say:=0;
    ActBol:=Bol;
    Open;
    ReadNdx;
    ShowBolYil;
  end;
end;
Procedure ReadOgr;
var T, K, U : Text; S, A, B, C, D, E, F:String;
  J, I, L Bol, X, Y:integer;
  begin
     Assign(T,'OGR.TXT');
     ReWrite(T);
     Assign(K,'KUTUK.TXT');
     ReWrite(K);
     Assign(U,'KAYIT.TXT');
     ReWrite(U);
     for Bol:=1 to Bolum.NuKod do begin
         BolumDeg(Bol); A:=Bolum.Kod(ActBol); A:=Prdx(A);
         for I:=1 to Ogr^.Say do begin
            Ogr^.DFile.GetRec(Ogr^.GetAdr(I),Ogr^.Is);
            F:= Prdx(Ogr^.GetIs);
            Writeln(T,A);
            Writeln(T,F);
            Writeln(T, AdjustAd(Ogr^.Ad));
            Writeln(T, Cins);
  	    {DogumYer : DogumYerStr;
	    DogumGun : Byte;
	    DogumAy  : Byte;
	    DogumYil : Word;
	    YKK      : Word;}
            S:=Grad.Kod(HazNot);
            Writeln(T,S);
	    Writeln(T,HazBasYil);
            For J:=1 to Ogr^.YYCount do begin
                Str(Donem[J].YL:4, D);
                Str(Donem[J].YY:1, E);
                For L:=1 to Ogr^.Donem[J].CNT do begin
                   X:=Ogr^.AnaKay[J,L].DrsPtr;
                   Y:=Ogr^.AnaKay[J,L].Grd;
                   Drs^.DFile.GetRec(X,Drs^.Is);
                   B:=AdjustDrsKod;
                   C:=Grade.Kod(Y);
                   Writeln(K,F);
                   Writeln(K,D);
                   Writeln(K,E);
                   Writeln(K,B);
                   Writeln(K,C);
                end;
            end;
         end;
     end;

            Kac      : KacType;
            YYKay    : YYKayType;
            Ders     : DersType;
	    YYCount  : Word;
	    Donem    : YYArr;
	    AnaKay   : AnaKayType;
  close(T);Close(K); Close(U);
end;
Procedure InitProg;
begin
  Univ:='ÄUKUROVA öNòVERSòTESò';
  Fakulte:='';
  OGR^.Open;
  DRS^.open;
  UYE^.open;
  YYDRS^.Open;
end;

Procedure QuitProg;
begin
  While EDSP<>0 do CloseEdit;
  YYDRS^.DFile.CloseFile;
  UYE^.DFile.CloseFile;
  DRS^.DFile.CloseFile;
  OGR^.DFile.CloseFile;
  Dispose(UYE, Done);
  Dispose(YYDRS, Done);
  Dispose(DRS, Done);
  Dispose(OGR, Done);
  Yariyil.done;
end;
begin
  InitProg;
  ReadUnvan;
  ReadBolum;
  ReadUye;
  ReadDrs;
  Quitprog;
end.

