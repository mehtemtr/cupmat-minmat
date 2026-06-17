unit Unitunv;

interface

uses
  Windows, Messages, SysUtils, Classes, Graphics, Controls, Forms, Dialogs,
  Grids, DBGrids, Db, DBTables, StdCtrls;

type
  TForm1 = class(TForm)
    Table1: TTable;
    DataSource1: TDataSource;
    Table2: TTable;
    DataSource2: TDataSource;
    DBGrid1: TDBGrid;
    Button1: TButton;
    Table2UNVAN: TStringField;
    procedure Button1Click(Sender: TObject);
  private
    { Private declarations }
  public
    { Public declarations }
  end;

var
  Form1: TForm1;

implementation

{$R *.DFM}

procedure TForm1.Button1Click(Sender: TObject);
begin
table2.Edit;
Table2UNVAN.Value:='Prof. Dr.'; Table2.Insert;
Table2UNVAN.Value:='Doç. Dr.'; Table2.Insert;
Table2UNVAN.Value:='Yard. Doç. Dr.'; Table2.Insert;
Table2UNVAN.Value:='Ar. Gör.'; Table2.Insert;
Table2UNVAN.Value:='Öðr. Gör.'; Table2.Insert;
Table2UNVAN.Value:='Uzman'; Table2.Insert;
Table2UNVAN.Value:='Okutman'; Table2.Insert;
Table2UNVAN.Value:='Öðr. Gör. Dr.'; Table2.Insert;
Table2UNVAN.Value:='Ar. Gör. Dr.'; Table2.Insert;
Table2UNVAN.Value:='Diðer'; Table2.Insert;
Table2.post;

end;

end.
