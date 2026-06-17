uses win, GenUtil, blUnGr, uog;
const
   DonemDeg =1;
   DersDeg=2;
   SplitDonem=3;
type
    Str6 = String[6];
    PKalkKod=^TKalkKod;
    TKalkKod=record
       DrsKod : Str6;
       DrsDon : integer;
       NewKod1 : Str6;
       DrsDon1 : integer;
       NewKod2 : Str6;
       DrsDon2 : integer;
    end;

    PKalkArr=^TKalkArr;
    TKalkArr=Array[1..MaxDrs] of PKalkKod;


    TAlDers = record
       DAdr: Word;
       Don : Byte;
       Gr  : Byte;
       EQU : TKalkKod;
    end;

    PDistDers=^TDersArr;
    TDersArr = Array[1..MaxDonemDrs*MaxDonem] of TAlDers;

Var Dist, Fail : PDistDers;
    DistSay, FailSay : integer;
    Pkalk : PKalkArr; KalkSay:integer;
    HataF : Text;
    AlDers  : AnaRecType;
    YYKay   : AnaRecType;
function DonemKod ( S : Str6):integer;
var J : integer; A: String;
begin
   A:=Copy(S,4,3);
   SetBlankZero(A);
   J:=StrToInt(S);
   J:= J mod 2;
   if J=1 then DonemKod:=1 else DonemKod:=2
end;

function  AdjustDrsKod(S : String):String;
 Var T : string; P : integer;
 begin
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
    AdjustDrsKod:=S;
 end;
function FindKalk(S:Str6; Yer:integer):boolean;
Var L, M : Word;
    A, B : String;
begin
    FindKalk:=False;
    Yer:=1;
    A:=S;
    AdjustDrsKod(A);
    L:=1; Yer:=KalkSay+1;
    While Yer>L do begin
      M:=(Yer+L) div 2;
      B:=Pkalk^[M]^.DrsKod;
      AdjustDrsKod(B);
      If StrComp(B, A)>=0 then Yer:=M else L:=M+1;
    end;
    If Yer<=KalkSay then begin
       B:=Pkalk^[M]^.DrsKod;
       AdjustDrsKod(B);
       FindKalk:=(A=B);
    end;
end;

procedure ReadKalk;
var S,s1,s2 : string; A : Str6; I, Yer : integer;
T:text;
begin
   Assign(T,'KALKDERS:TXT');
   Reset(T);
   while not eof(T) do begin
      readln(T,S);
      A:=Copy(S,1,6);
      If not FindKalk(A,Yer) then begin
         inc(KalkSay);
         For i:=KalkSay downto Yer+1 do PKalk^[i]:=PKalk^[i-1];
         New(PKalk^[Yer]);
         with PKalk^[Yer]^ do begin
             DrsKod  :=A;
             DrsDon  := DonemKod ( A);
             A:=Copy(S,13,3);
             NewKod1 := A;
             DrsDon1 := DonemKod ( A);
             A:=Copy(S,20,3);
             NewKod2 := A;
             if A='' then DrsDon:=-1 else DrsDon2 := DonemKod ( A);
         end;
      end;
   end;
   close(T);
end;

function DonStr(D : integer):String;
begin
   if D= 2 then DonStr:='BAHAR' else DonStr:='GšZ  ';
end;

procedure Setzero;
begin
    FillChar(Dist,SizeOf(TDersArr),#0);
    FillChar(Fail,SizeOf(TDersArr), #0);
    FillChar(PKalk, SizeOf(PKalkArr),#0);
    DistSay:=0;
    FailSay:=0;
    KalkSay:=0;
end;

procedure initProg;
begin
    GetMem(Dist,SizeOf(TDersArr));
    GetMem(PKalk,SizeOf(PKalkArr));
    GetMem(Fail,SizeOf(TDersArr));
    SetZero;
    Assign(HataF,Bolum.Kod(ActBol)+'HATA.TXT');
    ReWrite(HataF);
end;
begin


Procedure FindDistDers;
Var I, J, Q    : Word;
    Succes     : Boolean;
    U, V, W, T : Word;
    DrsYer     : integer;
    A : String;
begin
   DistSay:=0;
   if Grad.Search('FF', U) then;
   if Grad.Search('NA', V) then;
   if Grad.Search('UB', W) then;
   if Grad.Search(' U', T) then;
with Ogr^ do begin
   For I:=1 to YYCount do
       For J:=1 to Donem[I].CNT do
        with AnaKay[I,J] do begin
           Succes:=GRAD.Grade[Grd].Basari;
           Q:=WORDARA(DrsPtr, Dist^, DistSay, SizeOf(TAlDers));
           If Q=0 then begin
              Inc(DistSay);
              with Dist^[DistSay] do begin
                 DAdr:=DrsPtr; Gr:=Grd; Don:=I;
                 Drs^.DFile.GetRec(DAdr, Drs^.Is);
                 A:=Drs^.GetIs;
                 if FindKalk(A, DrsYer) then
                    EQU:=PKalk^[DrsYer]^
                 else with EQU do begin
                         DrsKod:=Drs^.GetIs;
                         DrsDon := DonemKod(DrsKod);
                         NewKod1 :='      '; DrsDon1 :=-1;
                         NewKod2 :='      '; DrsDon2 :=-1;
                      end;
              end
           end else
              If (Succes) or ( (Grd=U) or (Grd=V) or (Grd=W) or (Grd=T) ) then
               with Dist^[Q] do begin
                  Gr:=Grd; Don:=I
               end;
        end;{With}
        {End For}
   {end for}
end;
end;

Procedure FindFailDers;
Var I:Word;  T : TAlDers;
begin
   FindDistDers;
   FailSay:=0;
   for I:=1 to DistSay do
      If not GRAD.Grade[Dist^[I].Gr].Basari then begin
         Inc(FailSay);
         Fail^[FailSay]:=Dist^[I];
      end;
end;
procedure ReportError(X : TAlDers);
VAR Y : WORD;
    S, A, U, V:String;
begin
   A:=Ogr^.GetIs+' '+Ogr^.GetAd;
   Y:=X.Don;
   S:=X.EQU.DrsKod;
   S:=AdjustDrsKod(S);
   U:=A+' '+YilStr(Ogr^.Donem[Y].YL,Ogr^.Donem[Y].YY)+' DE '+S+' DERS˜NDEN BAžARISIZ';
   V:='FAKAT BU DERSE EžDE¦ER B˜R DERS DE YOK. ™¦RENC˜ BU DERS KAYIT YAPTIRMALI';
   Writeln(HataF,U); Writeln(HataF,V);
end;
procedure ReportChange(X: TAlDers; Rept : integer);
VAR Y : WORD;
    S, A, U, V:String;  B : Str6;
begin
    A:=Ogr^.GetIs+' '+Ogr^.GetAd;
    Y:=X.Don;
    S:=X.EQU.DrsKod;
    S:=AdjustDrsKod(S);
    B:=S;
    S:=S+ ' '+ DonStr(DonemKod(B))+' YARIYILI DERS˜';

    U:=A+' NIN '+YilStr(Ogr^.Donem[Y].YL,Ogr^.Donem[Y].YY)+' DE BAžARISIZ OLDUGU'+S+' DERS˜';
    Writeln(HataF,U);
   Case Rept of
    DonemDeg: begin
                V:=X.EQU.NewKod1;
                B:=V;
                V:=V+ ' '+ DonStr(DonemKod(B))+' YARIYILI DERS˜ ˜LE DE¦˜žT˜R˜LD˜. **** D™NEM DE¦˜ž˜KL˜¦˜ YAPILDI ***';
             end;
    DersDeg :begin
                V:=X.EQU.NewKod1;
                B:=V;
                V:=V+ ' '+ DonStr(DonemKod(B))+' YARIYILI DERS˜ ˜LE DE¦˜žT˜R˜LD˜.';
             end;
    SplitDonem:begin
                V:=X.EQU.NewKod1;
                B:=V;
                V:=V+ ' '+ DonStr(DonemKod(B))+' YARIYILI DERS˜ VE ';
                U:=X.EQU.NewKod2;
                B:=U;
                V:=V+U+ ' '+ DonStr(DonemKod(B))+' YARIYILI DERS˜ ˜LE DE¦˜žT˜R˜LD˜ **˜K˜ D™NEME PAR€ALANA DERS***';

             end;
   end;
    Writeln(HataF,V);
end;
procedure Change(X: TAlDers; Rept : integer);
Var A, A1, A2 : Word; Yer, Yer1, Yer2 : Word;  S, S1, S2 : String;
I, J : Integer;
begin
   With X.EQU do begin
      S:=DrsKod; S1:=NewKod1; S2:=NewKod2
   end;
   Drs^.Search(S, Yer, A);
   Drs^.Search(S1, Yer1, A1);
   Drs^.Search(S2, Yer2, A2);
   Case Rept of
    DonemDeg:for I:=1 to Ogr^.YYCount do
               for J:=1 to Ogr^.Donem[I].CNT do
                   If Ogr^.AnaKay[I,J].DrsPtr=A then
                      Ogr^.AnaKay[I,J].DrsPtr:=A1;
    DersDeg :for I:=1 to Ogr^.YYCount do
               for J:=1 to Ogr^.Donem[I].CNT do
                   If Ogr^.AnaKay[I,J].DrsPtr=A then Ogr^.AnaKay[I,J].DrsPtr:=A1;

    SplitDonem:;
   end;
end;

Procedure Kontrol;
var   L,Y,Z : integer; M, Q, I, J : WORD;
      X : TAlDers;
      Succes:Boolean;
      S: Str6;
begin
   FindFailDers;
   For I:=1 to FailSay do begin
      X:=Fail^[i];
      with X do begin
         S:=EQU.DrsKod;
         L:=EQU.DrsDon;
         M:=DAdr;
         Y:=Ogr^.Donem[Don].YY;
      end;
      Q:=WORDARA(Y, Ogr^.Ders[AktifYYInd], Ogr^.Kac[AktifYYInd], SizeOf(AnaRecType));
      if (Y=Yariyil.Yil[AktifYYInd].YarYil) and (Q=0) then begin
          {™¦RENC˜ Q DERS˜NDEN BAžARISIZ OLMUž FAKAT DERS˜ ALMAMIž}
          {CASE 1 : BU DERSE EžDE¦ER B˜R DERS YOK }
            If (X.EQU.DrsDon1=-1) and (X.EQU.DrsDon2=-1) then ReportError(X);
            {CASE 2 : BU DERSE EžDE¦ER B˜R DERS VAR }
            If (X.EQU.DrsDon1<>-1) and (X.EQU.DrsDon2=-1) then
               if X.EQU.DrsDon1<> (Y mod 2) then begin
                     {CASE 2.1 : BU DERS ˜LE EžDE¦ER DERS AYN˜ DONEM DERS˜ DE¦˜L }
                     ReportChange(X, DonemDeg);
                     Change(X, DonemDeg);
               end else begin
                     {CASE 2.2 : BU DERS ˜LE EžDE¦ER DERS AYN˜ DONEM DERS˜ }
                     ReportChange(X, DersDeg);
                     Change(X, DersDeg);
               end;
            {CASE 3 : BU DERSE EžDE¦ER ˜K˜ DERS VAR }
            If (X.EQU.DrsDon1<>-1) and (X.EQU.DrsDon2<>-1) then begin
               ReportChange(X, SplitDonem);
               Change(X, SplitDonem);
            end;
      end;
   end;
end;




Procedure EditKut(X : TAlDers; Rept : integer);
Var TC, CH  : Char;
    GrdYer,Yer, L  : Word;
    KD:String;
    EditRow : Word;

procedure DeleteDrs;
Var  V : AnaRec;
begin
  If EdDrs > CurCnt then begin
     GotoXY(1, EditRow);
     ClrEol
  end
  else begin
       DelRec(AnaKay[CurDon], V, EdDrs, CurCnt, SizeOf(AnaRec));
       Donem[CurDon].CNT:=CurCnt;
  end;
end;
Procedure BeginEdit;
Var L : Word;
begin
   CurDon:=X.Don;
   With Donem[CurDon] do begin
	CurYil:=YL; CurYY:=YY; CurCnt:=CNT
   end;
   For EdDrs:=1 to CurCnt do
      if AnaKay[CurDon,EdDrs].DrsPtr=X.DAdr then exit;
end;
procedure DeleteYil(X : Word);
Var U : YilRec; V : AnaRecType;
begin
  DelRec(Donem, U, X, YYCount, SizeOf(U));
  Inc(YYCount);
  DelRec(AnaKay, V, X, YYCount, SizeOf(AnaRecType));
end;

Procedure PutAnaToOgr;
Var I : Word;
begin
    I:=1;
    While I<=YYCount do If Donem[I].CNT=0 then DeleteYil(I) else Inc(I);
    Dfile.PutRec(FileAdr,Is);
end;

begin
     BeginEdit;
     L:=X.DAdr;
     Case Rept of
     DersDeg :for I:=1 to Ogr^.YYCount do
               for J:=1 to Ogr^.Donem[I].CNT do
                   If Ogr^.AnaKay[I,J].DrsPtr=L then Ogr^.AnaKay[I,J].DrsPtr:=A1;
     DonemDeg: begin
                 L:=DonemKod(X.EQU.DrsKod);
                 if L=0 then L:=1 else L:=2;
                 if Ogr^.SearchDonem(Donem[X.Don].YL, L,Yer) then begin
                    Inc(Donem[Yer].CNT);
                    AnaKay[Yer,Donem[Yer].CNT].DAdr:=X.DAdr;
                    AnaKay[Yer,Donem[Yer].CNT].Grd:=X.Grd;
                    EdDrs:=1;
                    While AnaKay[X.Don,EdDrs]<>X.DAdr do Inc(EdDrs);
                    DelRec(AnaKay[X.Don], V, EdDrs, Donem[X.Don].CNT, SizeOf(AnaRec));
                 end else begin


Var L, M : Word;
    S:String;
begin
  L:=1; Yer:=Succ(YYCount); S:=YilStr(Y,Z);
  SearchDonem:=False;
  while L<Yer do begin
     M:=(L+Yer) div 2;
     With Donem[M] do
       If YilStr(YL,YY)>=S then Yer:=M else L:=Succ(M);
  end;
  With Donem[Yer] do
     If Yer<=YYCount then SearchDonem:=(YilStr(YL,YY)=S);
end;



     CTRL_Y : If YeniDonem then BeginEdit(CurDon);
		 F9     :begin
                           Don.Init;
			   L:=Don.DonemSec;
                           Don.Done;
			   If L<>0 then begin
			      BeginEdit(L);
			   end;
			 end;
		 DELKEY : DeleteDrs;
		 ESC    : begin PutAnaToOgr; CloseEdit; exit end;
		 Upkey  : GoUp;
		 DownKey: GoDown;
		 INSKEY : begin PutAnaToOgr; ClrScr;end;
              end;
       Until (TC=INSKEY);
   until False;
end;



Function OgrRec.YeniDonem:Boolean;
Var Y:word; Z:Byte;
    TC : Char;
Procedure InsYil;
Var U : YilRec; V : AnaRecType;
    Yer:Word;  L:Word;
begin
   FillChar(V,SizeOf(V),#0);
   FillChar(U,SizeOf(U),#0);
   If not GRAD.Search('NY',Yer) then Yer:=1;
   For L:=1 to MaxDonemDrs do V[L].Grd:=Yer;
   If SearchDonem(Y,Z,L) then
      CurDon:=L
   else if YYCount < MaxDonem then begin
	   With U do begin CNT:=0;YL:=Donem[Don].YL; YY:=L end;
   	   InsRec(Donem,U,L,YYCount,SizeOf(YilRec));
	   Dec(YYCount);
	   InsRec(AnaKay,V,L, YYCount,SizeOf(AnaRecType));
           CurDon:=L;
	   With Donem[L] do begin
	      YL:=Y; YY:=Z; CNT:=0
	   end;
   end;
   With Donem[CurDon] do begin
	CurYil:=YL; CurYY:=YY; CurCnt:=CNT;
   end;
end;
begin
    YeniDonem:=False;
    If YYCount = MaxDonem then
       Complain('DAHA FAZLA D™NEM G˜R˜ž˜ YAPAMAM')
    else if YeniDonemGir(Y,Z,'YEN˜ D™NEM') then
         begin
             InsYil;
             YeniDonem:=True
         end
 end;
