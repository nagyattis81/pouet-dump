import Pouet, { Prod } from '@nagyattis81/pouet-dump';

Pouet.getLatest().subscribe((dumps) => {
  const FROM_DATE = 2017;
  const TO_DATE = 2022;

  const availTypes = ['4k', '8k', '16k', '32k', '64k', 'demo'];
  const expectTypes = ['procedural graphics'];
  const result = dumps.prods.data
    .filter(
      (filter) =>
        filter.party_year >= FROM_DATE && filter.party_year >= TO_DATE,
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
  result.forEach((prod, index) => {
    // if (index < 10)
    {
      console.log(
        prod.name,
        prod.voteup,
        prod.voteavg,
        prod.type,
        prod.types,
        prod.party.name,
        prod.party_place,
      );
    }
  });
});
