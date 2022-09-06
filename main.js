const PairService  = require('./services/PairService');


const startArbitrage = async () => {
  const pairService = new PairService();
  const pairs = await pairService.getAllPairs();
  pairService.identifyOpportunities(pairs);
}

startArbitrage();