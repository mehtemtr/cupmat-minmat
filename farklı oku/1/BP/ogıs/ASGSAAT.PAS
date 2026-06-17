uses BLUNGR, UIndex, Nsr, Crt, GenUtil, DFile, Exist, Uprt, UOG;
{$F+}
Procedure Kred14;
Function Ortala(M:Byte; S : String):String;
Var L :byte;
begin
   STRIP(S);
   L:=(M - Length(S)) div 2;
   Ortala:=Spaces(L)+S;
end;
Var S : String; I, ASaat : Word; R : Integer; TC : Char; Adres : Word;
begin
    ASaat:=14;
    OpenEditWindow('™¦RENC˜ KAYIT ASGAR˜ SAAT KONTROL',
		 '4@YARIYILDA ASGAR˜ SAAT',
		 'ESC:VAZGE€',
                  [ESC],
 		 [],8,1);
    Str(ASaat:4,S);
    InputStr(S,Form.FieldKol[1],1,4,True,['0'..'9'],4,TC);
    Val(S,ASaat,R);
    CloseEdit;
    If TC=ESC then exit;
    Message('KAYIT ASGAR˜ SAAT KONTROL',
             'LšTFEN YAZICIYA KAGIT TAKINIZ@HAZIR OLUNCA ENTER@@ESC:VAZGEC@ENTER:BAžLA',
             [ESC,CR], TC);
       if TC=ESC then Exit;
    With Ogr do begin
        OpenEditWindow('™¦RENC˜ KAYIT ASGAR˜ SAAT KONTROL',
		 '8@™GR. NO@25@™¦RENC˜N˜N ADI, SOYADI@4@TOPLAM SAAT',
		 'ESC:VAZGE€',
                  [ESC],
 		 [],8,1);
        LPT.WriteLnPrt('\E\C'+Ortala(60,UNIV));
        LPT.WriteLnPrt('\E\C'+Ortala(60,Fakulte+' '+Bolum.KodAd(ActBol)) );
        LPT.WriteLnPrt('\C'+ Ortala(119,YilStr(ActYil,ActYY)+' ™¦RET˜M YILI ASGAR˜ SAAT KONTROL'));
        LPT.WriteLnPrt(' ');
        LPT.WriteLnPrt('\C ™¦R. NO         ADI   SOYADI       SAAT');
        LPT.WriteLnPrt('\C -------- ------------------------- ----');
        For I:=1 to Say do begin
            Adres:=GetAdr(I);
            DFile.GetRec(Adres, Is);
            FindTopSaatKredi;
            Str(TopSaat:4, S);
            WriteStr(Form.FieldKol[1],1,Getis, GirisColor);
            WriteStr(Form.FieldKol[2],1,GetAd, GirisColor);
            WriteStr(Form.FieldKol[3],1,S, GirisColor);
            If TopSaat < ASaat then
            LPT.WritelnPrt('\C '+GetIs+' '+GetAd+' '+S);
        end;
    CloseEdit;
  end;
end;
Procedure YilSec;
begin
  YYDrs.YilSec;
end;
Procedure EditYY;
begin
  Ogr.EditYY
end;
procedure BolumSec;
begin
   Ogr.BolumSec
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
Procedure Universite;
Var TC : Char;
begin
   OpenEditWindow('šN˜VERS˜TE VE FAKšLTE ADI DE¦˜ž˜KL˜¦˜',
   '30@šN˜VERS˜TEN˜N ADI@31@FAKšLTEN˜N ADI' ,'ESC : DE¦˜ž˜KL˜K TAMAM',[ESC],[],10, 1);
   Repeat
     InputStr(Univ, Form.FieldKol[1],1,30, False,ALLKar,0, TC);
     If TC = NULL then
       InputStr(Fakulte, Form.FieldKol[2],1,30, False,ALLKar,0, TC);
   until TC=ESC;
   WriteUniv;
   CloseEdit;
   ShowBolYil
end;
procedure Bos;
begin
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
  Drs.init;  Drs.open; Drs.KredSaatToMem;
  Uye.init;  Uye.open;
  YYDrs.Init;YYDrs.Open;
  ReadUniv;
  ShowBolYil;
  ReadListStat;
end;


Procedure ShowCopwr;
Var S:String;
begin
   Writestr(10, 20, Decode('#9-951; '#0':0+;%56+8%6+'#0'!+.''+7.%/'#0'/%5-%?+'#0'351&'#0'$5'#0'>969&'#0':0.:'), CmdColor);
   str(memavail,s);
   Writestr(27, 24, 'KALAN HAFIZA : '+S+' BYTE', CmdColor);
end;

Var CH:Char;
begin
  MenuBar:=
  AddMenu('~DOSYA',ALT_D, 0, Bos,
       AddMenu('~B™LšM SE€    F1', F1     , CmdBolumSec  , BolumSec,0,
       AddMenu('~YIL SE€ CTRL_F1', CTRL_F1, CmdYilSec    , YilSec  ,0,
       AddMenu('€~IKIž     ALT_Q', ALT_Q,   CmdQuitProg , QUitProg,0,0))),
  AddMenu('SAA~T', ALT_t, 0, Bos,
       AddMenu('~KAYIT G˜R˜ž˜        F6', F6      , CmdEditYY,EditYY,0,
       AddMenu('~ASGAR˜ SAAT BAS        ', NULL    , CmdYokla, Kred14,0,0)),0));

LinkMenu(0, MenuBar);
DefineMainBox(MenuBar);
ClrScr;
     KrediHesapla:= False;
     fillwin(#178,16*Blue+LightGray);
     If Not Disk.ChangeDir then Halt;
     initprog;
     ShowCopwr;
Repeat
    ShowMenuBar(0);
    CH:=GetKeyCmd;
    fillwin(#178,16*Blue+LightGray);
    ShowBolYil;
    DoEvent(EventKey);
    ShowCopwr;
until false;
showCursor;
end.

