async function test() {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=tr&tl=de&dt=t&q=${encodeURIComponent('Merhaba dünya')}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
}
test();
