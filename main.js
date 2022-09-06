const { getAllPairs, identifyOpportunities } = require('./services/pairService');


const startArbitrage = async () => {
  const pairs = await getAllPairs();
  identifyOpportunities(pairs);
}

startArbitrage();