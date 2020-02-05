const electron = require('electron');
const remote = electron.remote;
const conf = require('../conf.json');

const hideIn = document.getElementById('hide-in');
const downPerc = document.getElementById('down-perc');
const urlIn = document.getElementById('url-in');
const letsGo = document.getElementById('lets-go');
const vidContainer = document.getElementById('vid-container');
const vidThumb = document.getElementById('vid-thumb');
const vidTitle = document.getElementById('vid-title');
const vidDate = document.getElementById('vid-date');
const vidDescription = document.getElementById('vid-description');

document.getElementById('close-window').onclick = () => {
  remote.getCurrentWindow().close();
};

urlIn.onkeyup = () => {
  let v = urlIn.value;

  if (v.match(/^https:\/\/www\.youtube\.com\/watch\?v=.{11}$/) || v.match(/^https:\/\/youtu\.be\/.{11}$/)) {
    let tkn = v.slice(-11);
    let thumbSrc = `http://img.youtube.com/vi/${tkn}/mqdefault.jpg`;
    vidContainer.style.display = 'flex';
    vidThumb.src = thumbSrc;

    fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${tkn}&key=${conf.key}`)
      .then(res => res.json())
      .then(res => {
        let info = res.items[0].snippet;
        let pubDate = new Date(info.publishedAt);
        vidTitle.innerHTML = info.title;
        vidDate.innerHTML = `${pubDate.getDate()}.${pubDate.getMonth() + 1}.${pubDate.getFullYear()} ${pubDate.getHours().toString().padStart(2, '0')}:${pubDate.getMinutes().toString().padStart(2, '0')}`;
        vidDescription.innerHTML = info.description;
        letsGo.disabled = false;
      });
  } else {
    vidContainer.style.display = 'none';
    letsGo.disabled = true;
  }
};

letsGo.onclick = () => {
  hideIn.style.display = 'block';
  downPerc.style.display = 'flex';
  hideIn.value = 0;
  downPerc.innerHTML = '0%';
  electron.ipcRenderer.send('download', urlIn.value);
};

electron.ipcRenderer.on('downloading', (event, percent) => {
  hideIn.value = percent;
  downPerc.innerHTML = percent + '%';
});

electron.ipcRenderer.on('finished', () => {
  hideIn.style.display = 'none';
  downPerc.style.display = 'none';
});