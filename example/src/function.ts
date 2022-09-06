import Pouet, { Prod } from '@nagyattis81/pouet-dump';
import axios from 'axios';
import * as fs from 'fs';
import * as ProgressBar from 'progress';

enum DownloadType {
  DOWNLOAD,
  NO_DOWNLOAD,
}

function download(prods: Prod[], downloadType: DownloadType) {
  prods.forEach(async (prod) => {
    let url = prod.download;
    const PREFIX = 'https://files.scene.org/view/parties';
    if (url.startsWith(PREFIX)) {
      url =
        'https://files.scene.org/get/parties' + url.substring(PREFIX.length);
    }
    const fields = url.split('/');
    const prefix = String(prod.voteup).padStart(3, '0');
    const file = prefix + '_' + fields[fields.length - 1];
    if (downloadType === DownloadType.NO_DOWNLOAD) {
      console.log(file);
      return;
    }

    axios({
      url,
      method: 'GET',
      responseType: 'stream',
    }).then((response) => {
      const totalLength = response.headers['content-length'];
      if (totalLength) {
        const progressBar = new ProgressBar(
          'downloading [:bar] :percent :etas ' + url,
          {
            width: 40,
            complete: '=',
            incomplete: ' ',
            renderThrottle: 1,
            total: parseInt(totalLength),
          },
        );

        response.data.on('data', (chunk: any) => {
          progressBar.tick(chunk.length);
        });
      }
      response.data.pipe(fs.createWriteStream('./out/' + file));
    });
  });
}

Pouet.getLatest().subscribe((dumps) => {
  const FROM_DATE = 2017;
  const TO_DATE = 2022;
  const MAX_PROD = 80;

  const availTypes = ['4k', '8k', '16k', '32k', '64k', 'demo'];
  const expectTypes = ['procedural graphics'];
  const prods = dumps.prods.data
    .filter(
      (filter) =>
        filter.party_year >= FROM_DATE && filter.party_year <= TO_DATE,
    )
    .filter((filter) => filter.platforms['68'])
    .filter((filter) => {
      for (let i = 0; i < availTypes.length; i++) {
        if (filter.types.find((find) => find === availTypes[i])) {
          return true;
        }
      }
      return false;
    })
    .filter((filter) => {
      for (let i = 0; i < expectTypes.length; i++) {
        if (filter.types.find((find) => find === expectTypes[i])) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (a.voteup < b.voteup) {
        return 1;
      }
      if (a.voteup > b.voteup) {
        return -1;
      }
      return 0;
    })
    .slice(0, MAX_PROD);
  download(prods, DownloadType.DOWNLOAD);
});
