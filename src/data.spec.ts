import { Party, Prod, User } from './models';

export function createUser(id: string): User {
  return {
    avatar: 'avatar',
    glops: 0,
    id,
    level: 'level',
    nickname: 'nickname',
    registerDate: 'registerDate',
  };
}

export function createParty(id: string): Party {
  return {
    addedDate: 'addedDate',
    addedUser: 'addedUser',
    id,
    name: 'name',
    web: 'web',
  };
}

export function createProd(): Prod {
  return {
    id: '0',
    addedDate: 'addedDate',
    addedUser: 'addedUser',
    addeduser: createUser('1'),
    awards: [
      {
        awardType: 'awardType',
        categoryID: '0',
        id: '0',
        prodID: '0',
      },
    ],
    boardID: 'boardID',
    cdc: 0,
    credits: [
      {
        role: 'role',
        user: createUser('2'),
      },
    ],
    csdb: 'csdb',
    demozoo: 'demozoo',
    download: 'download',
    downloadLinks: [
      {
        link: 'link',
        type: 'type',
      },
    ],
    groups: [
      {
        acronym: 'acronym',
        addedDate: 'addedDate',
        addedUser: 'addedUser',
        csdb: 'csdb',
        demozoo: 'demozoo',
        disambiguation: 'disambiguation',
        id: '0',
        name: 'name',
        web: 'web',
        zxdemo: 'zxdemo',
      },
    ],
    invitation: 'invitation',
    invitationyear: 0,
    name: 'name',
    party: createParty('1'),
    party_compo: 'party_compo',
    party_compo_name: 'party_compo_name',
    party_place: 0,
    party_year: 0,
    placings: [
      {
        compo: 'compo',
        compo_name: 'compo_name',
        party: createParty('3'),
        ranking: 0,
        year: 0,
      },
    ],
    platforms: {
      '1': {
        icon: 'icon',
        name: 'name',
        slug: 'slug',
      },
    },
    popularity: 0,
    rank: 0,
    releaseDate: 'releaseDate',
    sceneorg: 'sceneorg',
    screenshot: 'screenshot',
    type: 'type',
    types: ['item'],
    voteavg: 0,
    votedown: 0,
    votepig: 0,
    voteup: 0,
    zxdemo: 'zxdemo',
  };
}

export function createProdResult(): any[] {
  return [
    {
      addedDate: 'addedDate',
      addedUserId: 1,
      addedUserName: 'addedUser',
      boardID: 'boardID',
      cdc: 0,
      csdb: 'csdb',
      demozoo: 'demozoo',
      download: 'download',
      id: 0,
      invitation: 'invitation',
      invitationyear: 0,
      name: 'name',
      party: null,
      party_compo: 'party_compo',
      party_compo_name: 'party_compo_name',
      party_place: 0,
      party_year: 0,
      popularity: 0,
      rank: 0,
      releaseDate: 'releaseDate',
      sceneorg: 'sceneorg',
      screenshot: 'screenshot',
      type: 'type',
      voteavg: 0,
      votedown: 0,
      votepig: 0,
      voteup: 0,
      zxdemo: 'zxdemo',
    },
  ];
}

export function createPartyResult(): any[] {
  return [
    {
      addedDate: 'addedDate',
      addedUser: 'addedUser',
      id: 1,
      name: 'name',
      web: 'web',
    },
  ];
}

export function createGroupResult(): any[] {
  return [
    {
      acronym: 'acronym',
      addedDate: 'addedDate',
      addedUser: 'addedUser',
      csdb: 'csdb',
      demozoo: 'demozoo',
      disambiguation: 'disambiguation',
      id: 0,
      name: 'name',
      web: 'web',
      zxdemo: 'zxdemo',
    },
  ];
}

export function createGroupsResult(): any[] {
  return [
    {
      group_: 0,
      prod: 0,
    },
  ];
}

export function createPlatformResult(): any[] {
  return [
    {
      icon: 'icon',
      id: 1,
      name: 'name',
      slug: 'slug',
    },
  ];
}

export function createTypesResult(): any[] {
  return [
    {
      prod: 0,
      value: 'item',
    },
  ];
}

export function createDownloadLinksResult(): any[] {
  return [
    {
      link: 'link',
      prod: 0,
      type: 'type',
    },
  ];
}

export function createCreditsResult(): any[] {
  return [
    {
      prod: 0,
      role: 'role',
      user: 2,
    },
  ];
}

export function createAwardsResult(): any[] {
  return [
    {
      awardType: 'awardType',
      categoryID: 0,
      id: 0,
      prodID: 0,
    },
  ];
}

export function createPlacingsResult(): any[] {
  return [
    {
      compo: 'compo',
      compo_name: 'compo_name',
      party: 3,
      prod: 0,
      ranking: 0,
      year: 0,
    },
  ];
}

describe('data.spec.ts', () => {
  it('OK', () => {
    expect(true).toBeTruthy();
  });
});
