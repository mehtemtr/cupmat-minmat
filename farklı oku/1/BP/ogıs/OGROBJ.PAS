

unit OgrObj;

{$O+,F+,X+,I-,S-}

interface

const

{ TStream access modes }

  stCreate    = $3C00;           { Create new file }
  stOpenRead  = $3D00;           { Read access only }
  stOpenWrite = $3D01;           { Write access only }
  stOpen      = $3D02;           { Read and write access }

{ TStream error codes }

  stOk         =  0;              { No error }
  stError      = -1;              { Access error }
  stInitError  = -2;              { Cannot initialize stream }
  stReadError  = -3;              { Read beyond end of stream }
  stWriteError = -4;              { Cannot expand stream }
  stGetError   = -5;              { Get of unregistered object type }
  stPutError   = -6;              { Put of unregistered object type }

{ Maximum TCollection size }

  MaxCollectionSize = 65520 div SizeOf(Pointer);

{ TCollection error codes }

  coIndexError = -1;              { Index out of range }
  coOverflow   = -2;              { Overflow }

{ VMT header size }

  vmtHeaderSize = 8;

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

  PWordArray = ^TWordArray;
  TWordArray = array[0..16383] of Word;

{ TObject base object }

  PObject = ^TObject;
  TObject = object
    constructor Init;
    procedure Free;
    destructor Done; virtual;
  end;

{ TStreamRec }

  PStreamRec = ^TStreamRec;
  TStreamRec = record
    ObjType: Word;
    VmtLink: Word;
    Load: Pointer;
    Store: Pointer;
    Next: Word;
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
    function Get: PObject;
    function GetPos: Longint; virtual;
    function GetSize: Longint; virtual;
    procedure Put(P: PObject);
    procedure Read(var Buf; Count: Word); virtual;
    function  ReadStr: PString;
    procedure Reset;
    procedure Seek(Pos: Longint); virtual;
    procedure Truncate; virtual;
    procedure Write(var Buf; Count: Word); virtual;
    procedure WriteStr(P: PString);
  end;

{ DOS file name string }

{$IFDEF Windows}
  FNameStr = PChar;
{$ELSE}
  FNameStr = string[79];
{$ENDIF}

{ TDosStream }

  PDosStream = ^TDosStream;
  TDosStream = object(TStream)
    Handle: Word;
    constructor Init(FileName: FNameStr; Mode: Word);
    destructor Done; virtual;
    function GetPos: Longint; virtual;
    function GetSize: Longint; virtual;
    procedure Read(var Buf; Count: Word); virtual;
    procedure Seek(Pos: Longint); virtual;
    procedure Truncate; virtual;
    procedure Write(var Buf; Count: Word); virtual;
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
    procedure Flush; virtual;
    function GetPos: Longint; virtual;
    function GetSize: Longint; virtual;
    procedure Read(var Buf; Count: Word); virtual;
    procedure Seek(Pos: Longint); virtual;
    procedure Truncate; virtual;
    procedure Write(var Buf; Count: Word); virtual;
  end;

{ TEmsStream }

  PEmsStream = ^TEmsStream;
  TEmsStream = object(TStream)
    Handle: Word;
    PageCount: Word;
    Size: Longint;
    Position: Longint;
    constructor Init(MinSize, MaxSize: Longint);
    destructor Done; virtual;
    function GetPos: Longint; virtual;
    function GetSize: Longint; virtual;
    procedure Read(var Buf; Count: Word); virtual;
    procedure Seek(Pos: Longint); virtual;
    procedure Truncate; virtual;
    procedure Write(var Buf; Count: Word); virtual;
  end;

{ TCollection types }

  PItemList = ^TItemList;
  TItemList = array[0..MaxCollectionSize - 1] of Pointer;

{ TCollection object }

  PCollection = ^TCollection;
  TCollection = object(TObject)
    Items: PItemList;
    Count: Integer;
    Limit: Integer;
    Delta: Integer;
    constructor Init(ALimit, ADelta: Integer);
    constructor Load(var S: TStream);
    destructor Done; virtual;
    function At(Index: Integer): Pointer;
    procedure AtDelete(Index: Integer);
    procedure AtFree(Index: Integer);
    procedure AtInsert(Index: Integer; Item: Pointer);
    procedure AtPut(Index: Integer; Item: Pointer);
    procedure Delete(Item: Pointer);
    procedure DeleteAll;
    procedure Error(Code, Info: Integer); virtual;
    function FirstThat(Test: Pointer): Pointer;
    procedure ForEach(Action: Pointer);
    procedure Free(Item: Pointer);
    procedure FreeAll;
    procedure FreeItem(Item: Pointer); virtual;
    function GetItem(var S: TStream): Pointer; virtual;
    function IndexOf(Item: Pointer): Integer; virtual;
    procedure Insert(Item: Pointer); virtual;
    function LastThat(Test: Pointer): Pointer;
    procedure Pack;
    procedure PutItem(var S: TStream; Item: Pointer); virtual;
    procedure SetLimit(ALimit: Integer); virtual;
    procedure Store(var S: TStream);
  end;

{ TSortedCollection object }

  PSortedCollection = ^TSortedCollection;
  TSortedCollection = object(TCollection)
    Duplicates: Boolean;
    constructor Init(ALimit, ADelta: Integer);
    constructor Load(var S: TStream);
    function Compare(Key1, Key2: String): Integer; virtual;
    function IndexOf(Item: Pointer): Integer; virtual;
    procedure Insert(Item: Pointer); virtual;
    function KeyOf(Item: Pointer): String; virtual;
    function Search(Key: String; var Index: Integer): Boolean; virtual;
    procedure Store(var S: TStream);
  end;


function NewStr(const S: String): PString;
procedure DisposeStr(P: PString);

{ Longint routines }

function LongMul(X, Y: Integer): Longint;
inline($5A/$58/$F7/$EA);

function LongDiv(X: Longint; Y: Integer): Integer;
inline($59/$58/$5A/$F7/$F9);

{ Stream routines }

procedure RegisterType(var S: TStreamRec);

{ Abstract notification procedure }

procedure Abstract;

{ Objects registration procedure }

procedure RegisterObjects;

const

{ Stream error procedure }

  StreamError: Pointer = nil;

{ EMS stream state variables }

  EmsCurHandle: Word = $FFFF;
  EmsCurPage: Word = $FFFF;

{ Stream registration records }

const
  RCollection: TStreamRec = (
    ObjType: 50;
    VmtLink: Ofs(TypeOf(TCollection)^);
    Load: @TCollection.Load;
    Store: @TCollection.Store);


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
{$IFNDEF Windows}
  FillChar(Image(Self).Data, SizeOf(Self) - SizeOf(TObject), 0);
{$ENDIF}
end;

{ Shorthand procedure for a done/dispose }

procedure TObject.Free;
begin
  Dispose(PObject(@Self), Done);
end;

destructor TObject.Done;
begin
end;

{ TStream type registration routines }

const
  StreamTypes: Word = 0;

procedure RegisterError;
begin
  RunError(212);
end;

procedure RegisterType(var S: TStreamRec); assembler;
asm
        MOV     AX,DS
        CMP     AX,S.Word[2]
        JNE     @@1
        MOV     SI,S.Word[0]
        MOV     AX,[SI].TStreamRec.ObjType
        OR      AX,AX
        JE      @@1
        MOV     DI,StreamTypes
        MOV     [SI].TStreamRec.Next,DI
        JMP     @@3
@@1:    JMP     RegisterError
@@2:    CMP     AX,[DI].TStreamRec.ObjType
        JE      @@1
        MOV     DI,[DI].TStreamRec.Next
@@3:    OR      DI,DI
        JNE     @@2
        MOV     StreamTypes,SI
end;

{ TStream support routines }

const
  TStream_Error = vmtHeaderSize + $04;
  TStream_Flush = vmtHeaderSize + $08;
  TStream_Read  = vmtHeaderSize + $14;
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

function TStream.Get: PObject; assembler;
asm
        PUSH    AX
        MOV     AX,SP
        PUSH    SS
        PUSH    AX
        MOV     AX,2
        PUSH    AX
        LES     DI,Self
        PUSH    ES
        PUSH    DI
        MOV     DI,ES:[DI]
        CALL    DWORD PTR [DI].TStream_Read
        POP     AX
        OR      AX,AX
        JE      @@3
        MOV     BX,StreamTypes
        JMP     @@2
@@1:    CMP     AX,[BX].TStreamRec.ObjType
        JE      @@4
        MOV     BX,[BX].TStreamRec.Next
@@2:    OR      BX,BX
        JNE     @@1
        LES     DI,Self
        MOV     DX,stGetError
        CALL    DoStreamError
@@3:    XOR     AX,AX
        MOV     DX,AX
        JMP     @@5
@@4:    LES     DI,Self
        PUSH    ES
        PUSH    DI
        PUSH    [BX].TStreamRec.VmtLink
        XOR     AX,AX
        PUSH    AX
        PUSH    AX
        CALL    [BX].TStreamRec.Load
@@5:
end;

function TStream.GetPos: Longint;
begin
  Abstract;
end;

function TStream.GetSize: Longint;
begin
  Abstract;
end;

procedure TStream.Put(P: PObject); assembler;
asm
        LES     DI,P
        MOV     CX,ES
        OR      CX,DI
        JE      @@4
        MOV     AX,ES:[DI]
        MOV     BX,StreamTypes
        JMP     @@2
@@1:    CMP     AX,[BX].TStreamRec.VmtLink
        JE      @@3
        MOV     BX,[BX].TStreamRec.Next
@@2:    OR      BX,BX
        JNE     @@1
        LES     DI,Self
        MOV     DX,stPutError
        CALL    DoStreamError
        JMP     @@5
@@3:    MOV     CX,[BX].TStreamRec.ObjType
@@4:    PUSH    BX
        PUSH    CX
        MOV     AX,SP
        PUSH    SS
        PUSH    AX
        MOV     AX,2
        PUSH    AX
        LES     DI,Self
        PUSH    ES
        PUSH    DI
        MOV     DI,ES:[DI]
        CALL    DWORD PTR [DI].TStream_Write
        POP     CX
        POP     BX
        JCXZ    @@5
        LES     DI,Self
        PUSH    ES
        PUSH    DI
        PUSH    P.Word[2]
        PUSH    P.Word[0]
        CALL    [BX].TStreamRec.Store
@@5:
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
var
  NameBuf: array[0..79] of Char;
asm
        XOR     AX,AX
        PUSH    AX
        LES     DI,Self
        PUSH    ES
        PUSH    DI
        CALL    TStream.Init
{$IFDEF Windows}
	LEA	DI,NameBuf
	PUSH	SS
	PUSH	DI
	LES	DI,FileName
	PUSH	ES
	PUSH	DI
	MOV	AX,79
	PUSH	AX
	CALL	StrLCopy
	PUSH	DX
	PUSH	AX
	PUSH	DX
	PUSH	AX
	CALL	AnsiToOem
	PUSH	DS
	LEA	DX,NameBuf
{$ELSE}
        PUSH    DS
        LDS     SI,FileName
        LEA     DI,NameBuf
        MOV     DX,DI
        PUSH    SS
        POP     ES
        CLD
        LODSB
        CMP     AL,79
        JB      @@1
        MOV     AL,79
@@1:    CBW
        XCHG    AX,CX
        REP     MOVSB
        XCHG    AX,CX
        STOSB
{$ENDIF}
        PUSH    SS
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

{ TEmsStream }

const
  EmsPageSize = $4000;

var
  EmsBaseSeg: Word;
  EmsVersion: Byte;

procedure EmsSelectPage; near; assembler;
asm
        MOV     AX,ES:[DI].TEmsStream.Position.Word[0]
        MOV     DX,ES:[DI].TEmsStream.Position.Word[2]
        MOV     CX,EmsPageSize
        DIV     CX
        SUB     CX,DX
        MOV     SI,DX
        MOV     DX,ES:[DI].TEmsStream.Handle
        CMP     DX,EmsCurHandle
        JNE     @@1
        CMP     AX,EmsCurPage
        JE      @@3
@@1:    MOV     BX,AX
        MOV     AX,4400H
        INT     67H
        MOV     AL,AH
        AND     AX,0FFH
        JE      @@2
        MOV     DX,stError
        JMP     @@3
@@2:    MOV     EmsCurHandle,DX
        MOV     EmsCurPage,BX
@@3:
end;

procedure EmsSetPages; near; assembler;
asm
        CMP     EmsVersion,40H
        JAE     @@1
        MOV     AX,84H
        JMP     @@2
@@1:    MOV     DX,ES:[DI].TEmsStream.Handle
        MOV     BX,AX
        MOV     AH,51H
        INT     67H
        MOV     AL,AH
        AND     AX,0FFH
        JNE     @@2
        MOV     ES:[DI].TEmsStream.PageCount,BX
@@2:
end;

constructor TEmsStream.Init(MinSize, MaxSize: LongInt); assembler;
const
  EmsDeviceLen = 8;
  EmsDeviceStr: array[1..EmsDeviceLen] of Char = 'EMMXXXX0';
asm
        XOR     AX,AX
        PUSH    AX
        LES     DI,Self
        PUSH    ES
        PUSH    DI
        CALL    TStream.Init
        MOV     AX,3567H
        INT     21H
        MOV     CX,EmsDeviceLen
        MOV     SI,OFFSET EmsDeviceStr
        MOV     DI,0AH
        CLD
        REP     CMPSB
        LES     DI,Self
        MOV     AX,-1
        JNE     @@3
        MOV     AH,41H
        INT     67H
        MOV     EmsBaseSeg,BX
        MOV     AH,46H
        INT     67H
        MOV     EmsVersion,AL
        MOV     CX,EmsPageSize
        MOV     AX,MinSize.Word[0]
        MOV     DX,MinSize.Word[2]
        ADD     AX,EmsPageSize-1
        ADC     DX,0
        DIV     CX
        MOV     BX,AX
        CMP     EmsVersion,40H
        JAE     @@2
        PUSH    AX
        MOV     AX,MaxSize.Word[0]
        MOV     DX,MaxSize.Word[2]
        ADD     AX,EmsPageSize-1
        ADC     DX,0
        DIV     CX
        MOV     CX,AX
        MOV     AH,42H
        INT     67H
        POP     AX
        CMP     BX,CX
        JB      @@1
        MOV     BX,CX
@@1:    CMP     BX,AX
        JA      @@2
        MOV     BX,AX
@@2:    MOV     AH,43H
        INT     67H
        MOV     AL,AH
        AND     AX,0FFH
        JE      @@4
@@3:    MOV     DX,stInitError
        CALL    DoStreamError
        MOV     DX,-1
        XOR     BX,BX
@@4:    MOV     ES:[DI].TEmsStream.Handle,DX
        MOV     ES:[DI].TEmsStream.PageCount,BX
	XOR	AX,AX
	ADD	DI,OFFSET TEmsStream.Size
	MOV	CX,4
	REP	STOSW
end;

destructor TEmsStream.Done; assembler;
asm
        LES     DI,Self
        MOV     DX,ES:[DI].TEmsStream.Handle
        CMP     DX,-1
        JE      @@1
        MOV     AH,45H
        INT     67H
@@1:    XOR     AX,AX
        PUSH    AX
        PUSH    ES
        PUSH    DI
        CALL    TStream.Done
end;

function TEmsStream.GetPos: Longint; assembler;
asm
        LES     DI,Self
        CMP     ES:[DI].TEmsStream.Status,0
        JNE     @@1
        MOV     AX,ES:[DI].TEmsStream.Position.Word[0]
        MOV     DX,ES:[DI].TEmsStream.Position.Word[2]
        JMP     @@2
@@1:    MOV     AX,-1
        CWD
@@2:
end;

function TEmsStream.GetSize: Longint; assembler;
asm
        LES     DI,Self
        CMP     ES:[DI].TEmsStream.Status,0
        JNE     @@1
        MOV     AX,ES:[DI].TEmsStream.Size.Word[0]
        MOV     DX,ES:[DI].TEmsStream.Size.Word[2]
        JMP     @@2
@@1:    MOV     AX,-1
        CWD
@@2:
end;

procedure TEmsStream.Read(var Buf; Count: Word); assembler;
asm
        LES     DI,Self
        XOR     BX,BX
        CMP     BX,ES:[DI].TEmsStream.Status
        JNE     @@3
        MOV     AX,ES:[DI].TEmsStream.Position.Word[0]
        MOV     DX,ES:[DI].TEmsStream.Position.Word[2]
        ADD     AX,Count
        ADC     DX,BX
        CMP     DX,ES:[DI].TEmsStream.Size.Word[2]
        JA      @@1
        JB      @@7
        CMP     AX,ES:[DI].TEmsStream.Size.Word[0]
        JBE     @@7
@@1:    XOR     AX,AX
        MOV     DX,stReadError
@@2:    CALL    DoStreamError
@@3:    LES     DI,Buf
        MOV     CX,Count
        XOR     AL,AL
        CLD
        REP     STOSB
        JMP     @@8
@@5:    PUSH    BX
        CALL    EmsSelectPage
        POP     BX
        JNE     @@2
        MOV     AX,Count
        SUB     AX,BX
        CMP     CX,AX
        JB      @@6
        MOV     CX,AX
@@6:    ADD     ES:[DI].TEmsStream.Position.Word[0],CX
        ADC     ES:[DI].TEmsStream.Position.Word[2],0
        PUSH    ES
        PUSH    DS
        PUSH    DI
        LES     DI,Buf
        ADD     DI,BX
        ADD     BX,CX
        MOV     DS,EmsBaseSeg
        CLD
        REP     MOVSB
        POP     DI
        POP     DS
        POP     ES
@@7:    CMP     BX,Count
        JB      @@5
@@8:
end;

procedure TEmsStream.Seek(Pos: Longint); assembler;
asm
        LES     DI,Self
        MOV     AX,Pos.Word[0]
        MOV     DX,Pos.Word[2]
        OR      DX,DX
        JNS     @@1
        XOR     AX,AX
        CWD
@@1:    MOV     ES:[DI].TEmsStream.Position.Word[0],AX
        MOV     ES:[DI].TEmsStream.Position.Word[2],DX
end;

procedure TEmsStream.Truncate; assembler;
asm
        LES     DI,Self
        XOR     BX,BX
        CMP     ES:[DI].TEmsStream.Status,BX
        JNE     @@2
        CMP     EmsVersion,40H
        JB      @@1
        MOV     AX,ES:[DI].TEmsStream.Position.Word[0]
        MOV     DX,ES:[DI].TEmsStream.Position.Word[2]
        ADD     AX,EmsPageSize-1
        ADC     DX,BX
        MOV     CX,EmsPageSize
        DIV     CX
        CALL    EmsSetPages
        JE      @@1
        MOV     DX,stError
        CALL    DoStreamError
        JMP     @@2
@@1:    MOV     AX,ES:[DI].TEmsStream.Position.Word[0]
        MOV     DX,ES:[DI].TEmsStream.Position.Word[2]
        MOV     ES:[DI].TEmsStream.Size.Word[0],AX
        MOV     ES:[DI].TEmsStream.Size.Word[2],DX
@@2:
end;

procedure TEmsStream.Write(var Buf; Count: Word); assembler;
asm
        LES     DI,Self
        XOR     BX,BX
        CMP     BX,ES:[DI].TEmsStream.Status
        JNE     @@7
        MOV     AX,ES:[DI].TEmsStream.Position.Word[0]
        MOV     DX,ES:[DI].TEmsStream.Position.Word[2]
        ADD     AX,Count
        ADC     DX,BX
        ADD     AX,EmsPageSize-1
        ADC     DX,BX
        MOV     CX,EmsPageSize
        DIV     CX
        CMP     AX,ES:[DI].TEmsStream.PageCount
        JBE     @@4
        PUSH    BX
        CALL    EmsSetPages
        POP     BX
        JE      @@4
@@1:    MOV     DX,stWriteError
        CALL    DoStreamError
        JMP     @@7
@@2:    PUSH    BX
        CALL    EmsSelectPage
        POP     BX
        JNE     @@1
        MOV     AX,Count
        SUB     AX,BX
        CMP     CX,AX
        JB      @@3
        MOV     CX,AX
@@3:    ADD     ES:[DI].TEmsStream.Position.Word[0],CX
        ADC     ES:[DI].TEmsStream.Position.Word[2],0
        PUSH    ES
        PUSH    DS
        PUSH    DI
        MOV     DI,SI
        MOV     ES,EmsBaseSeg
        LDS     SI,Buf
        ADD     SI,BX
        ADD     BX,CX
        CLD
        REP     MOVSB
        POP     DI
        POP     DS
        POP     ES
@@4:    CMP     BX,Count
        JB      @@2
@@5:    MOV     AX,ES:[DI].TEmsStream.Position.Word[0]
        MOV     DX,ES:[DI].TEmsStream.Position.Word[2]
        CMP     DX,ES:[DI].TEmsStream.Size.Word[2]
        JB      @@7
        JA      @@6
        CMP     AX,ES:[DI].TEmsStream.Size.Word[0]
        JBE     @@7
@@6:    MOV     ES:[DI].TEmsStream.Size.Word[0],AX
        MOV     ES:[DI].TEmsStream.Size.Word[2],DX
@@7:
end;



{ TCollection }

const
  TCollection_Error    = vmtHeaderSize + $04;
  TCollection_SetLimit = vmtHeaderSize + $1C;

procedure CollectionError; near; assembler;
asm
        PUSH    AX
        PUSH    BX
        PUSH    ES
        PUSH    DI
        MOV     DI,ES:[DI]
        CALL    DWORD PTR [DI].TCollection_Error
end;

constructor TCollection.Init(ALimit, ADelta: Integer);
begin
  TObject.Init;
  Items := nil;
  Count := 0;
  Limit := 0;
  Delta := ADelta;
  SetLimit(ALimit);
end;

constructor TCollection.Load(var S: TStream);
var
  C, I: Integer;
begin
  S.Read(Count, SizeOf(Integer) * 3);
  Items := nil;
  C := Count;
  I := Limit;
  Count := 0;
  Limit := 0;
  SetLimit(I);
  Count := C;
  for I := 0 to C - 1 do AtPut(I, GetItem(S));
end;

destructor TCollection.Done;
begin
  FreeAll;
  SetLimit(0);
end;

function TCollection.At(Index: Integer): Pointer; assembler;
asm
        LES     DI,Self
        MOV     BX,Index
        OR      BX,BX
        JL      @@1
        CMP     BX,ES:[DI].TCollection.Count
        JGE     @@1
        LES     DI,ES:[DI].TCollection.Items
        SHL     BX,1
        SHL     BX,1
	MOV	AX,ES:[DI+BX]
	MOV	DX,ES:[DI+BX+2]
        JMP     @@2
@@1:    MOV     AX,coIndexError
        CALL    CollectionError
        XOR     AX,AX
        MOV     DX,AX
@@2:
end;

procedure TCollection.AtDelete(Index: Integer); assembler;
asm
        LES     DI,Self
        MOV     BX,Index
        OR      BX,BX
        JL      @@1
        CMP     BX,ES:[DI].TCollection.Count
        JGE     @@1
        DEC     ES:[DI].TCollection.Count
        MOV     CX,ES:[DI].TCollection.Count
        SUB     CX,BX
        JE      @@2
        CLD
        LES     DI,ES:[DI].TCollection.Items
        SHL     BX,1
        SHL     BX,1
        ADD     DI,BX
        LEA     SI,[DI+4]
        SHL     CX,1
        PUSH    DS
        PUSH    ES
        POP     DS
        REP     MOVSW
        POP     DS
        JMP     @@2
@@1:    MOV     AX,coIndexError
        CALL    CollectionError
@@2:
end;

procedure TCollection.AtFree(Index: Integer);
var
  Item: Pointer;
begin
  Item := At(Index);
  AtDelete(Index);
  FreeItem(Item);
end;

procedure TCollection.AtInsert(Index: Integer; Item: Pointer); assembler;
asm
        LES     DI,Self
        MOV     BX,Index
        OR      BX,BX
        JL      @@3
        MOV     CX,ES:[DI].TCollection.Count
        CMP     BX,CX
        JG      @@3
        CMP     CX,ES:[DI].TCollection.Limit
        JNE     @@1
        PUSH    CX
        PUSH    BX
        ADD     CX,ES:[DI].TCollection.Delta
        PUSH    CX
        PUSH    ES
        PUSH    DI
        MOV     DI,ES:[DI]
        CALL    DWORD PTR [DI].TCollection_SetLimit
        POP     BX
        POP     CX
        LES     DI,Self
        CMP     CX,ES:[DI].TCollection.Limit
        JE      @@4
@@1:    INC     ES:[DI].TCollection.Count
        STD
        LES     DI,ES:[DI].TCollection.Items
        SHL     CX,1
        ADD     DI,CX
        ADD     DI,CX
        INC     DI
        INC     DI
        SHL     BX,1
        SUB     CX,BX
        JE      @@2
        LEA     SI,[DI-4]
        PUSH    DS
        PUSH    ES
        POP     DS
        REP     MOVSW
        POP     DS
@@2:    MOV     AX,WORD PTR [Item+2]
        STOSW
        MOV     AX,WORD PTR [Item]
        STOSW
        CLD
        JMP     @@6
@@3:    MOV     AX,coIndexError
        JMP     @@5
@@4:    MOV     AX,coOverflow
        MOV     BX,CX
@@5:    CALL    CollectionError
@@6:
end;

procedure TCollection.AtPut(Index: Integer; Item: Pointer); assembler;
asm
	MOV	AX,Item.Word[0]
        MOV	DX,Item.Word[2]
        LES	DI,Self
        MOV     BX,Index
        OR      BX,BX
        JL      @@1
        CMP     BX,ES:[DI].TCollection.Count
        JGE     @@1
        LES     DI,ES:[DI].TCollection.Items
        SHL     BX,1
        SHL     BX,1
        MOV     ES:[DI+BX],AX
        MOV     ES:[DI+BX+2],DX
        JMP     @@2
@@1:    MOV     AX,coIndexError
        CALL    CollectionError
@@2:
end;

procedure TCollection.Delete(Item: Pointer);
begin
  AtDelete(IndexOf(Item));
end;

procedure TCollection.DeleteAll;
begin
  Count := 0;
end;

procedure TCollection.Error(Code, Info: Integer);
begin
  RunError(212 - Code);
end;

function TCollection.FirstThat(Test: Pointer): Pointer; assembler;
asm
        LES     DI,Self
        MOV     CX,ES:[DI].TCollection.Count
        JCXZ    @@2
        LES     DI,ES:[DI].TCollection.Items
@@1:    PUSH    ES
        PUSH    DI
        PUSH    CX
        PUSH    WORD PTR ES:[DI+2]
        PUSH    WORD PTR ES:[DI]
{$IFDEF Windows}
	MOV	AX,[BP]
	AND	AL,0FEH
	PUSH	AX
{$ELSE}
        PUSH    WORD PTR [BP]
{$ENDIF}
        CALL    Test
        POP     CX
        POP     DI
        POP     ES
        OR      AL,AL
        JNE     @@3
        ADD     DI,4
        LOOP    @@1
@@2:    XOR     AX,AX
        MOV     DX,AX
        JMP     @@4
@@3:	MOV	AX,ES:[DI]
	MOV	DX,ES:[DI+2]
@@4:
end;

procedure TCollection.ForEach(Action: Pointer); assembler;
asm
        LES     DI,Self
        MOV     CX,ES:[DI].TCollection.Count
        JCXZ    @@2
        LES     DI,ES:[DI].TCollection.Items
@@1:    PUSH    ES
        PUSH    DI
        PUSH    CX
        PUSH    WORD PTR ES:[DI+2]
        PUSH    WORD PTR ES:[DI]
{$IFDEF Windows}
	MOV	AX,[BP]
	AND	AL,0FEH
	PUSH	AX
{$ELSE}
        PUSH    WORD PTR [BP]
{$ENDIF}
        CALL    Action
        POP     CX
        POP     DI
        POP     ES
        ADD     DI,4
        LOOP    @@1
@@2:
end;

procedure TCollection.Free(Item: Pointer);
begin
  Delete(Item);
  FreeItem(Item);
end;

procedure TCollection.FreeAll;
var
  I: Integer;
begin
  for I := 0 to Count - 1 do FreeItem(At(I));
  Count := 0;
end;

procedure TCollection.FreeItem(Item: Pointer);
begin
  if Item <> nil then Dispose(PObject(Item), Done);
end;

function TCollection.GetItem(var S: TStream): Pointer;
begin
  GetItem := S.Get;
end;

function TCollection.IndexOf(Item: Pointer): Integer; assembler;
asm
	MOV	AX,Item.Word[0]
	MOV	DX,Item.Word[2]
        LES     DI,Self
        MOV     CX,ES:[DI].TCollection.Count
        JCXZ    @@3
        LES     DI,ES:[DI].TCollection.Items
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

procedure TCollection.Insert(Item: Pointer);
begin
  AtInsert(Count, Item);
end;

function TCollection.LastThat(Test: Pointer): Pointer; assembler;
asm
        LES     DI,Self
        MOV     CX,ES:[DI].TCollection.Count
        JCXZ    @@2
        LES     DI,ES:[DI].TCollection.Items
        MOV     AX,CX
        SHL     AX,1
        SHL     AX,1
        ADD     DI,AX
@@1:    SUB     DI,4
        PUSH    ES
        PUSH    DI
        PUSH    CX
        PUSH    WORD PTR ES:[DI+2]
        PUSH    WORD PTR ES:[DI]
{$IFDEF Windows}
	MOV	AX,[BP]
	AND	AL,0FEH
	PUSH	AX
{$ELSE}
        PUSH    WORD PTR [BP]
{$ENDIF}
        CALL    Test
        POP     CX
        POP     DI
        POP     ES
        OR      AL,AL
        JNE     @@3
        LOOP    @@1
@@2:    XOR     AX,AX
        MOV     DX,AX
        JMP     @@4
@@3:	MOV	AX,ES:[DI]
	MOV	DX,ES:[DI+2]
@@4:
end;

procedure TCollection.Pack; assembler;
asm
        LES     DI,Self
        MOV     CX,ES:[DI].TCollection.Count
        JCXZ    @@3
        LES     DI,ES:[DI].TCollection.Items
        MOV     SI,DI
        PUSH    DS
        PUSH    ES
        POP     DS
        CLD
@@1:    LODSW
        XCHG    AX,DX
        LODSW
        MOV     BX,AX
        OR      BX,DX
        JE      @@2
        XCHG    AX,DX
        STOSW
        XCHG    AX,DX
        STOSW
@@2:    LOOP    @@1
        POP     DS
        LES     BX,Self
        SUB     DI,WORD PTR ES:[BX].TCollection.Items
        SHR     DI,1
        SHR     DI,1
        MOV     ES:[BX].TCollection.Count,DI
@@3:
end;

procedure TCollection.PutItem(var S: TStream; Item: Pointer);
begin
  S.Put(Item);
end;

procedure TCollection.SetLimit(ALimit: Integer);
var
  AItems: PItemList;
begin
  if ALimit < Count then ALimit := Count;
  if ALimit > MaxCollectionSize then ALimit := MaxCollectionSize;
  if ALimit <> Limit then
  begin
    if ALimit = 0 then AItems := nil else
    begin
      GetMem(AItems, ALimit * SizeOf(Pointer));
      if (Count <> 0) and (Items <> nil) then
        Move(Items^, AItems^, Count * SizeOf(Pointer));
    end;
    if Limit <> 0 then FreeMem(Items, Limit * SizeOf(Pointer));
    Items := AItems;
    Limit := ALimit;
  end;
end;

procedure TCollection.Store(var S: TStream);

procedure DoPutItem(P: Pointer); far;
begin
  PutItem(S, P);
end;

begin
  S.Write(Count, SizeOf(Integer) * 3);
  ForEach(@DoPutItem);
end;

{ TSortedCollection }

constructor TSortedCollection.Init(ALimit, ADelta: Integer);
begin
  TCollection.Init(ALimit, ADelta);
  Duplicates := False;
end;

constructor TSortedCollection.Load(var S: TStream);
begin
  TCollection.Load(S);
  S.Read(Duplicates, SizeOf(Boolean));
end;

function TSortedCollection.Compare(Key1, Key2: String): Integer;
begin
  Abstract;
end;

function TSortedCollection.IndexOf(Item: Pointer): Integer;
var
  I: Integer;
begin
  IndexOf := -1;
  if Search(KeyOf(Item), I) then
  begin
    if Duplicates then
      while (I < Count) and (Item <> Items^[I]) do Inc(I);
    if I < Count then IndexOf := I;
  end;
end;

procedure TSortedCollection.Insert(Item: Pointer);
var
  I: Integer;
begin
  if not Search(KeyOf(Item), I) or Duplicates then AtInsert(I, Item);
end;

function TSortedCollection.KeyOf(Item: Pointer): String;
begin
  KeyOf := '';
end;

function TSortedCollection.Search(Key: String; var Index: Integer): Boolean;
var
  L, H, I, C: Integer;
begin
  Search := False;
  L := 0;
  H := Count - 1;
  while L <= H do
  begin
    I := (L + H) shr 1;
    C := Compare(KeyOf(Items^[I]), Key);
    if C < 0 then L := I + 1 else
    begin
      H := I - 1;
      if C = 0 then
      begin
        Search := True;
        if not Duplicates then L := I;
      end;
    end;
  end;
  Index := L;
end;

procedure TSortedCollection.Store(var S: TStream);
begin
  TCollection.Store(S);
  S.Write(Duplicates, SizeOf(Boolean));
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

procedure RegisterObjects;
begin
  RegisterType(RCollection);

end;

end.
