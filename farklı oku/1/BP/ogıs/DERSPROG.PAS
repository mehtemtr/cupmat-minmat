 uses SU,Crt,Dos,Printer;
 const
   Donem = '1990-91 BAHAR YARIYILI ';
   Btop1 = 'ษอออออออออออหออออออออออออหออออออออออออหออออออออออออหออออออออออออหออออออออออออป';
   Btop2 = 'บSAATLER    บ  PAZARTES บ    SALI    บ  €ARAMBA  บ  PEREMBE  บ    CUMA    บ';
   Bara  = 'ฬอออออออออออฮออออออออออออฮออออออออออออฮออออออออออออฮออออออออออออฮออออออออออออน';
   Bempty= 'บ           บ            บ            บ            บ            บ            บ';
   BBosCell = '            บ';
   BIlkCell ='บ           บ';

   Bbottom='ศอออออออออออสออออออออออออสออออออออออออสออออออออออออสออออออออออออสออออออออออออผ';
   BSaatLer:Array[1..10] of String =('บ 8:00- 8:45บ','บ 8:55- 9:40บ',
                                    'บ 9:50-10:35บ','บ10:45-11:30บ',
                                    'บ11:40-12:25บ','บ13:30-14:15บ',
                                    'บ14:25-15:10บ','บ15:20-16:05บ',
                                    'บ16:15-17:00บ','บ17:10-17:55บ');



   FreeCol = 62;
   GunAd : Array[1..5] of String=('PAZARTES','SALI','€ARAMBA','PEREMBE','CUMA');
   top1 = 'ษออหออออออออออหออออออออออหออออออออออหออออออออออหออออออออออป';
   top2 = 'บSTบ PAZARTESบ   SALI   บ €ARAMBA บ PEREMBE บ   CUMA   บ';
   ara  = 'ฬออฮออออออออออฮออออออออออฮออออออออออฮออออออออออฮออออออออออน';
   empty= 'บ  บ          บ          บ          บ          บ          บ';
   BosCell = '          บ';
   bottom='ศออสออออออออออสออออออออออสออออออออออสออออออออออสออออออออออผ';
   SaatLer:Array[1..10] of String =('บ 1บ','บ 2บ',
                                    'บ 3บ','บ 4บ',
                                    'บ 5บ','บ 6บ',
                                    'บ 7บ','บ 8บ',
                                    'บ 9บ','บ10บ');

      type
        Str6 = String[6];
        Str4 = String[4];
        Str2 = String[2];
        Form = Record
           D, A,U, G : String;
        end;

 {  GLOBAL VARIABLES }
Var
    EdRow, EdCol : Byte;
    ActBol, ActClass, ActGun, ActSaat : Byte;
    InsForm : Boolean;
    UpDate  : Boolean;
Type WinRecType = Record
     WMax, WMin : Word;
end;
Var WinRec : WinRecType;
    Color  : Byte;
const
   MaxBol = 5;
   MaxClass = 4;
   MaxGun  = 5;
   MaxSaat = 10;
   MaxProg = 2*MaxBol*MaxClass*MaxGun*MaxSaat;
   MaxOut = 200;
   Type OutStrType = Array[0..200] of String[80];

   type
        ProgType = record
            Fwd, Bwd  : Integer;
            Ders      : Str6;
            Uye, Sinif: Str4;
            Grup      : Char;
        end;
        EdProgState = Record
           Bol, Sinif, Gun , Saat : Byte;
        end;

   Var
     ProgState : EdProgState;
     Prog : Array[0..MaxProg] of ProgType;
     ProgPtr : Array[1..MaxBol, 1..MaxClass,1..MaxGun,1..MaxSaat] of integer;
     ProgFileName : String;
     EdProg  : Integer;
     CopyF   : Form;
     BolSay  : Integer;
     Bol     : Array[1..10] of String;
     SecBol  : Array[1..MaxBol] of Boolean;
     SS      : Array[1..MaxBol] of Byte;
     SinifSec: Array[1..MaxBol] of Boolean;
     OutStr  : ^OutStrType;
Function EscBasim:boolean;
var C : Char;
begin
    C:=NULL;EscBasim:=False;
    While (KeyPressed) do
       C:=GetKey;
    if C=ESC then EscBasim:=True;
end;
Procedure FindLocation;
begin
      EdCol:=5+11*(ActGun-1);
      EdRow:=3+2*(ActSaat-1);
end;
Procedure AdjustForm(Var F : Form );
begin
    with F do begin
       PadL(D,6,' ');
       PadL(U,4,' ');
       PadL(A,4,' ');
       G:=G+' ';G[0]:=#1;
    end;
end;
Procedure SaveCell;
begin
   FindLocation;
   SaveScreen(EdCol,EdRow,EdCol+12,EdRow+3);
end;
Procedure RestoreCell;
begin
   FindLocation;
   RestoreScreen(EdCol,EdRow,EdCol+12,EdRow+3);
end;

Procedure PrintForm( Var F : Form);
  Var S:String;
  begin
      FindLocation;
      AdjustForm(F);
      Str(ActSaat:2,S);
      S:=GunAd[ActGun]+'-'+S;
      S:=S+Spaces(13);
      S:=Copy(S,1,12);
      With F do begin
         writeXY('          ',EdCol,EdRow,White,Red);
         writeXY(S,EdCol,EdRow,LightGreen,Red);
         writeXY('            ',EdCol,EdRow+1,White,Red);
         writeXY(D+'  '+A,EdCol,EdRow+1,White,Red);
         writexy(#219,EdCol+12,EdRow+1,Black,LightGray);
         writeXY('            ',EdCol,EdRow+2,White,Red);
         If G=' ' then
              writeXY(U,EdCol,EdRow+2,White,Red)
         else
              writeXY(U+'  '+G+'.GRUP',EdCol,EdRow+2,White,Red);
         Writexy(#219,EdCol+12,EdRow+2,Black,LightGray);
         writexy(constStr(#219,12),EdCol+1,EdRow+3,Black,LightGray);
      end;
      colorscrn(White,Red);
  end;



Procedure InputStrX(Var S : String;
		   X,Y,L : Byte;
		   Exact : Boolean;
		   Term  : CharSet;
		   Target: String;
		Var TC   : Char);
begin
    If TC <> NULL then exit;
    InputStr(S, X,Y,L,Exact,Term,Target, TC);
end;

Function EditForm(Var F : Form; Term : CharSet):Char;
Var TC: Char;
begin
    SaveCell;
    PrintForm(F);

    repeat
          InputStr(F.D,EdCol,EdRow+1,6,False,Term,AllKar,TC);
          InputStrX(F.A,EdCol+8,EdRow+1,4,False,Term,AllKar,TC);
          InputStrX(F.U,EdCol,EdRow+2,4,False,Term,AllKar,TC);
          InputStrX(F.G,EdCol+6,EdRow+2,1,False,Term,NumericStr+' ',TC);
          PrintForm(F);
    until TC<>NULL;
    RestoreCell;
    EditForm:=TC;
end;

Procedure NillForm(Var F : Form);
Begin
    With F do begin
       D:=Spaces(6);
       A:=Spaces(4);
       U:=Spaces(4);
       G:=' '
      end;
end;
Procedure GetProg(Var F : Form);
begin
    EdProg:=ProgPtr[ActBol,ActClass,ActGun,ActSaat];
    NillForm(F);
    If Edprog <> 0 then
       With F do
        with Prog[EdProg] do Begin
          D:=Ders;
          U:=Uye;
          A:=Sinif;
          G[1]:=Grup;
       end;
end;

Procedure SetProg(F : Form);
begin
    ProgPtr[ActBol,ActClass,ActGun,ActSaat]:=EdProg;
    With F do
      with Prog[EdProg] do Begin
          Ders:=D;
          Uye:=U;
          Sinif:=A;
          Grup:=G[1];
       end;
end;
Function NewRec:Integer;
Var
   FFree, Deltd : Integer;
Begin
   With Prog[0] do begin
      FFree:=Fwd; Deltd:=Bwd;
      If Deltd=0 then begin
         If FFree>MaxProg then begin
            Complain('PROGRAM COK BUYUK');
            NewRec:=0;
            exit
         end;
         NewRec:=FFree;
         Inc(Fwd);
         exit
      end;
   end;
   NewRec:=Deltd;
   With Prog[Deltd] do begin
       Fwd:=0;Deltd:=Bwd;Bwd:=0;
   end;
   Prog[0].Bwd:=Deltd
end;
Procedure ReleaseRec(X :Integer);
Var
   FFree, Deltd : Integer;
Begin
   With Prog[0] do begin
      FFree:=Fwd; Deltd:=Bwd; Bwd:=X;
   end;
   With Prog[X] do begin
       Fwd:=-1;Bwd:=Deltd
   end;
end;
Function Search( F : Form; Var X : Integer):Boolean;
begin
    Search:=False;
    If EdProg = 0 then exit;
    X:=Edprog;
    Repeat
       with Prog[X] do
        with F do begin
           If (Ders=D) and (G[1]=Grup) then begin
              Search:=True;
              Exit
           end;
           X:=Fwd;
       end;
    Until X=EdProg;
end;


Procedure InsProg(Var F:Form);
Var X, B :Integer;
begin
   If Search(F,X) then
      SetProg(F)
   else begin
      If F.D='      ' then exit;
      X:=NewRec;
      If X = 0 then exit;
      If EdProg = 0 then begin
        EdProg := X;
        ProgPtr[ActBol,ActClass,ActGun,ActSaat]:=EdProg;
        SetProg(F);
        With Prog[EdProg] do begin Fwd:=EdProg; Bwd:=EdProg end;
      end
      else begin
        B:=Prog[EdProg].Bwd;
        Prog[X].Fwd:=EdProg;
        Prog[EdProg].Bwd:=X;
        Prog[X].Bwd:=B;
        Prog[B].Fwd:=X;
        EdProg:=X;
        SetProg(F);
        ProgPtr[ActBol,ActClass,ActGun,ActSaat]:=EdProg;
      end;
   end;
end;
Procedure DelProg(Var F:Form);
Var X, Bc,Fr :Integer;
begin
   If Not Search(F,X) then
      Complain('BU KODLU VE GRUP DA BIR DERS YOK')
   else begin
      If F.D='      ' then exit;
      With Prog[X] do begin
          Bc:=Bwd; Fr:=Fwd;
      end;
      Prog[Bc].Fwd:=Fr;
      Prog[Fr].Bwd:=Bc;
      ReleaseRec(X);
      If (Fr = Bc) and (X = Fr) then begin
          EdProg:=0;
          ProgPtr[ActBol,ActClass,ActGun,ActSaat]:=0;
          NillForm(F);
      end else begin
        EdProg := Fr;
        ProgPtr[ActBol,ActClass,ActGun,ActSaat]:=EdProg;
        GetProg(F);
      end
   end
end;
Procedure NextProg(Var F : Form);
begin
    If Edprog=0 then
      beep
    else begin
       EdProg:=Prog[EdProg].Fwd;
       ProgPtr[ActBol,ActClass,ActGun,ActSaat]:=EdProg;
       GetProg(F);
    end;
end;
Procedure PrevProg(Var F : Form);
begin
    If Edprog=0 then
      beep
    else begin
       EdProg:=Prog[EdProg].Bwd;
       ProgPtr[ActBol,ActClass,ActGun,ActSaat]:=EdProg;
       GetProg(F);
    end;
end;


Procedure GoUp(Var F : Form);
begin
   If ActSaat=1 then
      beep
   else begin
      Dec(ActSaat);
      GetProg(F);
   end;
end;
Procedure GoDown(Var F:Form);
begin
   If ActSaat = MaxSaat then
      beep
   else begin
      Inc(ActSaat);
      GetProg(F);
   end;
end;
Procedure GoLeft(Var F:Form);
Begin
   If ActGun = 1 then
      if ActSaat = 1 then
         beep
      else begin
         ActGun:=MaxGun; Goup(F);
      end
   else begin
      Dec(ActGun);
      GetProg(F);
   end;
end;
Procedure GoRight(Var F:Form);
Begin
   If ActGun = MaxGun then
      if ActSaat = MaxSaat then
         beep
      else begin
         ActGun:=1; GoDown(F);
      end
   else begin
      Inc(ActGun);
      GetProg(F);
   end;
end;

Procedure PrevSameCell;
begin
   If Prog[EdProg].Bwd=0 then
     beep
   else
     EdProg:=Prog[EdProg].Bwd
end;

Procedure InitProg;
begin
    ProgFileName :='';
    FillChar(ProgPtr, SizeOf(ProgPtr),#0);
    FillChar(Prog   , SizeOf(Prog),#0);
    With Prog[0] do begin
      Fwd:=1; Bwd:=0
    end;
    ActBol:=1;
    ActClass:=1;
    ActGun:=1;
    ActSaat:=1;
    GetMem(OutStr,SizeOf(OutStrType));
end;

Function  Exists(FileName : String) : Boolean;
var
  SR : SearchRec;
begin
  FindFirst(FileName, ReadOnly + Hidden + SysFile, SR);
  Exists := (DosError = 0) and (Pos('?', FileName) = 0) and
	    (Pos('*', FileName) = 0);
end; { Exists }

function DirExists(DirName : String) : Boolean;
var
  SR : SearchRec;
begin
  FindFirst(DirName, Directory, SR);
  DirExists := (DosError = 0) and (Pos('?', DirName) = 0) ;
end; { DirExists }

Procedure SaveWinRec;
begin
   With WinRec do begin
      WMax:=WindMax;
      WMin:=WindMin;
   end;
end;
Procedure RestoreWinRec;
begin
   With WinRec do begin
      WindMax:=WMax;
      WindMin:=WMin;
   end;
end;
Procedure SaveColor;
Begin
    Color:=TextAttr;
end;
Procedure RestoreColor;
begin
    TextAttr:=Color;
end;
Procedure ShaDowWindow(X1,Y1,X2,Y2, Txt, Bck : Byte);
  var I, L,R : Byte;
  begin
      SaveWinRec;
      Window(X1,Y1,X2-1,Y2-1);
      ColorScrn(Txt,Bck);
      ClrScr;
      ResToreWinRec;
      L:=X2-X1+1;R:=Y2-Y1+1;
      For I:=2 to R do WriteXY(#219,X2,Y1 + I -1, Black,LightGray);
      WriteXY(constStr(#219,L-1),X1+1,Y2,Black,LightGray);
end;
Procedure ReadProg;
var TC : Char;
    X : Byte;
    S : String;
    D : DirStr;
    N : NameStr;
    E : ExtStr;
    F : File;
    Result : Integer;
begin
    Beep;
    SaveColor;
    SaveScreen(2, 5, 60,10);
    ShadowWinDow(2,5,60,10,LightGreen,Yellow);
    WriteXY('PROGRAM DOSYASI YUKLEME',3,6,White,Red);
    PromptCmdLine('ESC:Exit');
    GotoXY(3,7);
    Write('PROGRAM DOSYASI ADI : ');
    X:=WhereX;
    InputStr(ProgFileName,X,7,20,False,[ESC],AllKar,TC);
    if TC = NULL then begin
         FSplit(ProgFileName, D, N, E);
         ProgFileName:=D+N+'.PRG';
         S:=D+N+'.PTR';
       If  ( Not Exists(ProgFileName)) or ( Not Exists(S) ) then
          Complain('BU DOSYA BULUNAMADI')
       else begin
          Assign(F,ProgFileName);
          Reset(F,SizeOf(Prog));
          BlockRead(F,Prog,1,Result);
          close(F);
          Assign(F,S);
          Reset(F,SizeOf(ProgPtr));
          BlockRead(F,ProgPtr,1,Result);
          close(F);
       end;
    end;
    ResToreScreen(2,5,60,10);
    RestoreColor;
end;

Procedure WriteProg;
var TC : Char;
    X : Byte;
    S : String;
    D : DirStr;
    N : NameStr;
    E : ExtStr;
    F : File;
    Result : Integer;
begin
    Beep;
    SaveColor;
    SaveScreen(2, 5, 60,10);
    ShadowWinDow(2,5,60,10,LightGreen,Yellow);
    WriteXY('PROGRAM DOSYASI SAKLAMA',3,6,White,Red);
    PromptCmdLine('ESC:Exit');
    GotoXY(3,7);
    Write('PROGRAM DOSYASI ADI : ');
    X:=WhereX;
    InputStr(ProgFileName,X,7,20,False,[ESC],AllKar,TC);
    if TC = NULL then begin
       FSplit(ProgFileName, D, N, E);
       ProgFileName:=D+N+'.PRG';
       S:=D+N+'.PTR';
       TC := 'E';
       If  ( Exists(ProgFileName)) or ( Exists(S) ) then begin
           beep;
           PromptCmdLine('BU DOSYA ZATEN VAR UZERINE YAZAYIM MI?(E/H)');
           TC:=GetDesiredKey(['E','e','h','H']);
        end;
        If TC = 'E' then begin
           Assign(F,ProgFileName);
           ReWrite(F,SizeOf(Prog));
           BlockWrite(F,Prog,1,Result);
           close(F);
           Assign(F,S);
           ReWrite(F,SizeOf(ProgPtr));
           BlockWrite(F,ProgPtr,1,Result);
           close(F);
        end
    end;
    ResToreScreen(2,5,60,10);
    RestoreColor;
end;
Procedure PrintCell;
  Var S:String;
      X : Integer;
      I : Byte;
  begin
      SaveColor;
      SaveWinRec;
      Window(FreeCol,2,FreeCol+18,18);
      ColorScrn(Yellow,LightGray);
      clrscr;
      If EdProg = 0 then begin
         RestoreWinRec;
         RestoreColor;
         Exit;
      end;
      Str(ActSaat:2,S);
      S:=GunAd[ActGun]+'-'+S;
      S:=S+Spaces(13);
      S:=Copy(S,1,12);
      writeXY('          ',1,2,LightGreen,Magenta);
      writeXY(S,1,2,LightGreen,Magenta);
      X:=EdProg; I:=3;
      Repeat
         with Prog[X] do begin
            writeXY('          ',1,I,LightGreen,Magenta);
            writeXY(Ders+'  '+Sinif,1,I,LightGreen,Magenta);
            writexy(#219,13,I,Black,LightGray); Inc(I);
            writeXY('          ',1,I,LightGreen,Magenta);
            If Grup=' ' then
              writeXY(Uye+'        ',1,I,LightGreen,Magenta)
            else
              writeXY(Uye+'  '+Grup+'.GRUP',1,I,LightGreen,Magenta);
             Writexy(#219,13,I,Black,LightGray);Inc(I);
             if Fwd<> EdProg then begin
                  WriteXY(Copy(Cizgi,1,12),1,I,White,Magenta);
                  writexy(#219,13,I,Black,LightGray);
                  Inc(I);
             end;
             X:=Fwd;
         end;
      until X=EdProg;
      writexy(constStr(#219,12),2,I,Black,LightGray);RestoreWinRec;
   RestoreColor;
  end;

Procedure PrintCopyCell;
Var I:Byte;
  begin
      SaveColor;
      SaveWinRec;
      Window(FreeCol,20,FreeCol+18,24);
      ColorScrn(Yellow,LightGray);
      clrscr;
      writeXY('            ',1,2,LightBlue,Yellow);
      writeXY('KOPYA ',1,2,LightBlue,Yellow);
      I:=3;
      With CopyF do begin
        writeXY('  `        ',1,I,LightBlue,Yellow);
        writeXY(D+'  '+A,1,I,LightBlue,Yellow);
        writexy(#219,13,I,Black,LightGray); Inc(I);
        writeXY('          ',1,I,LightBlue,Yellow);
        If G=' ' then
              writeXY(U+'        ',1,I,LightBlue,Yellow)
        else
              writeXY(U+'  '+G+'.GRUP',1,I,LightBlue,Yellow);
        Writexy(#219,13,I,Black,LightGray);Inc(I);
      end;
      writexy(constStr(#219,12),2,I,Black,LightGray);RestoreWinRec;
   RestoreColor;
  end;
Procedure BolSinSec(Var F : Form);
var I : Byte;
    TC : Char;
begin
    SaveScreen(5,5,70,20);
    SaveColor;
    ShaDowWindow(5,5,60,20,White, Yellow);
    PromptCmdLine('BOLUMU YON TUSLARI ILE SECINIZ@ F1 : SINIF @ ESC : EXIT');
    Repeat
       PrintXY('SINIF = ',6,6);
       Write(ActClass:2);
       PrintXY('BOLUM = '+Bol[ActBol],WhereX+1,6);
       Writeln;
       PrintXY('BOLUMLER',6,8);
       for i:=1 to BolSay do
          If I=ActBol Then
              IPrintXY(Bol[I],6,I+8)
          else
              PrintXY(Bol[I],6,I+8);
      GotoXY(6,ActBol+8);
      TC:=GetDesiredKey([UpKey,DownKey,ESC,F1]);
      Case Tc of
         ESC : begin
                 RestoreScreen(5,5,70,20);
                 RestoreColor;
                 ActGun:=1;ActSaat:=1;
                 GetProg(F);
                 exit;
                end;
         F1  : begin
                 Inc(ActClass); if ActClass>4 then ActClass:=1;
               end;
         Upkey: begin
                  Dec(ActBol); if ActBol<1 then ActBol:=BolSay;
                end;
         Downkey: begin
                  Inc(ActBol); if ActBol>BolSay then ActBol:=1;
                end;
      end;
    until False;
end;
procedure ShowLastline;
Var S : String;
begin
  PromptCmdLine('F1:DOSYA@F2:BOL/SNF@F3:CIKAR@F4:EKLE@F5:KOPYA@F6:PASTE@F7:DIGER DERS@ESC:EXIT');
  Str(ActClass,S);
  writeXY('BOLUM : '+Bol[ActBol]+' '+S+'.SINIF',1,24,Yellow,Blue);
end;


Function SinifAdi(X : Byte):String;
Var S : String;
begin
   If X<=4 then begin
      Str(X:4,S);
      S:=S+'.SINIF      '
   end else
      S:='  BUTUN SINIFLAR';
   SinifAdi:=S;
end;
Function Olustur(BL,SN : Byte):Integer;
Var X,Y : Array[1..MaxGun] of Integer;
    GN,ST : Byte;
    K : Integer;
    S : String;

Function AllFinished:Boolean;
Var R : Boolean;
    I: Byte;
begin
    R:=True;
    for I:=1 to MaxGun do begin
        if (X[I]=Y[I]) then begin X[I]:=0; Y[I]:=0 end;
        R:=R and (X[I]=Y[I]);
    end;
    AllFinished:=R;
end;
begin
   Str(SN:1,S);
   OutStr^[0]:=Donem+Bol[BL]+' '+S+'.SINIF DERS PROGRAMI';
   OutStr^[1]:=BTop1;
   OutStr^[2]:=BTop2;
   K:=3;
   For ST:=1 To MaxSaat do begin
      OutStr^[K]:=BAra;
      OutStr^[K+1]:=BSaatler[ST];
      OutStr^[K+2]:=BIlkCell;
      For GN:=1 To 5 do begin X[GN]:=ProgPtr[BL,SN,GN,ST];Y[GN]:=X[GN] end;
      Repeat
          For GN:=1 To 5 do begin
             If Y[GN] = 0 then begin
                OutStr^[K+1]:=OutStr^[K+1]+BBosCell;
                OutStr^[K+2]:=OutStr^[K+2]+BBosCell;
             end
             else
                With Prog[Y[GN]] do begin
                   OutStr^[K+1]:=OutStr^[K+1]+Ders+'  '+Sinif+'บ';
                   If Grup = ' ' then
                         OutStr^[K+2]:=OutStr^[K+2]+Uye+'        บ'
                   else
                         OutStr^[K+2]:=OutStr^[K+2]+Uye+'  '+Grup+'.GRUPบ';
                   Y[GN]:=Fwd;
                 end;
          end;
          K:=K+2;
          OutStr^[K+1]:=BIlkCell;
          OutStr^[K+2]:=BIlkCell;
      until AllFinished;
      K:=K+1;
   end;
   OutStr^[K]:=BBottom;
   Olustur:=K;
end;
Procedure DetermineSinifSec(BL : Byte);
Var I : Byte;
begin
     if SS[BL]=5 then
        for I:=1 to 4 do SinifSec[I]:=True
     else begin
        for I:=1 to 4 do SinifSec[I]:=False;
        SinifSec[SS[BL]]:=True;
     end;
end;

procedure DiskeYaz;
var TC : Char;
    X : Byte;
    S : String;
    D : DirStr;
    N : NameStr;
    E : ExtStr;
    F : File;
    Result : Integer;
    PF   : Text;
    LineSay : Integer;
    Bl,SN,I,J : Byte;
begin
    Beep;
    SaveColor;
    SaveScreen(2, 5, 60,10);
    ShadowWinDow(2,5,60,10,LightGreen,Yellow);
    WriteXY('PROGRAMI DISKE YAZMA SERVISI',3,6,White,Red);
    PromptCmdLine('ESC:Exit');
    GotoXY(3,7);
    Write('PROGRAM DOSYASI ADI : ');
    X:=WhereX;
    InputStr(ProgFileName,X,7,20,False,[ESC],AllKar,TC);
    if TC = NULL then begin
       FSplit(ProgFileName, D, N, E);
       ProgFileName:=D+N+'.TXT';
       S:=D+N+'.PTR';
       TC := 'E';
       If  ( Exists(ProgFileName)) or ( Exists(S) ) then begin
           beep;
           PromptCmdLine('BU DOSYA ZATEN VAR UZERINE YAZAYIM MI?(E/H)');
           TC:=GetDesiredKey(['E','e','h','H']);
        end;
        If TC = 'E' then begin
           Assign(PF,ProgFileName);
           ReWrite(PF);
           For BL:=1 to BolSay do
               If SecBol[BL] then begin
                    DetermineSinifSec(BL);
                    For SN:=1 to 4 do
                        If SinifSec[SN] then
                           For J:=0 to Olustur(BL,SN) do
                               Writeln(PF,OutStr^[J]);

               end;
           close(PF);
        end
    end;
    ResToreScreen(2,5,60,10);
    RestoreColor;
end;

procedure YaziciyaYAz;
var TC : Char;
    X : Byte;
    S : String;
    D : DirStr;
    N : NameStr;
    E : ExtStr;
    F : File;
    Result : Integer;
    PF   : Text;
    LineSay : Integer;
    Bl,SN,I,J : Byte;
    CC:CHAR;
begin
    Beep;
    SaveColor;
    SaveScreen(2, 5, 60,10);
    ShadowWinDow(2,5,60,10,LightGreen,Yellow);
    WriteXY('PROGRAMI YAZICIYA YAZMA SERVISI',3,6,White,Red);
    PromptCmdLine('ESC:Exit');
    PrintXY('LUTFEN YAZICIYA KAGIT TAKINIZ ',3,7);
    PrintXY('HAZIR OLUNCA ENTER ',3,9);
    TC:=GetDesiredKey([ESC,#13]);
    if TC = #13 then begin
        For BL:=1 to BolSay do
           If SecBol[BL] then begin
               DetermineSinifSec(BL);
               For SN:=1 to 4 do
                   If SinifSec[SN] then begin
                      For J:=0 to Olustur(BL,SN) do
                          if escbasim then begin
                             message('BASIM KESILDI@ENTER:DEVAM@ESC:EXIT',10,10,[ESC,#13],CC);
                             If CC=ESC then begin
                                 ResToreScreen(2,5,60,10);
                                 RestoreColor;
                                 exit
                             end
                          end
                          else
                             Writeln(Lst,OutStr^[J]);
                      writeln(lst,#12);
                   end;
            end;
    end;
    ResToreScreen(2,5,60,10);
    RestoreColor;
end;


Procedure Dosya;
var I ,ed: Byte;
    TC,CH : Char;
procedure Rest;
begin
       RestoreScreen(3,3,70,20);
       RestoreColor;
end;

begin
    For I:=1 to MaxBol do begin
       SecBol[I]:=False;
       SS[I]:=5;
    end;
    SaveScreen(3,3,70,20);
    SaveColor;
    ShaDowWindow(3,3,60,20,White, Blue);
    PromptCmdLine('F1:PROG. SAKLA@F2:PROG OKU@F3:PROG DISKE BAS@F4:YAZICIDAN BAS@ESC:EXIT');
    TC:=GetDesiredKey([F1,F2,F3,F4,ESC]);
    Case TC of
       F1 : Begin Rest;WriteProg;end;
       F2 : begin Rest;ReadProg; end;
       F3,F4 : begin
            PromptCmdLine('F1:SINIF SECIMI@F2:BASIMA GEC@ENTER : BOLUM SECIMI@ESC:EXIT');
            Ed:=1;
            Repeat
               PrintXY('BOLUMU VE SINIFI SECINIZ',4,6);
               IF TC = f3 then
                  PrintXY('PROGRAM DISKE YAZILACAK',4,4)
               else
                  PrintXY('PROGRAM YAZICIYA GONDERILECEK',4,4);
               WriteXY(Copy(Cizgi,1,50),4,5,Red,Blue);
               PrintXY('BOLUMU VE SINIFI SECINIZ',4,6);
               PrintXY('BOLUMLER',4,7);
               for i:=1 to BolSay do
                  If SecBol[I] Then
                    IPrintXY(Bol[I]+SinifAdi(SS[I]),4,I+7)
                  else
                    PrintXY(Bol[I]+SinifAdi(SS[I]),4,I+7);
                  GotoXY(4,Ed+7);
                  CH:=GetDesiredKey([UpKey,DownKey,ESC,F1,F2,#13]);
                   Case CH of
                         #13 : SecBol[Ed]:=Not SecBol[Ed];
                         ESC : begin
                                  Rest;
                                  exit;
                               end;
                         F1  : begin
                                 Inc(SS[Ed]);
                                 if SS[Ed]>5 then SS[Ed]:=1;
                                end;
                         Upkey: begin
                                Dec(Ed); if Ed<1 then Ed:=BolSay;
                               end;
                         Downkey: begin
                                Inc(Ed); if Ed>BolSay then Ed:=1;
                                end;

                       F2      : begin
                                   Rest;
                                   if TC=f3 then DiskeYaz else YaziciyaYaz;
                                   exit;
                                 end;
                    end;
                   until False;
               end;

     end;
     Rest;
end;

Procedure PrintDers;
  Var S :String;
      F : Form;
  begin
      FindLocation;
      GetProg(F);
      AdjustForm(F);
      With F do  WriteXY(D+A,EdCol,EdRow+1,Yellow,LightGray);
  end;
Procedure PrintCourses;
begin
   For ActGun:=1 to 5 do
       For ActSaat:=1 to 10 do
          PrintDers;
   ActGun:=1;
   ActSaat:=1;
end;
Procedure DrawProgChart;
Var i,j:Integer;

begin
  ColorScrn(Yellow,LightGray);
  clrscr;
   writeln(top1);
   writeln(top2);
   for i:=1 to 10 do begin
      writeln(ara);
      write(saatler[i]);
      for j:=1 to 5 do write(boscell);
      writeln;
   end;
   writeln(bottom);
   PrintCourses;
end;





Procedure EditAllProg;
Var TC : Char;
    F  : Form;
begin
  ShowLastLine;
  GetProg(F);
  Repeat
     ProgFileName:='';
     PrintCell;
     PrintCopyCell;
     TC:=EditForm(F,[F1,F2,F3,F4,F5,F6,F7,F8,'>','.','<',',',UpKey,DownKey,LeftKey,RightKey,ESC]);
     If TC<>F3 then InsProg(F);
     PrintDers;
     Case TC of
        F4      : NillForm(F);
        RightKey,'>','.' : GoRight(F);
        LeftKey,'<',',' : GoLeft(F);
        UpKey   : GoUp(F);
        DownKey : GoDown(F);
        F7      :
                      if Edprog = 0 then
                         beep
                      else begin
                         EdProg:=Prog[EdProg].Fwd;
                         ProgPtr[ActBol,ActClass,ActGun,ActSaat]:=EdProg;
                         GetProg(F);
                      end;
        F5      : CopyF:=F;
        F6      : F:=CopyF;

        F2      : begin
                     BolSinSec(F);PrintCourses;GetProg(F);ShowLastLine;
                  end;
        F3      : DelProg(F);
        F1      : begin Dosya; PrintCourses;GetProg(F);ShowLastLine end;

     end;
  until TC = ESC;
  WriteProg;
  ColorScrn(LightGray,Black);
  ClrScr;
end;

begin
  BolSay:=5;
  BOL[1]:='BYOLOJ BLM              ';
  BOL[2]:='FZK BLM                 ';
  BOL[3]:='KMYA BLM                 ';
  BOL[4]:='MATEMATK BLM             ';
  BOL[5]:='TRK DL VE EDEBYATI BLM';
  NillForm(CopyF);
  InitProg;
  DrawProgChart;
  EditAllProg;
end.


Procedure Message( S: String; X,Y : Byte; Term : CharSet ; Var TC : Char);
var L,K, MesWdwX1,MesWdwY1,MesWdwX2,MesWdWY2 : Byte;

begin
    If S = '' then exit;
    ArgSplit(S,Delimeters,ArgSay);
    L:=0;
    for K:=1 to ArgSay do if L<Length(Arg^[K]) then L:=Length(Arg^[K]);
    MesWdwX1:=X; MesWdwY1:=Y; MesWdwX2:=X+L+1; MesWdWY2:=Y+ArgSay+1;
    SaveScreen(MesWdwX1,MesWdwY1,MesWdwX2,MesWdWY2);
    Frame(MesWdwX1,MesWdwY1,MesWdwX2,MesWdWY2);
    for K:=1 to ArgSay do
	begin
	   S:=Arg^[K];
	   L:=CenterOutput(S, MesWdwX1+1,MesWdwX2-1);
	   writeXY(S,L,Y+K,White,Red);
	end;
    Repeat
	Beep;
	TC:=GetKey;
    until TC In Term;
    RestoreScreen(MesWdwX1,MesWdwY1,MesWdwX2,MesWdWY2);
end;