const fs = require('fs');

const filePath = "d:/2026 dünya/farklı oku/1/NORMAL/DRS.DAT";

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath);
  const recordSize = 46;
  const headerSize = 10;
  const numRecords = (content.length - headerSize) / recordSize;
  
  console.log(`Total courses in DRS.DAT: ${numRecords}`);
  
  // Let's dump courses at index 549, 550, 689, 691, 704, 705, 706, 707, 708, 709, 710, 711, 712, 713, 715, 717, 718, 831, 832
  const targetIds = [549, 550, 689, 691, 702, 704, 705, 706, 707, 708, 709, 710, 711, 712, 713, 715, 717, 718, 831, 832];
  
  targetIds.forEach((id) => {
    // Check both 0-based and 1-based indexing
    // Let's use 1-based indexing (so index = id - 1)
    const idx = id - 1; 
    if (idx >= 0 && idx < numRecords) {
      const start = headerSize + idx * recordSize;
      const record = content.slice(start, start + recordSize);
      
      const code = record.slice(0, 6).toString('ascii').trim();
      
      // Course name is usually after code. Let's print the rest of the record.
      let name = "";
      for (let j = 6; j < recordSize; j++) {
        const char = record[j];
        if (char === 0 || char === 0x0D) break;
        let c = String.fromCharCode(char);
        if (char === 0x9e || char === 0x9f) c = 'ş';
        if (char === 0x98 || char === 0x8d) c = 'ı';
        if (char === 0x87) c = 'ç';
        if (char === 0x94 || char === 0x92) c = 'ö';
        name += c;
      }
      
      console.log(`Course ID ${id} (Index ${idx}): Code="${code}" Name="${name.trim()}"`);
    }
  });
} else {
  console.log("File not found");
}
