import Pouet from '@nagyattis81/pouet-dump';
import axios from 'axios';
import * as fs from 'fs';
const ProgressBar = require('progress');

Pouet.getLatest().subscribe((dumps) => {
  const FROM_DATE = 2017;
  const TO_DATE = 2022;

  const availTypes = ['4k', '8k', '16k', '32k', '64k', 'demo'];
  const expectTypes = ['procedural graphics'];
  const result = dumps.prods.data
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
    .filter((filter) => filter.party_place < 4)
    .filter((filter) => filter.voteup > 20)
    .sort((a, b) => {
      if (a.voteup < b.voteup) {
        return 1;
      }
      if (a.voteup > b.voteup) {
        return -1;
      }
      return 0;
    });

  console.log(result.length);
  result.forEach(async (prod, index) => {
    // if (index < 10)
    {
      /* console.log(
        prod.name,
        prod.voteup,
        prod.voteavg,
        prod.type,
        prod.party.name,
        prod.party_year,
        prod.party_place,
        prod.download,
      ); */
      let url = prod.download;
      const PREFIX = 'https://files.scene.org/view/parties';
      if (url.startsWith(PREFIX)) {
        url =
          'https://files.scene.org/get/parties' + url.substring(PREFIX.length);
      }
      const fields = url.split('/');
      const file = fields[fields.length - 1];
      console.log(url, file);
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
      });
      {
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
        const prefix = String(prod.voteup).padStart(3, '0');
        response.data.pipe(
          fs.createWriteStream('./out/' + prefix + '_' + file),
        );
      }
    }
  });
});
