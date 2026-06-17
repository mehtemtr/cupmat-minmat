const
  
  MaxKeyLen     =  8;
  MaxAdLen      = 25;
  MaxSaat :Byte = 30;
  MaxKredi:Real = 25;

  OgrKeyL   = 8;
  DrsKeyL   = 6;
  UyeKeyL   = 6;
  YYDrsKeyL = 8;

   MaxOgr       = 1023;
   MaxDrs       = 2047;
   MaxUye       =  511;
   MaxYYDrs     =  639;

   Guz=1;Bah = 2;Yaz=3;
    GUZBAH : ARRAY[Guz..Yaz] Of String[3] = ('GUZ', 'BAH','YAZ');

  MaxDonemDrs = 18;
  MaxDonem    = 20;

type
  KeyStr       = String[MaxKeyLen];
  AdStr        = String[MaxAdLen];
  Str2         = string[2];

  AnaRec = Record
       DrsPtr: Word; Grd : Byte;
   end;
   KayRec = Record
	  OgrPtr: Word; Nt : Byte;
   end;
   YilRec = Record
	   YL  : Word;
	   YY  : Byte;
	  CNT : Byte;
   end;
   YYArr          = Array[1..MaxDonem] of YilRec;
   AnaRecType     = Array[1..MaxDonemDrs] of AnaRec;
   AnaKayType     = Array[1..MaxDonem] of AnaRecType;
   KacType        = Array[Guz..Yaz] of Byte;
   DonemDers      = Array[1..MaxDonemDrs] of Word;
   YYKayType      = Array[Guz..Yaz] of DonemDers;
   DersType       = Array[Guz..Yaz] of AnaRecType;
   KredArr        = Array[1..MaxDrs] of Real;
   SaatArr        = Array[1..MaxDrs] of Byte;
   DogumYerStr = String[15];
   OgrRec  = record
	  Is       : Array[0..OgrKeyL-1] of Char;
	  Ad       : AdStr;
	  Cins     : Char;
	  DogumYer : DogumYerStr;
	  DogumGun : Byte;
	  DogumAy  : Byte;
	  DogumYil : Word;
	  YKK      : Word;
          HazNot   : Word;
	  HazBasYil: Word;
          Kac      : KacType;
          YYKay    : YYKayType;
          Ders     : DersType;
	  YYCount  : Word;
	  Donem    : YYArr;
	  AnaKay   : AnaKayType;
   end;
   UyeRec  = record
	  Is         : Array[0..UyeKeyL-1] of Char;
	  Ad         : AdStr;
	  UnvKd      : Byte;
          YYDSay     : Array[Guz..Bah] Of Byte;
   end;
   DrsRec  = record
	  Is         : Array[0..DrsKeyL-1] of Char;
	  Ad         : AdStr;
	  Saat       : Byte;
	  Kredi      : Real;
	  AlanOgrSay : LongInt;
	  YYDSay     : Array[Guz..Yaz] Of Byte;
   end;
   YYDrsRec  = record
	  Is         : Array[0..YYDrsKeyL-1] of Char;
	  DrsAdr     : Word;
	  UyeAdr     : Word;
	  Mevcut     : Array[1..3] of Word;
	  ListLink   : Word;
          ButLink    : Word;
          TekLink    : Word;
   end;
   HeadRec = record
	FirstFree   : Word;
	Deltd       : Word;
	RecLen      : Word;
	MaxKay      : Word;
	IsOpen      : Word;
   end;
   TYarYil = record
      Yil:Word; YY : Word;
   end;
   TBol = Record
       Kod : String[2];
       Ad  : String[30];
   end;
Var
    BolSay : Integer;
    ActBol : Integer;
    ActY   : Integer;
    YarYil : Array[1..3] of TYarYil;
    Bolum  : Array[1..16] of TBol;
    Ogr : OgrRec; OgrF : File;
    Drs : DrsRec; DrsF : File;
    Uye : UyeRec; UyeF : File;
    YYDrs : YYDrsRec; YYDrsF : File;
    HeadOgr, HeadDrs, HeadUye, HeadYYDrs : HeadRec;
    ResOgr, ResDrs, ResUye, ResYYDrs : Integer;

    HataF : Text;
    HataSay : Integer;
    AlanOgrSay : Array[1..2048] of Integer;
    YYDSay : Array[1..3, 1..2048] of Integer;

Function YilStr(Y:Word; Z:Byte):String;
Var S, T:String;
begin
    Str(Y:4,S);
    Str((Y+1):4,T);
    S:=S+'-'+Copy(T,3,2);
    Case Z of
       1: S:=S+'  GšZ ';
       2: S:=S+' BAHAR';
       3: S:=S+' YAZ  '
    end;
    YilStr:=S;
end;
Function DonemAd(I : Integer) : String;
begin
    DonemAd:=YilStr(Ogr.Donem[I].YL, Ogr.Donem[I].YY);
end;
function FLPOS(A,C,D:WORD):LongInt;Far;Assembler;
asm
        MOV     AX,A
        MOV     CX,C
        DEC     CX
        MUL     CX
        ADD     AX, D
        ADC     DX, 0
end;
procedure YilOku;
Var K : Integer;
    T : Text;
begin
    Assign(T,'YIL.DAT');
    reset(T);
    Readln(T,K);
    for K:=1 to 3 do
       With YarYil[K] do begin
           Readln(T,YarYil[K].Yil);Readln(T,YarYil[K].YY);
       end;
    close(T);
end;
procedure BolumOku;
Var K : Integer;
    T : Text;
begin
    Assign(T,'BOLUM.DAT');
    reset(T);
    Readln(T,BolSay); ReadLn(T,K);
    for K:=1 to BolSay do
       With Bolum[K] do begin
           Readln(T,Bolum[K].Kod);Readln(T,Bolum[K].Ad);
       end;
    close(T);
end;
Function GetIs(Var X; Len : Integer):String;
Var S : String;
begin
   S[0]:=CHR(Len); Move(X,S[1],Len);
   GetIs:=S
end;
Function GetAd(Var X; Len : Integer):String;
Var S : String;
begin
   S[0]:=CHR(Len);
   FillChar(S[1],Len,' ');
   Move(X,S[1],Len);
   GetAd:=S
end;
Function OgrGetIs:String;
begin
  OgrGetIs:=GetIs(Ogr.Is,8);
end;
Function OgrGetAd:String;
begin
  OgrGetAd:=GetAd(Ogr.Ad[1],25);
end;
Function DrsGetIs:String;
begin
  DrsGetIs:=GetIs(Drs.Is,6);
end;
Function DrsGetAd:String;
begin
  DrsGetAd:=GetAd(Drs.Ad[1],25);
end;
Function UyeGetIs:String;
begin
  UyeGetIs:=GetIs(Uye.Is,8);
end;
Function UyeGetAd:String;
begin
  UyeGetAd:=GetAd(Uye.Ad[1],25);
end;
Function YYDrsGetIs:String;
begin
  YYDrsGetIs:=GetIs(YYDrs.Is,8);
end;
Function YYDrsKodOK:Boolean;
begin
   YYDrsKodOK:=(DrsGetIs = Copy(YYDrsGetIs,1,6))
end;
Function  SnStr(Y :Integer):String;
   Var S : String;
   begin
      Str(Y,S);
      S:=Copy(S,3,2);
      If S[1]=' ' then S[1]:='0';
      SnStr:=S;
end;
Function YYDrsFName(I : Integer):String;
Var A, S : String; K, L : Integer;
begin
   K:=YarYil[I].Yil;L:=YarYil[I].YY;
   YYDrsFName:=GUZBAH[L]+'DRS'+SnStr(K)+'.DAT';
end;
Procedure OpenYYDrs(I : Integer);
begin
    Assign(YYDrsF,YYDrsFName(I));
    Reset(YYDrsF,1);
    BlockRead(YYDrsF,HeadYYDrs, SizeOf(HeadRec),ResYYDrs);
end;
Procedure OpenDrs;
begin
    Assign(DrsF,'DRS.DAT');
    Reset(DrsF,1);
    BlockRead(DrsF,HeadDrs, SizeOf(HeadRec),ResDrs);
end;
Procedure OpenUye;
begin
    Assign(UyeF,'UYE.DAT');
    Reset(UyeF,1);
    BlockRead(UyeF,HeadUye, SizeOf(HeadRec),ResUye);
end;
Procedure OpenOgr(Bol:Integer);
begin
    Assign(OgrF,Bolum[Bol].Kod+'OGR.DAT');
    Reset(OgrF,1);
    BlockRead(OgrF,HeadOgr, SizeOf(HeadRec),ResOgr);
end;
Function ReadOgr(R : Integer):Boolean;
begin
   ReadOgr:=False;
   if (R<=0) or (R>=HeadOgr.FirstFree) then exit;
   Seek(OgrF, FlPos(SizeOf(OgrRec), R, SizeOf(HeadRec)));
   BlockRead(OgrF, Ogr, SizeOf(OgrRec), ResOgr);
   ReadOgr:=True;
end;
Function ReadDrs(R : Integer):Boolean;
begin
   ReadDrs:=False;
   if (R<=0) or (R>=HeadDrs.FirstFree) then exit;
   Seek(DrsF, FlPos(SizeOf(DrsRec), R, SizeOf(HeadRec)));
   BlockRead(DrsF, Drs, SizeOf(DrsRec), ResDrs);
   ReadDrs:=True;
end;
Function ReadUye(R : Integer):Boolean;
begin
   ReadUye:=False;
   if (R<=0) or (R>=HeadUye.FirstFree) then exit;
   Seek(UyeF, FlPos(SizeOf(UyeRec), R, SizeOf(HeadRec)));
   BlockRead(UyeF, Uye, SizeOf(UyeRec), ResUye);
   ReadUye:=True;
end;
Function ReadYYDrs(R : Integer):Boolean;
begin
   ReadYYDrs:=False;
   if (R<=0) or (R>=HeadYYDrs.FirstFree) then exit;
   Seek(YYDrsF, FlPos(SizeOf(YYDrsRec), R, SizeOf(HeadRec)));
   BlockRead(YYDrsF, YYDrs, SizeOf(YYDrsRec), ResYYDrs);
   ReadYYDrs:=True;
end;
Function WriteOgr(R : Integer):Boolean;
begin
   WriteOgr:=False;
   if (R<=0) or (R>=HeadOgr.FirstFree) then exit;
   Seek(OgrF, FlPos(SizeOf(OgrRec), R, SizeOf(HeadRec)));
   BlockWrite(OgrF, Ogr, SizeOf(OgrRec), ResOgr);
   WriteOgr:=True;
end;
Function WriteDrs(R : Integer):Boolean;
begin
   WriteDrs:=False;
   if (R<=0) or (R>=HeadDrs.FirstFree) then exit;
   Seek(DrsF, FlPos(SizeOf(DrsRec), R, SizeOf(HeadRec)));
   BlockWrite(DrsF, Drs, SizeOf(DrsRec), ResDrs);
   WriteDrs:=True;
end;
Function WriteUye(R : Integer):Boolean;
begin
   WriteUye:=False;
   if (R<=0) or (R>=HeadUye.FirstFree) then exit;
   Seek(UyeF, FlPos(SizeOf(UyeRec), R, SizeOf(HeadRec)));
   BlockWrite(UyeF, Uye, SizeOf(UyeRec), ResUye);
   WriteUye:=True;
end;
Function WriteYYDrs(R : Integer):Boolean;
begin
   WriteYYDrs:=False;
   if (R<=0) or (R>=HeadYYDrs.FirstFree) then exit;
   Seek(YYDrsF, FlPos(SizeOf(YYDrsRec), R, SizeOf(HeadRec)));
   BlockWrite(YYDrsF, YYDrs, SizeOf(YYDrsRec), ResYYDrs);
   WriteYYDrs:=True;
end;

procedure BolDegis(Bol : Integer);
begin
   Close(OgrF);
   OpenOgr(Bol);
   ActBol:=Bol;
end;
Procedure YilDegis(I : Integer);
begin
    Close(YYDrsF);
    OpenYYDrs(I);
    ActY:=I;
end;
procedure Basla;
begin
    FillChar(AlanOgrSay, SizeOf(AlanOgrSay),#0);
    FillChar(YYDSay,SizeOf(YYDSay),#0);
    BolumOku;
    YilOku;
    OpenOgr(1);
    ActBol:=1;
    OpenYYDrs(1);
    ActY:=1;
    OpenDrs;
    OpenUye;
    HataSay:=0;
    Assign(HataF,'HATA.TXT');
    ReWrite(HataF);
end;
Procedure Bitir;
begin
   Close(OgrF);Close(UyeF);Close(DrsF);Close(YYDrsF);Close(HataF);
end;
Procedure HataYaz(S : String; Arttir : Boolean);
Var A : String;
begin
   If Arttir then begin
      Inc(HataSay); Str(HataSay,A);
      Writeln(HataF,A+' .HATA');
   end;
   Writeln(HataF,S);
end;
Function Deleted(Var X ):Boolean;
Var M : Word;
begin
   Move(X,M,2);
   Deleted:=(M=$FFFF)
end;
procedure AraVer;
begin
  HataYaz('---------------------------------------------------------',False);
end;
procedure SonVer;
begin
  HataYaz('=========================================================',False);
end;
Procedure YYDrsUygun;
Var I,J : Integer;
    Junk :Boolean;

function Ok1(I : Integer):Boolean;
Var A : String;
begin
 Ok1:=False;
 if not ReadYYDrs(I) then begin
   Str(I,A);
   HataYaz(A+' YARIYIL ADRESI SINIR DISI',true);
   junk:=False;AraVer
 end else if not Deleted(YYDrs) then Ok1:=True;
end;
function Ok2(I : Integer):Boolean;
Var A, B : String;
begin
  Ok2:=true;
  Str(I,B); Str(YYDrs.DrsAdr,A);
  if not ReadDrs(YYDrs.DrsAdr) then begin
     HataYaz(B+' = '+ YYDrsGetIs+' DRSADR = '+A+' SINIR DISI',True);
     Junk:=False; Ok2:=False;AraVer
  end else if Deleted(Drs) then begin
     HataYaz(B+' = '+ YYDrsGetIs+' DRSADR = '+A+' DERS CIKILMIS '+Drs.Ad,True);
     Junk:=False; Ok2:=False;AraVer
  end;
end;

Procedure Ok3(I : Integer);
Var A : String;
begin
  if not YYDrsKodOK  then begin
       HataYaz(YYDrsGetIs+' '+DrsGetIs+' '+Drs.Ad+' KODLAR TUTMUYOR',True);
       Junk:=False;AraVer
  end;
end;
begin
    Junk:=True;
    for J:=1 to 3 do begin
        YilDegis(J);
        HataYaz(YYDrsFName(ActY)+' DOSYASI INCELENIYOR',False);
        For I:=1 to HeadYYDrs.FirstFree-1 do
           if Ok1(I) then  begin
                 Inc(YYDSay[J, YYDrs.DrsAdr]);
                 if Ok2(I) then Ok3(I);
           end;
        If junk then HataYaz('    ' + YYDrsFName(ActY)+' KUSUR BULUNAMADI',False);
        SonVer;
    end;
end;

procedure OgrDrsUygun;
Var I,J, K, L : Integer;
    Junk :Boolean;

function Ok1(I : Integer):Boolean;
Var A, B : String;
begin
 Ok1:=False;
 if not ReadOgr(I) then begin
   HataYaz(A+'OGRENCI ADRESI SINIR DISI',True);
   junk:=False; AraVer
 end else if not Deleted(Ogr) then Ok1:=True;

end;
procedure Ok2(I, M, N : Integer);
Var A, B, C, D : String;
begin

  if not ReadDrs(Ogr.AnaKay[M,N].DrsPtr) then begin
     Str(I,A); Str(M,B); Str(N, C); Str(Ogr.AnaKay[M,N].DrsPtr,D);
     HataYaz(A +' = '+OgrGetIs+ ' ['+B+','+C+'].DONEM='+ DonemAd(M)+' DRSPTR='+D+' SINIR DISI',True);
     Junk:=False; AraVer;
  end else
     if Deleted(drs) then begin
        Str(I,A); Str(M,B); Str(N, C); Str(Ogr.AnaKay[M,N].DrsPtr,D);
        HataYaz(A +' = '+OgrGetIs+ ' ['+B+','+C+'].DONEM='+ DonemAd(M)+' DRSPTR='+D+' CIKMIS',True);
        Junk:=False; AraVer;
     end;
end;
procedure Ok3(I : Integer);
Var A : String; M, N : Integer;
begin
     For M:=1 to ogr.YYCount do
        For N:=1 to Ogr.Donem[M].CNT do begin
           Inc(AlanOgrSay[Ogr.AnaKay[M,N].DrsPtr]);
           OK2(I,M,N);
        end;
end;
begin
    for J:=1 to BolSay do begin
        BolDegis(J);

        Junk:=True;
        HataYaz(Bolum[ActBol].Kod+' DOSYASI KUTUKLER INCELENIYOR',False);
        For I:=1 to HeadOgr.FirstFree-1 do
           if Ok1(I) then Ok3(I);
        if junk then HataYaz('      KUTUKTE KUSUR BULUNAMADI', False);
        SonVer;

    end;
end;
Procedure OgrKayUygun(YariYil : Integer);
Var I,J, K, L : Integer;
    Junk :Boolean;
function Ok1(I : Integer):Boolean;
Var A, B : String;
begin
 Ok1:=False;
 if not ReadOgr(I) then begin
   HataYaz(A+'OGRENCI ADRESI SINIR DISI',True);
   junk:=False; AraVer
 end
 else
 if not Deleted(Ogr) then Ok1:=True;
end;
procedure Ok2(I, N : Integer);
Var A, B, C, D, E, F, S : String;
begin
  Str(I,A); Str(YariYil,B); Str(N, C); Str(Ogr.YYKay[YariYil,N],D);

  if not ReadYYDrs(Ogr.YYKay[YariYil,N]) then begin
     HataYaz(A +' = '+OgrGetIs+ ' ['+B+','+C+'].DONEM YYDRSADR='+D+' SINIR DISI',True);
     Junk:=False; AraVer
  end else
    If Ogr.Ders[YariYil,N].DrsPtr<>YYDrs.DrsAdr then begin

        {Ogr.Ders[YariYil,N].DrsPtr:=YYDrs.DrsAdr;
        WriteOgr(I);
        exit; }

        Str(YYDrs.DrsAdr,E); Str(Ogr.Ders[YariYil,N].DrsPtr,F);
        HataYaz(A +' = '+OgrGetIs+ ' ['+B+','+C+'].DONEM YYDRSPTR='+E+' DRSPTR='+F+' AYNI DEGIL',True);
        ReadDrs(Ogr.Ders[YariYil,N].DrsPtr);
        HataYaz('YYDRS = '+YYDrsGetIs+' DERS = '+ DrsGetIs+' '+Drs.Ad,False);
        Junk:=False; AraVer;
    end;
end;
procedure Ok3(I : Integer);
Var A : String; M, N : Integer;
begin
        For N:=1 to Ogr.Kac[YariYil] do begin
            Inc(AlanOgrSay[Ogr.Ders[YariYil,N].DrsPtr]);
            Ok2(I,N);
        end;
end;
begin
    YilDegis(YariYil);
    for J:=1 to BolSay do begin
        BolDegis(J);
        Junk:=True;
        HataYaz(Bolum[ActBol].Ad+' '+YilStr(YarYil[YariYil].Yil, YarYil[YariYil].YY)+ ' YARIYIL KAYITLAR INCELENIYOR',False);
        For I:=1 to HeadOgr.FirstFree-1 do
            if Ok1(I) then Ok3(I);
        if junk then HataYaz('      YARIYIL KAYITLARDA KUSUR BULUNAMADI', False);
        SonVer;
    end;
end;
procedure yenidrs;
Var I : Integer; F : File;
    begin
      Assign(F,'DRS.BAK');
      ReWrite(F,1);
      BlockWrite(F,HeadDrs, SizeOf(HeadRec),ResDrs);
      for I:=1 to HeadDrs.FirstFree-1 do begin
          ReadDrs(I);
          BlockWrite(F, Drs, SizeOf(DrsRec), ResDrs);
      end;
      close(F);
end;
Procedure DersSifir1;
Var I : Integer;
begin
    For I:=1 to HeadDrs.FirstFree-1 do begin
        ReadDrs(I);
        Drs.AlanOgrSay:=0;
        FillChar(Drs.YYDSay,SizeOf(drs.YYDSay),#0);
        WriteDrs(I);
    end;
end;
Procedure DersDolDur;
Var I, J : Integer;
begin
    For I:=1 to HeadDrs.FirstFree-1 do begin
        ReadDrs(I);
        Drs.AlanOgrSay:=AlanOgrSay[I];
        For J:=1 to 3 do Drs.YYDSay[J]:=YYDSay[J,I];
        WriteDrs(I);
    end;
end;

begin
    Basla;
    {DersSifir1;}
    YYDrsUygun;
    OgrDrsUygun;
    OgrKayUygun(1);
    OgrKayUygun(2);
    OgrKayUygun(3);
    {DersDoldur;}
    Bitir
end.


Procedure DersSifirla;
Var I : Integer;
begin
    For I:=1 to HeadDrs.FirstFree-1 do
        ReadDrs(I);
        if Not KullanilanDers[I] then begin
           Drs.AlanOgrSay:=0;
	   fillChar(drs.YYDSay,SizeOf(drs.YYDSay),#0);
           WriteDrs(I);
        end;
end;