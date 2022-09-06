
### updatePairs
##### (void)
Récupère les adresses des paires à partir d'un tableau et les enregistre dans un fichier JSON 

### getAllPairs
##### (void)
Récupère toutes les paires à partir du fichier JSON

### getPairPrice
##### (address :string)
Récupère le prix d'une pair à partir de son adresse.

### identifyOpportunities
##### (pairs :array)
Identifie les opportunités à partir d'un tableau de prix avec des paires.

### calculateNetProfit
##### (priceA :int, priceB :int)
Calcule le profit net en prenant en compte tous les paramètres externes.

### compare
##### (void)
Fonction pour comparer un tableau de plusieurs valeurs et le réorganiser de façon ascendante.

### startArbitrage
##### (void)
Actionne la fonction getAllPairs() puis identifyOpportunities().

