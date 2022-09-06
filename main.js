const PairService  = require('./services/PairService');
const pairService = new PairService();

const startArbitrage = async () => {
  const pairs = await pairService.getAllPairs();
  pairService.identifyOpportunities(pairs);
}

const refreshPairs = async () => {
  try {
    await pairService.updatePairs();
  } catch (error) {
    console.log({error})
  }
}

// refreshPairs();
startArbitrage();