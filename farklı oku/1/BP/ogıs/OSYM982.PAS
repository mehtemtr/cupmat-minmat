uses Crt, win, blungr, UIndex, DFile, exist,UOG;
const YilStr:String[2]='97';
type
     TAday=record
      ADAYNO      : String[10]; {10 CHARACTER}
      ADI         : String[12]; {12 CHARACTER}
      SOYADI      : String[14]; {14 CHARACTER}
      BABA        : String[10]; {10 CHARACTER}
      DOGTAR      : String[8]; {08 CHARACTER}
      CNS         : Char; {05 CHARACTER}
      PUAN        : String[7]; {03.03 CHARACTER (TOTAL 7 CHARACTER)}
      TER_SIR     : String[2]; {02 CHARACTER}
      KAZ_YP      : String[6]; {06 CHARACTER}
      ADR1        : String[21];{21 CHARACTER}
      ADR2        : String[21];{21 CHARACTER}
      ADR3        : String[12];{12 CHARACTER}
      OIL         : String[2]; {2 CHARACTER}
      PKODU       : String[5]; {5 CHARACTER}
   end;

   TProg=Record
      Progno:String[6];
      BolKod:String[2];
      BolSayKod:String[3];
      ProgAd:String[40];
   end;
   TprogAr=  Array[1..20] of TProg;
   TFak=record
     Progsay : integer;
     FakKod: String[2];
     FakAd : String[30];
     Prog  : TProgAr;
   end;
     TTarih = record
       Gun , Ay : Byte;
       Yil : integer;
  end;
  TFakSel = object(Cursor)
      Procedure   ShowLine(Yer : Word; Attr : Byte); Virtual;
  end;
  TBolProg=object(Select)
     FNo   : word;
     Prog  : TProgAr;
     Constructor Init(AFNo : Word);
     Constructor Load;
     Procedure   ShowLine(Yer : Word; Attr : Byte); Virtual;
     Function    Search(S:String; Var Yer, Adr : Word):Boolean;Virtual;
     procedure   Store;
     procedure   EditProgKod;
     Procedure   ReInit;
     Procedure   Order;
  end;

Var Il : Array[1..100] of string[30];
    Fak : Array[1..20] of TFak;
    FakSay : integer;
    FakSel : TFakSel;
    PR:TBolProg;
    BolSay : integer;
    OSYM : TextFile;
procedure GetAday(S : string; Var Aday : TAday);
Var I, X,Y: integer; W : String;
begin
   W:=S;
   With Aday do begin
      ADAYNO      :=Copy(S,1,10); {10 CHARACTER}
      Delete(S,1,2*10);
      ADI         :=Copy(S,1,12); {12 CHARACTER}
      Delete(S,1,12);
      SOYADI      :=Copy(S,1,14); {14 CHARACTER}
      Delete(S,1,14);
      BABA    :=Copy(S,1,10); {10 CHARACTER}
      Delete(S,1,10);
      DOGTAR       :=Copy(S,1,8);  {08 CHARACTER}
      Delete(S,1,8);
      CNS:='E'; if Copy(S,1,3)='KIZ' then CNS:='K';  {05 CHARACTER}
      Delete(S,1,5);
      PUAN   :=Copy(S,1,7);  {03.03 CHARACTER (TOTAL 7 CHARACTER)}
      Delete(S,1,16);
      TER_SIR     :=Copy(S,1,2);  {02 CHARACTER}
      Delete(S,1,2);
      KAZ_YP      :=Copy(S,1,6);  {06 CHARACTER}
      S:=Copy(W,122,Length(W));
      ADR1        :=Copy(S,1,21); {21 CHARACTER}
      Delete(S,1,21);
      ADR2        :=Copy(S,1,21); {21 CHARACTER}
      Delete(S,1,21);
      ADR3        :=Copy(S,1,12); {12 CHARACTER}
      Delete(S,1,12);
      OIL         :=Copy(S,1,2);  {2 CHARACTER}
      Delete(S,1,2);
      PKODU       :=Copy(S,1,5);  {5 CHARACTER}
   end;
end;

procedure OgrGir;
Var i,No : integer;Yer : Word;
    S,A,B,C,D : String;
    Aday : TAday;
    Stop : Boolean;
procedure proceedRead;
begin
        OSYM.OpenToRead('OSYM.TXT');
        While not Eof(OSYM.T) do begin
           S:=OSYM.ReadText;
           GetAday(S,Aday);
           if Aday.KAZ_YP=B then begin
              Inc(No);
              Str(No:3,C);
              SetBlankZero(C);
              S:=YilStr+A+C;
              Ogr^.ZeroKay;
              Move(S[1],Ogr^.Is,8);
              S:=Aday.Adi; D:=Aday.SoyAdi;
              Strip(S); Strip(D);
              Ogr^.Ad:=S+' '+D;
              Ogr^.Cins:=Aday.Cns;
              GRAD.Search('TK', Yer);
              Ogr^.HazNot:=Yer;
              Ogr^.HazBasYil:=0;
              Ogr^.DogumYer:='';
              Ogr^.DogumGun:=StrToInt(Copy(Aday.DogTar,1,2));
              Ogr^.DogumAy :=StrToInt(Copy(Aday.DogTar,4,2));
              Ogr^.DogumYil:=StrToInt(Copy(Aday.DogTar,7,4));
              Ogr^.GirisYap;
           end;
       end;
       OSYM.CloseFile;
end;
begin
  for i:=1 to PR.Say do begin
    S:=PR.Prog[i].BolKod;No:=0;
    if Bolum.Search(S,Yer) then begin
        Ogr^.DFile.CloseFile;
        Ogr^.WriteNdx;
        FillChar(Ogr^.KodPtr^,(Ogr^.KeyL+2)*(Ogr^.MaxKay+1),#0);
        Ogr^.Say:=0;
        ActBol:=Yer;
        Ogr^.Open;
        Ogr^.ReadNdx;
        ShowBolYil;
        A:=PR.Prog[i].BolSayKod;
        B:=PR.Prog[i].ProgNo;
        Stop:=False;
        if OGR^.Say<>0 then begin
           Ogr^.DFile.GetRec(Ogr^.GetAdr(Ogr^.Say),Ogr^.Is);
           S:=Ogr^.GetIs;
           S:=Copy(S,3,3);
           if A<>S then begin
              complain(A+' '+S+' KODLARI TUTMUYOR');
              Stop:=True;
           end;
        end;
        if not Stop then ProceedRead;
    end;
end;
end;

procedure IlOku;
Var InF : TextFile; x : integer;
begin
    Inf.OpenToread('IL.TXT');
    for x:=1 to 90 do Il[X]:=Inf.ReadText;
    Inf.CloseFile
end;
procedure OrderFak(L : integer);
Var i,j : integer;
    A : Tprog;
begin
   for i:=1 to Fak[L].ProgSay-1 do
       for j:=i+1 to Fak[L].ProgSay do
          if Fak[L].Prog[i].ProgNo>Fak[L].prog[j].ProgNo then begin
             A:=Fak[L].prog[i];Fak[L].prog[i]:=Fak[L].prog[j];Fak[L].prog[j]:=A
          end;
end;
procedure  TBolProg.Order;
Var i,j : integer;
    A : Tprog;
begin
   for i:=1 to say-1 do
       for j:=i+1 to Say do
          if Prog[i].ProgNo>prog[j].ProgNo then begin
             A:=prog[i];prog[i]:=prog[j];prog[j]:=A
          end;
end;
Constructor TBolProg.Init;
Var i : integer;
begin
   inherited init(6);
   FNo:=AFno;
   Say:=Fak[FNo].ProgSay;
   Prog:=Fak[FNo].Prog;
   Order;
   Store;
end;
Procedure TBolProg.ReInit;
Var i,j : integer; K : integer;B:boolean;
    A : TProg;
begin
   K:=FakSel.SelectSingle('FAKULTEYI/YUKSEKOKULU SE€˜N˜Z','35@FAKULTE ADI',1, FakSay, SelectColor);
   FNo:=K;
   Say:=Fak[FNo].ProgSay;
   Prog:=Fak[FNo].Prog;
   Order;
   B:=Selection(' PROGRAMLAR SE€˜M',
		'6@OSYM KOD@50@PROGARMIN ADIDERS˜N ADI', SelectColor);
   Say:=0;
   if B then begin
      For i:=1 to Fak[FNo].ProgSay do begin
          if SelArr[i] then begin
             inc(Say);
             A:=Prog[Say];
             Prog[Say]:=Fak[FNo].Prog[i];
             Prog[Say].BolKod:=A.BolKod;
             Prog[Say].BolSayKod:=A.BolSayKod;
          end;
      end;
   end;
   Order;
   Store;
end;
procedure   TBolProg.Store;
Var T : TextFile;
    I, J : Integer;
    S : String;
begin
   With T do begin
     OpenToWrite('PROGS.DAT');
     Str(Say,S);
     WriteText(S);
     Str(FNo,S);
     WriteText(S);
     For I:=1 to Say do begin
       WriteText(Prog[i].Progno);
       WriteText(Prog[i].BolKod);
       WriteText(Prog[i].BolSayKod);
       WriteText(Prog[i].ProgAd);
     end;
     CloseFile;
   end;
end;
Constructor TBolProg.Load;
Var T : TextFile;
    N, I, J : Integer;B:Boolean;
begin
   inherited init(6);
   With T do begin
     OpenToRead('PROGS.DAT');
     Say:=StrToInt(ReadText);
     FNo:=StrToInt(ReadText);
     For I:=1 to Say do begin
       Prog[i].Progno:=ReadText;
       Prog[i].BolKod:=ReadText;
       Prog[i].BolSayKod:=ReadText;
       Prog[i].ProgAd:=ReadText;
     end;
     CloseFile;
   end;
end;
Procedure   TBolProg.ShowLine(Yer : Word; Attr : Byte);
Var S : String;
begin
  With Prog[Yer] do begin
    S:=ProgNo;S:=S+spaces(6); S:=Copy(S,1,6);
    WriteStr(Form.FieldKol[1],EdRow,S,Attr);
    S:=ProgAd;S:=S+spaces(50); S:=Copy(S,1,50);
    WriteStr(Form.FieldKol[2],EdRow,S,Attr);
  end;
end;

Function TBolProg.Search(S:String; Var Yer, Adr : Word):Boolean;
var
  L, H, I, C: Integer;
begin
   for i:=1 to Say do begin
     if S=Copy(Prog[i].ProgNo,1,Length(S)) then begin
        Yer:=i;
        Adr:=i;
        Search:=true;
        exit
     end else begin
        yer:=Say+1;
        Adr:=Say+1;
     end;
   end;
   Search:=False
end;
Procedure   TFakSel.ShowLine(Yer : Word; Attr : Byte);
Var S : String;
begin
  S:=Fak[Yer].FakAd;S:=S+spaces(35); S:=Copy(S,1,35);
  WriteStr(Form.FieldKol[1],EdRow,S,Attr);
end;
Procedure OkuFak;
var
     InF : Text;
     S : string;
     X,Y:integer;

begin
    Assign(InF,'FAKS.DAT');
    reset(InF);FakSay:=0;
    While not Eof(InF) do begin
       Readln(InF,S);
       inc(FakSay);
       Val(S,X,Y);
       Readln(InF,Fak[FakSay].FakAd);
       Fak[FakSay].ProgSay:=X;
       For Y:=1 to X do begin
          Readln(InF,S);
          Fak[FakSay].Prog[Y].ProgNo:=Copy(S,1,6);
          Delete(S,1,7);
          Fak[FakSay].Prog[Y].ProgAd:=S;
      end;
    end;
    close(InF);
    For X:=1 to FakSay do OrderFak(X);
    for X:=1 to FakSay do
        For Y:=1 to FAk[X].ProgSay do begin
           FAk[X].Prog[Y].BolKod:='00';
           FAk[X].Prog[Y].BolSayKod:='000';
        end;
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
procedure initProg;
Var K,i : integer;B:boolean;A:TProg;
begin
    BolSay:=Bolum.NuKod;
    IlOku;
    OkuFak; FakSel.init;
    If not Exists('PROGS.DAT') then begin
      K:=FakSel.SelectSingle('FAKULTEYI/YUKSEKOKULU SE€˜N˜Z','35@FAKULTE ADI',1, FakSay, SelectColor);
      PR.init(K);
      PR.Order;
      B:=PR.Selection(' PROGRAMLAR SE€˜M',
 		      '6@OSYM KOD@50@PROGARMIN ADIDERS˜N ADI', SelectColor);
      PR.Say:=0;
      if B then begin
        For i:=1 to Fak[PR.FNo].ProgSay do
          if SelArr[i] then begin
             inc(PR.Say);
             A:=PR.Prog[PR.Say];
             PR.Prog[PR.Say]:=Fak[PR.FNo].Prog[i];
             PR.Prog[PR.Say].BolKod:=A.BolKod;
             PR.Prog[PR.Say].BolSayKod:=A.BolSayKod;
          end;
        PR.Order;
        PR.Store;
        end;
      end;
      PR.Load;
      Univ:='€UKUROVA šN˜VERS˜TES˜';
      Fakulte:='';
      OGR^.Open;
      ReadUniv;
     ShowBolYil;
end;
procedure PadR(Var S : String; L : integer);
begin
  S:=S+Spaces(L);
  S[0]:=Chr(L)
end;

Procedure TBolProg.EditProgKod;
Var TC, CH  : Char;
    bl,Yer, L  : Word;
    EditRow, edKolon : Word;

Function SingleLine(Yer : Word):String;
Var T, S, V : String;
    Bl,L, G    : Word;
begin
    With PR.Prog[Yer] do begin
        S:=Progno;
        PadR(S,6);
        T:=S;
        S:=ProgAd;
        PadR(S,42);
        T:=T+' '+S;
        S:=BolKod;
        PadR(S,9);
        T:=T+' '+S;
        S:=BolSayKod;
        PadR(S,3);
        T:=T+' '+S;
    end;
    SingleLine:=T;
end;
procedure PrintProgs;
Var I, L, M : Word;
begin
    I:=1;
    EditRow:=1;
    ClrScr;
    For i:=1 to PR.Say do begin
       WriteStr(Form.FieldKol[1],EditRow , SingleLine(I), TextAttr);
       Inc(EditRow);
    end;
    EditRow:=1;
end;

function GoDown:boolean;
begin
    GoDown:=False;
    if (EditRow >=Say) then
      beep
    else begin
       Inc(EditRow);
       GoDown:=True;
    end;
end;
function GoUp:boolean;
begin
    GoUp:=False;
    if (EditRow <=1) then
      beep
    else begin
       Dec(EditRow);
       GoUp:=True;
    end;
end;
procedure GoLeft;
begin
    if (EdKolon = 1) and GoUp then
       EdKolon:=2
    else EdKolon:=1
end;
procedure GoRight;
begin
     if (EdKolon = 2) and GoDown then
       EdKolon:=1
    else EdKolon:=2
end;
Procedure BeginEdit;
Var L : Word;
begin
   EdKolon:=1;
   PrintProgs;
end;
procedure ReadKd;
var S : String;
begin
    if TC<>NULL then exit;
    if EdKolon<>1 then exit;
    S:=Prog[EditRow].BolKod;
    S:=S+'  '; S[0]:=Chr(2);
    InputStr(S,Form.FieldKol[3],EditRow,2, True, AllKar, 0, TC);
    if TC<>NULL then exit;
    S:=S+'  '; S[0]:=Chr(2);
    Prog[EditRow].BolKod:=S;
    GoRight;
end;
procedure ReadSayKd;
var S : String;
begin
    if TC<>NULL then exit;
    If EdKolon<>2 then exit;
    S:=Prog[EditRow].BolSayKod;
    S:=S+'   '; S[0]:=Chr(3);
    InputStr(S,Form.FieldKol[4],EditRow,3, True, AllKar, 0, TC);
    if TC<>NULL then exit;
    S:=S+'   '; S[0]:=Chr(3);
    Prog[EditRow].BolSayKod:=S;
    GoDown;GoLeft;
end;
begin
    OpenEditWindow('B™LšMLER˜N KULLANILAN KODLARINI G˜R˜N˜Z',
    '6@OSYM  @40@PROGRAM ADI@2@BOL KOD@2@SAYISAL KOD',
       'F1:B™LšM SE€@ESC:€IKIž',
       [ESC,UPKEY,DOWNKEY,F1],
       [],3,15);
   TC:=NULL;
   BeginEdit;
   repeat
       ReadKd;
       ReadSayKd;
       case TC of
	 ESC : begin CloseEdit; Store end;
         UPKEY : begin GoUp;TC:=NULL end;
         DOWNKEY:begin GoDown;TC:=NULL end;
         F1:begin Bl:=Bolum.BolumSec;PR.Prog[EditRow].BolKod:=Bolum.Kod(Bl);TC:=NULL end;
       end;
   Until (TC=ESC);
end;
{$F+}
Procedure Bos;
begin
end;
procedure BolumKodGir;
begin
   PR.EditProgKod
end;
procedure OgGir;
begin
 OgrGir
end;
procedure BolumYeniGir;
begin
 PR.ReInit;
end;
Procedure QuitProg;
begin
  While EDSP<>0 do CloseEdit;
  OGR^.DFile.CloseFile;
  Dispose(UYE, Done);
  Dispose(YYDRS, Done);
  Dispose(DRS, Done);
  Dispose(OGR, Done);
  Yariyil.done;
  clrscr;
  Halt;
end;
{$F-}
Var CH:Char;
begin
  ClrScr;
  MenuBar:=
  AddMenu('~DOSYA',ALT_D, 0, Bos,
       AddMenu('~B™LšM KOD G˜R   F1', F1, CmdBolumSec  , BolumKodGir,0,
       AddMenu('~BOLUM YENIDEN   F2', F2, CmdOgrGir  , BolumYeniGir,0,
       AddMenu('™¦RENC˜LER˜ G˜R  F3', F3, CmdBolumGir  , OgGir,0,
       AddMenu('€~IK       ALT_Q', ALT_Q  , CmdQuitProg  , QuitProg,0
       ,0)))),0);

    LinkMenu(0, MenuBar);
    DefineMainBox(MenuBar);
   fillwin(#178,16*Blue+LightGray);
   If Not Disk.ChangeDir then Halt;
   initprog;
Repeat
    ShowMenuBar(0);
    CH:=GetKeyCmd;
    fillwin(#178,16*Blue+LightGray);
    ShowBolYil;
    DoEvent(EventKey);
until false;
showCursor;
end.


end.
 {    PR.ReInit;}
OgrGir;
    PR.EditProgKod








