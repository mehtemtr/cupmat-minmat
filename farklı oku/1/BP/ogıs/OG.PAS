  uses Objects, Str, Nsr, crt;
CONST
  MaxKeyLen     =  8;
  MaxAdLen      = 25;
type
   PAdIs = ^TAdIs;
   TAdIs = Object(TObject)
         Ad   : PChar;
         KeyL : Byte;
         Data : Record end;
         Constructor Init(KL : Byte);
         Constructor Load(Var S : Stream);
         Procedure   Store(Var S: Stream);
         Destructor  Done; Virtual;
         Procedure   ReadAd( X,Y    : Byte; Var TC : Char);
         Function    GetAd : String;
         Procedure   SetAd( S: String);
         Function    GetIs : String;
         Procedure   SetIs( S: String);
         Procedure   ZeroKay;
   end;
   PDrs = ^Tdrs;
   TDrs  = object(TAdIs)
	  Is         : Array[0..5] of Char;
	  Saat       : Byte;
	  Kredi      : Real;
	  AlanOgrSay : Word;
	  Constructor  Init;
          Constructor  Load(Var S : Stream);
          Procedure    Store(Var S : Steam);
          Procedure    ShowIsAd;
	  Procedure    Giris;
	  Procedure    Cikis;
     end;
Constructor TDrs.Init;
begin
   TAdIs.Init(6);
   TAdIs.ZeroKay;
end;
Constructor Tdrs.Load;
begin
   TAdIs.Load(S);
   S.Read(Saat, SizeOf(Byte)+SizeOf(Real)+SizeOf(Word));
end;
Constructor Tdrs.Store;
begin
   TAdIs.Store(S);
   S.Write(Saat, SizeOf(Byte)+SizeOf(Real)+SizeOf(Word));
end;
Procedure TDrs.ShowIsAd;
Var S:String;
begin
   ClearForm;
   ShowStatus(GetIs);
   WriteStr(1,1,GetIs, GirisColor);
   WriteStr(1,2,GetAd, GirisColor);
   S:=IntToStr(Saat,4);
   WriteStr(1,3,S, GirisColor);
   S:= RealToStr(Kredi,5,2);
   WriteStr(1,4,S, GirisColor);
end;
Procedure TDrs.Giris;
Var TC     : Char;
    Yer1, Yer2, M, L , Adres, K   : Word;
    NewS, OldS, S      : String;
    Junk,B : Boolean;
Procedure  ReadSaat;
Var S:String;
Begin
   If TC<>NULL then Exit;
   S:=IntToStr(Saat,4);
   InputStr(S, 1, 3, 4, True, ['0'..'9'], 0, TC);
   If TC<>NULL then exit;
   Saat:=StrToInt(S);
   ShowIsAd;
end;
Procedure   ReadKredi;
Var S:String;
Begin
   If TC<>NULL then Exit;
   S:=RealToStr(Kredi,5,2);
   InputStr(S, 1, 4, 5, True, ['.','0'..'9'], 0, TC);
   If TC<>NULL then exit;
   Kredi:=StrToReal(S);
   ShowIsAd;
end;
begin
  OpenForm('DERS G˜R˜ž˜ VE DE¦˜ž˜KL˜¦˜',
		 '6@DERS KOD@25@DERS˜N ADI@4@SAAT@5@KRED˜',
		 'F9:KOD DE¦˜ž@F10:SAB˜T@INS:G˜R˜ž@ESC:VAZGE€',
		 [F9,F10,INSKEY,ESC],[],9);

  ShowCursor;
  ClearForm;
  ZeroKay;
  Repeat
       TC:=ReadKod( 1,1,TRUE,3);
       ShowIsAd;
       ReadAd( 1,2, TC);
       ReadSaat;
       ReadKredi;
       DoEvent(EventKey);
       Case TC of
	   INSKEY : begin
                       GirisYap;
                       ZeroKay;
                       Ad:=''
                    end;
	   ESC    :begin
		     CloseEdit;
		     Exit;
		   end;
         end;
  until false;
end;


Constructor TAdIs.Init;
begin
   Ad:=Nil;
   KeyL:=KL;
end;
Constructor TAdIs.Load;
Var T : String;
begin
    Ad:=Nil;
    S.Read(T,MaxAdLen+1);
    SetAd(T);
    S.Read(KeyL, 1);
    S.Read(Data, KeyL);
end;
Procedure TAdIs.Store;
Var T : String;
begin
   T :=GetAd;
   S.Write(T, MaxAdLen+1);
   S.Write(KeyL, KeyL+1);
end;

Function  TAdIs.GetAd : String;
Var T : String;
begin
  FillChar(T, MaxAdLen+1, ' ');
  T:=GetStr(Ad);
  T[0]:=Char(MaxAdLen);
  GetAd:=T;
end;
Procedure  TAdIs.SetAd(S : String);
begin
  Ad:=PutStr(S, Ad);
end;

Procedure   TAdIs.ReadAd( X,Y    : Byte; Var TC : Char);
Var S:String;
Begin
   If TC<>NULL then Exit;
   S:=GetAd;
   InputStr(S, X, Y, MaxAdLen, False, AllKar, 0, TC);
   SetAd(S);
   If TC<>NULL then exit;
end;
Destructor TAdIs.Done;
begin
   If Ad<>Nil then FreeMem(Ad, StrLen(Ad)+1);
end;

Function  TAdIs.GetIs : String;
Var T : String;
begin
  Move(KeyL,T, KeyL+1);
  GetIs:=T;
end;
Procedure  TAdIs.SetIs(S : String);
Var T : String;
begin
  T:=Spaces(MaxKeyLen-Length(S));
  T:=Copy(T,Length(T)-KeyL+1, KeyL);
  Move(T, KeyL, KeyL+1);
end;
Procedure TAdIs.ZeroKay;
Type
   PImage = ^Image;
   Image = record
       Link : Word;
       AA   : PChar;
       Data : Array[0..MaxKeyLen] of Char;
   end;
Var P : Pointer;
begin
 P:=@Self;
 FillChar(PImage(P)^.Data[KeyL+1], SizeOf(Self) - SizeOf(TObject)-SizeOf(Pchar)-KeyL-1, 0);
end;
Var P : PAdIs;
    S : BufStream;
    TC : Char;
    A : String;
begin
   P:=New(PAdIs,Init(6));
   ClrScr;
   TC:=NULL;
   P^.ReadAd(10,10,TC);
   S.Init('DENE.Dat',SCreate,1024);
   P^.Store(S);
   S.Done;
   DisPose(P, Done);
   S.Init('DENE.Dat',SOpen,1024);
   P:=New(PAdIs, Load(S));
   S.Done;
   A:=P^.GetAd;
   DisPose(P, Done);
end.


   OgrRec  = object(TObject)
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
	  CurDon,
	  CurYil,
	  CurYY,
	  CurCnt,
	  EdDrs,
	  EdKolon      : Word;
	  TopSaat      : Word;
	  TopKredi     : Real;
	  KayitKontrol : Boolean;
          Constructor Init;
          Procedure   ZeroKay;Virtual;
          Procedure   ShowIsAd;Virtual;
	  Procedure   Giris;
          Procedure   Cikis;
          procedure   BolumSec;
          Procedure   YeniYil(Y : Word; Z:Byte);
	  Procedure   Open;
          Procedure   ReadNdx;
          Procedure   WriteNdx;
	  Procedure   EditKut;
	  Procedure   KutIsle;
          Function    SearchDonem(Y : word; Z:Byte; Var Yer : Word):Boolean;
          Function    GetOgr:Char;
          Function    YeniDonem:Boolean;
          Procedure   FindTopSaatKredi;
          Function    KayitHata(PrBas : Boolean):Boolean;
          Procedure   EditYY;
          Procedure   KayKont;
	  Function    GradeOk(CD : Word; D : AnaRec):Boolean;
	  Function    GPA:Real;
	  Function    YYGPA(D:Word):Real;
	  Function    DogumTarih:String;
	  Procedure   GetSoyName(Var S, N : String);
	  Function    SearchSoy(S : String; Var Yer, Adres : Word) : Boolean;
	  Procedure   SoyIndis;
          Procedure   OrtIndis;
     end;
     UyeRec  = object(TObject)
	  Is         : Array[0..UyeKeyL-1] of Char;
	  Ad         : AdStr;
	  UnvKd      : Byte;
          YYDSay     : Array[Guz..Bah] Of Byte;
	  Stopper    : Byte;
	  Constructor Init;
          Function    SingleLine(Yer : Word) : String; Virtual;
          Procedure   ZeroKay;Virtual;
          Procedure   ShowIsAd;Virtual;
	  Procedure   Giris;
          Procedure   Cikis;
	  Procedure   Open;
          Procedure   ReadNdx;
          Procedure   WriteNdx;
     end;

     YYDrsRec  = object(Index)
	  Is         : Array[0..YYDrsKeyL-1] of Char;
	  DrsAdr     : Word;
	  UyeAdr     : Word;
	  Mevcut     : Array[1..3] of Word;
	  ListLink   : Word;
          ButLink    : Word;
          TekLink    : Word;
	  Stopper    : Byte;
          Constructor Init;
          Function    SingleLine(Yer : Word) : String; Virtual;
          Procedure   ZeroKay;Virtual;
          Procedure   ShowIsAd;Virtual;
	  Procedure   Giris;
          Procedure   Cikis;
          Procedure   YilSec;
          Procedure   YeniYil(Y:Word;Z:Byte);
	  Function    GetIsExpand:String;
	  Procedure   PutIs(S : String);
          Function    ReadKD(X,Y : Byte; FromActBol:Boolean):Char;
	  Procedure   Open;
          Function    GetDrs:Char;
          Procedure   ReadNdx;
          Procedure   WriteNdx;
          Procedure   IndisInit(Bol : Byte; Butunleme : Byte);
     end;
     DonemObj   = object(Cursor)
       Constructor Init;
       Procedure  ShowLine(Yer:Word; Attr:Byte);virtual;
       Function   DonemSec:Word;
    end;


procedure DrsRec.open;
begin
  DFile.OpenFile('DRS.DAT');
end;
Procedure DrsRec.ReadNdx;
begin
   if not ReadIndex('DRS.NDX') then
       complain('DERS ˜NDEKS DOSYASI OKUNAMADI');
end;
Procedure DrsRec.WriteNdx;
begin
   if not WriteIndex('DRS.NDX') then
       complain('DERS ˜NDEKS DOSYASI YAZILAMADI');
end;



