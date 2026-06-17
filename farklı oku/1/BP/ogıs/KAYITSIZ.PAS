uses Crt, Win, UOg, BLUNGR, GenUtil, DFile, UPrt, Exist;
Const
       Ust= '  SIRA  ™¦R. NO   ™¦RENC˜N˜N ADI SOYADI               BAžARI DURUMU';
       AR = ' ----- -------- ------------------------- ---------------------------------';
       Alt= ' --------------------------------------------------------------------------';
       MaxBas=60;
SDrs : String = 'DRS.DAT';
SDrsNdx : String = 'DRS.NDX';
SBolum : String = 'BOLUM.DAT';
SUnv : String = 'UNV.DAT';
SGrd : String = 'GRADE.DAT';
SStat : String = 'GRDSTAT.DAT';
SUniv : String = 'UNIVFAK.DAT';
SYil : String = 'YIL.DAT';
Var KaySay:Word;
    KayAdr:Array[1..MaxOgr]Of word;
    BasDersSay : Word;
    FailDersSay : Word;
    BasDers     : Array[1..MaxDonemDrs*MaxDonem] of Word;
    BasDonem    : Array[1..MaxDonemDrs*MaxDonem] of Byte;
    FailDers    : Array[1..MaxDonemDrs*MaxDonem] of Word;
    FailDonem   : Array[1..MaxDonemDrs*MaxDonem] of Byte;
{$F+}
Procedure YilSec;
begin
  AktifYYInd:=Yariyil.YilSec;
  With Yariyil.Yil[AktifYYInd] do begin
    ActYY:=YarYil;
    ActYil:=Sene;
  end;
  Yariyil.WriteYil;
  ShowBolYil;
end;
procedure BolumSec;
begin
   Ogr.BolumSec
end;

Procedure QuitProg;
begin
  While EDSP<>0 do CloseEdit;
  Ogr.DFile.CloseFile;
  ogr.done;
  Yariyil.done;
  clrscr;
  Halt;
end;
Procedure WriteUniv;
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
  Unvan.init;
  Grad.iNIT;
  Yariyil.init;
  Ogr.Init;  Ogr.Open;
  ReadUniv;
  ShowBolYil;
end;
procedure Bos;
begin
end;
Function Ortala(M:Byte; S : String):String;
Var L :byte;
begin
   STRIP(S);
   L:=(M - Length(S)) div 2;
   Ortala:=Spaces(L)+S;
end;
Procedure PrintHader(Sayfa:Byte);

Var M, S : String;
Begin
   LPT.WriteLnPrt('\E\C'+Ortala(60,UNIV));
   LPT.WriteLnPrt('\E\C'+Ortala(60,Fakulte+' '+Bolum.KodAd(ActBol)) );
   LPT.WriteLnPrt('\C'+ Ortala(119,YilStr(ActYil,ActYY)+' ™¦RET˜M YILI KAYITSIZ ™¦RENC˜LER'));
   STR(Sayfa:2,S); Str(KaySay:5,M);
   LPT.WriteLnPrt( '\C\S5TOPLAM ™¦RENC˜   : '+M+'\C\S80SAYFA : '+S);
   LPT.WriteLnPrt(ALT);
   LPT.WriteLnPrt(Ust);
   LPT.WriteLnPrt(ESC+'0');
   LPT.WriteLnPrt(AR);
end;
Procedure FormFeed(Var Sayfa:Byte);
Var L : Word; S : String;
begin
   LPT.WriteLnPrt(ALT);
   LPT.WriteLnPrt('\F '+ESC+'2');
   Inc(sayfa);
end;

procedure BolumDeg(B : Byte);
begin
with ogr do begin
   DFile.CloseFile;
   FillChar(KodPtr^,(KeyL+2)*(MaxKay+1),#0);
   Say:=0;
   ActBol:=B;
   Open;
   ReadNdx;
   ShowBolYil;
end;
end;

Function Ihtimal:Boolean;
Var I,J,DelX,Q : Word;
 Succes : Boolean;
begin
   FailDersSay:=0;
   FillChar(FailDers, SizeOf(FailDers),#0);
with Ogr do begin
   For I:=1 Downto YYCount do
       If Donem[I].YY = ActYY then
          For J:=1 to Donem[I].CNT do
              with AnaKay[I,J] do begin
                 Succes:=GRAD.Grade[Grd].Basari;
                 If Not Succes then begin
                    Q:=WORDARA(DrsPtr, FailDers, FailDersSay, SizeOf(Word));
                    If Q = 0 then begin
                       Inc(FailDersSay);
                       FailDers[FailDersSay]:=DrsPtr;
                       FailDonem[FailDersSay]:=I;
                    end;
                 end;
              end;{With}
         {End For}
   {end if}
   {end for}
   For I:=1 Downto YYCount do
       If Donem[I].YY = ActYY then
          For J:=1 to Donem[I].CNT do
              with AnaKay[I,J] do begin
                 Succes:=GRAD.Grade[Grd].Basari;
                 If Succes then begin
                    Q:=WORDARA(DrsPtr, FailDers, FailDersSay, SizeOf(Word));
                    If Q <> 0 then begin
                       DelRec(FailDers, DelX, Q, FailDersSay, SizeOf(Word));
                       Inc(FailDersSay);
                       DelRec(FailDonem, DelX, Q, FailDersSay, SizeOf(Word));
                    end;
                 end;
              end;{With}
         {End For}
   {end if}
   {end for}
end;
   Ihtimal:=(FailDersSay=0);
end;
procedure Sayisal;
begin
end;



procedure Isimler;
Var Adr,I:Word; S, A, B, C:String; Sayfa:Byte; Basilan:Byte;
procedure find;
var I : Integer;
begin
with ogr do begin
   KaySay:=0;
   For I:=1 to Say do begin
      Adr:=GetAdr(I); DFile.GetRec(Adr, Is);
      if Kac[AktifYYInd]=0 then begin
         Inc(KaySay);
         KayAdr[KaySay]:=Adr;
      end;
   end;
end;
end;
Var BB : Byte;
begin
for BB:=1 to Bolum.NuKod do begin
  BolumDeg(BB);
  with Ogr do begin
   Find;
   If KaySay <>0 then begin
      Sayfa:=1;
      Basilan:=0;
      PrintHader(Sayfa);
      For I:=1 to KaySay do begin
         DFile.GetRec(KayAdr[I], Is);
         Str(I:5,S); A:=GetIs; B:=Ad;B:=B+Spaces(25);B:=Copy(B,1,25);
         if ihtimal then begin
           if ActYY = 1 then C:='GšZ ' else C:='BAHAR ';
           C:=C+'DA BAžARISIZ DERS˜ YOK';
         end;
         S:=' '+S+' '+A+' '+B+' '+C;
         LPT.WriteLnPrt(S);
         Inc(Basilan);
         If Basilan=MaxBas then begin
            FormFeed(Sayfa);
            Basilan:=0;
            If I<KaySay then PrintHader(Sayfa);
         end;
      end;
      if Basilan>0 then FormFeed(Sayfa);
   end;
end;
end;
end;
{$F-}
Var CH:Char;
begin
  MenuBar:=
  AddMenu('~DOSYA',ALT_D, 0, Bos,
       AddMenu('~B™LšM SE€    F1', F1     , CmdBolumSec  , BolumSec,0,
       AddMenu('~YIL SE€ CTRL_F1', CTRL_F1, CmdYilSec    , YilSec  ,0,
       AddMenu('€~IK       ALT_Q', ALT_Q  , CmdQuitProg  , QuitProg,0,0))),
  AddMenu('~KAYITSIZ', ALT_K, 0, Bos,
       AddMenu('˜~S˜MLER   F2',F2, CmdOgrGir,   Isimler,  0,
       AddMenu('SAYISAL    F3',F3, CmdDrsGir,   Sayisal,  0,0)),0));

LinkMenu(0, MenuBar);
DefineMainBox(MenuBar);
ClrScr;
     KrediHesapla:= False;
     fillwin(#178,16*Blue+LightGray);
     If Not Disk.ChangeDir then Halt;
     initprog;
Repeat
    ShowMenuBar(0);
    CH:=GetKeyCmd;
    fillwin(#178,16*Blue+LightGray);
    ShowBolYil;
    DoEvent(EventKey);
until false;
showCursor;
end.
