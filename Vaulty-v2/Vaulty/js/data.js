const STORAGE_KEY = 'vaulty-data-v1';

const seedData = {
  monthlyIncome: 2000,
  incomes: [
    { id: crypto.randomUUID(), type: 'Mensuel', category: 'Salaire', name: 'Revenu mensuel', amount: 2000, date: new Date().toISOString().slice(0,10) },
    { id: crypto.randomUUID(), type: 'Ponctuel', category: 'Prime', name: 'Exemple de prime', amount: 120, date: new Date().toISOString().slice(0,10) }
  ],
  kangaroos: [
    { id: crypto.randomUUID(), name: 'Maison', description: 'Toutes les dépenses liées à la maison', category: 'Logement', budget: 900, expenses: [
      { id: crypto.randomUUID(), category: 'Assurances', description: 'Assurance maison', amount: 34.95, periodic: true, startDate: new Date().toISOString().slice(0,10) },
      { id: crypto.randomUUID(), category: 'Crédits', description: 'Crédit maison', amount: 678, periodic: true, startDate: new Date().toISOString().slice(0,10) }
    ]}
  ],
  squirrels: [
    { id: crypto.randomUUID(), name: 'Voyage Vienne', description: 'Préparer le voyage sans crédit', unlockMode: 'date', unlockDate: '2027-10-01', target: 200, saved: 80, expenses: [], categories: ['Transport','Hébergement'] },
    { id: crypto.randomUUID(), name: 'TV', description: "M'acheter une télévision", unlockMode: 'target', unlockDate: '', target: 250, saved: 40, expenses: [], categories: ['Équipement'] }
  ]
};

function loadData(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || structuredClone(seedData); }
  catch { return structuredClone(seedData); }
}
function saveData(data){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function resetData(){ localStorage.removeItem(STORAGE_KEY); return structuredClone(seedData); }
