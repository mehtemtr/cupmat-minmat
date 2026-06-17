unit UOg;
interface
  uses BLUNGR, UIndex, Nsr, Crt, GenUtil, DFile, Exist;
CONST

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
   MaxYYDrs     =  511;




  MaxDonemDrs = 16;
  MaxDonem    = 20;

type
  KeyStr       = String[MaxKeyLen];
  AdStr        = String[MaxAdLen];
  Str2         = string[2];

  IndisPtr     = ^IndisArr;
  IndisArr     = Array[0..MaxKey] Of Word;
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
   OgrRec  = object(Index)
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
          Procedure   EditYY;
	  Function    GradeOk(CD : Word; D : AnaRec):Boolean;
	  Function    GPA:Real;
	  Function    YYGPA(D:Word):Real;
	  Function    DogumTarih:String;
	  Procedure   GetSoyName(Var S, N : String);
	  Function    SearchSoy(S : String; Var Yer, Adres : Word) : Boolean;
	  Procedure   SoyIndis;
          Procedure   OrtIndis;
     end;
     UyeRec  = object(Index)
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
     DrsRec  = object(Index)
	  Is         : Array[0..DrsKeyL-1] of Char;
	  Ad         : AdStr;
	  Saat       : Byte;
	  Kredi      : Real;
	  AlanOgrSay : LongInt;
	  YYDSay     : Array[Guz..Yaz] Of Byte;
	  Stopper    : Byte;
	  Constructor Init;
          Destructor  Done; Virtual;
          Procedure   ZeroKay;Virtual;
          Procedure   ShowIsAd;Virtual;
	  Procedure   Giris;
	  Procedure   Cikis;
	  Procedure   AlanOgrDegis(X : Word; Arttir : Boolean);
	  Procedure   ReadAlOgSay;
	  Procedure   WriteAlOgSay;
	  Procedure   Open;
          Procedure   ReadNdx;
          Procedure   WriteNdx;
          Procedure   KredSaatToMem;
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


    

Var
    Ogr           : OgrRec;
    Drs           : DrsRec;
    XKred         : ^KredArr;
    XSaat         : ^SaatArr;
    YYDrs         : YYDrsRec;
    Uye           : UyeRec;
    Don           : DonemObj;
    Univ, Fakulte : String;
    SaveKac       : Byte;
    SaveKay       : DonemDers;
    SaveAct       : AnaRecType;
    AlOgSay       : Array[1..MaxOgr] of LongInt;
    KrediHesapla  : Boolean;
    YYListStat:Array[Guz..Yaz,1..MaxBolum] of Boolean;
    BTListStat:Array[Guz..Yaz,1..MaxBolum] of Boolean;
    TTListStat:Array[Guz..Yaz,1..MaxBolum] of Boolean;

    procedure ClearForm;
    Procedure ShowBolYil;
    Procedure YeniYil;
    Procedure WriteListStat;
    Procedure ReadListStat;
    Procedure SetAllStatFalse;
    Function  YeniDonemGir(Var Y:Word; Var Z : Byte; Title : String):Boolean;
{------------------------------------------------------------}
implementation
Procedure SetAllStatFalse;
begin
  FIllChar(YYListStat,SizeOf(YYListStat), #0);
  FIllChar(BTListStat,SizeOf(BTListStat), #0);
  FIllChar(TTListStat,SizeOf(TTListStat), #0);
end;
Procedure ShowBolYil;
Var S , T : String;
    L, M : Byte;
begin
    SaveWinInfo;NormalWindow;
    WriteChar(1,2,80,#205,TextAttr);
    S:=Fakulte; If Length(S)> 27 then S:=Copy(S,1,27);
    L:=Length(S); While S[L]=' ' do Dec(L);
    WriteStr(2,2,' ' + Copy(S,1,L)+ ' ', HiLiteAttr);
    M:=L+6;
    With Bolum do begin
      S:= KodAd(ActBol);
      T:= YilStr(ActYil, ActYY);
    end;
    If Length(S)> 27 then S:=Copy(S,1,27);
    L:=Length(S); While S[L]=' ' do Dec(L);
    WriteStr(M,2,' ' + Copy(S,1,L)+ ' ', HiLiteAttr);
    WriteStr(65,2,' ' + T+ ' ', HiLiteAttr);
    RestoreWinInfo;
end;


Constructor OgrRec.Init;
Var X : word;
begin
    Index.Init(MaxOgr, OgrKeyL, Ofs(CurDon)-Ofs(Is));
    Sabit:='';
    SetRecNil;
    Cins:='E';
    NdxAdr:=1;
    FileAdr:=1;
    HazBasYil:=0;
    HazNot:=106;
    ReadNdx;
    KayitKontRol:=True;
    DogumYer :=Spaces(SizeOf(DogumYerStr));
    DogumGun := 01;
    DogumAy  := 01;
    DogumYil := 1900;
end;
Function OgrRec.DogumTarih:String;
begin
  DogumTarih:=IntToStr(DogumGun+0,2)+'/'+IntToStr(DogumAy+0,2)+'/'+IntToStr(DogumYil,4);
end;
Procedure   OgrRec.GetSoyName(Var S, N : String);
Var T, A : String; I : Byte;
begin
    T:=Ad; Strip(T); N:=T;
    While ParseWord(T, A, ' ') do S:=A;
    T:=Ad;
    I:=Pos(S,N);
    N:=Copy(N,1,I-1);
end;
Function  OgrRec.SearchSoy(S : String; Var Yer, Adres : Word) : Boolean;
Var L, M : Word;
    A, B : String;
    U    : Boolean;
begin
    SearchSoy:=False;
    Adres:=0;
    Yer:=1;
    If Length(S)>MaxAdLen then S[0]:=Chr(MaxAdLen);
    L:=1; Yer:=IndisSay+1;
    While Yer>L do begin
      M:=(Yer+L) div 2;
      DFile.GetRec(Indis[M],Is);
      GetSoyName(A,B);
      If Encode(A)>=Encode(S) then Yer:=M else L:=M+1;
    end;
    If Yer<=IndisSay then begin
       DFile.GetRec(Indis[Yer],Is);
       GetSoyName(A,B);
       U:=(A=S);
       If U then Adres:=Indis[Yer];
       SearchSoy:=U;
    end;
end;
Procedure  OgrRec.SoyIndis;
Var I, Yer, Adres : Word; B:Boolean; S,T:String;
begin
   IndisSay :=0;
   For I:=1 to Say do begin
      DFile.GetRec(GetAdr(I), Is);
      S:=Ad; GetSoyName(S,T);
      B:=SearchSoy(S, Yer, Adres);
      Adres:=GetAdr(I);
      InsRec(Indis, Adres,Yer, IndisSay, 2);
   end;
end;

Procedure OgrRec.OrtIndis;
Type
    GpaArrType= Array[1..MaxOgr] of Real;

Var
   GpaArr    : ^GpaArrType;
   R : Real;
   Gap, I, J, Adres, L , M: Integer;
begin
   IndisSay :=0;
   GetMem(GpaArr, SizeOf(GpaArrType));
   For I:=1 to Say do begin
      Adres:=GetAdr(I);
      DFile.GetRec(Adres, Is);
      R:=GPA;
      If R<>0 then begin
        Inc(IndisSay);
        GpaArr^[IndisSay]:=R;
        Indis[IndisSay] :=Adres;
      end;
   end;
   Gap:=IndisSay div 2;
   While Gap>0 do begin
      For I:=Succ(Gap) to IndisSay do begin
	   J:=I-Gap;
	   While J > 0 do begin
		   L:=J+Gap;
		   If GpaArr^[J]<=GpaArr^[L] then
		      J:=0
		   else begin
		      R:=GpaArr^[J];
		      GpaArr^[J]:=GpaArr^[L];
		      GpaArr^[L]:=R;
		      M:=Indis[J];
		      Indis[J]:=Indis[L];
		      Indis[L]:=M;
		   end;
		   J:=J-Gap
	   end;
      end;
      Gap:= Gap div 2;
    end;
   FreeMem(GpaArr, SizeOf(GpaArrType));
   Reverse(Indis, 2, 1, IndisSay);
end;
Procedure OgrRec.ZeroKay;
begin
    FillChar(Kac, Ofs(CurDon)-Ofs(Kac),#0);
    CurDon:=1;
    CurYil:=ActYil;
    CurYY:=1;
    CurCnt:=0;
    EdDrs:=1;
    EdKolon:=1;
    TopSaat:=0;
    TopKredi:=0.0;
    KayitKontrol:=True;
end;
Procedure   OgrRec.Open;
begin
  if Bolum.NuKod<>0 then begin
      DFile.OpenFile(Bolum.Kod(ActBol)+'OGR.DAT');
 end;
end;
Procedure OgrRec.ReadNdx;
begin
   If Bolum.NuKod<>0 then
      If Not ReadIndex(Bolum.Kod(ActBol)+'OGR.NDX') then
         complain('™¦RENC˜ ˜NDEKS DOSYASI OKUNAMADI');
end;

Procedure OgrRec.WriteNdx;
begin
   If Bolum.NuKod<>0 then
      If Not WriteIndex(Bolum.Kod(ActBol)+'OGR.NDX') then
         complain('™¦RENC˜ ˜NDEKS DOSYASI YAZILAMADI');
end;
Procedure   OgrRec.ShowIsAd;
Var  S:String;

begin
   ClearForm;
   ShowStatus(GetIs);
   WriteStr(1,1,Getis, GirisColor);
   WriteStr(1,2,GetAd, GirisColor);
   S:=Cins;
   WriteStr(1,3,S, GirisColor);
   S:=DogumYer;
   WriteStr(1,4,S, GirisColor);
   WriteStr(1,5,DogumTarih, GirisColor);
   S:= GRAD.KOD(HazNot);
   WriteStr(1,6,S, GirisColor);
   S:=IntToStr(HazBasYil,4);
   WriteStr(1,7,S, GirisColor);
end;
Procedure OgrRec.Giris;
Var TC     : Char;
    Yer1, Yer2, M, L   : Word;
    NewS, OldS, S      : String;
    junk,B:boolean;

Procedure ReadCins;
Var S:String;
Begin
   If TC<>NULL then Exit;
   S:=Cins;
   InputStr(S, 1, 3, 1, True, ['E','K'], 0, TC);
   If TC<>NULL then exit;
   Cins:=S[1];
   ShowIsAD;
   If Search(GetIs, NdxAdr, FileAdr) then dfILE.PutRec(FileAdr, Is);
end;
Procedure ReadDogumYeri;
Var S : String;
begin
   If TC<>NULL then Exit;
   S:=DogumYer;
   InputStr(S, 1, 4, SizeOf(DogumYerStr), False, AllKar, 0, TC);
   If TC<>NULL then exit;
   DogumYer:=Copy(S+Spaces(SizeOf(DogumYerStr)),1,SizeOf(DogumYerStr));
   ShowIsAD;
   If Search(GetIs, NdxAdr, FileAdr) then dfILE.PutRec(FileAdr, Is);
end;
Procedure ReadDogumTarih;
Var Tarih : String;
begin
   If TC<>NULL then Exit;
   Tarih:=DogumTarih;
   GetTarih(1,5,Tarih,TC);
   If TC<>NULL then exit;
   DogumGun:=StrToInt(Copy(Tarih,1,2));
   DogumAy :=StrToInt(Copy(Tarih,4,2));
   DogumYil:=StrToInt(Copy(Tarih,7,4));
   ShowIsAD;
   If Search(GetIs, NdxAdr, FileAdr) then dfILE.PutRec(FileAdr, Is);
end;

Procedure   ReadHazNot;
Var S   : String;
    Yer : Word;
Begin
   If TC<>NULL then Exit;
   S:=GRAD.Kod(HazNot);
   InputStr(S, 1, 6, 2, True, AllKar, 2, TC);
   If TC<>NULL then exit;
   If not GRAD.Search(S, Yer) then
      complain('B™YLE B˜R NOT YOK')
   else
      HazNot:=Yer;
   ShowIsAD;
   If Search(GetIs, NdxAdr, FileAdr) then DFile.PutRec(FileAdr, Is);
end;

Procedure ReadHazBasYil;
Var S   : String;
    Yer : Word;
Begin
   If TC<>NULL then Exit;
   S:=IntToStr(HazBasYil,4);
   InputStr(S, 1, 7, 4, True, ['0'..'9'], 4, TC);
   If TC<>NULL then exit;
   HazBasYil:=StrToInt(S);
   ShowIsAD;
   If Search(GetIs, NdxAdr, FileAdr) then DFile.PutRec(FileAdr, Is);
end;
begin
  If Bolum.NuKod = 0 then begin complain('HENšZ B˜R B™LšM YOK'); exit end;
  OpenForm('™¦RENC˜ G˜R˜ž˜ VE DE¦˜ž˜KL˜¦˜',
		 '8@™GR. NO@25@™GRENC˜N˜N ADI, SOYADI@1@C˜NS@15@DO¦UM YER˜@10@DO¦UM TAR˜H˜@2@HAZIRILIK NOT@4@HAZIRLIK BAžARI YILI',
		 'F9:KOD DE¦˜ž@F10:SAB˜T@INS:G˜R˜ž@ESC:VAZGE€',
		 [F9,F10,INSKEY, ESC],
		 [CmdBolumSec, CmdBolumGir],5);
  ShowCursor;
  ClearForm;
  ZeroKay;
  Repeat
       TC:=ReadKod(Form.FieldKol[1],1,True, 0);
       ShowIsAd;
       ReadAd(Form.FieldKol[1],2, TC);
       ReadCins;
       ReadDogumYeri;
       ReadDogumTarih;
       ReadHazNot;
       ReadHazBasYil;
       DoEvent(EventKey);
       Case TC of
	INSKEY : begin
		   GirisYap;ZeroKay; Ad:=''; HazBasYil:=0;DogumYer:=''
		 end;
        ESC    : Begin WriteNdx;
	    	       CloseEdit;
		       Exit;
		   end;
         F9    : If GetNewKod('™GR. KOD DE¦˜ž',OldS, NewS) then begin
                    junk:=ChangeKod(OldS, NewS);
		    ClearForm;Ad:='';
		 end
	      else complain('KOD DE¦˜ž˜KL˜¦˜ ˜MKANSIZ');
       end;
  until false;
end;

Constructor DrsRec.Init;
Var X : word;
begin
    Index.Init(MaxDrs, DrsKeyL,Ofs(Stopper)-Ofs(Is));
    GetMem(XKred, Sizeof(KredArr));
    GetMem(XSaat, SizeOf(SaatArr));
    FillChar(XKred^,SizeOf(KredArr),#0);
    FillChar(XSaat^,SizeOf(SaatArr),#0);
    Sabit:=''; SetRecNil;
    FillChar(YYDSay,SizeOf(YYDSay),#0);
    Saat:=0;
    Kredi:=0.0;
    AlanOgrSay:=0;
    NdxAdr:=1; FileAdr:=1;
    ReadNdx;
end;
Destructor DrsRec.Done;
begin
    FreeMem(XSaat, SizeOf(SaatArr));
    FreeMem(XKred, Sizeof(KredArr));
    Index.Done;
end;
Procedure DrsRec.ZeroKay;
begin
   FillChar(Saat, Ofs(Stopper)-Ofs(Saat),#0)
end;
Procedure   DrsRec.AlanOgrDegis(X : Word; Arttir : Boolean);
Var T : DrsRec;
begin
  DFile.GetRec(X, T.Is);
  If Arttir then Inc(AlanOgrSay) else Dec(AlanOgrSay);
  DFile.PutRec(X, T.Is)
end;
Procedure  DrsRec.ReadAlOgSay;
Var I, J :Word;
    T : DrsRec;
begin
  FillChar(AlOgSay, SizeOf(AlOgSay), #0);
   For I:=1 to Say do begin
      J:=GetAdr(I);
      DFile.GetRec(J, T.Is);;
      AlOgSay[J]:=AlanOgrSay;
   end;
end;
Procedure  DrsRec.WriteAlOgSay;
Var I, J :Word;
    T : DrsRec;
begin
   For I:=1 to Say do begin
      J:=GetAdr(I);
      DFile.GetRec(J, T.Is);
      AlanOgrSay:=AlOgSay[J];
      DFile.PutRec(J, T.Is);
   end;
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

Procedure DrsRec.KredSaatToMem;
Var I,J : Word;
Begin
     For I:=1 to Say do begin
         J:=GetAdr(I);
         DFile.GetRec(J,Is);
         XKred^[J]:=Kredi;
         XSaat^[J]:=Saat;
     end;
 end;

Procedure DrsRec.ShowIsAd;
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
Procedure DrsRec.Giris;
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
   If Search(GetIs,NdxAdr, FileAdr) then begin
         DFile.PutRec(FileAdr, Is);
         XSaat^[FileAdr]:=Saat;
   end;
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
   If Search(GetIs,NdxAdr, FileAdr) then begin
        DFile.PutRec(FileAdr, Is);
        XKred^[FileAdr]:=Saat;
   end;
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
                       If Search(GetIs, NdxAdr, FileAdr) then begin
                          XSaat^[FileAdr]:=Saat;
                          XKred^[FileAdr]:=Kredi;
                       end;
                       ZeroKay;
                       Ad:=''
                    end;
	   ESC    :begin
		     WriteNdx;
		     CloseEdit;
		     Exit;
		   end;
            F9  : If GetNewKod('DRS. KOD DE¦˜ž',OldS, NewS) then begin
 		     Junk:=ChangeKod( OldS, NewS);
		     ClearForm; ZeroKay;
                     K:=AktifYYInd;
                     Repeat
                        Junk:=YYDrs.ChangeKod(OldS,NewS);
                        YYDrs.DFile.CloseFile;
                        YYDrs.WriteNdx;
                        Inc(AktifYYInd);
                        If AktifYYInd > Yaz Then AKtifYYInd:=Guz;
                        YYDrs.Open;
                        YYDrs.ReadNdx;
                     Until AktifYYInd = K;
	           end;
         end;
  until false;
end;

Constructor UyeRec.Init;
Var X : word;
begin
    Index.Init(MaxUye, UyeKeyL,Ofs(Stopper)-Ofs(Is));
    Sabit:='';FillChar(Is,UyeKeyL,' ');
    SetRecNil; UnvKd:=1;
    NdxAdr:=1; FileAdr:=1;
    ReadNdx;
end;

Function    UyeRec.SingleLine(Yer : Word) : String;
begin
   DFile.GetRec(GetAdr(Yer),Is);
   SingleLine:=GetIs+'  '+Unvan.KODAD(UnvKd)+GetAd
   end;
Procedure UyeRec.ZeroKay;
begin
  Fillchar(YYDSay, SizeOf(YYDSay),#0)
 end;

Procedure UyeRec.Open;
begin
  DFile.OpenFile('UYE.DAT');
end;
Procedure UyeRec.ReadNdx;
begin
   if not ReadIndex('UYE.NDX') then
       complain('OGR. šYE ˜NDEKS DOSYASI OKUNAMADI');
end;
Procedure UyeRec.WriteNdx;
begin
   if not WriteIndex('UYE.NDX') then
       complain('šYE ˜NDEKS DOSYASI YAZILAMADI');
end;

Procedure UyeRec.ShowIsAd;
Var S:String;
begin
   ClearForm;
   ShowStatus(GetIs);
   WriteStr(1,1,GetIs, GirisColor);
   WriteStr(1,2,GetAd, GirisColor);
   S:=Unvan.Kod(UnvKd);
   WriteStr(1,3,S, GirisColor);
   S:= Unvan.KodAd(UnvKd);
   WriteStr(1,4,S, GirisColor);
end;
Procedure UyeRec.Giris;
Var TC     : Char;
    Yer1, Yer2, M, L   : Word;
    NewS, OldS, S      : String;
    Junk:Boolean;

Procedure   ReadUnvan;
Var S:String;
    T:Word;
    Y:Word;A:Word;
Begin
   If TC<>NULL then Exit;
   If (UnvKd <=0) or (UnvKd >= Unvan.NuKod) then UnvKd:=1;
   S:=Unvan.Kod(UnvKd);
   repeat
     InputStr(S, 1, 3, 2, True, AllKar, 0, TC);
     If TC = ALT_F10 then begin
        T:=Unvan.UnvanSec;
        If T<>0 then UnvKd:=T;
        TC:=NULL; S:=Unvan.Kod(UnvKd)
     end;
     If TC<>NULL then exit;
     If Unvan.Search(S, Y) then
        UnvKd:=Y
     else
        complain('B™YLE B˜R šNVAN YOK');
   until Unvan.Search(S, Y);
   ShowIsAd;
   If Search(GetIs,NdxAdr, FileAdr) then DFile.PutRec(FileAdr, Is);
end;
begin
  OpenForm('™¦R. ELEMANI G˜R˜ž˜ VE DE¦˜ž˜KL˜¦˜',
		 '6@šYE KOD@25@™¦RET˜M ELEMANI ADI@2@šNVAN KOD@11@šNVAN',
		 'F9:KOD DE¦˜ž@F10:SAB˜T@ALT_F10:šNVAN SE€@INS:G˜R˜ž@ESC:VAZGE€',
		 [F9,F10,INSKEY,ESC, ALT_F10],
		 [CmdUnvanGir],9);

  ShowCursor;
  ClearForm;
  ZeroKay;
  Repeat
       TC:=ReadKod(1,1,True,3);
       ShowIsAd;
       ReadAd(1,2, TC);
       ReadUnvan;
       DoEvent(EventKey);
       Case TC of
	   INSKEY : begin GirisYap; ZeroKay; Ad:='' end;
	   ESC    :begin
		     WriteNdx;
		     CloseEdit;
		     Exit;
		   end;
              F9  : If GetNewKod('šYE. KOD DE¦˜ž',OldS, NewS) then begin
 		       Junk:=ChangeKod(OldS,NewS);
     		       ClearForm;Ad:='';
        	   end;
    end;
  until false;
end;



Function CharToSec(C:Char):Str2;
      Var T : Str2;
      begin
	   Str((Ord(C)-64):2,T);
	   If T[1]=' ' then T[1]:='0';
	   CharToSec:=T
      end;
Function CharToBolKod(C:Char):Str2;
   begin
      CharToBolKod:=Bolum.Kod(Ord(C)-64);
   end;

Function YYDrsRec.GetIsExpand:String;
Var S:String;
   begin
      S:=GetIs;
      S:=Copy(S,1,6)+' '+CharToBolKod(S[7])+' '+CharToSec(S[8]);
      GetIsExpand:=S;
end;

Procedure YYDrsRec.PutIs(S : String);
Var T : String; Y, Yer : Word;

   begin
      T:=Copy(S,7,2);
      Y:=StrToInt(Copy(S,9,2));
      S[0]:=Chr(6);
      if Bolum.Search(T,Yer) then S:=S+Chr(Yer+64)+Chr(Y+64);
      SetIs(S);
end;
Constructor YYDrsRec.Init;
Var X : word;
begin
    Index.Init(MaxYYDrs, YYDrsKeyL, Ofs(Stopper)-Ofs(Is));
    SetRecNil;
    Sabit:='';
    FillChar(Is,DrsKeyL,' ');
    Is[6]:=chr(ActBol+64);
    Is[7]:='A';
    NdxAdr:=1; FileAdr:=1;
    ReadNdx;
end;
Procedure YYDrsRec.ZeroKay;
begin
  FillChar(Mevcut, Ofs(Stopper)-Ofs(Mevcut),#0)
end;

procedure YYDrsRec.open;
begin
 DFile.OpenFile(GUZBAH[ActYY]+'DRS'+SeneStr+'.DAT');
end;

Procedure YYDrsRec.ReadNdx;
begin
 If Not ReadIndex(GUZBAH[ActYY]+'DRS'+SeneStr+'.NDX') then
    complain(GUZBAH[ActYY]+' '+SeneStr+' DERS ˜NDEKS DOSYASI OKUNAMADI');
end;


Procedure YYDrsRec.WriteNdx;
begin
 If Not WriteIndex(GUZBAH[ActYY]+'DRS'+SeneStr+'.NDX') then
    complain(GUZBAH[ActYY]+' '+SeneStr+' DERS ˜NDEKS DOSYASI YAZILAMADI');
end;
Function YYDrsRec.SingleLine(Yer:Word) : String;
begin
   FileAdr:=GetAdr(Yer);
   DFile.GetRec(FileAdr,Is);
   Drs.DFile.GetRec(DrsAdr,Drs.Is);
   SingleLine:=GetIsExpand+' '+Drs.GetAd;
end;

Function YYDrsRec.ReadKD(X, Y : byte; FromActBol : Boolean):Char;
Var S, T : String;
    OK    : Boolean;
    L, M  : Word;
    TC    : Char;
begin
Repeat
   Repeat
       With Drs do begin
	  S:=GetIs;
          L:=Length(Sabit);
          S:=Copy(S,L+1,KeyL-L);
          WriteStr(X,Y,Sabit,TextAttr); M:=X+Length(Sabit);
	  InputStr(S, M, Y, KeyL-L, True, AllKar, 3, TC);
          S:=Sabit+S;
	  SetIs(S); S:=GetIs;
       end;
       OK:=False;
       ReadKD:=TC;
       With Drs do Begin
       Case TC of
             F10 : GetSabit;
             NULL:  begin
                      OK:=Search(S, NdxADr, FileAdr);
                      if OK then
	                 DFile.GetRec(FileAdr, Is)
                      else
	                 Complain('BU DERS DOSYADA YOK');
                    end
             else exit
          end;
       end;
  until OK;
  ReadKD:=TC;
  If TC<>NULL then exit;
  If FromActBol then S:=S+Chr(ActBol + 64);
  OK:=SearchAndPrint(S,'HANG˜ DERS', '12@KOD@25@DERS˜N ADI',
			    NdxADr, FileADr);
       If OK then
          DFile.GetRec(FileAdr,Is)
       else
          Complain('BU DERS YARIYILDA YOK');
  Until OK;
  WriteStr(X,Y, SingleLine(NdxAdr), TextAttr);
end;
Procedure YYDrsRec.ShowIsAd;
Var S : String;
begin
  ClearForm;
  WriteStr(1,WinLastRow,Spaces(WinLastCol), NormalAttr);
  S:=GetIs;
  Drs.DFile.GetRec(DrsAdr,Drs.Is);
  WriteStr(1,1,Drs.GetIs, GirisColor);
  WriteStr(1,2,CharToBolKod(S[7]), GirisColor);
  WriteStr(1,3,CharToSec(S[8]), GirisColor);
  WriteStr(1,4,Drs.GetAd, GirisColor);
end;
Procedure YYDrsRec.Giris;
Var
     TC       : Char;
     B:boolean;
     S:String;
     OldUyeAdr : Word;
     junk      : Boolean;


Procedure ReadYYBol;
Var S: String;
    B:Boolean;
    Yer:Word;
begin
  If TC<>NULL then exit;
  repeat
     S:=CharToBolKod(Is[6]);
     InputStr(S,1,2,2,true,AllKar,0,TC);
     If TC<>NULL then exit;
     B:=Bolum.Search(S,Yer);
     If not B then
       complain('B™YLE B˜R B™LšM YOK')
     else
	Is[6]:=Chr(Yer+64);
  Until B;
  ShowIsAd;
end;

Procedure ReadYYSec;
Var S: String;
    B:Boolean;
    Sec:Word;
begin
  If TC<>NULL then exit;
  repeat
     S:=CharToSec(Is[7]);
     InputStr(S,1,3,2,true,['0'..'9'],2,TC);
     Sec:=StrToInt(S);
     If TC<>NULL then exit;
     If Sec = 0 then
	complain('GRUP SIFIRDAN FARKLI OLMALI')
     ELSE
	Is[7]:=Chr(Sec+64);
  Until Sec<>0;
  ShowIsAd;
end;
Procedure ShowUye;
begin
  With Uye do begin
    DFile.GetRec(UyeAdr,Is);
    WriteStr(1,5,GetIs,GirisColor);
    WriteStr(1,6,Unvan.KodAD(UnvKd),GirisColor);
    WriteStr(1,7,GetAd,GirisColor);
  end;
end;

Procedure ReadYYUye;
Var S         : String;
    M         : Boolean;
    OldUyeAdr : Word;

begin
   S:=GetIs;
   M:=Search(S,NdxAdr, FileAdr);
   If M then begin
       DFile.GetRec(FileAdr,Is);
       OldUyeAdr:=UyeAdr;
       ShowUye;
    end
   else OldUyeAdr:=0;
   If TC<>NULL Then Exit;
   TC:=Uye.ReadKod(1,5, False, 0);
   If TC<>NULL then exit;
   UyeAdr:=Uye.FileAdr;
   If M then begin
      With Uye do begin
         DFile.GetRec(OldUyeAdr,Is);
         Dec(YYDSay[ActYY]);
         DFile.PutRec(OldUyeAdr,Is);
         DFile.GetRec(UyeAdr,Is);
         Inc(YYDSay[ActYY]);
         DFile.PutRec(UyeAdr,Is);
       end;
       DFile.PutRec(FileAdr,Is)
   end;
   ShowUye;
end;
begin
  OpenForm('YARIYIL DERS G˜R˜ž˜ VE DE¦˜ž˜KL˜¦˜',
    '6@DERS KOD@2@ALAN B™LšM@2@GRUP@25@DERS˜N ADI@6@šYE KOD@11@šNVAN@25@™¦RET˜M ELEMANI',
    'F10:SAB˜T@INS:G˜R˜ž@ESC:VAZGE€',
    [F10, INSKEY, ESC, TAB],
     [CmdDrsGir, CmdUyeGir],5);
  ShowCursor;DrsAdr:=1; UyeAdr:=1;
  ClearForm;
  ZeroKay;
  Repeat
       TC:=Drs.ReadKod(1,1,False,3);
       S:=Drs.GetIs;
       If Drs.Search(S,Drs.NdxAdr,Drs.FileAdr) then begin
          DrsAdr:=Drs.FileAdr;
          Move(Drs.Is,Is,6);
          ShowIsAd;
       end;
       ReadYYBol;
       ReadYYSec;
       S:=GetIs;
       If TC = NULL then ShowStatus(GetIs);
       ReadYYUye;
       DoEvent(EventKey);
       Case TC of
	  ESC: WriteNdx;
       INSKEY : If not Search(S,NdxADr, FileAdr) then begin
                   GirisYap;
                   With Drs do begin
		       Dfile.GetRec(DrsAdr, Is);
		       Inc(YYDSay[ActYY]);
		       DFile.PutRec(DrsAdr,Is);
		    end;
                    With Uye do begin
                       DFile.GetRec(UyeAdr,Is);
                       Inc(YYDSay[ActYY]);
                       DFile.PutRec(UyeAdr,Is);
		    end;
		    ZeroKay;
                 end;
  end;
  Until TC=ESC;
  CloseEdit;
end;

Procedure   YYDrsRec.IndisInit(Bol : Byte; Butunleme : Byte);
Var I, L, M : Word;
    DoIt : Boolean;
Begin
   IndisSay:=0; L:=16;
   FillChar(Indis,SizeOf(Indis),#0);
   For I:=1 to Say do begin
       If KodPtr^[L]=Chr(Bol+64) then
          begin
             M:=GetAdr(I);
             DoIt:=True;
             if Butunleme in [2,3] then DFile.GetRec(M, Is);
             Case Butunleme of
               1 : DoIt:=True;
               2 : DoIt:=ButLink<>0;
               3 : DoIt:=TekLink<>0;
             end;
             if DoIt then begin
                Inc(IndisSay);
                Indis[IndisSay]:=GetAdr(I)
             end;
          end;
       L:=L+10;
   end;
end;

Function OgrRec.SearchDonem(Y : word; Z:Byte; Var Yer : Word):Boolean;
Var L, M : Word;
    S:String;
begin
  L:=1; Yer:=Succ(YYCount); S:=YilStr(Y,Z);
  SearchDonem:=False;
  while L<Yer do begin
     M:=(L+Yer) div 2;
     With Donem[M] do
       If YilStr(YL,YY)>=S then Yer:=M else L:=Succ(M);
  end;
  With Donem[Yer] do
     If Yer<=YYCount then SearchDonem:=(YilStr(YL,YY)=S);
end;
Constructor DonemObj.Init;
begin
   Cursor.Init;
end;

Function DonemObj.DonemSec:Word;
Var Sec : Word;
begin
  DonemSec:=1;
  If Ogr.YYCount = 0 then
     complain('SE€ECEK B˜R D™NEM YOK')
  else begin
     Sec:=SelectSingle('D™NEM˜ SE€˜N˜Z','13@D™NEM',1, Ogr.YYCount, SelectColor);
     If Sec = 0 then Sec:=1;
     DonemSec:=Sec;
  end;
end;


Procedure DonemObj.ShowLine(Yer:Word; Attr:Byte);
begin
   with Ogr.Donem[Yer] do
      WriteStr(Form.FieldKol[1],EDRow,YilStr(YL,YY),Attr);
end;

Function OgrRec.GetOgr:Char;
Var TC : Char;
    L : Byte;
    S : sTRING;
begin
  OpenEditWindow('™¦RENC˜Y˜ G˜R˜N˜Z',
		 '8@™GR. NO@25@™GRENC˜N˜N ADI, SOYADI',
		 'F10:SAB˜T@ESC:VAZGE€',
		 [F10,ESC],
		 [CmdBolumSec, CmdBolumGir, CmdOgrGir],8,1);
  Repeat
     TC:=ReadKod(Form.FieldKol[1],1,False,0);
     DoEvent(EventKey);
  until (TC = NULL) or (TC in Term);
  S:= GRAD.KOD(HazNot);
  S:=SingleLine(NdxAdr)+' HAZ.NOT:'+S;
  WriteStr(Form.FieldKol[1],1,S, TextAttr);
  GetOgr:=TC;
  CloseEdit;
  PrevWin;
  GotoXY(1,1);
  ClrEol;
  WriteStr(1,1,'™¦RENC˜ : '+S, TextAttr);
  RestoreWinInfo;
end;

Function YYDrsRec.GetDrs:Char;
Var TC : Char;
    S : sTRING;
begin

  OpenEditWindow('YARIYIL DERS˜N˜ G˜R˜N˜Z',
		 '12@DERS KOD@25@DERS˜N ADI',
		 'ESC:VAZGE€',[ESC],[],8,1);
  TC:=ReadKD(Form.FieldKol[1],1,True);
  S:=SingleLine(NdxAdr);
  WriteStr(Form.FieldKol[1],1,SingleLine(NdxAdr), TextAttr);
  GetDrs:=TC;
  CloseEdit;
  PrevWin;
  GotoXY(1,1);
  ClrEol;
  WriteStr(1,1,'YARIYIL DERS : '+S, TextAttr);
  RestoreWinInfo;
end;



Procedure OgrRec.EditKut;
Var TC, CH  : Char;
    GrdYer,Yer, L  : Word;
    KD:String;


Function SingleAnaLine(Yer : Word):String;
Var T, S, V : String;
    L, G    : Word;
begin
  With  AnaKay[CurDon,Yer] do begin
     L:=DrsPtr;
     G:=Grd;
  end;
  V:=GRAD.GradeLine(G);
  With Drs do
       If L > 0 then begin
          Dfile.GetRec(L,Is);
          S:=GetIs;
          T:=GetAd;
          SingleAnaLine:=YilStr(CurYil, CurYY)+' '+S+'   '+T +' '+
                 IntToStr(Saat,2)+'  '+ RealToStr(Kredi,3,1)+'   '+V;
       end else begin
          SingleAnaLine:=YilStr(CurYil, CurYY) + Spaces(WinLastCol-Form.FieldKol[2]);
  end;
end;

procedure PrintCourses;
Var I : Word;
begin
    I:=1; ClrScr;
    While I<=CurCnt do begin
       WriteStr(Form.FieldKol[1],I,SingleAnaLine(I), TextAttr);
       Inc(I)
    end;
end;
procedure DeleteDrs;
Var  V : AnaRec;
begin
  If EdDrs > CurCnt then begin
     GotoXY(1,EdDrs); ClrEol
  end
  else begin
       Drs.AlanOgrDegis(AnaKay[CurDon, EdDrs].DrsPtr, False);
       DelRec(AnaKay[CurDon], V, EdDrs, CurCnt, SizeOf(AnaRec));
       Donem[CurDon].CNT:=CurCnt;
       PrintCourses;
  end;
   If EdDrs > CurCnt then EdKolon:=1 else EdKolon:=2
end;

Procedure GoDown;
begin
    if (EdDrs > CurCnt) or (EdDrs = MaxDonemDrs) then
       beep
    else
       Inc(EdDrs);
    If EdDrs > CurCnt then begin
     EdKolon:=1; GotoXY(1,EdDrs); ClrEol;
     With AnaKay[CurDon,EdDrs] do begin DrsPtr:=0; Grd:=106 end;
    end else EdKolon:=2
end;
Procedure GoUp;
begin
    If EdDrs<=1 then
       beep
    else begin
        If EdDrs > CurCnt then begin
           GotoXY(1,EdDrs); ClrEol;
           With AnaKay[CurDon,EdDrs] do begin DrsPtr:=0; Grd:=106 end;
        end;
       Dec(EdDrs);EdKolon:=2;
    end;
end;

Procedure BeginEdit(WhichDonem : Byte);
Var L : Word;
begin
   CurDon:=WhichDonem;
   With Donem[CurDon] do begin
	CurYil:=YL; CurYY:=YY; CurCnt:=CNT
   end;
   PrintCourses;
   If CurCnt < MaxDonemDrs  then begin
      EdKolon:=1;EdDrs:=Succ(CurCnt)
   end else begin
      EdKolon:=2;EdDrs:=CurCnt
   end;
end;
procedure DeleteYil(X : Word);
Var U : YilRec; V : AnaRecType;
begin
  DelRec(Donem, U, X, YYCount, SizeOf(U));
  Inc(YYCount);
  DelRec(AnaKay, V, X, YYCount, SizeOf(AnaRecType));
end;


Procedure GetAnaFromOgr;
var I: Word;
begin
    Dfile.GetRec(FileAdr,Is);
    For I:= YYCount+1 to MaxDonem do
       with Donem[I] do begin
	     YL:=ActYil; YY:=ActYY
       end;
end;

Procedure PutAnaToOgr;
Var I : Word;
begin
    I:=1;
    While I<=YYCount do If Donem[I].CNT=0 then DeleteYil(I) else Inc(I);
    Dfile.PutRec(FileAdr,Is);
end;

begin
    OpenSplitWindow('ANA KšTšK G˜R˜ž/DE¦˜ž˜KL˜K',
    '13@D™NEM@8@DRS. KOD@25@DERS˜N ADI@2@ST@6@KR@12@ALINAN NOT',
       'CTRL_Y:D™NEM GIR@F9:D™NEM SE€@INS:G˜R˜ž@DEL:€IKAR@ESC:VAZGEC',
       [CTRL_Y,INSKEY,DELKEY,F9,ESC,UPKEY,DOWNKEY,F10],
       [CmdNotDegis, CmdYeniNot, CmdDrsGir]);
   repeat
     repeat
       TC:=GetOgr;
       Case TC of
	 ESC : begin CloseEdit; exit end;
	 NULL: begin GetAnaFromOgr;
		 If YYCount = 0 then
		   If Not YeniDonem then TC:=ESC;
	       end;
       end;
     until TC=NULL;
     ClrScr;BeginEdit(1);
     repeat
	WriteStr(Form.FieldKol[1],EdDrs,SingleAnaLine(EdDrs),TextAttr);
	Case EdKolon of
	  1 : begin
	     If EdDrs > CurCnt then begin
	       GotoXY(1,EdDrs);
	       ClrEol;
	       WriteStr(Form.FieldKol[1], EdDrs,YilStr(CurYil, CurYY), TextAttr);
	     end;
	     TC:=Drs.ReadKod( Form.FieldKol[2],EdDrs,False,3);
	     If TC = NULL then begin
		L:=Drs.FileAdr;
		L :=WORDARA(L, AnaKay[CurDon], CurCnt, SizeOf(AnaRec));
		If L<>0 then
		   complain('BU DERS ZATEN VAR')
		else begin
		   AnaKay[CurDon,EdDrs].DrsPtr:=Drs.FileAdr;
		   EdKolon:=2;
		end;
	     end;
	   end;
	  2 : With AnaKay[CurDon, EdDrs] do begin
	       GrdYer:=Grd;
	       KD:=GRAD.KOD(GrdYer);
	       Grad.ReadGrade(KD,Form.FieldKol[6],EdDrs, GrdYer, TC);
	       If TC = Null then begin
                  Grd:=GrdYer;
		  if GradeOk(CurDon, AnaKay[CurDon, EdDrs]) then begin
		     Grd:=GrdYer;
		     if EdDrs > CurCnt then begin
			Inc(CurCnt);
			Donem[CurDon].CNT:=CurCnt;
			Drs.AlanOgrDegis(AnaKay[CurDon, CurCnt].DrsPtr, True);
		     end;
		     GoDown;
		  end;
		  if EdDrs > CurCnt then EdKolon:=1;
	       end;
	     end;
	  end;
	  DoEvent(EventKey);
	  Case TC of
		 CTRL_Y : If YeniDonem then BeginEdit(CurDon);
		 F9     :begin
                           Don.Init;
			   L:=Don.DonemSec;
                           Don.Done;
			   If L<>0 then begin
			      BeginEdit(L);
			   end;
			 end;
		 DELKEY : begin DeleteDrs; PrintCourSes end;
		 ESC    : begin PutAnaToOgr; CloseEdit; exit end;
		 Upkey  : GoUp;
		 DownKey: GoDown;
		 INSKEY : begin PutAnaToOgr; ClrScr;end;
              end;
       Until (TC=INSKEY);
   until False;
end;

Procedure OgrRec.KutIsle;
 Var I, J, K, L : Word;
    U:YilRec;
    V:AnaRecType;
begin
 Drs.ReadAlOgSay;
 For I:=1 to Say do begin
     DFile.GetRec(GetAdr(I),Is);
     K:=Kac[AktifYYInd];
     If K<>0 then begin
	 With U do begin
	     CNT:=K;
	     YL:=ActYil;
	     YY:=ActYY
	 end;
	 V:=Ders[AktifYYInd];
	 If SearchDonem(ActYil,ActYY,L) then begin
	      For J:=1 to Donem[L].CNT do Dec(AlOgSay[AnaKay[L,J].DrsPtr]);
	      AnaKay[L]:=V;
	      Donem[L]:=U;
	      For J:=1 to Donem[L].CNT do Inc(AlOgSay[AnaKay[L,J].DrsPtr]);
	      DFile.PutRec(GetAdr(I),Is);
	  end else
	      if YYCount < MaxDonem then begin
		 InsRec(Donem,U,L,YYCount,SizeOf(YilRec));
		 Dec(YYCount);
		 InsRec(AnaKay,V,L, YYCount,SizeOf(AnaRecType));
		 For J:=1 to Donem[L].CNT do Dec(AlOgSay[AnaKay[L,J].DrsPtr]);
		 DFile.PutRec(GetAdr(I),Is);
	      end else complain(GetIs+' ANA KUTUK DOLU');
     end;
 end;
 Drs.WriteAlOgSay;
end;
Procedure OgrRec.EditYY;
Var TC, CH  : Char;
    GrdYer, Yer, L, CD, C, SaveEdDrs  : Word;
    KD:String;
    InnerLoop:Boolean;
    ESKIBOLUM, ESKIYIL:WORD;
Procedure SetStatFalse;
begin
  YYListStat[AktifYYInd,ActBol]:=False;
  BTListStat[AktifYYInd,ActBol]:=False;
  TTListStat[AktifYYInd,ActBol]:=False;
end;
Procedure YYSetZero;
begin
    GotoXY(1,EdDrs); ClrEol; YYKay[AktifYYInd,EdDrs]:=0;
    With Ders[AktifYYInd,EdDrs] do begin DrsPtr:=0; Grd:=106 end;
    EdKolon:=1;
end;
Procedure YYGoUp;
begin
    If EdDrs<=1 then
       beep
    else begin
       If EdDrs > Kac[AktifYYInd] then YYSetZero;
       EdKolon:=2;
       Dec(EdDrs);
    end;
end;
Procedure YYGoDown;
begin
    if (EdDrs > Kac[AktifYYInd] ) or (EdDrs = MaxDonemDrs) then
       beep
    else
       Inc(EdDrs);
    If EdDrs > Kac[AktifYYInd] then YYSetZero else EdKolon:=2;
end;

Function SingleYYLine(Yer : word):String;
Var S, T , V: String;
    D : Word;
    G : Byte;
begin
    With Ders[AktifYYInd,Yer] do begin D:=DrsPtr; G:=Grd end;
    If D = 0 then begin
       SingleYYLine:=Spaces(WinLastCol-Form.FieldKol[1]);
       exit
    end;
    With YYDrs do begin
       Dfile.GetRec(YYKay[AktifYYInd,Yer],Is);
       S:=GetIsExpand;
    end;
    With Drs do begin
	    Dfile.GetRec(D,Is);
	    S:=S+' '+GetAd;
            T:=' '+ IntToStr(Saat,2)+'  '+ RealToStr(Kredi,3,1)+' ';
    end;
    With GRAD do  V := GRadeLine(G);
    S:=S+T+'  '+V;
    SingleYYLine:=S;
 end;


procedure PrintYYCourses;
Var I : Word;
begin
    I:=1; ClrScr;
    While I<=Kac[AktifYYInd] do begin
       WriteStr(Form.FieldKol[1],I,SingleYYLine(I), TextAttr);
       Inc(I)
    end;
end;
procedure DeleteYYDrs;
Var  V : AnaRec;
     L, K : Word;
begin
  If EdDrs > Kac[AktifYYInd] then
     YYSetZero
  else begin
     With YYDrs do begin
	 Dfile.GetRec(YYKay[AktifYYInd,EdDrs] ,Is);
         Dec(Mevcut[1]);
	 Dfile.PutRec(YYKay[AktifYYInd,EdDrs],Is);
     end;
     K:=Kac[AktifYYInd];
     DelRec(Ders[AktifYYInd], V, EdDrs, K, SizeOf(AnaRec));
     Inc(K);
     DelRec(YYKay[AktifYYInd], L, EdDrs, K, 2);
     Kac[AktifYYInd]:=K;
     PrintYYCourses;
     If EdDrs > Kac[AktifYYInd] then YYSetZero else EdKolon:=2;
  end;
end;
Procedure KayitSakla;
begin
    SaveKac:=Kac[AktifYYInd];
    SaveKay:=YYKay[AktifYYInd];
    SaveAct:=Ders[AktifYYInd];
end;
Procedure RestoreKayit;
begin
    Kac[AktifYYInd]  :=SaveKac;
    YYKay[AktifYYInd]:=SaveKay;
    Ders[AktifYYInd] :=SaveAct;
    SetStatFalse;
end;

Procedure ZeroYYKay(X : Byte);
begin
    FillChar(Kac[X],SizeOf(Kac[X]),#0);
    FillChar(YYKay[X], SizeOf(YYKay[X]),#0);
    FillChar(Ders[X],SizeOf(Ders[X]),#0);
    SetStatFalse;
end;
Procedure  GetYYFromOgr;
Var I : Byte;
begin
     Dfile.GetRec(FileAdr,Is);
end;

Procedure BeginYYEdit;
Var L : Word;
begin
   PrintYYCourses;
   If Kac[AktifYYInd]<MaxDonemDrs Then begin
      EdDrs:=Succ(Kac[AktifYYInd]);EdKolon:=1;YYSetZero
   end else begin
      EdDrs:=Kac[AktifYYInd];EdKolon:=2
   end;
end;

Procedure FindTopSaatKredi;
Var I, M : Word;
    X    : Real;
begin
   M:=0;X:=0.0;
   For I:=1 to Kac[AktifYYInd] do
       With Drs do begin
	 Dfile.GetRec(Ders[AktifYYInd,I].DrsPtr,Is);
         M:=M+Saat;X:=X+Kredi;
   end;
   TopSaat:=M; TopKredi:=X;
end;

Procedure YYGiris;

VAR Y, Q, T, I, J, K : WORD;
    S:String;
    Yer : Word;
    Succes, Hata:Boolean;
begin
   if not KayitKontrol then begin
      DFile.PutRec(FileAdr,Is);SetStatFalse;
      exit;
   end;
   Hata:=False; FindTopSaatKredi;
   If (KrediHesapla and (TopKredi > MaxKredi)) or
      (Not KrediHesapla and (TopSaat > MaxSaat)) then begin
      if Not KrediHesapla then
         S:=IntToStr(MaxSaat,2)
      else
         S:=RealToStr(MaxSaat,5,2);
      Complain('DERS/KREDI SAATI '+S+' YI AžIYOR');
      Hata:=True;
   end;
   For K:=1 to Kac[AktifYYInd] do
       For I:=1 to YYCount do begin
	   Q:=WORDARA(Ders[AktifYYInd,K].DrsPtr, AnaKay[I], Donem[I].CNT, SizeOf(AnaRec));
           if Q<>0 then begin
               Succes:=GRAD.Grade[AnaKay[I,Q].Grd].Basari;
               if Succes then begin
                   T:=AnaKay[I,Q].DrsPtr;
                   with Drs do begin
        	       Dfile.GetRec(T, Is);S:=GetIs;
	           end;
	           Complain(S+' '+YilStr(Donem[I].YL,Donem[I].YY)+' DE BAžARILI. GEREKS˜Z KAYIT');
                   Hata:=True;
               END;
           END;
       end;
   Y:=Pred(ActYil);
   If SearchDonem(Y, ActYY, Yer) then
       For I:=1 to Donem[Yer].CNT do begin
           T:=AnaKay[Yer,I].DrsPtr;
           Succes:=GRAD.Grade[AnaKay[Yer,I].Grd].Basari;
           if not Succes then begin
	       Q:=WORDARA(T, Ders[AktifYYInd], Kac[AktifYYInd], SizeOf(AnaRec));
	       If Q=0 then begin
	           with Drs do begin Dfile.GetRec(T, Is);S:=GetIs; end;
		   Complain(S+' '+YilStr(Y,ActYY)+' DE BAžARISIZ. KAYIT YAPILMALI');
                   Hata:=True;
 	       end;
           end;
        end;
   If Hata Then BEGIN
      Message('KAYIT KONTROL',
      'KAYITTA HATA VAR. KAYIDI@G˜RMEM˜     ˜STERM˜S˜N˜Z@ESC:VAZGE€@ENTER:G˜R',
       [ESC,CR], TC);
       if TC=CR then Hata:=False;
       TC:=NULL;
  end;
  If Not Hata then begin DFile.PutRec(FileAdr,Is);SetStatFalse; end;
end;
Procedure DecMev;
Var L : Word;
begin
   For L:=1 to Kac[AktifYYInd] do
       With YYDrs do begin
	  Dfile.GetRec(YYKay[AktifYYInd,L] ,Is);
          Dec(Mevcut[1]);
	  Dfile.PutRec(YYKay[AktifYYInd,L],Is);
       end;
end;
Procedure ShowKayitKontStat;
begin
  PrevWin;
  If KayitKontrol then
     WriteStr(WinLastCol-8,1,'KONTROL', CmdColor)
  else begin
     GotoXY(WinLastCol-8,1);
     ClrEol;
  end;
  RestoreWinInfo;
end;
PROCEDURE YYBLCHANGE;
VAR C:BYTE;
BEGIN
   IF (ESKIBOLUM<>ACTBOL) OR (ESKIYIL<>ACTYY) THEN BEGIN
     For C:=Guz to Bah do ZeroYYKay(C);
     KAYITSAKLA;
   END;
   ESKIBOLUM:=ACTBOL; ESKIYIL:=ACTYY;
END;

begin
  OpenSplitWindow('YARIYIL KAYIT G˜R˜ž˜',
  '12@DERS KOD@25@DERS˜N ADI@2@ST@6@KRD@12@ALINAN NOT',
  'INS:G˜R@DEL:€IK@PGUP:™NCEK˜@CTRL_X:SIFIRLA@CTRL_Y:KONTROL@ESC:EXIT',

  [ESC,INSKEY,DELKEY,UPKEY, DOWNKEY, PGUPKEY,CTRL_X,F10, CTRL_Y, F8],
     [CmdYYDrsGir, CmdYilSec, CmdAnaEdit]);
   For C:=Guz to Bah do ZeroYYKay(C);
   ShowKayitKontStat;
   ESKIBOLUM:=ACTBOL; ESKIYIL:=ACTYY;
   repeat
       TC:=GetOgr; ShowKayitKontStat;
       If TC=ESC then begin CloseEdit; exit end;
       DFile.Getrec(FileAdr,is);
       BeginYYEdit;
       If not SearchDonem(ActYil, ActYY, CD) then CD:=1;
       InnerLoop:=False;
       repeat
	  Case EdKolon  of
	  1 : begin
                TC:=YYDrs.ReadKD(Form.FieldKol[1], EdDrs, True);
		If TC = NULL then begin
		  SetStatFalse;
		  Ders[AktifYYInd,EdDrs].DrsPtr:=YYDrs.DrsAdr;
		  YYKay[AktifYYInd,EdDrs]:=YYDrs.FileAdr;
		  WriteStr(Form.FieldKol[1],EdDrs,SingleYYLine(EdDrs),TextAttr);
		  L:=YYDrs.FileAdr;
		  L :=WORDARA(L, YYKay[AktifYYInd], Kac[AktifYYInd], 2);
		  If L<>0 then begin
		     complain('BU DERS ZATEN VAR');
                     YYSetZero;
                  end
		  else begin
		     if GradeOk(CD, Ders[AktifYYInd, EdDrs]) then begin
			Inc(Kac[AktifYYInd]);
			L:=Kac[AktifYYInd];
                        With YYDrs do begin
			   Dfile.GetRec(YYKay[AktifYYInd,L] ,Is);
                           Inc(Mevcut[1]);
			   Dfile.PutRec(YYKay[AktifYYInd,L],Is);
			   SetStatFalse;
                         end;
                         YYGoDown;
                     end;
		  end;
	      end;
            end;
	  2:  With Ders[AktifYYInd, EdDrs] do begin
                GrdYer:=Grd;
                GRAD.ReadGrade(KD,Form.FieldKol[5],EdDrs,GrdYer,TC);
		Grd:=GrdYer;
                If TC=NULL then begin TC:=DownKey;SetStatFalse end;
              end;
	  end;
          If TC = F8 then begin
               Message('ANAKšTšK DE¦˜ž˜KL˜K',
               'ANA KšTšKE G˜R˜žTEN ™NCE@YARIYIL KAYIDINI G˜RMEL˜S˜N˜Z@ESC:VAZGE€@ENTER:G˜R',
               [ESC,CR], TC);
               If TC=CR then begin
                     DFile.PutRec(FileAdr,Is);
                     KayitSakla; Clrscr;
                     EventKey:=HotKeyEvent(F8, MenuBar);
                     ESKIBOLUM:=ACTBOL;
		     DoEvent(EventKey);
                     YYBLCHANGE;
                     InnerLoop:=True;
                end;
                TC:=NULL; EventKey:=0;
          end;
          If TC = CTRL_F1 then begin
               Message('YARIYIL DE¦˜ž˜KL˜K',
               'YARIYIL DE¦˜žMEDEN ™NCE@YARIYIL KAYIDINI G˜RMEL˜S˜N˜Z@ESC:VAZGE€@ENTER:G˜R',
               [ESC,CR], TC);
               If TC=CR then begin
                     DFile.PutRec(FileAdr,Is);
                     KayitSakla; Clrscr;
                     EventKey:=HotKeyEvent(CTRL_F1, MenuBar);
		     DoEvent(EventKey);
                     YYBLCHANGE;
                     InnerLoop:=True;
                end;
                TC:=NULL; EventKey:=0;
          end;
          DoEvent(EventKey);
	  Case TC of
	    DELKEY : BEGIN DeleteYYDrs;SetStatFalse END;
	    ESC    : begin YYGiris;
			   CloseEdit;
			   WriteListStat;
                           exit
		     end;
	    Upkey  : YYGoUp;
	    DownKey: YYGoDown;
	    INSKEY : begin YYGiris;
			   KayitSakla;
                           InnerLoop:=True;
                           ClrScr;
		      end;
	    CTRL_X : begin DecMev; ZeroYYKay(AktifYYInd) ; BeginYYEdit end;
            CTRL_Y : begin
                        KayitKontrol:=Not KayitKontrol;
                        ShowKayitKontStat;
                     end;

	    PGUPKEY: Begin
                       DecMev;
                       RestoreKayit;
		       For L:=1 to Kac[AktifYYInd] do
                          With YYDrs do begin
			   Dfile.GetRec(YYKay[AktifYYInd,L] ,Is);
                           Inc(Mevcut[1]);
			   Dfile.PutRec(YYKay[AktifYYInd,L],Is);
                         end;
                         BeginYYEdit end;
	  end;
       Until InnerLoop;
       WriteListStat;
   until False;
end;

Function OgrRec.GradeOk(CD : Word; D : AnaRec):Boolean;
VAR T, I : WORD;
    A, B : Boolean;
    S:String;
begin
   I:=1;
   GradeOK:=False;
   While I<CD do begin
      T:=WORDARA(D.DRSPtr, AnaKay[I], Donem[I].CNT, SizeOf(AnaRec));
      If T<>0 then
	 if GRAD.Grade[AnaKay[I,T].Grd].Basari then begin
	    complain('BU DERS '+YILSTR(DONEM[I].YL,DONEM[I].YY)+' D™NEM˜NDE BAžARILI OLARAK VAR');
	    Exit
	 end;
      INC(I)
   END;
   I:=Succ(CD);
   WHILE I<=YYCount DO BEGIN
      T:=WORDARA(D.DRSPtr, AnaKay[I],Donem[I].CNT, SizeOf(AnaRec));
      IF T<>0 THEN begin
         A:=GRAD.Grade[AnaKay[I,T].Grd].Basari;
	 B:=GRAD.Grade[D.Grd].Basari;
         With Donem[I] do S:=YILSTR(YL,YY);
         If A and B then
	   complain('BU DERS '+ S +' D™NEM˜NDE BAžARILI OLARAK VAR');
         If Not A and B then
           complain('BU DERS '+ S +' D™NEM˜NDE BAžARISIZ OLARAK VAR');
         If B then exit;
	END;
      INC(I)
   end;
   GradeOk:=True;
END;


procedure OgrRec.Cikis;
Var B              : Boolean;
    SelYer,  K     : Word;
    Var S          : String;
    Y, T, I, J, L  : Byte;
    YDF            : Array[Guz..Yaz] of DataFile;

procedure DersleriSil;
Var I, J, M : Word;
begin
  With Drs do
    For I:=1 to YYCount do
       For j:=1 to Donem[I].CNT do begin
               M:=AnaKay[I,J].DrsPtr;
               Dfile.GetRec(M,Is);
               Dec(AlanOgrSay);
               Dfile.PutRec(M,Is);
        end;
end;
begin
   if not Selection('™¦RENC˜ €IKIžI','8@™GR.KOD@25@™¦RENC˜N˜N ADI',SelectColor) then exit;
   YYDrs.DFile.CloseFile;
   For Y:=Guz to Yaz do begin
      YDF[Y].Init(MaxYYDrs, Ofs(YYDrs.Stopper)-Ofs(YYDrs.Is));
      YDF[Y].OpenFile(GUZBAH[Y]+'DRS.DAT');
   end;
   SelYer:=Say;
   While SelYer>=1 do begin
      If SelArr[SelYer] then begin
	FileAdr:=GetAdr(SelYer);
	Dfile.GetRec(FileAdr, Is);
	DersleriSil;
        For Y:=Guz to Yaz do begin
	If Kac[Y]<>0 then
  	   For J:=1 to Kac[Y] do begin
               YDF[Y].GetRec(YYKay[Y,J],YYDrs.Is);
               Dec(YYDrs.Mevcut[1]);
               YDF[Y].PutRec(YYKay[Y,J],YYDrs.Is)
           end;
        end;
	DelIndex(SelYer);
	DFile.ReleaseRec(FileAdr);
     end;
     Dec(SelYer)
   end;
   WriteNdx;
   For Y:=Guz to Yaz do begin
      YDF[Y].CloseFile;
   end;
   YYDrs.Open;
end;
procedure DrsRec.Cikis;
Var B             : Boolean;
    SelYer, K     : Word;
begin
  if not Drs.Selection('DERS €IKIžI','6@DRS.KOD@25@DERS˜N ADI',SelectColor) then exit;
   SelYer:=Say;
   While SelYer>=1 do begin
     If SelArr[SelYer] then begin
	FileAdr:=GetAdr(SelYer);
	Dfile.GetRec(FileAdr, Is);
        B:=(AlanOgrSay > 0 );
       For K:=Guz to Yaz do B:= B or (YYDSay[K]>0);
	If B then
		complain(GetKey(SelYer)+' DERS˜N˜ €IKARAMAM')
	else begin
		DelIndex(SelYer);
		DFile.ReleaseRec(FileAdr);
	end;
       end;
       Dec(SelYer);
    end;
    WriteNdx;
  end;
procedure UyeRec.Cikis;
Var B:Boolean;
   SelYer, K : Word;
begin
  if not Uye.Selection('™¦RET˜M ELEMANI €IKIžI','6@šYE.KOD@10@šNVAN@25@šYEN˜N ADI',SelectColor) then exit;
   SelYer:=Say;
   While SelYer>=1 do begin
	If SelArr[SelYer] then begin
		K:=Say;
		FileAdr:=GetAdr(SelYer);
		Dfile.GetRec(FileAdr, Is);
                B:=False;
                For K:=Guz to Yaz do B:= B or (YYDSay[K]>0);
                if B then
			complain(GetKey(SelYer)+' KODLU šYEY˜ €IKARAMAM')
		else begin
  		  DelIndex(SelYer);
                  DFile.ReleaseRec(FileAdr);
                end;
	end;
	Dec(SelYer);
    end;
    WriteNdx;
end;
procedure YYDrsRec.Cikis;
Var  SelYer     : Word;
begin
   if not YYDrs.Selection('YARIYIL DERS €IKIžI',
    '6@DRSKOD@2@BL@2@GR@25@DERS˜N ADI',SelectColor) then exit;
   SelYer:=Say;
   While SelYer>=1 do begin
	If SelArr[SelYer] then begin
  	  FileAdr:=GetAdr(SelYer);
          Dfile.GetRec(FileAdr, Is);
          If (Mevcut[1] >0)  then
		complain(GetIsExpand+' DERS˜N˜ €IKARAMAM')
          else begin
		DelIndex(SelYer);
		DFile.ReleaseRec(FileAdr);
          end;
	end;
	Dec(SelYer)
       end;
       WriteNdx;
end;

Function YeniDonemGir(Var Y:Word; Var Z : Byte; Title : String):Boolean;
Var  TC : Char;
Procedure GetYil;
Var S : String;R:Integer;
begin
    Str(Y:4,S);InputStr(S,Form.FieldKol[1],1,4,True,['0'..'9'],4,TC);
    Val(S,Y,R);
end;

Procedure GetYY;
Var S : String;R:Integer;
begin
    If TC <> NULL then exit;
    Str(Z:1,S);
    InputStr(S,Form.FieldKol[2],1,1,True,['1','2'],1,TC);
    Val(S,Z,R);
end;
begin
  OpenEditWindow(Title,
		 '4@YIL@3@YARIYIL',
		 'INS:G˜R˜ž@ESC:VAZGE€',[ESC, INSKEY],[],10,1);
  ShowCursor;
  ClrScr;
  Y:=ActYil;
  Z:=ActYY;
  Repeat
     GetYil;
     GetYY;
     case TC of
	INSKEY : YeniDonemGir:=True;
	ESC    : YeniDonemGir:=False;
     end;
Until TC in [INSKEY,ESC];
CloseEdit;
end;


Function OgrRec.YeniDonem:Boolean;
Var Y:word; Z:Byte;
    TC : Char;
Procedure InsYil;
Var U : YilRec; V : AnaRecType;
    Yer:Word;  L:Word;
begin
   FillChar(V,SizeOf(V),#0); FillChar(U,SizeOf(U),#0);
   If not GRAD.Search('NY',Yer) then Yer:=1;
   For L:=1 to MaxDonemDrs do V[L].Grd:=Yer;
   If SearchDonem(Y,Z,L) then
      CurDon:=L
   else if YYCount < MaxDonem then begin
	   With U do begin CNT:=0;YL:=Y; YY:=Z end;
   	   InsRec(Donem,U,L,YYCount,SizeOf(YilRec));
	   Dec(YYCount);
	   InsRec(AnaKay,V,L, YYCount,SizeOf(AnaRecType));
           CurDon:=L;
	   With Donem[L] do begin
	      YL:=Y; YY:=Z; CNT:=0
	   end;
   end;
   With Donem[CurDon] do begin
	CurYil:=YL; CurYY:=YY; CurCnt:=CNT;
   end;
end;
begin
    YeniDonem:=False;
    If YYCount = MaxDonem then
       Complain('DAHA FAZLA D™NEM G˜R˜ž˜ YAPAMAM')
    else if YeniDonemGir(Y,Z,'YEN˜ D™NEM') then
         begin
             InsYil;
             YeniDonem:=True
         end
 end;

Procedure YeniYil;
Var I, X, Y   : Word;
    Bol, W, Z : Byte;
    TC        : Char;
begin
  SetAllStatFalse;
  With Yariyil.Yil[Yaz] do begin
     X:=Sene; W:=YarYil
  end;
  If not YeniDonemGir(Y, Z, 'YEN˜ YIL VE YARIYIL') then exit;
  For I:=Guz to Bah do begin
      With Yariyil.Yil[I] do
         If (Sene = Y) and (YarYil = Z) then begin
           Complain(YilStr(Y,Z)+' KULLANIMDA. SIFIRLANAMAZ');
           Exit
         end;
  end;
  Message('YEN˜ YIL VE YARIYIL',
      YilStr(X, W)+'YARIYILI DERSLER˜@VE DERS KAYITLARI S˜L˜NECEK@ESC:VAZGE€@ENTER:DEVAM',
       [ESC,CR], TC);
  If TC=ESC then exit;
  Ogr.YeniYil(Y, Z);
  YYDrs.YeniYil(Y,Z);
 CloseWindow;
end;

procedure OgrRec.BolumSec;
begin
   DFile.CloseFile;
   WriteNdx;
   FillChar(KodPtr^,(KeyL+2)*(MaxKay+1),#0);
   Say:=0;
   ActBol:=Bolum.BolumSec;
   Open;
   ReadNdx;
   ShowBolYil;
end;

Procedure YYDrsRec.YilSec;
begin
  DFile.CloseFile;
  WriteNdx;
  FillChar(KodPtr^,(KeyL+2)*(MaxKay+1),#0);
  Say:=0;
  AktifYYInd:=Yariyil.YilSec;
  With Yariyil.Yil[AktifYYInd] do begin
    ActYY:=YarYil;
    ActYil:=Sene;
  end;
  Yariyil.WriteYil;
  YYDrs.Open;
  YYDrs.ReadNdx;
  ShowBolYil;
end;


Procedure OgrRec.YeniYil(Y : Word; Z:Byte);
Var W, J, Bol, K : Word;
    U :Byte;
begin
  DFile.CloseFile;
  With Yariyil.Yil[Z] do begin
     K:=Sene; U:=YarYil
  end;
  Bekleyiniz(YilStr(K, U)+' SAKLANIP '+YilStr(Y,Z)+' SIFIRLANIYOR');
  For Bol:=1 to Bolum.NuKod do begin
     DFile.Init(MaxOgr, Ofs(CurDon)-Ofs(Is));
     DFile.OpenFile(Bolum.Kod(Bol)+'OGR.DAT');
     For J:=1 to DFile.FirstFree-1 do begin
         DFile.GetRec(J,Is);
         Move(Is,W,2);
         If W<>$FFFF then begin
            Kac[Yaz]  :=Kac[Z];
            YYKay[Yaz]:=YYKay[Z];
            Ders[Yaz] :=Ders[Z];
            Kac[Z]:=0;
            FillChar(YYKay[Z],SizeOf(YYKay[Z]),#0);
            FillChar(Ders[Z],SizeOf(Ders[Z]),#0);
            DFile.PutRec(J,Is);
         end;
     end;
     DFile.CloseFile;
  end;
  CloseWindow;
  Open;
end;
Procedure YYDrsRec.YeniYil(Y:Word; Z:Byte);
Var D : DataFile;
    Bol, I, X, R, K, W, J: Word; U : Byte;
begin

  DFile.CloseFile;
  With Yariyil.Yil[Z] do begin
     K:=Sene; U:=YarYil
  end;
  Bekleyiniz(YilStr(K, U)+' SAKLANIP '+YilStr(Y,Z)+' SIFIRLANIYOR');
  AktifYYInd:=Yaz;
  With Yariyil.Yil[Yaz] do begin
     ActYil:=Sene; ActYY:=YarYil
  end;
  Open;
  ReadNdx;
  For I:=1 to Say do begin
      DFile.GetRec(GetAdr(I), Is);
      Drs.DFile.GetRec(DrsAdr,Drs.Is);
      Dec(Drs.YYDSay[ActYY]);
      Drs.DFile.PutRec(DrsADr, Drs.Is);
  end;
  DFile.CloseFile;
  EraseFile(GUZBAH[ActYY]+'DRS'+SnStr(ActYil)+'.DAT');
  EraseFile(GUZBAH[ActYY]+'DRS'+SnStr(ActYil)+'.NDX');
  For Bol:=1 to Bolum.NuKod do begin
    EraseFile(Bolum.Kod(Bol)+GUZBAH[ActYY]+SnStr(ActYil)+'L.DAT');
    EraseFile(Bolum.Kod(Bol)+GUZBAH[ActYY]+SnStr(ActYil)+'B.DAT');
    EraseFile(Bolum.Kod(Bol)+GUZBAH[ActYY]+SnStr(ActYil)+'T.DAT');
 end;
 Yariyil.Yil[Yaz].Sene  :=Yariyil.Yil[Z].Sene;
 Yariyil.Yil[Yaz].YarYil:=Yariyil.Yil[Z].YarYil;

 With Yariyil.Yil[Z] do begin
     Sene:=Y; YarYil:=Z;
 end;
 With Yariyil.Yil[Yaz] do begin
     ActYil:=Sene; ActYY:=YarYil;
  end;
  AktifYYInd:=Yaz;
  Open;
  ReadNdx;
  D.Init(MaxYYDrs, DFile.RecLen);
  D.OpenFile(GUZBAH[Z]+'DRS'+SnStr(Y)+'.DAT');
  For I:=1 to Say do begin
      DFile.GetRec(GetADr(I),Is);
      FillChar(Mevcut,Ofs(Stopper)-Ofs(Mevcut),#0);
      D.AddRec(R,Is);
  end;
  D.CloseFile;
  DFile.CloseFile;
  AktifYYInd:=Z;
  With Yariyil.Yil[Z] do begin
     ActYil:=Sene; ActYY:=YarYil;
  end;
  Open;
  ReadNdx;
  IndexDuz;
  Yariyil.WriteYil;
  CloseWindow;
end;
Procedure WriteListStat;
Var StatF  : DataFile;
    R      : Word;
begin
    If not Exists('LISTSTAT.DAT') then
       with StatF do begin
        Init(3,SizeOf(YYListStat));
        OpenFile('LISTSTAT.DAT');
        AddRec(R,YYListStat);
        AddRec(R,BTListStat);
        AddRec(R,TTListStat);
        CloseFile
      end
    else
       with StatF do begin
        Init(3,SizeOf(YYListStat));
        OpenFile('LISTSTAT.DAT');
        PutRec(1,YYListStat);
        PutRec(2,BTListStat);
        PutRec(3,TTListStat);
        CloseFile
      end
end;
Procedure ReadListStat;
Var StatF      : DataFile;
begin
    If not Exists('LISTSTAT.DAT') then WriteListStat;
    with StatF do begin
        Init(3,SizeOf(YYListStat));
        OpenFile('LISTSTAT.DAT');
        GetRec(1,YYListStat);
        GetRec(2,BTListStat);
        GetRec(3,TTListStat);
        CloseFile
      end
end;
Function   OgrRec.GPA:Real;
Var I, J, DRAdr : Word;
    X, Y, Z : Real;
    Gr      : Byte;
begin
    X:=0;
    TopSaat:=0;
    TopKredi:=0.0;
    Z:=0.0;
    Y:=0;
    For I:=1 to YYCount do
	For J:=1 to Donem[I].CNT do begin
	    Gr:=AnaKay[I,J].Grd;
	    If (GRAD.Grade[Gr].OrtHes) and (GRAD.Grade[Gr].Basari) then
            begin
               DRAdr:=AnaKay[I,J].DrsPtr;
	       TopSaat := TopSaat + XSaat^[DRAdr];
               TopKredi:= TopKredi+ XKred^[DRAdr];
	       X:=X+XSaat^[DRAdr]*GRAD.GW(Gr);
               Y:=Y+XKred^[DRAdr]*GRAD.GW(Gr);
	    end;
	end;
    Z:=Int(TopSaat);
    If Z<>0 then X:=X/Z;
    If TopKredi<>0 then Y:=Y/TopKredi;
    GPA:=X;
    If KrediHesapla then GPA:=Y;
end;
Function   OgrRec.YYGPA(D:Word):Real;
Var I, J, DRAdr : Word;
    X, Y, Z : Real;
    Gr      : Byte;
begin
    X:=0;
    TopSaat:=0;
    TopKredi:=0.0;
    Z:=0.0;
    Y:=0;
    For I:=1 to Donem[D].CNT do begin
	  Gr:=AnaKay[D,I].Grd;
          If (GRAD.Grade[Gr].OrtHes) and (GRAD.Grade[Gr].Basari) then
          begin
               DRAdr:=AnaKay[D, I].DrsPtr;
	       TopSaat := TopSaat + XSaat^[DRAdr];
               TopKredi:= TopKredi+ XKred^[DRAdr];
	       X:=X+XSaat^[DRAdr]*GRAD.GW(Gr);
               Y:=Y+XKred^[DRAdr]*GRAD.GW(Gr);
           end;
    end;
    Z:=Int(TopSaat);
    If Z<>0 then X:=X/Z;
    If TopKredi<>0 then Y:=Y/TopKredi;
    YYGPA:=X;
    If KrediHesapla then YYGPA:=Y;
end;

procedure ClearForm;
begin
   Clrscr;
   WriteStr(1,WinLastRow,Spaces(WinLastCol), NormalAttr);
end;
begin
   FillChar(YYListStat,SizeOf(YYListStat),#0);
   FillChar(BTListStat,SizeOf(YYListStat),#0);
   FillChar(TTListStat,SizeOf(YYListStat),#0);
   Don.Init;

end.


