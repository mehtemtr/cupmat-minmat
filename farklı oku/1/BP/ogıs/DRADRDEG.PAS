uses Crt, GenUtil, StrIn, NSR, UOG, BLUNGR, UPrt, DFile, Exist;

procedure WriteUniv;
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

  Yariyil.Init;

  Drs.init;  Drs.open;
  yyDrs.Init; YYDrs.Open;
  ReadUniv;
  ShowBolYil;
end;

Procedure QuitProg;
begin
  While EDSP<>0 do CloseEdit;
  Drs.DFile.CloseFile;
  YYDrs.DFile.CloseFile;
  YYDrs.Done;
  drs.done;
  Yariyil.done;
  clrscr;
  Halt;
end;
var A, B, C, D, I : Word; Ders:Array[1..30] of string;
begin
{GUZDRS95.DAT DOSYASI INCELENIYOR}
Ders[1]:='IGS101HA';
Ders[2]:='IBE103AA';
Ders[3]:='IGS101AA';
Ders[4]:='IBE103BA';
Ders[5]:='IGS101BA';
Ders[6]:='IBE103EA';
Ders[7]:='IGS101EA';
Ders[8]:='IBE103FA';
Ders[9]:='IGS101FA';
Ders[10]:='IBE103CA';
Ders[11]:='IGS101CA';
Ders[12]:='IBE103GA';
Ders[13]:='IGS101GA';
{BAHDRS94.DAT DOSYASI INCELENIYOR}
Ders[14]:='IYD102AA';
Ders[15]:='IYD102BA';
Ders[16]:='IYD102GA';
Ders[17]:='IYD104CA';
Ders[18]:='IYD104EA';
Ders[19]:='IYD104FA';
Ders[20]:='IYD202AA';
Ders[21]:='IYD202BA';
Ders[22]:='IYD202GA';

     initprog;
     YYDrs.IndexDuz;
     for I:=1 to 13 do begin
     if YYDrs.Search(Ders[I], A, B) then begin
        YYDrs.DFile.GetRec(B, YYDrs.Is);
        if Drs.Search(copy(Ders[I],1,6), C, D) then begin
           YYDrs.DrsAdr:=D;
           Drs.DFile.GetRec(YYDrs.DrsAdr,Drs.Is);
           YYDrs.DFile.PutRec(B,YYDrs.Is);
        end;
     end;
     end;
     quitprog;
end.
GUZDRS95
IGS101HA IGS107 TURK HALK MUZIGI          KODLAR TUTMUYOR
---------------------------------------------------------
2 .HATA
IBE103AA IBE105 BASKETBOL                 KODLAR TUTMUYOR
---------------------------------------------------------
3 .HATA
IGS101AA IGS107 TURK HALK MUZIGI          KODLAR TUTMUYOR
---------------------------------------------------------
4 .HATA
IBE103BA IBE105 BASKETBOL                 KODLAR TUTMUYOR
---------------------------------------------------------
5 .HATA
IGS101BA IGS107 TURK HALK MUZIGI          KODLAR TUTMUYOR
---------------------------------------------------------
6 .HATA
IBE103EA IBE105 BASKETBOL                 KODLAR TUTMUYOR
---------------------------------------------------------
7 .HATA
IGS101EA IGS107 TURK HALK MUZIGI          KODLAR TUTMUYOR
---------------------------------------------------------
8 .HATA
IBE103FA IBE105 BASKETBOL                 KODLAR TUTMUYOR
---------------------------------------------------------
9 .HATA
IGS101FA IGS107 TURK HALK MUZIGI          KODLAR TUTMUYOR
---------------------------------------------------------
10 .HATA
IBE103CA IBE105 BASKETBOL                 KODLAR TUTMUYOR
---------------------------------------------------------
11 .HATA
IGS101CA IGS107 TURK HALK MUZIGI          KODLAR TUTMUYOR
---------------------------------------------------------
12 .HATA
IBE103GA IBE105 BASKETBOL                 KODLAR TUTMUYOR
---------------------------------------------------------
13 .HATA
IGS101GA IGS107 TURK HALK MUZIGI          KODLAR TUTMUYOR
---------------------------------------------------------
=========================================================
BAHDRS94.DAT DOSYASI INCELENIYOR
14 .HATA
IYD102AA    104 ˜NG˜L˜ZCE II              KODLAR TUTMUYOR
---------------------------------------------------------
15 .HATA
IYD102BA    104 ˜NG˜L˜ZCE II              KODLAR TUTMUYOR
---------------------------------------------------------
16 .HATA
IYD102GA    104 ˜NG˜L˜ZCE II              KODLAR TUTMUYOR
---------------------------------------------------------
17 .HATA
IYD104CA    106 ˜NG˜L˜ZCE II              KODLAR TUTMUYOR
---------------------------------------------------------
18 .HATA
IYD104EA    106 ˜NG˜L˜ZCE II              KODLAR TUTMUYOR
---------------------------------------------------------
19 .HATA
IYD104FA    106 ˜NG˜L˜ZCE II              KODLAR TUTMUYOR
---------------------------------------------------------
20 .HATA
IYD202AA    202 ˜NG˜L˜ZCE IV              KODLAR TUTMUYOR
---------------------------------------------------------
21 .HATA
IYD202BA    202 ˜NG˜L˜ZCE IV              KODLAR TUTMUYOR
---------------------------------------------------------
22 .HATA
IYD202GA    202 ˜NG˜L˜ZCE IV              KODLAR TUTMUYOR
---------------------------------------------------------
