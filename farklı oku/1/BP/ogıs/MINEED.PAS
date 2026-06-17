unit MinNeed;

interface
uses OgrTip, Crt, Win, Exist, Obj, BlUnGr, DrUYY, Ogrenci, Istat;

  Procedure InitProg;
  Procedure QuitProg;

implementation
Procedure InitProg;
begin
  Univ:='€UKUROVA šN˜VERS˜TES˜';
  Fakulte:='';
  New(Bolum,init);
  New(Unvan,init);
  New(Grad,init);
  New(Yariyil,init);
  New(Ogr,init);New(Ana,init);
  New(Drs,init);
  New(Uye,init);
  New(YYDrs,init);
  ReadUniv;
  ShowBolYil;
  GetMem(ListStat, SizeOf(TListStat));
  ReadListStat;
end;

Procedure QuitProg;
begin
  While EDSP<>0 do CloseEdit;
  FreeMem(ListStat, SizeOf(TListStat));
  YYDRs^.Sakla; YYDrs^.Free;
  Uye^.Sakla; Uye^.Free;
  Drs^.Sakla; Drs^.Free;
  if Ana<>nil then Ana^.Free;
  if ogr<>nil then begin Ogr^.Sakla; Ogr^.Free; end;
  Yariyil^.free;
  Grad^.free;
  Unvan^.free;
  Bolum^.free;
  clrscr;
end;
begin
end.