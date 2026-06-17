unit DFile;

interface
  uses UBase, Win, exist, Dos;
Type
   DataFile  =  object(Base)
        F           : File;
	FirstFree   : Word;
	Deltd       : Word;
	RecLen      : Word;
	MaxKay      : Word;
	IsOpen      : Word;

	Status      : Word;

	Constructor Init(MK, RL : Word);
	Procedure   Error;
	Procedure   WriteHeader;
	Procedure   ReadHeader;
	Procedure   GetRec(R : Word; Var Buf);
	Procedure   PutRec(R : Word; Var Buf);
	Procedure   AddRec(Var R : Word; Var Buffer);
	Procedure   OpenFile(FName  : String);
        Procedure   CloseFile;
	Function    NewRec: Word;
	Procedure   ReleaseRec(R : Word);
        Function    FileName:String;
 end;
 TextFile  =  object(Base)
        T           : Text;
	Status      : Word;
        Mode        : Word;
	Constructor Init;
	Procedure   Error;
	Function    ReadText:String;
	Procedure   WriteText(S:String);
	Procedure   OpenToWrite(FName  : String);
        Procedure   OpenToRead(FName  : String);
        Procedure   CloseFile;
        Function    FileName:String;
  end;

  Function DisketTak(Title:String):Boolean;
  Procedure   EraseFile(FName : String);
  Procedure RenameFile(FName1, FName2 : String);
  Function  CopyFile(Source, Dest : String):Boolean;
  Function FlPos(A,B,C : Word):LongInt;

  Var  Drive     : String;

Implementation
Function DisketTak(Title:String):Boolean;
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

Function ErrorStr(ErrorCode:Word):String;
Var S:String;
begin
  case ErrorCode of
      2: S := 'DOSYA BULUNAMADI';
      3: S := 'PAT˜KA BULUNAMADI';
      4: S := 'A€IK DOSYA SAYISI COK FAZLA';
      5: S := 'ER˜ž˜ME ˜Z˜N VER˜LMED˜';
      8: S := 'HAHIZA YETERS˜Z';
     15: S := 'GE€ERS˜Z SšRšCš';
     16: S := 'D˜RECTORY YI S˜LEMEM';
    100: S := 'D˜SK OKUMA HATASI';
    101: S := 'D˜SK YAZIM HATASI';
    150: S := 'D˜SK YAZIM ˜€˜N KORUMALI';
    152: S := 'SšRšCš HAZIR DE¦˜L';
    else S := '™N G™RšLMEYEN B˜R HATA';
  end;
  ErrorStr:=S;
end;


{$L FLPOS.OBJ}
{$F+}
Function FlPos(A,B,C : Word):LongInt;External;
{$F-}
Constructor DataFile.Init;
begin
   FirstFree := 1;
   Deltd     := 0;
   RecLen    := RL;
   MaxKay    := MK;
   IsOpen    := 0;
   Status    := 0;
end;

{$I-}
procedure DataFile.GetRec;
Var Result : Integer;
begin
    if IsOpen = 0 then
	Complain(FileName+' '+'DOSYA A€IK DE¦˜L')
    else
       If (R<=0) or (R > FirstFree) or (R>MaxKay) then
	   complain(FileName+' '+'GE€ERS˜Z KAYIT NO')
       else begin
	       Seek(F, FLPos(RecLen, R, Ofs(Status)-Ofs(FirstFree) ) );
	       Status:=IOResult;
	       If Status=0 then begin
		  BlockRead(F,Buf,RecLen,Result);
		  Status:=IOResult;
	       end;
	    end;
   Error;
end;

procedure DataFile.PutRec;
var
  Result : Integer;
begin
    if IsOpen = 0 then
	Complain(FileName+' '+'DOSYA A€IK DE¦˜L')
    else
	If (R<=0) or (R > FirstFree) or (R>MaxKay) then
	    complain(FileName+' '+'GE€ERS˜Z KAYIT NO')
	else begin
	       Seek(F, FLPos(RecLen, R, Ofs(Status)-Ofs(FirstFree) ));
	       Status:=IOResult;
	       If Status = 0 then begin
		  BlockWrite(F,Buf,RecLen,Result);
		  Status:=IOResult;
	       end;
	     end;
    Error;
end;
Procedure DataFile.AddRec(Var R : Word; Var Buffer);
begin
    if IsOpen = 0 then
	Complain(FileName+' '+'DOSYA A€IK DE¦˜L')
    else begin
	R:= NewRec;
	If R<>0 then
	   PutRec(R,Buffer)
	else
	   Complain(FileName+' '+'DOSYA DOLU');
    end;
end;


Procedure DataFile.OpenFile;
var
  B   : Boolean;
  Result, L   : Integer;
  Buf : Array[1..5] of Word;
begin
  If IsOpen<>0 then exit;
  B:=Exists(FName);
  if Not B then begin
      Assign(F,FName);
      ReWrite(F,1);
      Status:=IOResult;
      Error;
      If Status = 0 then begin
          FirstFree:=1;
          Deltd:=0;
          WriteHeader;
      end;
  end else begin
      Assign(F,FName);
      Reset(F,1);
      Status:=IOResult;
      If Status = 0 then begin
	 Seek(F, 0);
	 Status:=IOResult;
	 If Status = 0 then begin
	    BlockRead(F,Buf,Ofs(Status)-Ofs(FirstFree),Result);
	    Status:=IOResult;
	 end;
      end;
      Error;
      if Status = 0 then begin
	 If Buf[3]<>RecLen then begin
	    Complain(FileName+' '+'KAYIT UZUNLU¦U DE¦˜žM˜ž');
	    Close(F);
	    exit;
	 end;
	 If Buf[5]<>0 then Complain(FileName+' '+'DOSYA A€IK BIRAKILMIž');
	 ReadHeader;
     end;
  end;
  If Status =0 then begin IsOpen:=1; writeheader; Reset(F,1) end;
end;

procedure DataFile.CloseFile;

begin
    if IsOpen = 0 then exit;
    IsOpen:=0;
    WriteHeader;
    Close(F);
end;
Function DataFile.NewRec: Word;
Var
   Result:Integer;
   Buf : Array[1..2] of Word;
begin
    if IsOpen = 0 then exit;
    if Deltd = 0 then
       If FirstFree > MaxKay then
	    NewRec:=0
       else begin
	    NewRec   := FirstFree;
	    FirstFree:= Succ(FirstFree);
       end
    else  begin
       NewRec :=Deltd;
       Seek(F, FLPos(RecLen, Deltd, Ofs(Status)-Ofs(FirstFree) ));
       Status:=IOResult;
       If Status = 0 then begin
	  BlockRead(F,Buf,4,Result);
	  Status:=IOResult;
	  If Status = 0 then Deltd:=Buf[2];
       end;
    end;
    if Status = 0 then begin
       WriteHeader;
       Reset(F,1);
    end
   else Error
end;
procedure DataFile.ReleaseRec;
Var Buf : Array[1..2] of Word;
    Result:Integer;
begin
    if IsOpen=0 then exit;
    Buf[1] := $FFFF; Buf[2] :=Deltd;
    Seek(F,FLPos(RecLen, R, Ofs(Status)-Ofs(FirstFree)));
    Status:=IOResult;
    If Status = 0 then begin
      BlockWrite(F,Buf,4,Result);
      Status:=IOResult;
      If Status = 0 then begin
	Deltd:=R; WriteHeader; Reset(F,1);
      end else Error;
    end else Error;
end;
Procedure DataFile.ReadHeader;
Var Result:Integer;
begin
    Seek(F, 0);
    Status:=IOResult;
    If Status = 0 then
      BlockRead(F,FirstFree,Ofs(Status)-Ofs(FirstFree),Result);
    Error;
end;
Procedure DataFile.WriteHeader;
Var Result:Integer;
begin
    Seek(F, 0);
    Status:=IOResult;
    If Status = 0 then
      BlockWrite(F,FirstFree,Ofs(Status)-Ofs(FirstFree),Result);
    Error;
end;

Procedure DataFile.Error;
begin
  If Status = 0 then exit;
    complain(FileName+' '+ErrorStr(Status));
end;
Function DataFile.FileName:String;
Var S:String;
begin
    S:=FileRec(F).Name;
    S[0]:=Char(Pos(#0,S)-1);
    FileName:=S;
end;

Constructor TextFile.Init;
begin
   Status:=0;
   Mode:=0;
end;
Procedure   TextFile.Error;
begin
  If Status = 0 then exit;
    complain(FileName+' '+ErrorStr(Status));
end;
{$I-}
Function TextFile.ReadText:String;
Var S : String;
begin
    If Mode<>2 then Begin
       complain(FileName+' OKUMAYA A€IK DE¦˜L');
       exit
    end;
    if Eof(T) then begin
       complain(FileName+' DOSYA SONUNA ER˜ž˜LD˜');
       exit
    end;
    ReadLn(T,S);
    Status:=IOResult;
    Error;
    ReadText:=S;
end;
Procedure   TextFile.WriteText(S:String);
begin
    If Mode<>1 then Begin
       complain(FileName+' YAZIMA A€IK DE¦˜L');
       exit
    end;
    WriteLn(T,S);
    Status:=IOResult;
    Error;
end;
Procedure   TextFile.OpenToWrite(FName  : String);
Begin
   Assign(T,FName);
   ReWrite(T);
   Status:=IOResult;
   If Status=0 then
      Mode:=1
   else
      Error;
   end;
Procedure   TextFile.OpenToRead(FName  : String);
Begin
   Assign(T,FName);
   Reset(T);
   Status:=IOResult;
   If Status=0 then
      Mode:=2
   else
      Error;
   end;
Procedure   TextFile.CloseFile;
Begin
   If Mode=0 then exit;
   Close(T); Mode:=0;
   Status:=IOResult;
   If Status=0 then
      Mode:=0
   else
      Error; Status:=0;
   end;
{I+}
Function    TextFile.FileName:String;
Var S:String;
begin
    S:=TextRec(T).Name;
    S[0]:=Char(Pos(#0,S)-1);
    FileName:=S;
end;

Procedure EraseFile(FName : String);
var
  B   : Boolean;
  D   : DataFile;
begin
 with D do begin
    Init(1,1);
    B:=Exists(FName);
    if Not B then exit;
    Assign(F, FName);
    Erase(F);
    Status:=IoResult;
    If Status<>0 then Complain(FileName+' DOSYASINI S˜LEM˜YORUM');
 end;
 end;
Procedure RenameFile(FName1, FName2 : String);
var
  B   : Boolean;
  D   : DataFile;
begin
 with D do begin
    Init(1,1);
    B:=Exists(FName1);
    if Not B then exit;
    Assign(F, FName1);
    Rename(F, FName2);
    Status:=IoResult;
    If Status<>0 then Complain(FileName+' '+FName2+'OLARAK ˜S˜MLED˜R˜LEMED˜');
 end;
 end;

Function CopyFile(Source, Dest : String):Boolean;
Const  BufferSize = 1024*20;
Var Status         : Word;
    FSource, FDest : File;
    Buffer         : ^Byte;
{$I-}
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
       Complain(ErrorStr(Status));
       Close(FSource);
       exit
    end;
    Assign(FDest, Dest);
    Rewrite(FDest, 1);
    if Status <> 0 then begin
       Complain(ErrorStr(Status));
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
         Complain(ErrorStr(Status));
  	 Close(FSource);
	 Close(FDest);
	 EraseFile(Dest);
	 Exit;
      end;
      BlockWrite(FDest, Buffer^, Blocks, Blocks);
      Status:=IOResult;
      If Status<>0 then begin
        Complain(ErrorStr(Status));
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
begin
end.


