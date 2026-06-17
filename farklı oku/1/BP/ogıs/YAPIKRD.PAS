uses Crt, Win, Exist, DFile, BLUNGR, YPKRD;
Const

   SBolum : String = 'BOLUM.DAT';

{$F+}
Procedure KodGir;
begin
  BolKodGir;
end;
Procedure TrGir;
begin
 TransferTarGir;
end;
Procedure BankDiskeYaz;
begin
  BankBilgiYaz
end;
Procedure BankBirles;
begin
  BankBirlestir;
end;

Procedure Bos;
begin
end;
Procedure QProg;
begin
  QuitProg
end;
pROCEDURE DnGr;
begin
DonemGir
end;
Procedure IProg;
begin
  InitProg
end;
{$F-}

Var CH:Char;
begin
  MenuBar:=
  AddMenu('~DOSYA',ALT_D, 0, Bos,
       AddMenu('~B™LšM KOD G˜R       F1', F1,  CmdBolumSec  , KodGir,0,
       AddMenu('~D™NEM B˜LG˜ G˜R     F2', F2,  CmdOgrGir    , DnGr,0,
       AddMenu('B~ANKA DISKE YAZ     F3', F3,  CmdYilSec    , BankDiskeYaz  ,0,
       AddMenu('~TRANSFER TAR˜H˜ G˜R F4', F4,  CmdDrsGir    , TrGir  ,0,
       AddMenu('DOSYALARI B˜RLEžT˜R  F4', F4, CmdYeniYil   , BankBirles ,0,
       AddMenu('€~IK          ALT_Q', ALT_Q  , CmdQuitProg  , QProg,0,
       0)))))),0);
   LinkMenu(0, MenuBar);
   DefineMainBox(MenuBar);
   ClrScr;
   KrediHesapla:= False;
   fillwin(#178,16*Blue+LightGray);
   If Not Disk.ChangeDir then Halt;
   IProg;
   ShowMenuBar(0);
   ShowFak;
Repeat
    ShowMenuBar(0);
    CH:=GetKeyCmd;
    fillwin(#178,16*Blue+LightGray);
    ShowFak;
    DoEvent(EventKey);
until false;
showCursor;
end.
Procedure DiskeYaz;
begin
  WriteOgrInfo
end;
Procedure Yaz;
begin
  Birlestir;
end;