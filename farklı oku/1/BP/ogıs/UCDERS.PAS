uses Crt, Nsr, Exist, DFile, UOg,  BLUNGR, UCN;
Const

SDrs : String = 'DRS.DAT';
SDrsNdx : String = 'DRS.NDX';
SBolum : String = 'BOLUM.DAT';
SUnv : String = 'UNV.DAT';
SGrd : String = 'GRADE.DAT';
SStat : String = 'GRDSTAT.DAT';
SUniv : String = 'UNIVFAK.DAT';
SYil : String = 'YIL.DAT';

{$F+}
Procedure BaslaKodAl;
Var
     S            : String;
     TC           : Char;
     Adres        : Word;
     Flag         : Boolean;
     B            : Word;
begin
    OpenEditWindow('MEZUN˜YET ˜€˜N 5 DERS˜ KALAN ™¦RENC˜LER',
	'8@™¦RENC˜ KOD BAžLANGI€',
	'ESC:VAZGE€',
	 [ESC],
	 [],3, 2);
         S := '';
         InputStr(S, 1,1, Ogr^.KeyL, True, ALLKAR, 0, TC);
         If TC = NULL then
            Init(S)
         else
            Say5:=0;
        CloseEdit;
end;

Procedure BesNGir;
begin
   if Say5 <>0 then EditNotbes else complain('5 DERS˜ KALAN YOK');
end;
Procedure PrBesN;
begin
   PrintBesNot;
end;
procedure BolumSec;
begin
   If Say5<>0 then Done;
   Say5:=0;
   Ogr^.BolumSec;
   BaslaKodAl;
end;

Procedure QProg;
begin
  QuitProg
end;
procedure Bos;
begin
end;
Procedure IProg;
begin
  InitProg
end;
Procedure CopyBesN;
begin
  Dosyala
end;
Procedure YYSil;
begin
  YYDrsSil;
end;
{$F-}

Var CH:Char;
begin
  MenuBar:=
  AddMenu('~DOSYA',ALT_D, 0, Bos,
       AddMenu('~B™LšM SE€     F1', F1,  CmdBolumSec  , BolumSec,0,
       AddMenu('š€ D~ERS ™GR   F2', F2,  CmdYilSec    , BesNGir  ,0,
       AddMenu('š€  DERS B~AS  F3', F3, CmdYeniYil   , PrBesN ,0,
       AddMenu('D~OSYALA       F4', F4, CmdOgrGir   , CopyBesN ,0,
       AddMenu('~YY. DERS SIL  F5', F5, CmdDrsGir   , YYSil ,0,
       AddMenu('€~IK       ALT_Q', ALT_Q  , CmdQuitProg  , QProg,0,
       0)))))),0);
   LinkMenu(0, MenuBar);
   DefineMainBox(MenuBar);
   ClrScr;
   KrediHesapla:= False;
   fillwin(#178,16*Blue+LightGray);
   If Not Disk.ChangeDir then Halt;
   IProg;
   ShowMenuBar(0);
   ShowBolYil;
   BolumSec;
Repeat
    ShowMenuBar(0);
    CH:=GetKeyCmd;
    fillwin(#178,16*Blue+LightGray);
    ShowBolYil;
    DoEvent(EventKey);
until false;
showCursor;
end.
