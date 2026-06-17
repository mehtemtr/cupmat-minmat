
unit Obj;

{$F+,X+,I-}


interface
     uses Crt, Win, Exist, Dos;
const

{ TStream access modes }

  stCreate    = $3C00;           { Create new file }
  stOpenRead  = $3D00;           { Read access only }
  stOpenWrite = $3D01;           { Write access only }
  stOpen      = $3D02;           { Read and write access }

  OutOpenReadCur  = 1;
  OutOpenWriteCur = 2;
  OutOpenRead     = 3;
  OutOpenWrite    = 4;
  PrinterMode     = 5;
{ TStream error codes }

  stOk         =  0;              { No error }
  stError      = -1;              { Access error }
  stInitError  = -2;              { Cannot initialize stream }
  stReadError  = -3;              { Read beyond end of stream }
  stWriteError = -4;              { Cannot expand stream }
  stGetError   = -5;              { Get of unregistered object type }
  stPutError   = -6;              { Put of unregistered object type }
  stRecLenError= -7;              { RecLen error }
  stNotOpen  = -8;              { FileNotOpen }
  StGecersizKayit = -9;
  StDosyaDolu = -10;




{ VMT header size }

  vmtHeaderSize = 8;


   Const
    _TIMEOUT_PRT      =   $01;	               { Printer timeout		}
    _IOERROR_PRT      =   $08;	       { I/O error			}
    _ONLINE_PRT       =   $10;	       { Printer is online		}
    _NOPAPER_PRT      =   $20;	       { Printer is out of paper	}
    _ACK_PRT	      =   $40;	       { Printer acknowledged		}
    _NOTBUSY_PRT      =   $80;	       { Printer is not busy		}


ERRORSTAT = _TIMEOUT_PRT + _IOERROR_PRT + _NOPAPER_PRT;

  MaxTab = 10;
  MaxKey        = 2047;

type

{ Type conversion records }

  WordRec = record
    Lo, Hi: Byte;
  end;

  LongRec = record
    Lo, Hi: Word;
  end;

  PtrRec = record
    Ofs, Seg: Word;
  end;

{ String pointers }

  PString = ^String;

{ Character set type }

  PCharSet = ^TCharSet;
  TCharSet = set of Char;

{ General arrays }

  PByteArray = ^TByteArray;
  TByteArray = array[0..32767] of Byte;

  PCharArray = ^TCharArray;
  TCharArray = array[0..32767] of Char;

  PWordArray = ^TWordArray;
  TWordArray = array[0..16383] of Word;

{ TObject base object }

  PObject = ^TObject;
  TObject = object
    constructor Init;
    procedure Free;
    destructor Done; virtual;
  end;


{ TStream }

  PStream = ^TStream;
  TStream = object(TObject)
    Status: Integer;
    ErrorInfo: Integer;
    constructor Init;
    procedure CopyFrom(var S: TStream; Count: Longint);
    procedure Error(Code, Info: Integer); virtual;
    procedure Flush; virtual;

    function  GetPos: Longint; virtual;
    function  GetSize: Longint; virtual;

    procedure Read(var Buf; Count: Word); virtual;
    function  ReadStr: PString;
    procedure Reset;
    procedure Seek(Pos: Longint); virtual;


    procedure Truncate; virtual;
    procedure Write(var Buf; Count: Word); virtual;
    procedure WriteStr(P: PString);
  end;

{ DOS file name string }


  FNameStr = string[79];

{ TDosStream }

  PDosStream = ^TDosStream;
  TDosStream = object(TStream)
    Handle: Word;
    FName : FNameStr;
    constructor Init(FileName: FNameStr; Mode: Word);
    destructor Done; virtual;
    procedure Error(Code, Info: Integer); virtual;
    function   GetPos: Longint; virtual;
    function   GetSize: Longint; virtual;
    procedure  Read(var Buf; Count: Word); virtual;
    procedure  Seek(Pos: Longint); virtual;
    procedure  Truncate; virtual;
    procedure  Write(var Buf; Count: Word); virtual;
    Procedure  CloseToReset;
  end;

{ TBufStream }

  PBufStream = ^TBufStream;
  TBufStream = object(TDosStream)
    Buffer: Pointer;
    BufSize: Word;
    BufPtr: Word;
    BufEnd: Word;
    constructor Init(FileName: FNameStr; Mode, Size: Word);
    destructor Done; virtual;
    procedure  Flush; virtual;
    function   GetPos: Longint; virtual;
    function   GetSize: Longint; virtual;
    procedure  Read(var Buf; Count: Word); virtual;
    procedure  Seek(Pos: Longint); virtual;
    procedure  Truncate; virtual;
    procedure  Write(var Buf; Count: Word); virtual;
  end;
  PDataFile = ^DataFile;
  DataFile  =  object(TBufStream)
	FirstFree   : Word;
	Deltd       : Word;
	RecLen      : Word;
	MaxKay      : Word;
        Dt          : Record End;
	Constructor Init(FLName: FNameStr; MK, RL, Size : Word);
        Destructor  Done;Virtual;
	Procedure   Error(Code, Info: Integer);Virtual;
        Function    GecerliKayit( R : Word):Boolean;
	Procedure   WriteHeader;
	Procedure   ReadHeader;
	Function    GetRec(R     : Word; Var Buf):Boolean;
	Function    PutRec(R     : Word; Var Buf):Boolean;
	Function    AddRec(Var R : Word; Var Buf):Boolean;
	Function    NewRec: Word;
	Procedure   ReleaseRec(R : Word);
        Function    Git(Pos : Word):Boolean;
 end;


  POutPut = ^TOutPut;
  TOutPut = Object(TObject)
         Status      : Integer;
         Mode        : Integer;
         T           : Text;
         Constructor Init(FName, Title : String; Md: Integer);
         Destructor  Done; Virtual;
         Procedure   StatPrt;
         Function    WaitPrt:Boolean;
         procedure   BytePrt(ByteVal : byte);
         procedure   InitPrt;
         procedure   WritePrt(Str : string);
         Function    ReadText:String;
         Procedure   WriteText(S:String);
         Procedure   Error;
         Function    FileName : String;
      end;

 Cursor = object(TObject)
     ColSay          : Byte;
     EdY             : Word;
     EdX             : Byte;
     EdRow,EdCol     : Byte;
     Bas, Son        : Word;
     TabStop         : Array [1..MaxTab] of Byte;

     Constructor Init;
     Procedure   ShowLine(Yer : Word; Attr : Byte); Virtual;
     Procedure   PrintGuys(Attr : Byte);
     Procedure   CursorDown;
     Procedure   CursorUp;
     Procedure   CursorTab;
     Function    SelectSingle(Title, EdT : STRING;
                               Basla, Bitir : Word;
                               Attr : Byte):Word;
  end;
  PSelect = ^Select;
  Select = object(CurSor)
     Say, KeyL : Word;
     Constructor Init(KL : Word);
     Function    Search(S:String; Var Yer, Adr : Word):Boolean;Virtual;
     Function    BaslaKod : word;
     Function    Selection(Title, EdT : String; Attr : Byte): Boolean;Virtual;
  end;

      Function Expand(S : String):String;
      Function Filter(S : String):String;

function NewStr(const S: String): PString;
procedure DisposeStr(P: PString);

{ Longint routines }

function LongMul(X, Y: Integer): Longint;
inline($5A/$58/$F7/$EA);

function LongDiv(X: Longint; Y: Integer): Integer;
inline($59/$58/$5A/$F7/$F9);

{ Stream routines }


procedure Abstract;



  Function  InfoStr(Info : Integer):String;
  Procedure EraseFile(FName : String);
  Procedure RenameFile(FName1, FName2 : String);
  Function  CopyFile(Source, Dest : String):Boolean;
  Function  Diskete:String;
  Procedure CiktiDegis(S : String);
  Procedure BasimUniteSec(Var Drive : String);
  Procedure SetToYazici;
  Function  DisketTak(Title:String; Var Drive:String):Boolean;

const

{ Stream error procedure }

  StreamError: Pointer = nil;


 Var
  SelArr    : Array[0..MaxKey] of Boolean;
  Indis     : Array[1..MaxKey] of Word;
  InvInd    : Array[1..MaxKey] of Word;
  IndisSay  : Word;
  LPT       : POutPut;
  Cikti     : POutPut;


implementation



procedure Abstract;
begin
  RunError(211);
end;

{ TObject }

constructor TObject.Init;
type
  Image = record
    Link: Word;
    Data: record end;
  end;
begin
  FillChar(Image(Self).Data, SizeOf(Self) - SizeOf(TObject), 0);
end;


procedure TObject.Free;
begin
  Dispose(PObject(@Self), Done);
end;

destructor TObject.Done;
begin
end;


const
  StreamTypes: Word = 0;


{ TStream support routines }

const
  TStream_Error = vmtHeaderSize + $04;
  TStream_Flush = vmtHeaderSize + $08;
  TStream_GetPos  =vmtHeaderSize +$0C;
  TStream_GetSize =vmtHeaderSize +$10;
  TStream_Read  = vmtHeaderSize + $14;
  TStream_Seek  = vmtHeaderSize + $18;
  TStream_Truncate =vmtHeaderSize +$1C;
  TStream_Write = vmtHeaderSize + $20;

{ Stream error handler                                  }
{ In    AX    = Error info                              }
{       DX    = Error code                              }
{       ES:DI = Stream object pointer                   }
{ Uses  AX,BX,CX,DX,SI                                  }

procedure DoStreamError; near; assembler;
asm
        PUSH    ES
        PUSH    DI
        PUSH    DX
        PUSH    AX
        PUSH    ES
        PUSH    DI
        MOV     DI,ES:[DI]
        CALL    DWORD PTR [DI].TStream_Error
        POP     DI
        POP     ES
end;

{ TStream }

constructor TStream.Init;
begin
  TObject.Init;
  Status := 0;
  ErrorInfo := 0;
end;

procedure TStream.CopyFrom(var S: TStream; Count: Longint);
var
  N: Word;
  Buffer: array[0..1023] of Byte;
begin
  while Count > 0 do
  begin
    if Count > SizeOf(Buffer) then N := SizeOf(Buffer) else N := Count;
    S.Read(Buffer, N);
    Write(Buffer, N);
    Dec(Count, N);
  end;
end;

procedure TStream.Error(Code, Info: Integer);
type
  TErrorProc = procedure(var S: TStream);
begin
  Status := Code;
  ErrorInfo := Info;
  if StreamError <> nil then TErrorProc(StreamError)(Self);
end;

procedure TStream.Flush;
begin
end;



function TStream.GetPos: Longint;
begin
  Abstract;
end;

function TStream.GetSize: Longint;
begin
  Abstract;
end;


procedure TStream.Read(var Buf; Count: Word);
begin
  Abstract;
end;

function TStream.ReadStr: PString;
var
  L: Byte;
  P: PString;
begin
  Read(L, 1);
  if L > 0 then
  begin
    GetMem(P, L + 1);
    P^[0] := Char(L);
    Read(P^[1], L);
    ReadStr := P;
  end else ReadStr := nil;
end;

procedure TStream.Reset;
begin
  Status := 0;
  ErrorInfo := 0;
end;

procedure TStream.Seek(Pos: Longint);
begin
  Abstract;
end;




procedure TStream.Truncate;
begin
  Abstract;
end;

procedure TStream.Write(var Buf; Count: Word);
begin
  Abstract;
end;

procedure TStream.WriteStr(P: PString);
const
  Empty: String[1] = '';
begin
  if P <> nil then Write(P^, Length(P^) + 1) else Write(Empty, 1);
end;

{ TDosStream }

constructor TDosStream.Init(FileName: FNameStr; Mode: Word); assembler;
asm
        XOR     AX,AX
        PUSH    AX
        LES     DI,Self
        PUSH    ES
        PUSH    DI
        CALL    TStream.Init
        PUSH    DS
        LDS     SI,FileName
        LES     DI, Self
        MOV     BX, TDosStream.FName
        ADD     DI, BX
        MOV     DX,DI
        CLD
        LODSB
        CMP     AL,79
        JB      @@1
        MOV     AL,79
@@1:    STOSB
        CBW
        XCHG    AX,CX
        INC     DX
        REP     MOVSB
        XCHG    AX,CX
        STOSB
        PUSH    ES
        POP     DS
        XOR     CX,CX
        MOV     AX,Mode
        INT     21H
        POP     DS
        JNC     @@2
        LES     DI,Self
        MOV     DX,stInitError
        CALL    DoStreamError
        MOV     AX,-1
@@2:    LES     DI,Self
        MOV     ES:[DI].TDosStream.Handle,AX
end;
Procedure  TDosStream.CloseToReset;Assembler;
Asm
        LES     DI,Self
        MOV     BX,ES:[DI].TDosStream.Handle
        CMP     BX,-1
        JE      @@1
        MOV     AH,45H
        INT     21H
        JC      @@1
        MOV     BX, AX
        MOV     AH, 3EH
        INT     21H
@@1:
end;
destructor TDosStream.Done; assembler;
asm
        LES     DI,Self
        MOV     BX,ES:[DI].TDosStream.Handle
        CMP     BX,-1
        JE      @@1
        MOV     AH,3EH
        INT     21H
@@1:    XOR     AX,AX
        PUSH    AX
        PUSH    ES
        PUSH    DI
        CALL    TStream.Done
end;

function TDosStream.GetPos: Longint; assembler;
asm
        LES     DI,Self
        XOR     DX,DX
        CMP     DX,ES:[DI].TDosStream.Status
        JNE     @@1
        MOV     CX,DX
        MOV     BX,ES:[DI].TDosStream.Handle
        MOV     AX,4201H
        INT     21H
        JNC     @@2
        MOV     DX,stError
        CALL    DoStreamError
@@1:    MOV     AX,-1
        CWD
@@2:
end;

function TDosStream.GetSize: Longint; assembler;
asm
        LES     DI,Self
        XOR     DX,DX
        CMP     DX,ES:[DI].TDosStream.Status
        JNE     @@1
        MOV     CX,DX
        MOV     BX,ES:[DI].TDosStream.Handle
        MOV     AX,4201H
        INT     21H
        PUSH    DX
        PUSH    AX
        XOR     DX,DX
        MOV     CX,DX
        MOV     AX,4202H
        INT     21H
        POP     SI
        POP     CX
        PUSH    DX
        PUSH    AX
        MOV     DX,SI
        MOV     AX,4200H
        INT     21H
        POP     AX
        POP     DX
        JNC     @@2
        MOV     DX,stError
        CALL    DoStreamError
@@1:    MOV     AX,-1
        CWD
@@2:
end;

procedure TDosStream.Read(var Buf; Count: Word); assembler;
asm
        LES     DI,Self
        CMP     ES:[DI].TDosStream.Status,0
        JNE     @@2
        PUSH    DS
        LDS     DX,Buf
        MOV     CX,Count
        MOV     BX,ES:[DI].TDosStream.Handle
        MOV     AH,3FH
        INT     21H
        POP     DS
        MOV     DX,stError
        JC      @@1
        CMP     AX,CX
        JE      @@3
        XOR     AX,AX
        MOV     DX,stReadError
@@1:    CALL    DoStreamError
@@2:    LES     DI,Buf
        MOV     CX,Count
        XOR     AL,AL
        CLD
        REP     STOSB
@@3:
end;

procedure TDosStream.Seek(Pos: Longint); assembler;
asm
        LES     DI,Self
        CMP     ES:[DI].TDosStream.Status,0
        JNE     @@2
        MOV     DX,Pos.Word[0]
        MOV     CX,Pos.Word[2]
        OR      CX,CX
        JNS     @@1
        XOR     DX,DX
        XOR     CX,CX
@@1:    MOV     BX,ES:[DI].TDosStream.Handle
        MOV     AX,4200H
        INT     21H
        JNC     @@2
        MOV     DX,stError
        CALL    DoStreamError
@@2:
end;

procedure TDosStream.Truncate; assembler;
asm
        LES     DI,Self
        XOR     CX,CX
        CMP     CX,ES:[DI].TDosStream.Status
        JNE     @@1
        MOV     BX,ES:[DI].TDosStream.Handle
        MOV     AH,40H
        INT     21H
        JNC     @@1
        MOV     DX,stError
        CALL    DoStreamError
@@1:
end;

procedure TDosStream.Write(var Buf; Count: Word); assembler;
asm
        LES     DI,Self
        CMP     ES:[DI].TDosStream.Status,0
        JNE     @@2
        PUSH    DS
        LDS     DX,Buf
        MOV     CX,Count
        MOV     BX,ES:[DI].TDosStream.Handle
        MOV     AH,40H
        INT     21H
        POP     DS
        MOV     DX,stError
        JC      @@1
        CMP     AX,CX
        JE      @@2
        XOR     AX,AX
        MOV     DX,stWriteError
@@1:    CALL    DoStreamError
@@2:
end;

{ TBufStream }

{ Flush TBufStream buffer                               }
{ In    AL    = Flush mode (0=Read, 1=Write, 2=Both)    }
{       ES:DI = TBufStream pointer                      }
{ Out   ZF    = Status test                             }

procedure FlushBuffer; near; assembler;
asm
        MOV     CX,ES:[DI].TBufStream.BufPtr
        SUB     CX,ES:[DI].TBufStream.BufEnd
        JE      @@3
        MOV     BX,ES:[DI].TDosStream.Handle
        JA      @@1
        CMP     AL,1
        JE      @@4
        MOV     DX,CX
        MOV     CX,-1
        MOV     AX,4201H
        INT     21H
        JMP     @@3
@@1:    CMP     AL,0
        JE      @@4
        PUSH    DS
        LDS     DX,ES:[DI].TBufStream.Buffer
        MOV     AH,40H
        INT     21H
        POP     DS
        MOV     DX,stError
        JC      @@2
        CMP     AX,CX
        JE      @@3
        XOR     AX,AX
        MOV     DX,stWriteError
@@2:    CALL    DoStreamError
@@3:    XOR     AX,AX
        MOV     ES:[DI].TBufStream.BufPtr,AX
        MOV     ES:[DI].TBufStream.BufEnd,AX
        CMP     AX,ES:[DI].TStream.Status
@@4:
end;

constructor TBufStream.Init(FileName: FNameStr; Mode, Size: Word);
begin
  TDosStream.Init(FileName, Mode);
  BufSize := Size;
  if Size = 0 then Error(stInitError, 0)
  else GetMem(Buffer, Size);
  BufPtr := 0;
  BufEnd := 0;
end;

destructor TBufStream.Done;
begin
  TBufStream.Flush;
  TDosStream.Done;
  FreeMem(Buffer, BufSize);
end;

procedure TBufStream.Flush; assembler;
asm
        LES     DI,Self
        CMP     ES:[DI].TBufStream.Status,0
        JNE     @@1
        MOV     AL,2
        CALL    FlushBuffer
@@1:
end;

function TBufStream.GetPos: Longint; assembler;
asm
        LES     DI,Self
        PUSH    ES
        PUSH    DI
        CALL    TDosStream.GetPos
        OR      DX,DX
        JS      @@1
        LES     DI,Self
        SUB     AX,ES:[DI].TBufStream.BufEnd
        SBB     DX,0
        ADD     AX,ES:[DI].TBufStream.BufPtr
        ADC     DX,0
@@1:
end;

function TBufStream.GetSize: Longint; assembler;
asm
        LES     DI,Self
        PUSH    ES
        PUSH    DI
        PUSH    ES
        PUSH    DI
        CALL    TBufStream.Flush
        CALL    TDosStream.GetSize
end;

procedure TBufStream.Read(var Buf; Count: Word); assembler;
asm
        LES     DI,Self
        CMP     ES:[DI].TBufStream.Status,0
        JNE     @@6
        MOV     AL,1
        CALL    FlushBuffer
        JNE     @@6
        XOR     BX,BX
@@1:    MOV     CX,Count
        SUB     CX,BX
        JE      @@7
        LES     DI,Self
        MOV     AX,ES:[DI].TBufStream.BufEnd
        SUB     AX,ES:[DI].TBufStream.BufPtr
        JA      @@2
        PUSH    DS
        PUSH    CX
        PUSH    BX
        LDS     DX,ES:[DI].TBufStream.Buffer
        MOV     CX,ES:[DI].TBufStream.BufSize
        MOV     BX,ES:[DI].TBufStream.Handle
        MOV     AH,3FH
        INT     21H
        POP     BX
        POP     CX
        POP     DS
        MOV     DX,stError
        JC      @@5
        MOV     ES:[DI].TBufStream.BufPtr,0
        MOV     ES:[DI].TBufStream.BufEnd,AX
        OR      AX,AX
        JE      @@4
@@2:    CMP     CX,AX
        JB      @@3
        MOV     CX,AX
@@3:    PUSH    DS
        LDS     SI,ES:[DI].TBufStream.Buffer
        ADD     SI,ES:[DI].TBufStream.BufPtr
        ADD     ES:[DI].TBufStream.BufPtr,CX
        LES     DI,Buf
        ADD     DI,BX
        ADD     BX,CX
        CLD
        REP     MOVSB
        POP     DS
        JMP     @@1
@@4:    MOV     DX,stReadError
@@5:    CALL    DoStreamError
@@6:    LES     DI,Buf
        MOV     CX,Count
        XOR     AL,AL
        CLD
        REP     STOSB
@@7:
end;

procedure TBufStream.Seek(Pos: Longint); assembler;
asm
        LES     DI,Self
        PUSH    ES
        PUSH    DI
        CALL    TDosStream.GetPos
        OR      DX,DX
        JS      @@2
        LES     DI,Self
        SUB     AX,Pos.Word[0]
        SBB     DX,Pos.Word[2]
        JNE     @@1
        OR      AX,AX
        JE      @@1
        MOV     DX,ES:[DI].TBufStream.BufEnd
        SUB     DX,AX
        JB      @@1
        MOV     ES:[DI].TBufStream.BufPtr,DX
        JMP     @@2
@@1:    PUSH    Pos.Word[2]
        PUSH    Pos.Word[0]
        PUSH    ES
        PUSH    DI
        PUSH    ES
        PUSH    DI
        CALL    TBufStream.Flush
        CALL    TDosStream.Seek
@@2:
end;

procedure TBufStream.Truncate;
begin
  TBufStream.Flush;
  TDosStream.Truncate;
end;

procedure TBufStream.Write(var Buf; Count: Word); assembler;
asm
        LES     DI,Self
        CMP     ES:[DI].TBufStream.Status,0
        JNE     @@4
        MOV     AL,0
        CALL    FlushBuffer
        JNE     @@4
        XOR     DX,DX
@@1:    MOV     CX,Count
        SUB     CX,DX
        JE      @@4
        LES     DI,Self
        MOV     AX,ES:[DI].TBufStream.BufSize
        SUB     AX,ES:[DI].TBufStream.BufPtr
        JA      @@2
        PUSH    CX
        PUSH    DX
        MOV     AL,1
        CALL    FlushBuffer
        POP     DX
        POP     CX
        JNE     @@4
        MOV     AX,ES:[DI].TBufStream.BufSize
@@2:    CMP     CX,AX
        JB      @@3
        MOV     CX,AX
@@3:    PUSH    DS
        MOV     AX,ES:[DI].TBufStream.BufPtr
        ADD     ES:[DI].TBufStream.BufPtr,CX
        LES     DI,ES:[DI].TBufStream.Buffer
        ADD     DI,AX
        LDS     SI,Buf
        ADD     SI,DX
        ADD     DX,CX
        CLD
        REP     MOVSB
        POP     DS
        JMP     @@1
@@4:
end;




{ Dynamic string handling routines }

function NewStr(const S: String): PString;
var
  P: PString;
begin
  if S = '' then P := nil else
  begin
    GetMem(P, Length(S) + 1);
    P^ := S;
  end;
  NewStr := P;
end;

procedure DisposeStr(P: PString);
begin
  if P <> nil then FreeMem(P, Length(P^) + 1);
end;

{ Objects registration procedure }

Function InfoStr(Info : Integer):String;
Var T : String;
begin
   case Info of
         2: T := 'DOSYA BULUNAMADI';
         3: T := 'PAT˜KA BULUNAMADI';
         4: T := 'A€IK DOSYA SAYISI COK FAZLA';
         5: T := 'ER˜ž˜ME ˜Z˜N VER˜LMED˜';
         8: T := 'HAHIZA YETERS˜Z';
        15: T := 'GE€ERS˜Z SšRšCš';
        16: T := 'D˜RECTORY YI S˜LEMEM';
       100: T := 'D˜SK OKUMA HATASI';
       101: T := 'D˜SK YAZIM HATASI';
       150: T := 'D˜SK YAZIM ˜€˜N KORUMALI';
       152: T := 'SšRšCš HAZIR DE¦˜L';
       else T:='™N G™RšLMEYEN B˜R HATA';
     end;
    InfoStr:=T;
   end;
Procedure TDosStream.Error;
Var S:String;

begin
  Status := Code;
  ErrorInfo := Info;
  If (Code=0) and ( Info = 0) then exit;
  Case Status of
     StRecLenError : S:='KAYIT UZUNLU¦U DE¦˜žM˜ž';
     StNotOpen     : S:='DOSYA A€IK DE¦˜L';
     stReadError   : If Info = 0 then begin
                           S:='OKUMADA HATA';
                           Status:=0;
                        end else S:=InfoStr(Info);
     stWriteError  : If Info = 0 then begin
                           S:='YAZIMDA HATA';
                           Status:=0;
                        end else S:=InfoStr(Info);
     stError, stInitError : begin
                              S:=InfoStr(Info)+' DOSYA A€ILAMIYOR';
                              Status:=StNotOpen;
                            end;
  end;
  Complain(FName+' '+S);
end;

Procedure EraseFile(FName : String);
var

  F   : File;
  Sts : Integer;
begin
    if Not Exists(FName) then exit;
    Assign(F, FName);
    Erase(F);
    Sts:=IoResult;
    If Sts<>0 then Complain(FName+' DOSYASINI S˜LEM˜YORUM');
 end;
Procedure RenameFile(FName1, FName2 : String);
var

  F   : File;
  Sts : Integer;
begin
    if Not Exists(FName1) or Exists(FName2) then exit;
    Assign(F, FName1);
    Rename(F, FName2);
    Sts:=IoResult;
    If Sts<>0 then Complain(FName1+' '+FName2+'OLARAK ˜S˜MLED˜R˜LEMED˜');
 end;


Function CopyFile(Source, Dest : String):Boolean;
Const  BufferSize = 1024*20;
Var Status         : Word;
    FSource, FDest : File;
    Buffer         : ^Byte;

Function OpenFiles:Boolean;
begin
    OpenFiles :=False;
    Status:=0;
    if Not Exists(Source) then begin
       Complain(Source+ ' DOSYASI BULUNAMADI');
       exit
    end;
    Assign(FSource, Source);
    Reset(FSource, 1);
    Status:=IOResult;
    if Status <> 0 then begin
       Complain(InfoStr(Status));
       Close(FSource);
       exit
    end;
    Assign(FDest, Dest);
    Rewrite(FDest, 1);
    if Status <> 0 then begin
       Complain(InfoStr(Status));
       Close(FDest);
       exit
    end;
    OpenFiles := True;
end; { SetUpFiles }

Function FileReadWrite:Boolean;
var Blocks : word;
begin
    FileReadWrite:=False;
    repeat
      BlockRead(FSource, Buffer^, BufferSize, Blocks);
      Status:=IOResult;
      If Status<>0 then begin
         Complain(InfoStr(Status));
  	 Close(FSource);
	 Close(FDest);
	 EraseFile(Dest);
	 Exit;
      end;
      BlockWrite(FDest, Buffer^, Blocks, Blocks);
      Status:=IOResult;
      If Status<>0 then begin
        Complain(InfoStr(Status));
	Close(FSource);
	Close(FDest);
	EraseFile(Dest);
	Exit;
      end;
    until Blocks = 0;
    FileReadWrite:=True;
end;
begin
  CopyFile:=False;
  If Not OpenFiles Then exit;
  GetMem(Buffer, BufferSize);
  If FileReadWrite then begin
       CopyFile:=True;
       Close(FSource);
       Close(FDest);
  end;
  FreeMem(Buffer, BufferSize);
  CopyFile:=True;
end;

Constructor TOutPut.Init;
begin
  TObject.Init;
  Status:=0;
  Mode:=Md;
  if not ( mode in [OutOpenReadCur, OutOpenWriteCur,OutOpenRead,OutOpenWrite, PrinterMode] ) then
  begin
     Complain('CIKTI šN˜TES˜ HATASI');
     Fail;
  end;
  If Mode in [OutOpenReadCur, OutOpenWriteCur] then begin
          Case mode of
            OutOpenReadCur  : Mode:=OutOpenRead;
            OutOpenWriteCur : Mode:=OutOpenWrite;
          end;
  end;
  Case Mode of
      OutOpenRead : begin
                        Assign(T, FName);
                        Reset(T);
                        Status:=IOResult;
                        If Status<>0 then begin
                           Error;
                           Fail
                        end;
                    end;
     OutOpenWrite : begin
                        Assign(T, FName);
                        ReWrite(T);
                        Status:=IOResult;
                        If Status<>0 then begin
                           Error;
                           Fail;
                        end;
                     end
    end;{Case}
end;
Destructor  TOutPut.Done;
Begin
   If (Mode = OutOpenRead) or (Mode = OutOpenWrite) then begin
       Close(T);
       Status:=IOResult;
       If Status<>0 then Error;
   end;
   TObject.Done;
end;
Function TOutPut.ReadText:String;
Var S : String;
begin
    If Mode<>OutOpenRead then Begin
       complain(FileName+' OKUMAYA A€IK DE¦˜L');
       exit
    end;
    if Eof(T) then begin
       complain(FileName+' DOSYA SONUNA ER˜ž˜LD˜');
       exit
    end;
    ReadLn(T,S);
    Status:=IOResult;
    If Status<>0 then begin
       S:='';
       Error;
    end;
    ReadText:=S;
end;
Procedure   TOutPut.WriteText(S:String);
begin
    If (Mode<>OutOpenWrite) and (Mode<>PrinterMode) then Begin
       complain(FileName+' YAZIMA A€IK DE¦˜L');
       exit
    end;
    Case Mode of
        OutOpenWrite: begin WriteLn(T,Filter(S));
                           Status:=IOResult;
                           Error;
                     end;
        PrinterMode: WritePrt(Expand(S +'\L'));
    end;

end;
Procedure TOutPut.StatPrt;Assembler;
asm;
        LES     DI,Self
        MOV     AH, 2
        XOR     DX, DX
        INT     17H
        MOV     ES:[DI].TOutPut.Status.Byte[0], AH
end;


procedure TOutPut.BytePrt(ByteVal : byte);Assembler;
asm;

        LES     DI,Self
        XOR     AX, AX
        MOV     AL, ByteVal
        XOR     DX, DX
        INT     17H
        MOV     ES:[DI].TOutPut.Status.Byte[0], AH
end;


procedure TOutPut.InitPrt;Assembler;
asm;
        LES     DI,Self
        XOR     AX, AX
        MOV     AH, 1
        XOR     DX, DX
        INT     17H
        MOV     ES:[DI].TOutPut.Status. Byte[0], AH
end;

Function  TOutPut.WaitPrt:Boolean;
Var TC:Char;
begin
   WaitPrt:=True;
   if  (Status and _ONLINE_PRT) = 0 then begin
          Message('YAZICI KONTROL',
          'YAZICI A€IK DE¦˜L@LšTFEN YAZICIYI A€INIZ@ESC:VAZGE€@ENTER:G˜R',
          [ESC,CR], TC);
          WaitPrt:=(TC=CR);
          exit;
    end else
    If ((Status and _NOPAPER_PRT) <> 0)  then begin
          Message('YAZICI KONTROL',
         'YAZICIDA KA¦IT YOK. LšTFEN@YAZICIYA KA¦IT TAKINIZ@ESC:VAZGE€@ENTER:G˜R',
          [ESC,CR], TC);
          WaitPrt:=(TC=CR);
          exit;
   end else
   If ((Status and _IOERROR_PRT) <> 0)  then begin
           Complain('YAZICIDA HATA');
           WaitPrt:=False;
           exit;
   end;
end;

procedure TOutPut.WritePrt(Str : string);
  var
    LenStr,I	: byte;
  begin {__WrtPrt}

     StatPrt;
     if ( ((Status and _ONLINE_PRT) = 0) or
				  ((Status and _NOPAPER_PRT) <> 0) ) then
        If Not WaitPrt then Exit;
    LenStr	:= Length(Str);
    for I := 1 to LenStr do
      begin
	repeat
	  StatPrt;
	  if ((Status and ErrorStat) <> 0) then
                 If Not WaitPrt then Exit;
	until ((Status and _NOTBUSY_PRT) <> 0);
	BytePrt(Byte(Str[I]));
	if ((Status and ErrorStat) <> 0) then
                If Not WaitPrt then Exit;
      end;
  end;



Procedure   TOutPut.Error;
begin
  If (Status = 0) then exit;
     complain(FileName+' '+InfoStr(Status));
end;


{I+}
Function    TOutPut.FileName:String;
Var S:String;
begin
    S:=TextRec(T).Name;
    S[0]:=Char(Pos(#0,S)-1);
    FileName:=S;
end;
Const
     Condense    = 1;  { \C  CONDENSED}
     Double      = 2;  { \D  DOUBLE STRIKE}
     Enlarge     = 3;  { \E  ENLARGE}

   { \F  FORMFEED
     \R  CARRIAGE RETURN
     \L  CARRIAGE RETURN AND LINE FEED
     \Sn ADD N SPACES }


Procedure SpaceNum; Near; Assembler;
asm
     XOR     AH, AH
     XOR     BH, BH
@@1: LODSB
     OR      AL, AL
     JE      @@2
     CMP     AL, '0'
     JB      @@2
     CMP     AL,'9'
     JA      @@2
     MOV     AH, BH
     SHL     BH,1
     SHL     BH,1
     SHL     BH,1
     SHL     AH,1
     ADD     BH, AH
     SUB     AL, '0'
     ADD     BH, AL
     JMP     @@1
@@2:
end;

Procedure AddCtr; Near; Assembler;
Asm
      PUSH   AX
@@1:  MOV    BH, BL
      AND    BH, 3
      SHR    BL, 1
      SHR    BL, 1
      OR     BH, BH
      JE @@4
        CMP   BH, Condense
        JNE   @@2
              MOV  AL, 27
              STOSB
              MOV  AL, 'P'
              STOSB
              JMP  @@1
@@2:     CMP  BH, Double
         JNE  @@3
              MOV   AL, 27
              STOSB
              MOV   AL, 'H'
              STOSB
              JMP @@1
@@3:     CMP  BH, Enlarge
         JNE  @@4
              MOV  AL, 27
              STOSB
              MOV  AL,'W'
              STOSB
              MOV  AL,'0'
              STOSB
              JMP  @@1
@@4:   XOR   BL, BL
       POP   AX
end;

Procedure DoCtr; near; Assembler;
asm
       XOR  BX, BX
@@1:   CMP  AL,'\'
       JNE  @@9
       LODSB
       CMP  AL,'C'
       JNE  @@2
            SHL BL, 1
            SHL BL, 1
	    OR  BL, Condense
            MOV  AL, 27
            STOSB
	    MOV  AL,'g'
            STOSB
	    JMP @@8
@@2:   CMP  AL,'D'
       JNE  @@3
            SHL BL, 1
            SHL BL, 1
            OR   BL, Double
            MOV  AL,27
            STOSB
            MOV   AL,'G'
            STOSB
	    JMP @@8
@@3:   CMP  AL,'E'
       JNE  @@4
            SHL BL, 1
            SHL BL, 1
            OR   BL, EnLarge
            MOV  AL,27
            STOSB
            MOV   AL,'W'
            STOSB
            MOV   AL,1
	    STOSB
            JMP @@8
@@4:   CMP  AL,'F'
       JNE  @@5
	    MOV  AL,12
	    STOSB
	    JMP @@8
@@5:   CMP  AL,'R'
       JNE  @@6
	    MOV  AL,13
	    STOSB
	    JMP @@8
@@6:   CMP  AL,'L'
       JNE  @@7
	    MOV  AL,13
	    STOSB
	    MOV  AL,10
	    STOSB
	    JMP @@8
@@7:   CMP  AL,'S'
       JNE  @@8
	    CALL SpaceNum
            DEC  SI
	    XOR  CX, CX
	    MOV  CL, BH
	    JCXZ @@8
	    CLD
	    MOV  AL,' '
	    REP  STOSB
@@8:    LODSB
        OR  AL, AL
	JE  @@9
        JMP @@1
@@9:
end;
Function Expand( S : String):String; Assembler;
asm
     PUSH            DS

     XOR             BX, BX
     LDS             SI, S
     MOV             BL, DS:[SI]
     INC             SI
     MOV             BYTE PTR DS:[SI+BX], 0
     XOR             BX, BX

     LES             DI, @Result
     MOV             DX, DI
     INC             DI
     CLD
@@1: LODSB
     OR    AL, AL
     JE    @@4
     CMP   AL,'\'
     JNE   @@2
	 CALL AddCtr
	 CALL DoCtr
@@2: OR AL, AL
     JE @@4
     STOSB
     JMP @@1
@@4: CALL AddCtr
     SUB   DI,DX
     MOV   AX, DI
     DEC   AX
     LES   DI,@Result
     STOSB
     POP    DS
end;
Function Filter( S : String):String; Assembler;
asm
     PUSH            DS

     XOR             BX, BX
     LDS             SI, S
     MOV             BL, DS:[SI]
     INC             SI
     MOV             BYTE PTR DS:[SI+BX], 0
     XOR             BX, BX

     LES             DI, @Result
     MOV             DX, DI
     INC             DI
     CLD
@@1: LODSB
     OR    AL, AL
     JE    @@9
     CMP   AL,'\'
     JNE   @@8
     LODSB
     CMP  AL,'C'
     JNE  @@2
     JMP  @@1
@@2: CMP  AL,'D'
     JNE  @@3
     JMP @@1
@@3: CMP  AL,'E'
     JNE  @@4
     JMP @@1
@@4: CMP  AL,'F'
     JNE  @@5
     JMP @@1
@@5: CMP  AL,'R'
     JNE  @@6
     MOV  AL,13
     STOSB
     JMP @@1
@@6: CMP  AL,'L'
     JNE  @@7
     MOV  AL,13
     STOSB
     MOV  AL,10
     STOSB
     JMP @@1
@@7: CMP  AL,'S'
     JNE  @@8
     CALL SpaceNum
     DEC  SI
     XOR  CX, CX
     MOV  CL, BH
     JCXZ @@8
     CLD
     MOV  AL,' '
     REP  STOSB
     JMP  @@1
@@8: STOSB
     JMP @@1
@@9: SUB   DI,DX
     MOV   AX, DI
     DEC   AX
     LES   DI,@Result
     STOSB
     POP    DS
end;

Constructor Cursor.Init;
begin
     TObject.Init;
     ColSay:=1; EdY:=1; EdX:=1; EdRow:=1; EdCol:=1;
     Bas:=1; Son:=0; TabStop[1]:=1;
end;

Procedure   Cursor.ShowLine(Yer : Word; Attr : Byte);
begin
end;
Procedure Cursor.CursorDown;Assembler;
Asm

        LES     DI, Self
        MOV     AX, ES:[DI].Cursor.EdY
        CMP     AX, ES:[DI].Cursor.Son
        JNE     @@1
        CALL    Win.Beep
        JMP     @@2
@@1:
        INC     ES:[DI].Cursor.EdY
        INC     ES:[DI].Cursor.EdRow
        MOV     CX, WindMin
        MOV     DX, WindMax
        MOV     AL, DH
        SUB     AL, CH
        INC     AL
        CMP     ES:[DI].Cursor.EdRow, AL
        JLE     @@2
        MOV     ES:[DI].Cursor.EdRow, AL
	MOV     AX, 0601H
	MOV     BH, 7
	INT     10H
@@2:
end;

Procedure Cursor.CursorUp;Assembler;
asm

        LES     DI,Self
        MOV     AX, ES:[DI].Cursor.EdY
        CMP     AX, ES:[DI].Cursor.Bas
        JNE     @@1
        CALL    Win.Beep
        JMP     @@2
@@1:
        DEC     ES:[DI].Cursor.EdY
        DEC     ES:[DI].Cursor.EdRow
        CMP     ES:[DI].Cursor.EdRow, 1
        JAE     @@2
        MOV     ES:[DI].Cursor.EdRow, 1
	MOV     AX, 0701H
        MOV     CX, WindMin
        MOV     DX, WindMax
        MOV     BH, 7
        INT     10H
@@2:
end;


Procedure Cursor.CursorTab;Assembler;
Asm
        LES     DI,Self
        XOR     BX, BX
        MOV     BL,ES:[DI].Cursor.EdX
        INC     BL
        CMP     ES:[DI].Cursor.ColSay,BL
        JAE     @@1
        MOV     BL,1
@@1:    MOV     ES:[DI].Cursor.EdX, BL
        MOV     AL, BYTE PTR ES:[DI+BX].Cursor.TabStop
        MOV     ES:[DI].Cursor.EdCol, AL
end;
Procedure Cursor.PrintGuys(Attr:Byte);
Var I, SN : Word;
begin
    ClrScr;
    SN := Bas + Hi(WindMax) - Hi(WindMin);
    If SN > Son then SN :=Son;
    Edrow:=1; EdY:=Bas;
    For  I:= Bas to SN Do begin
	 ShowLine(I, Attr);
         Inc(EdRow); Inc(EdY);
    end;
    EdY:=Bas; EdRow:=1; EDX:=1; EdCol:=TabStop[1];
    GotoXY(EdCol, EdRow);
end;
Function    Cursor.SelectSingle(Title, EdT : STRING;
                               Basla, Bitir : Word;
                               Attr : Byte):Word;
Var Stop : Boolean;
    TC   : Char;
begin
  SelectSingle:=Basla;
  if (Basla >= Bitir) then exit;
  OpenEditWindow(Title, EdT, 'ENTER:SE€˜M@ESC:VAZGE€',
		 [CR,ESC], [], 3, Bitir-Basla+1);

  ClrScr;
  Bas:=Basla; Son:=Bitir;
  PrintGuys(InvColor(Attr));
  Stop:=False; HideCursor;
  Repeat
     ShowLine(EdY, Attr); TC:=GetKeyCmd; ShowLine(EdY, InvColor(Attr));
     Case TC of
        UPKEY  : CursorUp;
        DOWNKEY: CursorDown;
	ESC : Begin
		Stop:=True;
		SelectSingle:=0;
	      end;
	CR  : begin
		SelectSingle:=EdY;
		Stop:=True
	      end;
     end;{Case}
  Until Stop;
  ShowCursor;
  CloseEdit;
end;
Constructor Select.Init(KL : Word);
Begin
   Cursor.Init;
   KeyL:=KL;
   Say:=0;
End;

Function Select.BaslaKod:Word;
Var
     S            : String;
     TC           : Char;
     Adres        : Word;
     Flag         : Boolean;
     B            : Word;
begin
    ShowCursor; Str(KeyL,S);
    OpenEditWindow('BAžLANGI€ KOD', S+'@KOD','ESC : VAZGE€',[ESC],[],10, 1);
    S := '';
    InputStr(S, 1,1, KeyL, True, ALLKAR, 0, TC);
    If TC = NULL then Begin
	Flag:=Search(S,B, Adres);
	If B > Say then B:= Say;
	BaslaKod:=B;
   end;
   CloseEdit;
   HideCursor;
end;
Function Select.Selection(Title, EdT : String; Attr : Byte): Boolean;
Var L, I, H, T : Word;
    Stop : Boolean;
    TC   : Char;
Procedure PrintLine;
begin
      If SelArr[EdY] then
         ShowLine(EdY,Attr)
      else
         ShowLine(EdY,InvColor(Attr));
end;
Procedure Reprint(T : Word; SaveEdY:Boolean);
Var I , H, L, M : Word;
begin
     ClrScr;
     H := T + Hi(WindMax) - Hi(WindMin);
     If H > SON then H :=SON;
     L:=EdY; M:=EdRow; EdY:=T; Edrow:=1;
     For I:= T to H do begin
	 GotoXY(1,EdRow); PrintLine;
	 Inc(EdY); Inc(EdRow)
     end;
     If SaveEdY then begin
	 EdY:=L;
	 EdRow:=M;
     end else begin
	 EdY:=T;
	 EdRow:=1;
     end;
     EdX:=1; EdCol:=TabStop[1];
     GotoXY(EdCol, EdRow);
end;



begin
  Selection:= False;
  If Say < 1 Then Begin
     Complain('SE€ECEK B˜R žEY YOK');
     Exit;
  end;
  OpenEditWindow(Title,EdT,
	       'ENTER:SE€˜M@PGUP:HEPS˜@PGDN:H˜€B˜R˜@F10:KOD BAžLA@END:SE€˜M TAMAM@ESC:˜PTAL',
	       [CR, F10, ENDKEY, ESC,PGUPKEY,PGDNKEY],[],3,Say);
  Bas:=1; Son:=Say;
  FillChar(SelArr,SizeOf(SelArr),#0);
  ClrScr;
  PrintGuys(InvColor(Attr));
  Stop:=False;
  HideCursor;
  Repeat
      PrintLine;
      WriteChar(1,EdRow, 1, Chr(26), Attr);
      TC:=GetKeyCmd;
      WriteStr(1, EdRow, ' ' , InvColor(Attr));
      case TC of
        UPKEY   : CursorUp;
	DOWNKEY : CursorDown;
	ESC     : Stop:=True;
	CR      : begin
                    SelArr[EdY]:=Not SelArr[EdY];
                    PrintLine;
                    CursorDown
                  end;
	F10     : begin
		     T:=BaslaKod;
		     If (Bas<=T) and (T<=Son) then RePrint(T,False);
		 end;
	PGUPKEY : begin
		      For I:=1 to Son do SelArr[I]:=TRUE;
                      T:= EdY - EdRow +1;
		      RePrint(T,True);
		   end;
        PGDNKEY : begin
		      For I:=1 to Son do SelArr[I]:=False;
		      T:= EdY -EdRow +1;
		      RePrint(T,True);
		   end;
	ENDKEY   : begin
		     I:=1;
		     Repeat
			Stop:=SelArr[I]; Inc(I);
		     Until Stop or (I > Say);
		     Selection:=Stop;
		     Stop:=True;
		   end;
	  end;{Case}
  Until Stop;
  ShowCursor; CloseEdit;
  end;

Function Select.search;
begin
end;
Function Diskete;
begin
   Diskete:='';
   if Cikti^.Mode<>PrinterMode then Diskete:='D˜SKE ';
end;

Constructor DataFile.Init;
Var Buf : Array[1..5] of Integer;
    B   : Boolean;
begin
    B:= Exists(FLName);
    if B then
      TBufStream.Init(FLName, StOpen, Size)
    else
      TBufStream.Init(FLName, StCreate, Size);
    FirstFree := 1;
    Deltd     := 0;
    RecLen    := RL;
    MaxKay    := MK;
    If B then  begin
       Read(Buf,Ofs(Dt)-Ofs(FirstFree));
       if (Status = 0) and (Buf[3]<>RecLen) then
          Error(StRecLenError, 0)
      else if Status = 0 then  ReadHeader
    end
 else
      WriteHeader;
end;

Function DataFile.GecerliKayit( R : Word):Boolean;
begin
      GecerliKayit:=False;
      If Status<>0 then
         Error(Status, ErrorInfo)
      else if (R > MaxKay) or (R>=FirstFree) or (R<=0) then
               Error(StGecersizKayit, ErrorInfo)
           else
           GecerliKayit:=True;
end;
Function DataFile.Git(Pos : Word):Boolean;
Var L : LongInt; B : Boolean;
begin
     B:=GecerliKayit(Pos);
     if B then begin
        L:=LongMul(RecLen, Pos-1);
        L:=L+SizeOf(DataFile)-SizeOf(TBufStream);
        TBufStream.Seek(L);
        Git:=(Status = 0);
     end
      else Git:=False;
end;
Function DataFile.GetRec(R     : Word; Var Buf):Boolean;
begin
  If Git(R) then begin
     Read(Buf, RecLen);
     GetRec:=(Status=0);
  end else
    GetRec:=False;
end;

Function DataFile.PutRec(R     : Word; Var Buf):Boolean;
begin
  If Git(R) then begin
     Write(Buf, RecLen);
     PutRec:=(Status=0);
  end else
    PutRec:=False;
end;
Function DataFile.NewRec: Word;
Var
   Buf : PByteArray;
begin
    NewRec:=0;
    if Status<>0 then exit;
    GetMem(Buf, RecLen);
    If Deltd = 0 then begin
       If FirstFree > MaxKay then
           Error(StDosyaDolu, ErrorInfo)
       else begin
            NewRec:=FirstFree;
            Inc(FirstFree);
            WriteHeader;
       end
    end else begin
       if GetRec(Deltd, Buf^) then begin
           NewRec:=Deltd;
           Deltd:=Buf^[1];
           WriteHeader;
       end;
    end;
    FreeMem(Buf, RecLen);
end;

Function DataFile.AddRec(Var R : Word; Var Buf):Boolean;
begin
        R:=NewRec;
        If R = 0 then exit;
        If PutRec(R, Buf) then WriteHeader;
        CloseToReset;
end;
Destructor DataFile.Done;

begin
    WriteHeader;
    TBufStream.Done;
end;
procedure DataFile.ReleaseRec;
Var Buf : Array[0..1] of Word;
begin
    Buf[0] := $FFFF;
    Buf[1] :=Deltd;
    if Git(R) then begin
      Write(Buf,4);
      If Status = 0 then begin
	Deltd:=R; WriteHeader;
      end;
    end;
end;
Procedure DataFile.ReadHeader;
begin
    Seek(0);
    Read(FirstFree, SizeOf(DataFile)-SizeOf(TBufStream));
end;
Procedure DataFile.WriteHeader;
begin
    Seek(0);
    Write(FirstFree, SizeOf(DataFile)-SizeOf(TBufStream));
end;
Procedure DataFile.Error;
Var S:String;

begin
  Status := Code;
  ErrorInfo := Info;
  If (Code=0) and ( Info = 0) then exit;
  Case Status of
     StRecLenError : S:='KAYIT UZUNLU¦U DE¦˜žM˜ž';
     StNotOpen     : S:='DOSYA A€IK DE¦˜L';
     stReadError   : If Info = 0 then begin
                           S:='OKUMADA HATA';
                           Status:=0;
                        end else S:=InfoStr(Info);
     stWriteError  : If Info = 0 then begin
                           S:='YAZIMDA HATA';
                           Status:=0;
                        end else S:=InfoStr(Info);
     stError, stInitError : begin
                              S:=InfoStr(Info)+' DOSYA A€ILAMIYOR';
                              Status:=StNotOpen;
                            end;
     StGecersizKayit : begin
                              S:='GE€ERS˜Z KAYIT NO ';
                              Status:=0;
                       end;
     StDosyaDolu     : begin
                              S:='DOSYA DOLU, KAYIT G˜R˜LMED˜';
                              Status:=0;
                       end;
  end;
  Complain(FName+' '+S);
end;
Procedure CiktiDegis(S : String);
begin
   If Cikti^.Mode<>PrinterMode then
      SetToYazici
   else begin
      Cikti^.Free;
      New(Cikti, init(S, StOpenWrite));
      If Cikti = Nil then SetToYazici;
   end;
end;
Procedure BasimUniteSec(T, S : String);
Var TC : Char;
begin
    Message(T, 'BASIM šN˜TES˜N˜ SE€˜N˜Z@D˜SK DOSYA ADI : '+S+
    '@ENTER : YAZICI@D:D˜SK', ['Y','D'], TC);
    Case TC of
      CR : SetToYazici;
      'D' : begin
              Cikti^.Free;
              New(Cikti, init(T, S, StOpenWrite));
              If Cikti=nil then SetToYazici;
            end;
    end;
end;

Procedure SetToYazici;
begin
   if Cikti<>nil then Cikti^.Free;
   New(Cikti,Init('','',PrinterMode));
end;
Function  DisketTak(Title:String; Var Drive:String):Boolean;
Var S, E : String;
    TC, LoggedD : Char;
    begin
       GetDir(0, S);
       DisketTak:=False;
       LoggedD :=S[1];
       Drive:='A';
       OpenEditWindow(Title, '1@SšRšCš','END:BASLA@ESC:VAZGE€', [ENDKEY,ESC], [], 10, 1);
       Repeat
	   InputStr(Drive,Form.FieldKol[1],1,1, TRUE, ['A'..'Z'],0,TC );
	   If TC = ENDKEY then
	      begin
		 if Drive[1]=LoggedD then
		    Complain('ZATEN BU SšRšCšDE €ALIžIYORSUNUZ')
		 else If Disk.DriveReady(Drive[1]) then
		 begin
		     Drive:=Drive+':';
		     DisketTak:=True;
		     CloseEdit;
		     exit;
		 end
	      end;
       until TC = ESC;
       closeEdit;
 end;
end.
  if ( mode in [OutOpenRead,OutOpenWrite]) and not DisketTak(Title) then fail;