module.exports = {
    provider: process.env.WWS_ENDPOINT,

    binanceEndpoint:
        'https://api.binance.com/api/v3/ticker/price?symbols=["BNBBUSD","ETHBUSD","BTCBUSD","BNBETH","BNBBTC"]',

    ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',

    factoryAddress: {
        PANCAKE: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
        BISWAP: '0x858E3312ed3A876947EA49d572A7C42DE08af7EE',
        BAKERY: '0x01bF7C66c6BD861915CdaaE475042d3c4BaE16A7',
        // MDEX: '0x3CD1C46068dAEa5Ebb0d3f55F6915B10648062B8',
        // JULSWAP: '0x553990F2CBA90272390f62C5BDb1681fFc899675',
        // APESWAP: '0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6',
        NOMISWAP: '0xd6715a8be3944ec72738f0bfdc739d48c3c29349',
        // BABYSWAP: '0x86407bEa2078ea5f5EB5A52B2caA963bC1F889Da',
        // KNIGHTSWAP: '0xf0bc2E21a76513aa7CC2730C7A1D6deE0790751f',
    },

    routerAddress: {
        PANCAKE: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
        BISWAP: '0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8',
        BAKERY: '0xcde540d7eafe93ac5fe6233bee57e1270d3e330f',
        // MDEX: '0x3CD1C46068dAEa5Ebb0d3f55F6915B10648062B8',
        // JULSWAP: '0xbd67d157502A23309Db761c41965600c2Ec788b2',
        // APESWAP: '0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7',
        NOMISWAP: '0xd654953d746f0b114d1f85332dc43446ac79413d',
        // BABYSWAP: '0x325E343f1dE602396E256B67eFd1F61C3A6B38Bd',
        // KNIGHTSWAP: '0x05E61E0cDcD2170a76F9568a110CEe3AFdD6c46f',
    },

    tradingFees: {
        PANCAKE: 0.3,
        BISWAP: 0.2,
        BAKERY: 0.3,
        MDEX: 0.3,
        JULSWAP: 0.3,
        APESWAP: 0.2,
        NOMISWAP: 0.1,
        BABYSWAP: 0.3,
        KNIGHTSWAP: 0.2,
    },

    quoteTokens: {
        // usdc: {
        //     symbol: 'USDC',
        //     address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        // },
        usdt: {
            symbol: 'USDT',
            address: '0x55d398326f99059ff775485246999027b3197955',
        },
        wbnb: {
            symbol: 'WBNB',
            address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
        },
        // busd: {
        //     symbol: 'BUSD',
        //     address: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
        // },
    },

    baseTokens: {
        // usdc: {
        //     symbol: 'USDC',
        //     address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        // },
        usdt: {
            symbol: 'USDT',
            address: '0x55d398326f99059ff775485246999027b3197955',
        },
        wbnb: {
            symbol: 'WBNB',
            address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
        },
        // busd: {
        //     symbol: 'BUSD',
        //     address: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
        // },
        eth: {
            symbol: 'ETH',
            address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
        },
        btcb: {
            symbol: 'BTCB',
            address: '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
        },
        // cake: {
        //     symbol: 'CAKE',
        //     address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
        // },
        // bake: {
        //     symbol: 'BAKE',
        //     address: '0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5',
        // },
        // ada: {
        //     symbol: 'ADA',
        //     address: '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47',
        // },

        // TRON: {
        //     symbol: 'TRX',
        //     address: '0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B',
        // },
        // 'XRP Token': {
        //     symbol: 'XRP',
        //     address: '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE',
        // },
        // dot: {
        //     symbol: 'DOT',
        //     address: '0x7083609fce4d1d8dc0c979aab8c869ea2c873402',
        // },
        // link: {
        //     symbol: 'LINK',
        //     address: '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD',
        // },
        // uni: {
        //     symbol: 'UNI',
        //     address: '0xbf5140a22578168fd562dccf235e5d43a02ce9b1',
        // },
        // doge: {
        //     symbol: 'DOGE',
        //     address: '0x4206931337dc273a630d328dA6441786BfaD668f',
        // },
        // mdx: {
        //     symbol: 'MDX',
        //     address: '0x9c65ab58d8d978db963e63f2bfb7121627e3a739',
        // },
        // alpaca: {
        //     symbol: 'ALPACA',
        //     address: '0x8f0528ce5ef7b51152a59745befdd91d97091d2f',
        // },
        // band: {
        //     symbol: 'BAND',
        //     address: '0xad6caeb32cd2c308980a548bd0bc5aa4306c6c18',
        // },
        // bbadger: {
        //     symbol: 'bBADGER',
        //     address: '0x1f7216fdb338247512ec99715587bb97bbf96eae',
        // },
        // beth: {
        //     symbol: 'BETH',
        //     address: '0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B',
        // },
        // cream: {
        //     symbol: 'CREAM',
        //     address: '0xd4cb328a82bdf5f03eb737f37fa6b370aef3e888',
        // },
        // inj: {
        //     symbol: 'INJ',
        //     address: '0xa2b726b1145a4773f68593cf171187d8ebe4d495',
        // },
        // beefy: {
        //     symbol: 'BEFI',
        //     address: '0xCa3F508B8e4Dd382eE878A314789373D80A5190A',
        // },
        // atm: {
        //     symbol: 'ATM',
        //     address: '0x25e9d05365c867e59c1904e7463af9f312296f9e',
        // },
        // badpad: {
        //     symbol: 'BSCPAD',
        //     address: '0x5a3010d4d8d3b5fb49f8b6e57fb9e48063f16700',
        // },
        // bunny: {
        //     symbol: 'BUNNY',
        //     address: '0xc9849e6fdb743d08faee3e34dd2d1bc69ea11a51',
        // },
        // eps: {
        //     symbol: 'EPS',
        //     address: '0xa7f552078dcc247c2684336020c03648500c6d9f',
        // },
        // iron: {
        //     symbol: 'IRON',
        //     address: '0x7b65b489fe53fce1f6548db886c08ad73111ddd8',
        // },
        // lina: {
        //     symbol: 'LINA',
        //     address: '0x762539b45a1dcce3d36d080f74d1aed37844b878',
        // },
        // alpha: {
        //     symbol: 'ALPHA',
        //     address: '0xa1faa113cbE53436Df28FF0aEe54275c13B40975',
        // },
        // venus: {
        //     symbol: 'XVS',
        //     address: '0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63',
        // },
        // twt: {
        //     symbol: 'TWT',
        //     address: '0x4B0F1812e5Df2A09796481Ff14017e6005508003',
        // },
        // vai: {
        //     symbol: 'VAI',
        //     address: '0x4bd17003473389a42daf6a0a729f6fdb328bbbd7',
        // },
        // nerve: {
        //     symbol: 'NRV',
        //     address: '0x42f6f551ae042cbe50c739158b4f0cac0edb9096',
        // },
        // btcst: {
        //     symbol: 'BTCST',
        //     address: '0x78650b139471520656b9e7aa7a5e9276814a38e9',
        // },
        // auto: {
        //     symbol: 'AUTO',
        //     address: '0xa184088a740c695e156f91f5cc086a06bb78b827',
        // },
        // kickpad: {
        //     symbol: 'KICKPAD',
        //     address: '0xcfefa64b0ddd611b125157c41cd3827f2e8e8615',
        // },
        // oction: {
        //     symbol: 'OCTI',
        //     address: '0x6c1de9907263f0c12261d88b65ca18f31163f29d',
        // },
        // oneinch: {
        //     symbol: '1INCH',
        //     address: '0x111111111117dc0aa78b770fa6a738034120c302',
        // },
        // vancat: {
        //     symbol: 'VANCAT',
        //     address: '0x8597ba143ac509189e89aab3ba28d661a5dd9830',
        // },
        // sfp: {
        //     symbol: 'SFP',
        //     address: '0xd41fdb03ba84762dd66a0af1a6c8540ff1ba5dfb',
        // },
        // sparta: {
        //     symbol: 'SPARTA',
        //     address: '0xe4ae305ebe1abe663f261bc00534067c80ad677c',
        // },
        // tcake: {
        //     symbol: 'TCAKE',
        //     address: '0x3b831d36ed418e893f42d46ff308c326c239429f',
        // },
        // fairmoon: {
        //     symbol: 'FAIRMOON',
        //     address: '0xfe75cd11e283813ec44b4592476109ba3706cef6',
        // },
        // orakuru: {
        //     symbol: 'ORK',
        //     address: '0xced0ce92f4bdc3c2201e255faf12f05cf8206da8',
        // },
        // bgov: {
        //     symbol: 'BGOV',
        //     address: '0xf8e026dc4c0860771f691ecffbbdfe2fa51c77cf',
        // },
        // frontier: {
        //     symbol: 'FRONT',
        //     address: '0x928e55dab735aa8260af3cedada18b5f70c72f1b',
        // },
        // swampy: {
        //     symbol: 'SWAMP',
        //     address: '0xc5a49b4cbe004b6fd55b30ba1de6ac360ff9765d',
        // },
        // ele: {
        //     symbol: 'ELE',
        //     address: '0xacd7b3d9c10e97d0efa418903c0c7669e702e4c0',
        // },
        // bondly: {
        //     symbol: 'BONDLY',
        //     address: '0x96058f8c3e16576d9bd68766f3836d9a33158f89',
        // },
        // ramp: {
        //     symbol: 'RAMP',
        //     address: '0x8519ea49c997f50ceffa444d240fb655e89248aa',
        // },
        // googse: {
        //     symbol: 'EGG',
        //     address: '0xf952fc3ca7325cc27d15885d37117676d25bfda6',
        // },
        // aioz: {
        //     symbol: 'AIOZ',
        //     address: '0x33d08d8c7a168333a85285a68c0042b39fc3741d',
        // },
        // starter: {
        //     symbol: 'START',
        //     address: '0x31d0a7ada4d4c131eb612db48861211f63e57610',
        // },
        // dshare: {
        //     symbol: 'SBDO',
        //     address: '0x0d9319565be7f53cefe84ad201be3f40feae2740',
        // },
        // bdollar: {
        //     symbol: 'BDO',
        //     address: '0x190b589cf9fb8ddeabbfeae36a813ffb2a702454',
        // },
        // swipe: {
        //     symbol: 'SXP',
        //     address: '0x47bead2563dcbf3bf2c9407fea4dc236faba485a',
        // },
        // tornado: {
        //     symbol: 'TORN',
        //     address: '0x40318becc7106364D6C41981956423a7058b7455',
        // },
        // lit: {
        //     symbol: 'LIT',
        //     address: '0xb59490aB09A0f526Cc7305822aC65f2Ab12f9723',
        // },
        // alice: {
        //     symbol: 'ALICE',
        //     address: '0xac51066d7bec65dc4589368da368b212745d63e8',
        // },
        // reef: {
        //     symbol: 'REEF',
        //     address: '0xf21768ccbc73ea5b6fd3c687208a7c2def2d966e',
        // },
        // pet: {
        //     symbol: 'PET',
        //     address: '0x4d4e595d643dc61ea7fcbf12e4b1aaa39f9975b8',
        // },
        // alice: {
        //     symbol: 'ALICE',
        //     address: '0xAC51066d7bEC65Dc4589368da368b212745d63E8',
        // },
        // alinx: {
        //     symbol: 'ALIX',
        //     address: '0xaF6Bd11A6F8f9c44b9D18f5FA116E403db599f8E',
        // },
        // alphaToken: {
        //     symbol: 'ALPHA',
        //     address: '0xa1faa113cbE53436Df28FF0aEe54275c13B40975',
        // },
        // altura: {
        //     symbol: 'ALU',
        //     address: '0x8263CD1601FE73C066bf49cc09841f35348e3be0',
        // },

        // Altura: {
        //     symbol: 'ALU',
        //     address: '0x8263CD1601FE73C066bf49cc09841f35348e3be0',
        // },

        // Automata: {
        //     symbol: 'ATA',
        //     address: '0xA2120b9e674d3fC3875f415A7DF52e382F141225',
        // },

        // 'Cosmos Token': {
        //     symbol: 'ATOM',
        //     address: '0x0Eb3a705fc54725037CC9e008bDede697f62F335',
        // },

        // 'Axie Infinity Shard': {
        //     symbol: 'AXS',
        //     address: '0x715D400F88C167884bbCc41C5FeA407ed4D2f8A0',
        // },

        // 'Baby Doge Coin': {
        //     symbol: 'BABYDOGE',
        //     address: '0xc748673057861a797275CD8A068AbB95A902e8de',
        // },

        // Bear: {
        //     symbol: 'BEAR',
        //     address: '0xc3EAE9b061Aa0e1B9BD3436080Dc57D2d63FEdc1',
        // },

        // 'Bella Protocol': {
        //     symbol: 'BEL',
        //     address: '0x8443f091997f06a61670B735ED92734F5628692F',
        // },

        // 'BELT Token': {
        //     symbol: 'BELT',
        //     address: '0xE0e514c71282b6f4e823703a39374Cf58dc3eA4f',
        // },

        // Binemon: {
        //     symbol: 'BIN',
        //     address: '0xe56842Ed550Ff2794F010738554db45E60730371',
        // },

        // Binamon: {
        //     symbol: 'BMON',
        //     address: '0x08ba0619b1e7A582E0BCe5BBE9843322C954C340',
        // },

        // BinaryX: {
        //     symbol: 'BNX',
        //     address: '0x8C851d1a123Ff703BD1f9dabe631b69902Df5f97',
        // },

        // BunnyPark: {
        //     symbol: 'BP',
        //     address: '0xACB8f52DC63BB752a51186D1c55868ADbFfEe9C1',
        // },

        // 'BSCPAD.com': {
        //     symbol: 'BSCPAD',
        //     address: '0x5A3010d4d8D3B5fB49f8B6E57FB9E48063f16700',
        // },

        // 'BitTorrent Old': {
        //     symbol: 'BTTOLD',
        //     address: '0x8595F9dA7b868b1822194fAEd312235E43007b49',
        // },

        // Coin98: {
        //     symbol: 'C98',
        //     address: '0xaEC945e04baF28b135Fa7c640f624f8D90F1C3a6',
        // },

        // Chess: {
        //     symbol: 'CHESS',
        //     address: '0x20de22029ab63cf9A7Cf5fEB2b737Ca1eE4c82A6',
        // },

        // Chroma: {
        //     symbol: 'CHR',
        //     address: '0xf9CeC8d50f6c8ad3Fb6dcCEC577e05aA32B224FE',
        // },

        // CP: {
        //     symbol: 'CP',
        //     address: '0x82C19905B036bf4E329740989DCF6aE441AE26c1',
        // },

        // 'DeRace Token': {
        //     symbol: 'DERC',
        //     address: '0x373E768f79c820aA441540d254dCA6d045c6d25b',
        // },

        // 'DODO bird': {
        //     symbol: 'DODO',
        //     address: '0x67ee3Cb086F8a16f34beE3ca72FAD36F7Db929e2',
        // },

        // Dogecoin: {
        //     symbol: 'DOGE',
        //     address: '0xbA2aE424d960c26247Dd6c32edC70B295c744C43',
        // },

        // 'My DeFi Pet Token': {
        //     symbol: 'DPET',
        //     address: '0xfb62AE373acA027177D1c18Ee0862817f9080d08',
        // },

        // 'DeathRoad Token': {
        //     symbol: 'DRACE',
        //     address: '0xA6c897CaaCA3Db7fD6e2D2cE1a00744f40aB87Bb',
        // },

        // DragonSlayer: {
        //     symbol: 'DRS',
        //     address: '0xc8E8ecB2A5B5d1eCFf007BF74d15A86434aA0c5C',
        // },

        // Dvision: {
        //     symbol: 'DVI',
        //     address: '0x758FB037A375F17c7e195CC634D77dA4F554255B',
        // },

        // 'Etherconnect Coin': {
        //     symbol: 'ECC',
        //     address: '0x8D047F4F57A190C96c8b9704B39A1379E999D82B',
        // },

        // Ellipsis: {
        //     symbol: 'EPS',
        //     address: '0xA7f552078dcC247C2684336020c03648500C6d9F',
        // },

        // FaraCrystal: {
        //     symbol: 'FARA',
        //     address: '0xF4Ed363144981D3A65f42e7D0DC54FF9EEf559A1',
        // },

        // FLOKI: {
        //     symbol: 'FLOKI',
        //     address: '0x2B3F34e9D4b127797CE6244Ea341a83733ddd6E4',
        // },

        // 'Formation Finance': {
        //     symbol: 'FORM',
        //     address: '0x25A528af62e56512A19ce8c3cAB427807c28CC19',
        // },

        // 'Frontier Token': {
        //     symbol: 'FRONT',
        //     address: '0x928e55daB735aa8260AF3cEDadA18B5f70C72f1b',
        // },

        // 'CyberDragon Gold': {
        //     symbol: 'GOLD',
        //     address: '0xb3a6381070B1a15169DEA646166EC0699fDAeA79',
        // },

        // StepHero: {
        //     symbol: 'HERO',
        //     address: '0xE8176d414560cFE1Bf82Fd73B986823B89E4F545',
        // },

        // Metahero: {
        //     symbol: 'HERO',
        //     address: '0xD40bEDb44C081D2935eebA6eF5a3c8A31A1bBE13',
        // },

        // 'Honey token': {
        //     symbol: 'HONEY',
        //     address: '0xFa363022816aBf82f18a9C2809dCd2BB393F6AC5',
        // },

        // 'Hunny Token': {
        //     symbol: 'HUNNY',
        //     address: '0x565b72163f17849832A692A3c5928cc502f46D69',
        // },

        // 'Injective Protocol': {
        //     symbol: 'INJ',
        //     address: '0xa2B726B1145A4773F68593CF171187d8EBe4d495',
        // },

        // 'IoTeX Network': {
        //     symbol: 'IOTX',
        //     address: '0x9678E42ceBEb63F23197D726B29b1CB20d0064E5',
        // },

        // 'Kaby Arena': {
        //     symbol: 'KABY',
        //     address: '0x02A40C048eE2607B5f5606e445CFc3633Fb20b58',
        // },

        // KmonCoin: {
        //     symbol: 'KMON',
        //     address: '0xc732B6586A93b6B7CF5FeD3470808Bc74998224D',
        // },

        // 'Linear Token': {
        //     symbol: 'LINA',
        //     address: '0x762539b45A1dCcE3D36d080F74d1AED37844b878',
        // },

        // 'ChainLink Token': {
        //     symbol: 'LINK',
        //     address: '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD',
        // },

        // 'Mask Network': {
        //     symbol: 'MASK',
        //     address: '0x2eD9a5C8C13b93955103B9a7C167B67Ef4d568a3',
        // },

        // Mobox: {
        //     symbol: 'MBOX',
        //     address: '0x3203c9E46cA618C8C1cE5dC67e7e9D75f5da2377',
        // },

        // MiniFootball: {
        //     symbol: 'MINIFOOTBALL',
        //     address: '0xD024Ac1195762F6F13f8CfDF3cdd2c97b33B248b',
        // },

        // Mist: {
        //     symbol: 'MIST',
        //     address: '0x68E374F856bF25468D365E539b700b648Bf94B67',
        // },

        // 'Mound Token': {
        //     symbol: 'MND',
        //     address: '0x4c97c901B5147F8C1C7Ce3c5cF3eB83B44F244fE',
        // },

        // 'Monsta Infinite Token': {
        //     symbol: 'MONI',
        //     address: '0x9573c88aE3e37508f87649f87c4dd5373C9F31e0',
        // },

        // Nafter: {
        //     symbol: 'NAFT',
        //     address: '0xD7730681B1DC8f6F969166B29D8A5EA8568616a3',
        // },

        // Nobility: {
        //     symbol: 'NBL',
        //     address: '0xA67a13c9283Da5AABB199Da54a9Cb4cD8B9b16bA',
        // },

        // NFTB: {
        //     symbol: 'NFTB',
        //     address: '0xde3dbBE30cfa9F437b293294d1fD64B26045C71A',
        // },

        // Nerve: {
        //     symbol: 'NRV',
        //     address: '0x42F6f551ae042cBe50C739158b4f0CAC0Edb9096',
        // },

        // 'Harmony ONE': {
        //     symbol: 'ONE',
        //     address: '0x03fF0ff224f904be3118461335064bB48Df47938',
        // },

        // 'PAID Network': {
        //     symbol: 'PAID',
        //     address: '0xAD86d0E9764ba90DDD68747D64BFfBd79879a238',
        // },

        // 'PET GAMES': {
        //     symbol: 'PETG',
        //     address: '0x09607078980CbB0665ABa9c6D1B84b8eAD246aA0',
        // },

        // 'Pink Token': {
        //     symbol: 'PINK',
        //     address: '0x9133049Fb1FdDC110c92BF5b7Df635abB70C89DC',
        // },

        // Polkamon: {
        //     symbol: 'PMON',
        //     address: '0x1796ae0b0fa4862485106a0de9b654eFE301D0b2',
        // },

        // 'Poco Token': {
        //     symbol: 'POCO',
        //     address: '0x394bBA8F309f3462b31238B3fd04b83F71A98848',
        // },

        // Moonpot: {
        //     symbol: 'POTS',
        //     address: '0x3Fcca8648651E5b974DD6d3e50F61567779772A8',
        // },

        // 'Plant vs Undead Token': {
        //     symbol: 'PVU',
        //     address: '0x31471E0791fCdbE82fbF4C44943255e923F1b794',
        // },

        // 'PandaInu Wallet Token': {
        //     symbol: 'PWT',
        //     address: '0xf3eDD4f14a018df4b6f02Bf1b2cF17A8120519A2',
        // },

        // 'Qubit Token': {
        //     symbol: 'QBT',
        //     address: '0x17B7163cf1Dbd286E262ddc68b553D899B93f526',
        // },

        // 'Radio Caca V2': {
        //     symbol: 'RACA',
        //     address: '0x12BB890508c125661E03b09EC06E404bc9289040',
        // },

        // 'RAMP DEFI': {
        //     symbol: 'RAMP',
        //     address: '0x8519EA49c997f50cefFa444d240fB655e89248Aa',
        // },

        // 'Reef.finance': {
        //     symbol: 'REEF',
        //     address: '0xF21768cCBC73Ea5B6fd3C687208a7c2def2d966e',
        // },

        // rUSD: {
        //     symbol: 'RUSD',
        //     address: '0x07663837218A003e66310a01596af4bf4e44623D',
        // },

        // 'SafePal Token': {
        //     symbol: 'SFP',
        //     address: '0xD41FDb03Ba84762dD66a0af1a6C8540FF1ba5dfb',
        // },

        // SeedifyFund: {
        //     symbol: 'SFUND',
        //     address: '0x477bC8d23c634C154061869478bce96BE6045D12',
        // },

        // Shirtum: {
        //     symbol: 'SHI',
        //     address: '0x7269d98Af4aA705e0B1A5D8512FadB4d45817d5a',
        // },

        // 'CryptoBlades Skill Token': {
        //     symbol: 'SKILL',
        //     address: '0x154A9F9cbd3449AD22FDaE23044319D6eF2a1Fab',
        // },

        // StarMon: {
        //     symbol: 'SMON',
        //     address: '0xAB15B79880f11cFfb58dB25eC2bc39d28c4d80d2',
        // },

        // Splintershards: {
        //     symbol: 'SPS',
        //     address: '0x1633b7157e7638C4d6593436111Bf125Ee74703F',
        // },

        // SushiToken: {
        //     symbol: 'SUSHI',
        //     address: '0x947950BcC74888a40Ffa2593C5798F11Fc9124C4',
        // },

        // Swipe: {
        //     symbol: 'SXP',
        //     address: '0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A',
        // },

        // 'Tokocrypto Token': {
        //     symbol: 'TKO',
        //     address: '0x9f589e3eabe42ebC94A44727b3f3531C0c877809',
        // },

        // 'Alien Worlds Trilium': {
        //     symbol: 'TLM',
        //     address: '0x2222227E22102Fe3322098e4CBfE18cFebD57c95',
        // },

        // 'TokenPocket Token': {
        //     symbol: 'TPT',
        //     address: '0xECa41281c24451168a37211F0bc2b8645AF45092',
        // },

        // 'TRONPAD.network': {
        //     symbol: 'TRONPAD',
        //     address: '0x1Bf7AedeC439D6BFE38f8f9b20CF3dc99e3571C4',
        // },

        // TrusterCoin: {
        //     symbol: 'TSC',
        //     address: '0xA2a26349448ddAfAe34949a6Cc2cEcF78c0497aC',
        // },

        // TrueUSD: {
        //     symbol: 'TUSD',
        //     address: '0x14016E85a25aeb13065688cAFB43044C2ef86784',
        // },

        // 'Trust Wallet': {
        //     symbol: 'TWT',
        //     address: '0x4B0F1812e5Df2A09796481Ff14017e6005508003',
        // },

        // 'UNCL on xDai on BSC': {
        //     symbol: 'UNCL',
        //     address: '0x0E8D5504bF54D9E44260f8d153EcD5412130CaBb',
        // },

        // 'UniCrypt on xDai on BSC': {
        //     symbol: 'UNCX',
        //     address: '0x09a6c44c3947B69E2B45F4D51b67E6a39ACfB506',
        // },

        // Uniswap: {
        //     symbol: 'UNI',
        //     address: '0xBf5140A22578168FD562DCcF235E5D43A02ce9B1',
        // },

        // 'Wrapped UST Token': {
        //     symbol: 'UST',
        //     address: '0x23396cF899Ca06c4472205fC903bDB4de249D6fC',
        // },

        // 'VAI Stablecoin': {
        //     symbol: 'VAI',
        //     address: '0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7',
        // },

        // 'Wanaka Farm': {
        //     symbol: 'WANA',
        //     address: '0x339C72829AB7DD45C3C52f965E7ABe358dd8761E',
        // },

        // WEYU: {
        //     symbol: 'WEYU',
        //     address: '0xFAfD4CB703B25CB22f43D017e7e0d75FEBc26743',
        // },

        // WINk: {
        //     symbol: 'WIN',
        //     address: '0xaeF0d72a118ce24feE3cD1d43d383897D05B4e99',
        // },
    },
}
