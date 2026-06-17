uses Crt, Nsr, Exist, DFile, BLUNGR, ArtikObj;
Const

   SBolum : String = 'BOLUM.DAT';

{$F+}
Procedure KodGir;
begin
  BolKodGir;
end;
Procedure DiskeYaz;
begin
  WriteOgrInfo
end;
Procedure Yaz;
begin
  Birlestir;
end;
Procedure Bos;
begin
end;
Procedure QProg;
begin
  QuitProg
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
       AddMenu('B~ANKA DISKE YAZ     F2', F2,  CmdYilSec    , DiskeYaz  ,0,
       AddMenu('DOSYALARI B˜RLEžT˜R  F3', F3, CmdYeniYil   , Yaz ,0,
       AddMenu('€~IK          ALT_Q', ALT_Q  , CmdQuitProg  , QProg,0,
       0)))),0);
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
