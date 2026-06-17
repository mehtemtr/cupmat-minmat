uses Crt, Nsr, UOg, UIndex, BLUNGR, Exist, GenUtil, DFile, UPrt;
Const CmdStatYaz = 12;
      CmdStatDsk = 13;
      HEAD='  KOD         DERS˜N ADI         SAAT  UB   DEV  FF   MAZ  BAž  NYK  MEV BAžARILI BAžARISIZ';
      ALT ='------ ------------------------- ---- ---- ---- ---- ---- ---- ---- ---- -------- ---------';
   Type
        StatRec = Record
           Adres : Word;
           DersKod : String[6];
           DersName: String[25];
           ST     : Byte;
           BTMev  : Word;
           DTMev  : Word;
           TTMev  : Word;
           MZMev  : Word;
           BSMev  : Word;
           NYMev  : Word;
           Gecer  : Word;
           Mevcut : Word;
        end;
        StatArr    = Array[1..MaxYYDrs] of StatRec;
        StatIndArr = Array[1..MaxDrs] of Word;
Var Stat    : ^StatArr;
    StatInd : ^StatIndArr;
    StatSay : Word;

    Function StatLine(X : Word) : String;
    begin
        With Stat^[X] do
           StatLine:=DersKod+' '+ DersName
           +' '+ IntToStr(ST,4)
           +' '+IntToStr(BTMev,4)
           +' '+IntToStr(DTMev,4)
           +' '+IntToStr(TTMev,4)
           +' '+IntToStr(MZMev,4)
           +' '+IntToStr(BSMev,4)
           +' '+IntToStr(NYMev,4)
           +' '+IntToStr(Mevcut,4)
           +' '+IntToStr(Gecer,8)
           +' '+IntToStr(Mevcut-Gecer,9);

end;
Function Ortala(M:Byte; S : String):String;
Var L, I :byte;
begin
   L:=(M - Length(S)) div 2;
   Ortala:=Spaces(L)+S;
end;
Procedure EraseExtra(S : String);
Var Extra:Word;
begin
   For Extra:=1 to Length(S) do
      If S[Extra] in ['+','-','*','='] then S[Extra]:=' ';
end;
Function DrsSinif(I : Word):String;
Begin
    DrsSinif:=Copy(Stat^[I].DersKod,4, 3);
end;
Function BuildStatArr:Boolean;
Var I, J, L, Gap : Integer;
    S : StatRec;
begin
   StatSay:=0;
   FillChar(Stat^, SizeOf(StatArr), #0);
   FillChar(StatInd^, SizeOf(StatIndArr),#0);
   BuildStatArr:=False;
   YYDrs^.IndisInit(ActBol, 1);
   If IndisSay = 0 then begin
      Complain('BU YARIYILDA DERS A€ILMAMIž');
      EXIT
   END;
   BuildStatArr:=True;
   For I:=1 to IndisSay do begin
       YYDrs^.DFile.GetRec(Indis[I], YYDrs^.Is);
       J:=YYDrs^.DrsAdr;
       Inc(StatSay);
       With Drs^ do
           With Stat^[StatSay] do begin
               DFile.GetRec(J,Is);
               Adres :=J;
               Move(Is,DersKod[1],KeyL);
               DersKod:=GetIs;
               DersName:=GetAd;
               ST      :=Saat;
           end;
    end;
    Gap:=StatSay div 2;
    While Gap>0 do begin
      For I:=Succ(Gap) to StatSay do begin
	   J:=I-Gap;
	   While J > 0 do begin
		   L:=J+Gap;
		   If DrsSinif(J)<=DrsSinif(L) then
		      J:=0
		   else begin
		      S:=Stat^[J];
		      Stat^[J]:=Stat^[L];
		      Stat^[L]:=S;
		   end;
		   J:=J-Gap
	   end;
      end;
      Gap:= Gap div 2;
    end;
    For I:=1 to StatSay do StatInd^[Stat^[I].Adres]:=I
end;

Function PrepStat:Boolean;
Var I, M, J, G  : Word; W:String;
begin
   PrepStat:=False;
   If Not BuildStatArr then exit;
   If Ogr^.Say = 0 then begin
      Complain('BU B™LšMDE ™¦RENC˜ YOK');
      EXIT;
   END;
   PrepStat:=True;
   With Ogr^ do begin
      For I :=1 to Say do begin
          DFile.GetRec(GetAdr(I), Is);
          For J:=1 to Kac[AktifYYInd] do begin
                M:=StatInd^[Ders[AktifYYInd,J].DrsPtr];
                G:=Ders[AktifYYInd,J].Grd;
                W:=GRAD.Kod(G);
                with Stat^[M] do begin
                      if (W = 'BS') or (W = ' S') then  Inc(BSMev); { BS BAžARILI }
                      if W = 'UB' then  Inc(BTMev); { BT BšTšNLEME}
                      if W = 'DT' then  Inc(DTMev); { DT DEVAMSIZ }
                      if W = 'MZ' then  Inc(MZMev); { MZ MAZARETL˜}
                      if W = 'NY' then  Inc(NYMev); { NY NOT YOK  }
                      if W = 'FF' then  Inc(TTMev); { TT TEKRAR   }
                      If GRAD.Grade[G].Basari then Inc(Gecer);
                      Inc(Mevcut);
                end;
          end;
      end;
   end;
end;

{$F+}
Procedure YilSec;
begin
  YYDrs^.YilSec;
end;
procedure BolumSec;
begin
   Ogr^.BolumSec
end;
Procedure QuitProg;
begin
  While EDSP<>0 do CloseEdit;
  FreeMem(Stat, SizeOf(StatArr));
  FreeMem(StatInd, SizeOf(StatIndArr));
  YYDrs^.DFile.CloseFile;
  Uye^.DFile.CloseFile;
  Drs^.DFile.CloseFile;
  Ogr^.DFile.CloseFile;
  YYDrs^.Done;
  uye^.done;
  Drs^.done;
  Ogr^.done;
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
  Ogr^.Open;
  Drs^.open;
  Drs^.KredSaatToMem;
  Uye^.open;
  YYDrs^.Open;
  ReadUniv;
  ShowBolYil;
  ReadListStat;
  GetMem(Stat, SizeOf(StatArr));
  GetMem(StatInd, SizeOf(StatIndArr));
end;
Procedure StatYaz;
var CH    : Char;
    I     : Word;
    S     : String;
begin
  OpenEditWindow('YAZICIYA ˜STAT˜ST˜K BASIMI',
		 '25@ ',
		 'CR:BAS@ESC:VAZGE€',
		  [CR, ESC],[],5,4);
  CH:=GetKeyCmd;
  Case CH of
     ESC : ;
     CR  : Begin  WriteStr(1,1,'˜STAT˜ST˜K HAZIRLANIYOR',TextAttr);
                  WriteStr(1,2,'LšTFEN BEKLEY˜N˜Z',TextAttr);
                  If PrepStat then begin
                     ClrScr;
                     WriteStr(1,1,'˜STAT˜ST˜K BASILIYOR', TextAttr);
                     LPT.WriteLnPrt('\E\C'+Ortala(60,UNIV));
                     LPT.WriteLnPrt('\E\C'+Ortala(60,Fakulte+' '+Bolum.KodAd(ActBol)) );
                     LPT.WriteLnPrt('\C'+ Ortala(119,YilStr(ActYil,ActYY)+' ™¦RET˜M YILI BAžARI DURUMU TABLOSU'));
                     LPT.WriteLnPrt('\C  ');
                     LPT.WriteLnPrt( '\C'+ Ortala(119,HEAD));
                     LPT.WriteLnPrt('\C'+ Ortala(119, ALT));
                     For I:=1 to StatSay do
                         LPT.WriteLnPrt('\C'+ Ortala(119,+StatLine(I)));
                     LPT.WriteLnPrt('\F');
                  end;
          end;
     end;
     CloseEdit;
 end;




Procedure StatDsk;
var TC    : Char;
    I     : Word;
    S     : String;
    DisketTxtF : TextFile;
    D : Boolean;
begin
  If not DisketTak('D˜SKETE ˜STAT˜ST˜K BASIMI') then exit;
  OpenEditWindow('D˜SKETE ˜STAT˜ST˜K BASIMI',
		 '30@DOSYA ADI',
		 'END:BASIMA GE€@ESC:VAZGE€',
		  [ENDKEY, ESC],[],5,4);
  D:=False;
  S:=Drive+Bolum.Kod(ActBol)+'STAT.TXT';
  Repeat
       ClrScr;
       WriteStr(1,1,S,TextAttr);
       TC:=GetDesiredKey([ESC, ENDKEY]);
       Case TC of
          ESC    : begin CloseEdit; exit end;
          ENDKEY : begin
                     If Exists(S) then begin
                        beep;
                        WriteStr(2,2,'BU DOSYA ZATEN VAR. S˜L˜NS˜NM˜ [E/H]',ErrorColor);
                        D:=Evet
                     end else D:=True;
                     ClrScr;
                   end;
        end;
   Until D;
   ClrScr;

   DisketTxtF.OpenToWrite(S);
   WriteStr(1,1,'˜STAT˜ST˜K HAZIRLANIYOR',TextAttr);
   WriteStr(1,2,'LšTFEN BEKLEY˜N˜Z',TextAttr);
   If PrepStat then begin
      ClrScr;
      WriteStr(1,1,'˜STAT˜ST˜K BASILIYOR', TextAttr);
      DisketTxtF.WriteText(UNIV);
      DisketTxtF.WriteText(Fakulte+' '+Bolum.KodAd(ActBol));
      DisketTxtF.WriteText(YilStr(ActYil,ActYY)+' ™¦RET˜M YILI BAžARI DURUMU TABLOSU');
      DisketTxtF.WriteText(' ');
      DisketTxtF.WriteText(HEAD);
      DisketTxtF.WriteText(ALT);
      For I:=1 to StatSay do  DisketTxtF.WriteText(StatLine(I));
  end;
  DisketTxtF.CloseFile;
  CloseEdit;
end;
{$F-}
Procedure ShowCopwr;
Var S:String;
begin
   str(memavail,s);
   Writestr(27, 24, 'KALAN HAFIZA : '+S+' BYTE', CmdColor);
end;


Var CH:Char;
begin

  MenuBar:=
  AddMenu('~DOSYA',ALT_D, 0, Bos,
       AddMenu('~B™LšM SE€    F1', F1     , CmdBolumSec  , BolumSec,0,
       AddMenu('~YIL SE€ CTRL_F1', CTRL_F1, CmdYilSec    , YilSec  ,0,
       AddMenu('€~IK       ALT_Q', ALT_Q  , CmdQuitProg  , QuitProg,0,0))),
  AddMenu('B~ASIM', ALT_A, 0, Bos,
       AddMenu('~YAZICI      F2',F2,      CmdStatYaz, StatYaz, 0,
       AddMenu('~D˜SKET CTRL-F2',CTRL_F2, CmdStatDsk, StatDsk, 0, 0)),0));
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

