const fs = require('fs');

['public/minmat/app.html', 'public/minmat/index.html'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace('<div id="menuScreen" class="screen">', '<div id="menuScreen" class="screen active">');
  content = content.replace('<div id="gameScreen" class="screen active">', '<div id="gameScreen" class="screen">');
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed screen classes in:', file);
});
