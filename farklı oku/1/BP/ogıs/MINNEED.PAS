unit MinNeed;
interface
uses Crt, Nsr, UOg, BLUNGR, DFile;
  procedure initprog;
  procedure quitProg;
implementation
Procedure InitProg;
begin
  Univ:='€UKUROVA šN˜VERS˜TES˜';
  Fakulte:='';
  Bolum.init;
  Unvan.init;
  Grad.iNIT;
  Yariyil.init;
  Ogr.Init;  Ogr.Open;
  Drs.init;  Drs.open; Drs.KredSaatToMem;
  Uye.init;  Uye.open;
  YYDrs.Init;YYDrs.Open;
  ReadListStat;
end;

Procedure QuitProg;
begin
  While EDSP<>0 do CloseEdit;
  YYDrs.DFile.CloseFile;
  Uye.DFile.CloseFile;
  Drs.DFile.CloseFile;
  Ogr.DFile.CloseFile;
  YYDrs.Done;
  uye.done;
  drs.done;
  ogr.done;
  Yariyil.done;
  clrscr;
  Halt;
end;
end.
