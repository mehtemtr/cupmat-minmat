unit  Ogis;
interface
uses OgrObj;
const MaxBim = 256;
  TDrsCollection_BimYer  = vmtHeaderSize + $34;
  TDrsCollection_InsBim  = vmtHeaderSize + $38;
  Type
       PDrsRec  = ^TDrsRec;
       TDrsRec  = record
	  Kod        : String[6];
	  Ad         : String[24];
	  Teorik     : Byte;
          Uygulama   : Byte;
	  AlanOgrSay : LongInt;
	  YYDSay     : Byte;
       end;
       TBim = String[3];
       PBimArray = ^TBimArray;
       TBimArray = Array[0..MaxBim-1] of TBim;

  PDrsCollection = ^TDrsCollection;
  TDrsCollection = object(TSortedCollection)
    BimSay    : Integer;
    Bim       : PBimArray;
    destructor  Done; virtual;
    function    BimYer(S : String): Integer;
    function    InsBim(S : String): Integer;
    function    KeyOf(Item: Pointer): String; Virtual;
  end;
  POgrCollection = ^TOgrCollection;
  TDrsCollection = object(TSortedCollection)
    BimSay    : Integer;
    Bim       : PBimArray;
    destructor  Done; virtual;
    function    BimYer(S : String): Integer;
    function    InsBim(S : String): Integer;
    function    KeyOf(Item: Pointer): String; Virtual;
  end;
{  const
   RIntKeyCollection: TStreamRec = (
    ObjType: 1500;
    VmtLink: Ofs(TypeOf(TIntKeyCollection)^);
    Load: @TIntKeyCollection.Load;
    Store: @TIntKeyCollection.Store);

  RKodCollection: TStreamRec = (
    ObjType: 1501;
    VmtLink: Ofs(TypeOf(TKodCollection)^);
    Load: @TIntKeyCollection.Load;
    Store: @TIntKeyCollection.Store);

  RIntKeyObj: TStreamRec = (
    ObjType: 1502;
    VmtLink: Ofs(TypeOf(TIntKeyObj)^);
    Load: @TIntKeyObj.Load;
    Store: @TIntKeyObj.Store);}

implementation
function TDrsCollection.BimYer(S : String): Integer; assembler;
asm
        LES     DI, S
	MOV	AX,ES:[DI]
	MOV	DX,ES:[DI+2]
        LES     DI,Self
        MOV     CX,ES:[DI].TDrsCollection.BimSay
        JCXZ    @@3
        LES     DI,ES:[DI].TDrsCollection.Bim
        MOV     BX,DI
        SHL     CX,1
        CLD
@@1:    REPNE   SCASW
        JCXZ    @@3
        TEST    CX,1
        JE      @@1
        XCHG    AX,DX
        SCASW
        XCHG    AX,DX
        LOOPNE  @@1
        JNE     @@3
        MOV     AX,DI
        SUB     AX,BX
        SHR     AX,1
        SHR     AX,1
        DEC     AX
        JMP     @@2
@@3:    MOV     AX,-1
@@2:
end;
function TDrsCollection.InsBim(S : String): Integer; assembler;
asm
        LES     DI, S
        PUSH    ES
        PUSH    DI
        LES     DI, Self
        PUSH    ES
        PUSH    DI
        MOV     DI,ES:[DI]
        CALL    DWORD PTR [DI].TDrsCollection_BimYer
        CMP     AX, -1
        JNE     @@2
        LES     DI, S
	MOV	CX, ES:[DI]
	MOV	DX, ES:[DI+2]
        LES     DI, Self
        INC     ES:[DI].TDrsCollection.BimSay
        MOV     AX, ES:[DI].TDrsCollection.BimSay
        MOV     BX, AX
        MOV     BH, BL
        SHL     BL,1
        ADD     BL, BH
        XOR     BH, BH
        MOV     ES:[DI+BX],CX
        MOV     ES:[DI+BX+2], DX
@@2:
end;
function  TDrsCollection.KeyOf(Item: Pointer): String;Assembler;
Asm
        LES     DI, Item
        XOR     BX, BX
	MOV	BL, ES:[DI]
	MOV	AX, ES:[DI+1]
        LES     DI, Self
        LES     DI, ES:[DI].TDrsCollection.Bim
        MOV     CX, ES:[DI+BX]
        MOV     BX, ES:[DI+BX+2]
        MOV     DL, AL
        SHR     AL, 1
        SHR     AL, 1
        SHR     AL, 1
        SHR     AL, 1
        ADD     AL, 48
        AND     DL, 15
        ADD     DL, 48
        XCHG    AH, DH
        ADD     DL, 48
        LES     DI, @Result
        MOV     ES:[DI], CX
        MOV     ES:[DI+2], BX
        MOV     ES:[DI+4], AX
        MOV     ES:[DI+6], DL
end;
destructor TDrsCollection.Done;
begin
    FreeMem(Bim, SizeOf(TBimArray));
    Inherited done
end;
begin
{  RegisterType(RKodCollection);
  RegisterType(RIntKeyCollection);
  RegisterType(RIntKeyObj);}
end.


type
    Tbim = String[3];
    PbimArray = ^TBimArray;
    TBimArray = Array[0..MaxBim-1] of TBim;
    Tdrs = object(TObject)
       bimsay : Integer;
       Bim    : PBimArray;
       procedure Error(Code, Info: Integer); virtual;
       function  BimYer(S:String):Integer; virtual;
       function  InsBim(S : String) : Integer; virtual;
     end;



procedure dc;near; assembler;
asm
  {AL hi al lo ah lo}
  MOV   BL, AL
  SHR   AL, 1
  SHR   AL, 1
  SHR   AL, 1
  SHR   AL, 1
  ADD   AL, 48
  AND   BL, 15
  ADD   BL, 48
  AND   AH, 15
  ADD   AH, 48
end;
function cnv(A :Word):String;assembler;
asm
   MOV   AX, A
   CALL  DC
   LES DI, @Result
   mov cl,3
   mov es:[di],cl
   mov es:[di+1],al
   mov es:[di+2],bl
   mov es:[di+3],Ah
end;
function SIKISTIR(Var S ):Word;assembler;
asm
   LES DI, S
   Mov AL,es:[DI]
   sub al,48
   mov ah, es:[di+1]
   sub ah,48
   shl al,1
   shl al,1
   shl al,1
   shl al,1
   add al, ah
   mov ah, es:[Di+2]
   sub ah,48
end;

procedure Tdrs.error;
begin
abstract
end;


Var I,j,k : Byte;
s:string;d:char;  B, A:Word;
begin
clrscr;
  for I:=0 to 9 do
      for j:=0 to 9 do
          for k:=0 to 9 do begin
              A:=(16*i)+J+256*k;
              S:=cnv(A);
              B:=sikistir(S[1]);
              if A<>B{S<>chr(I+48)+chr(j+48)+chr(K+48)} then begin
                  writeln(S);
                  readln;
              end;
  end;
  end.


         destructor Done; virtual;
{$04}    procedure  Error(Code, Info: Integer); virtual;
{$08}    procedure  FreeItem(Item: Pointer); virtual;
{$0C}    function   GetItem(var S: TStream): Pointer; virtual;
{$10}    function   IndexOf(Item: Pointer): Integer; virtual;
{$14}    procedure  Insert(Item: Pointer); virtual;
{$18}    procedure  PutItem(var S: TStream; Item: Pointer); virtual;
{$1C}    procedure  SetLimit(ALimit: Integer); virtual;
{$20}    function   Compare(Key1, Key2: Pointer): Integer; virtual;
{$24}    function   IndexOf(Item: Pointer): Integer; virtual;
{$28}    procedure  Insert(Item: Pointer); virtual;
{$2C}    function   KeyOf(Item: Pointer): Pointer; virtual;
{$30}    function   Search(Key: Pointer; var Index: Integer): Boolean; virtual;
 POgisObj = ^TOgisObj;
       TOgIsObj = Object(TObject)
          Key  : Array[0..3] of Byte;
          Data : Record end;
          constructor  Init( Var Rec);
          function     GetKey : String; virtual;
          function     GetAd  : String; virtual;
          procedure    PutKey(S : String) ; virtual;
          procedure    PutAd(S:String); virtual;
          constructor  Load(var S: TStream);
          procedure    Store(var S: TStream);
          procedure    Show(Color : Byte);virtual;
          procedure    Showline(Color : Byte);virtual;
  end;

  constructor TOgisObj.Init( Var Rec);
begin
  Inherited Init;
  FillChar(Key, SizeOf(key),#0);
  Move(Rec, Data, SizeOf(Self) - SizeOf(TObject)-2);
end;
constructor  TOgisObj.Load(var S: TStream);
begin
   Inherited init;
   S.Read(Key,SizeOf(Self) - SizeOf(TObject));
end;
procedure TOgisObj.Store(var S: TStream);
begin
   S.Write(Key,SizeOf(Self) - SizeOf(TObject));
end;
Procedure   TOgisObj.Show(Color : Byte);
begin
  Abstract;
end;
Procedure   TOgisObj.Showline(Color : Byte);
begin
  Abstract;
end;
function   TOgisObj.GetKey;
begin
  Abstract;
end;
function TOgisObj.GetAd;
begin
  Abstract;
end;
procedure TOgisObj.PutKey;
begin
  Abstract;
end;
procedure TOgisObj.PutAd;
begin
  Abstract;
end;


destructor TOgisCollection.Done;
begin
  FreeAll;
  SetLimit(0);
end;


function TOgisCollection.KeyOf(Item: Pointer): String; assembler;
asm
        MOV     AX,Item.Word[0]
        MOV     DX,Item.Word[2]
end;

function TOgisCollection.Compare(Key1, Key2: String): Integer;
 begin
    Compare:=0;{StrComp(PString(Key1)^,PString(Key2)^)}
end;

procedure TOgisCollection.Cikar(Key: String);
var
  I: Integer;
begin
  if Search(Key, I) then AtFree(I);
end;
procedure TOgisCollection.Giris;

begin
  Abstract;
end;
function TDrsObj.GetKey;Assembler;
asm
     LES    DI, Self
     XOR    BX, BX
     MOV    BL, BYTE PTR ES:[DI].TOgIsObj.Key[0]
     MOV    DX, WORD PTR ES:[DI].TOgIsObj.Key[1]
     LES    SI, Bim
     MOV    AX, WORD PTR ES:[DI+BX]
     MOV    BL, ES:[DI+BX+2]
     MOV    CX, 0604H
     MOV    BH, DL
     SHR    BH, CL
     ADD    BH, 48
     AND    DL, 15
     SHR    DH, CL
     ADD    DX, 3030H
     LES    DI, @Result
     CLD
     MOV    ES:[DI],CH
     INC    DI
     STOSW
     MOV    AX, BX
     STOSW
     MOV    AX, BX
     STOSW
end;
function BimKod: Integer; near; assembler;
asm
        LES     DI, Bim
        MOV     CX, ES:[DI]
        JCXZ    @@3
        SHL     CX,1
        MOV     BX, DI
        CLD
@@1:    REPNE   SCASW
        JCXZ    @@3
        TEST    CX,1
        JE      @@1
        XCHG    AX,DX
        SCASW
        XCHG    AX,DX
        LOOPNE  @@1
        JNE     @@3
        MOV     AX,DI
        SUB     AX,BX
        SHR     AX,1
        SHR     AX,1
        DEC     AX
        JMP     @@2
@@3:    MOV     AX,-1
@@2:
end;
procedure   TDrsObj.PutKey;Assembler;
asm
     LES    DI, S
     MOV    AX, ES:[DI+1]
     MOV    DL, ES;[DI+3]
     XOR    DH, DH
     CALL   BimKod
     CMP    AX, -1
     JNE    @@2
     MOV    BX,
     LES    DI, Bim
     INC    ES:[DI]
     MOV    BX, ES:[DI]
     SHL    BX, 1
     SHL    BX, 1
     MOV    AX, ES:[DI+BX]
     MOV    DH, ES:[DI+BX+2]
@@2:
     LES    DI, S
     MOV    BX, ES:[DI+4]
     MOV    DL, ES;[DI+6]
     LES    DI, Self
     MOV    ES:[DI].TOgIsObj.Key[0], AL
     SUB    BX, 3030H
     SUB    DL, 30H
     MOV    AL, BL

     MOV    DX ,WORD PTR ES:[DI].TOgIsObj.Key[1]
     LES    SI, Bim
     MOV    AL, ES:[DI+BX]
     MOV    AH, ES:[DI+BX+1]
     MOV    BL, ES:[DI+BX+2]
     MOV    CX, 0604H
     MOV    BH, DL
     SHR    BH, CL
     ADD    BH, 48
     AND    DL, 15
     SHR    DH, CL
     ADD    DX, 3030H
     LES    DI, @Result
     CLD
     MOV    ES:[DI],CH
     INC    DI
     STOSW
     MOV    AX, BX
     STOSW
     MOV    AX, BX
     STOSW
end;