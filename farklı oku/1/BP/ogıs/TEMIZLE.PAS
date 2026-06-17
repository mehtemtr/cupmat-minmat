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

procedure YYdrsSil;
Var XY : Array[1..MaxYYDrs] of Boolean;
    X:Word;
    Bol, YY : Byte;
    I,J,N : integer;

begin
    For YY:=1 to 3 do begin
        YilDegis(YY);
        FillChar(XY, SizeOf(XY),#0);
        for Bol:=1 to BolSay do begin
            BolDegis(Bol);
            For I:=1 to HeadOgr.FirstFree-1 do begin
                if not Deleted(Ogr) then
                    for N:=1 to Ogr.Kac[YY] do
                        XY[Ogr.YYKay[YY,N]]:=True;
            end;
        end;
        For I:=1 to HeadYYDrs.FirstFree-1 do
            if ReadYYDrs(I) and not XY[I] then begin
               X:=$FFFF;
               Move(X, YYDrs.Is, SizeOf(X));
               FillChar(YYDrs.Mevcut, 6*SizeOf(Word) ,#0);
               WriteYYDrs(I);
            end;
    end;
end;

begin
    Basla;
    YYDrsSil;
    Bitir
end.
