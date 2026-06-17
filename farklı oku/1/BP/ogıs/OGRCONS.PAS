Unit  OGRCONS;
Interface
const

      MaxKeyLen        =  8;
      MaxAdLen         = 25;
      MaxSaat   : Byte = 30;
      MaxKredi  : Real = 25;

      OgrKeyL   = 8;
      DrsKeyL   = 6;
      UyeKeyL   = 6;
      YYDrsKeyL = 8;

      MaxOgr       = 1023;
      MaxDrs       = 2047;
      MaxUye       =  511;
      MaxYYDrs     =  639;

      MaxDonemDrs = 16;
      MaxDonem    = 20;



       CmdBolumSec  =   1;
       CmdBolumGir  =   2;
       CmdYilSec    =   3;
       CmdYeniYil   =   4;
       CmdNotDegis  =   5;
       CmdYeniNot   =   6;
       CmdUnvanSec  =   7;
       CmdUnvanGir  =   8;
       CmdMaxSt     =   9;
       CmdUniversite=   10;
       CmdQuitProg  =   11;


       CmdOgrGir  =   12;
       CmdDrsGir  =   13;
       CmdYYDrsGir=   14;
       CmdUyeGir  =   15;

       CmdOgrCikis  =   16;
       CmdDrsCikis  =   17;
       CmdYYDrsCikis=   18;
       CmdUyeCikis  =   19;

       CmdOgrIndex  =   20;
       CmdDrsIndex  =   21;
       CmdYYDrsIndex=   22;
       CmdUyeIndex  =   23;

       CmdEditYY        =   24;
       CmdYYNotGir      =   25;
       CmdListeHazirla  =   26;
       CmdYYListeBas    =   27;
       CmdBTNotGir      =   28;
       CmdBTListeHazirla=   29;
       CmdBTListeBas    =   30;

       CmdAnaEdit   =   31;
       CmdNotBelge  =   32;
       CmdMezBelge  =   33;
       CmdKarneBasim=   34;
       CmdAnaKutIsle=   35;
       CmdKrediDok  =   36;

       CmdOgrBasim      = 37;
       CmdDrsBasim      = 38;
       CmdYYDrsBasim    = 39;
       CmdUyeBasim      = 40;
       CmdMezunSakla    = 41;
       CmdYYDiskListeBas= 42;
       CmdBTDiskListeBas= 43;


Implementation
end.
