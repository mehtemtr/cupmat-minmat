unit UOgr;
interface
  uses BLUNGR, UIndex,  Win, Crt, GenUtil, DFile, Exist;
CONST

  MaxKeyLen     =  8;
  MaxAdLen      = 25;
  OgrKeyL       = 8;
  MaxOgr        = 1023;
  MaxDonemDrs   = 18;
  MaxDonem      = 20;

type
  AdStr        = String[MaxAdLen];
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

   DogumYerStr = String[15];
   POgrRec  = ^TOgrRec;
   TOgrRec  = object(Index)
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
          extra    :record end;
          Constructor Init;
          Procedure   ZeroKay;Virtual;
          Procedure   ShowIsAd;Virtual;
	  Procedure   Giris;
          Procedure   Cikis;
          procedure   BolumSec;

	  Procedure   Open;
          Procedure   ReadNdx;
          Procedure   WriteNdx;

          Function    GetOgr:Char;

	  Function    DogumTarih:String;
	  Procedure   GetSoyName(Var S, N : String);
	  Function    SearchSoy(S : String; Var Yer, Adres : Word) : Boolean;
	  Procedure   SoyIndis;


     end;
  TTarih = record
       Gun , Ay : Byte;
       Yil : integer;
  end;
TOgr = Record
      No           : String[8] ;    {™§renci No  }
      OsymNo       : String[10];    {OSYM No     }
      Ad ,                          {Ad         }
      SoyAd        : String[15];    {Soyad      }
      Cins         : Char;          {Cins        }
      KayitTar     : TTarih;        {Kayt Tarihi}
      HazNot       : Byte;          {Hazrlk Notu}
      Baba,                         {Baba Ad    }
      Ana,                          {Ana Ad     }
      DogumYer     : String[15];    {Do§um Yeri  }
      DogumTar     : TTarih;        {Do§um Tarihi}
      Il,                           {˜l          }
      Ilce,                         {˜l‡e        }
      MahKoy       : String[15];    {Mah/K”y     }
      MezuniyetTar : TTarih;        {Mezuniyet Tarihi}
  end;

Var
    Ogr : POgrRec;


    Univ, Fakulte : String;

    procedure ClearForm;
    Procedure ShowBol;



implementation

Procedure ShowBol;
Var S , T : String;
    L, M : Byte;
begin

    WriteChar(1,2,80,#205,TextAttr);
    S:=Fakulte; If Length(S)> 27 then S:=Copy(S,1,27);
    L:=Length(S); While S[L]=' ' do Dec(L);
    WriteStr(2,2,' ' + Copy(S,1,L)+ ' ', HiLiteAttr);
    M:=L+6;
    With Bolum do begin
      S:= KodAd(ActBol);

    end;
    If Length(S)> 27 then S:=Copy(S,1,27);
    L:=Length(S); While S[L]=' ' do Dec(L);
    WriteStr(M,2,' ' + Copy(S,1,L)+ ' ', HiLiteAttr);
    WriteStr(65,2,' ' + T+ ' ', HiLiteAttr);
    RestoreWinInfo;
end;


Constructor TOgrRec.Init;
Var X : word;
begin
    Index.Init(MaxOgr, OgrKeyL, Ofs(extra)-Ofs(Is));
    Sabit:='';
    SetRecNil;
    Cins:='E';
    NdxAdr:=1;
    FileAdr:=1;
    HazBasYil:=0;
    HazNot:=106;
    ReadNdx;

    DogumYer :=Spaces(SizeOf(DogumYerStr));
    DogumGun := 01;
    DogumAy  := 01;
    DogumYil := 1900;
end;
Function TOgrRec.DogumTarih:String;
begin
  DogumTarih:=IntToStr(DogumGun+0,2)+'/'+IntToStr(DogumAy+0,2)+'/'+IntToStr(DogumYil,4);
end;
Procedure   TOgrRec.GetSoyName(Var S, N : String);
Var T, A : String; I : Byte;
begin
    T:=Ad; Strip(T); N:=T;
    While ParseWord(T, A, ' ') do S:=A;
    T:=Ad;
    I:=Pos(S,N);
    N:=Copy(N,1,I-1);
end;
Function  TOgrRec.SearchSoy(S : String; Var Yer, Adres : Word) : Boolean;
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
      If StrComp(A, S)>=0 then Yer:=M else L:=M+1;
    end;
    If Yer<=IndisSay then begin
       DFile.GetRec(Indis[Yer],Is);
       GetSoyName(A,B);
       U:=(A=S);
       If U then Adres:=Indis[Yer];
       SearchSoy:=U;
    end;
end;
Procedure  TOgrRec.SoyIndis;
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


Procedure TOgrRec.ZeroKay;
begin
    FillChar(Kac, Ofs(Extra)-Ofs(Kac),#0);
end;
Procedure   TOgrRec.Open;
begin
  if Bolum.NuKod<>0 then begin
      DFile.OpenFile(Bolum.Kod(ActBol)+'OGR.DAT');
 end;
end;
Procedure TOgrRec.ReadNdx;
begin
   If Bolum.NuKod<>0 then
      If Not ReadIndex(Bolum.Kod(ActBol)+'OGR.NDX') then
         complain('™¦RENC˜ ˜NDEKS DOSYASI OKUNAMADI');
end;

Procedure TOgrRec.WriteNdx;
begin
   If Bolum.NuKod<>0 then
      If Not WriteIndex(Bolum.Kod(ActBol)+'OGR.NDX') then
         complain('™¦RENC˜ ˜NDEKS DOSYASI YAZILAMADI');
end;
Procedure   TOgrRec.ShowIsAd;
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
Procedure TOgrRec.Giris;
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
   If Search(GetIs, NdxAdr, FileAdr) then DFile.PutRec(FileAdr, Is);
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
   If Search(GetIs, NdxAdr, FileAdr) then DFile.PutRec(FileAdr, Is);
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
   If Search(GetIs, NdxAdr, FileAdr) then DFile.PutRec(FileAdr, Is);
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

Function TOgrRec.GetOgr:Char;
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


procedure TOgrRec.Cikis;
Var B              : Boolean;
    SelYer,  K     : Word;
    Var S          : String;
    Y, T, I, J, L  : Byte;
    YDF            : Array[Guz..Yaz] of DataFile;


begin
   if not Selection('™¦RENC˜ €IKIžI','8@™GR.KOD@25@™¦RENC˜N˜N ADI',SelectColor) then exit;

   SelYer:=Say;
   While SelYer>=1 do begin
      If SelArr[SelYer] then begin
	FileAdr:=GetAdr(SelYer);
	Dfile.GetRec(FileAdr, Is);
	DelIndex(SelYer);
	DFile.ReleaseRec(FileAdr);
     end;
     Dec(SelYer)
   end;
   WriteNdx;

end;

procedure TOgrRec.BolumSec;
begin
   DFile.CloseFile;
   WriteNdx;
   FillChar(KodPtr^,(KeyL+2)*(MaxKay+1),#0);
   Say:=0;
   ActBol:=Bolum.BolumSec;
   Open;
   ReadNdx;
   ShowBol;
end;

procedure ClearForm;
begin
   Clrscr;
   WriteStr(1,WinLastRow,Spaces(WinLastCol), NormalAttr);
end;

Function AdAndMarker(DrsAdr : Word):String;
Var L, KK, M : Word;CH:Char;
begin
  With OGR^ do begin
    Ad:=Ad+Spaces(MaxAdLen); Ad:=Copy(Ad,1,MaxAdLen); AdAndMarker:=Ad;
    if YKK=$FFFF then begin
       if YKK=$FFFF then AdAndMarker:=Copy(Ad,1,MaxAdLen - 3)+' **';
       exit
    end;
    for KK:=YYCount downto 1 do begin
      If (Donem[KK].YY = ActYY) and (Donem[KK].YL < ActYil) then begin
        L:=WordAra(DrsAdr, AnaKay[KK], Donem[KK].CNT,SizeOf(AnaRec));
        If L<>0 then begin
           M:=AnaKay[KK, L].Grd;
           if not GRAD.Grade[M].Basari then begin
                 CH:=GRAD.Grade[M].Isaret;
                 AdAndMarker:=Copy(Ad,1,MaxAdLen - 2)+' '+CH;
                 exit;
           end;
        end;
      end;
    end;
  end;
end;

begin

   New(OGR, Init);

end.


