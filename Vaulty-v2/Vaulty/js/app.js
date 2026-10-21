
let data = loadData();
let route = { page:'home', tab:'list' };
let visualFilters = { types: new Set(['lizards','kangaroos','squirrels']), period: '6', category: 'all' };
const app = document.querySelector('#app');
const nav = document.querySelector('#sectionNav');
const title = document.querySelector('#pageTitle');
const subtitle = document.querySelector('#pageSubtitle');
const toast = document.querySelector('#toast');

const pageMeta = {
  home:['Vaulty','Mon budget, en équilibre'],
  lizards:['Lézards','Les revenus qui alimentent Vaulty'],
  kangaroos:['Kangourous','Les enveloppes de dépenses'],
  squirrels:['Écureuils','Les projets financés sans crédit'],
  eagle:["L'Aigle",'Visualiser, prévoir, convertir']
};

function notify(message){ toast.textContent=message; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),1800); }
function persist(message='Enregistré'){ saveData(data); render(); notify(message); }
function go(page,tab='list'){ route={page,tab}; render(); app.focus({preventScroll:true}); window.scrollTo({top:0,behavior:'smooth'}); }
window.go = go;

function empty(){ return `<div class="empty-state glass-card"><span class="empty-icon">✦</span><h3>Aucun élément pour l'instant</h3><p>Utilise le bouton + pour commencer.</p></div>`; }
function navButton(tab,icon,label){ return `<button data-tab="${tab}" class="${route.tab===tab?'active':''}"><span>${icon}</span> ${label}</button>`; }
function configureNav(){
  if(route.page==='home'){nav.classList.add('hidden');nav.innerHTML='';return;}
  nav.classList.remove('hidden');
  nav.innerHTML = route.page==='eagle'
    ? navButton('visual','◉','Visualisation')+navButton('preview','◇','Prévisualisation')+navButton('euro','€','Euro')
    : navButton('list','☷','Liste')+navButton('add','＋','Ajouter');
  nav.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>go(route.page,btn.dataset.tab)));
}

function render(){
  [title.textContent,subtitle.textContent]=pageMeta[route.page];
  configureNav();
  if(route.page==='home') app.innerHTML=homeView();
  if(route.page==='lizards') app.innerHTML=lizardsView();
  if(route.page==='kangaroos') app.innerHTML=kangaroosView();
  if(route.page==='squirrels') app.innerHTML=squirrelsView();
  if(route.page==='eagle') app.innerHTML=eagleView();
  bindActions();
}

function homeView(){
  return `<section class="hero">
    <img class="hero-logo" src="assets/images/logo-vaulty.png" alt="Coffre Vaulty avec une aile">
    <div><h1>Vaulty</h1></div>
    <blockquote class="quote glass-card"><strong>Proverbes 23:4, 5 :</strong> « Ne t’épuise pas à acquérir des richesses. Arrête et fais preuve d’intelligence. Quand tu portes le regard vers elles, elles ne sont plus là, car vraiment elles se font des ailes comme celles d’un aigle et s’envolent dans le ciel. »</blockquote>
  </section>
  <section class="menu-grid" aria-label="Menus de Vaulty">
    ${menu('lizards','🦎','Lézards','Revenus mensuels et ponctuels')}
    ${menu('kangaroos','🦘','Kangourous','Dépenses et crédits du quotidien')}
    ${menu('squirrels','🐿️','Écureuils','Épargne et projets futurs')}
    ${menu('eagle','🦅',"L'Aigle",'Tableau de bord et projections')}
  </section>`;
}
function menu(page,icon,name,desc){return `<button class="menu-card" data-go="${page}"><span class="menu-icon">${icon}</span><h2>${name}</h2><p>${desc}</p></button>`}

function lizardsView(){
  if(route.tab==='add') return sectionIntro('Nouveau Lézard','Enregistre une entrée mensuelle ou ponctuelle')+incomeForm();
  const total=sum(data.incomes,x=>x.amount);
  return sectionIntro('Mes Lézards','Les revenus disponibles et leur origine')+
  `<div class="balance">${money(total)}</div><div class="stats"><div class="stat glass-card"><span>Lézard mensuel</span><strong>${money(data.monthlyIncome)}</strong></div><div class="stat glass-card"><span>Total accumulé</span><strong class="positive">${money(total)}</strong></div><div class="stat glass-card"><span>Entrées</span><strong>${data.incomes.length}</strong></div></div>`+
  `<div class="list">${data.incomes.map(x=>`<article class="item glass-card"><div><h3>${escapeHTML(x.name)}</h3><p>${escapeHTML(x.category)} · ${dateFR(x.date)}</p><span class="badge">${escapeHTML(x.type)}</span></div><div class="item-value"><strong class="positive">+ ${money(x.amount)}</strong><div class="item-actions"><button class="mini-button delete" data-kind="income" data-id="${x.id}">Supprimer</button></div></div></article>`).join('')||empty()}</div>`;
}
function incomeForm(){return `<form class="form-card glass-card" id="incomeForm"><h2>Détails du Lézard</h2><div class="form-grid">
  <div class="field"><label>Type de Lézard</label><select name="type"><option>Mensuel</option><option>Ponctuel</option></select></div>
  <div class="field"><label>Catégorie</label><select name="category">${['Salaire','Épargne','Cadeau','Prime','Remboursement','Variation','Autre'].map(x=>`<option>${x}</option>`).join('')}</select></div>
  <div class="field full"><label>Désignation</label><input required name="name" placeholder="Ex. Salaire principal"></div>
  <div class="field"><label>Somme (€)</label><input required name="amount" type="number" min="0" step="0.01" inputmode="decimal"></div>
  <div class="field"><label>Date</label><input required name="date" type="date" value="${new Date().toISOString().slice(0,10)}"></div></div>
  <div class="form-actions"><button type="button" class="secondary" data-go-tab="list">Annuler</button><button class="primary">Enregistrer</button></div></form>`}

function kangaroosView(){
  if(route.tab==='add') return sectionIntro('Nouveau Kangourou','Crée une enveloppe puis ajoute ses dépenses')+kangarooForm();
  const cards=data.kangaroos.map(k=>{const spent=sum(k.expenses,e=>e.amount);return `<article class="item glass-card"><div><h3>🦘 ${escapeHTML(k.name)}</h3><p>${escapeHTML(k.description)}</p><span class="badge">${escapeHTML(k.category)}</span><div class="progress"><span style="width:${Math.min(100,spent/Math.max(1,k.budget)*100)}%"></span></div><small>${money(spent)} utilisés sur ${money(k.budget)}</small></div><div class="item-value"><strong>${money(k.budget-spent)}</strong><small>restants</small><div class="item-actions"><button class="mini-button expense-add" data-id="${k.id}">+ Dépense</button><button class="mini-button delete" data-kind="kangaroo" data-id="${k.id}">Supprimer</button></div></div></article>`}).join('');
  return sectionIntro('Mes Kangourous','Tes enveloppes de dépenses mensuelles')+`<div class="stats"><div class="stat glass-card"><span>Budget total</span><strong>${money(sum(data.kangaroos,k=>k.budget))}</strong></div><div class="stat glass-card"><span>Dépenses</span><strong>${money(sum(data.kangaroos,k=>sum(k.expenses,e=>e.amount)))}</strong></div><div class="stat glass-card"><span>Enveloppes</span><strong>${data.kangaroos.length}</strong></div></div><div class="list">${cards||empty()}</div>`;
}
function kangarooForm(){return `<form class="form-card glass-card" id="kangarooForm"><h2>Détails du Kangourou</h2><div class="form-grid"><div class="field"><label>Nom</label><input required name="name" placeholder="Ex. Maison"></div><div class="field"><label>Catégorie</label><input required name="category" placeholder="Ex. Logement"></div><div class="field full"><label>Description</label><textarea name="description" placeholder="Toutes les dépenses liées à…"></textarea></div><div class="field"><label>Budget mensuel (€)</label><input required name="budget" type="number" min="0" step="0.01"></div></div><div class="form-actions"><button type="button" class="secondary" data-go-tab="list">Annuler</button><button class="primary">Créer</button></div></form>`}
function expenseInline(k){return `<form class="form-card glass-card" id="expenseForm" data-parent="${k.id}"><h2>Nouvelle dépense · ${escapeHTML(k.name)}</h2><div class="form-grid"><div class="field"><label>Catégorie</label><input required name="category" placeholder="Assurances, crédits…"></div><div class="field"><label>Description</label><input required name="description"></div><div class="field"><label>Montant (€)</label><input required type="number" min="0" step="0.01" name="amount"></div><div class="field"><label>À partir du</label><input required type="date" name="startDate" value="${new Date().toISOString().slice(0,10)}"></div><label class="field checkbox full"><input type="checkbox" name="periodic"> Dépense périodique</label></div><div class="form-actions"><button type="button" class="secondary" data-go-tab="list">Annuler</button><button class="primary">Ajouter</button></div></form>`}

function squirrelsView(){
  if(route.tab==='add') return sectionIntro('Nouvel Écureuil','Crée un objectif et commence à mettre de côté')+squirrelForm();
  const cards=data.squirrels.map(s=>{const available=s.saved-sum(s.expenses,e=>e.amount);const unlocked=s.unlockMode==='target'?s.saved>=s.target:new Date()>=new Date(`${s.unlockDate}T00:00:00`);return `<article class="item glass-card"><div><h3>🐿️ ${escapeHTML(s.name)}</h3><p>${escapeHTML(s.description)}</p><span class="badge">${unlocked?'Actif':'En préparation'} · ${s.unlockMode==='target'?'À l’objectif':dateFR(s.unlockDate)}</span><div class="progress"><span style="width:${Math.min(100,s.saved/Math.max(1,s.target)*100)}%"></span></div><small>${money(s.saved)} mis de côté sur ${money(s.target)}</small></div><div class="item-value"><strong>${money(available)}</strong><small>disponibles</small><div class="item-actions"><button class="mini-button save-add" data-id="${s.id}">+ Fonds</button><button class="mini-button transfer" data-id="${s.id}">Transférer</button><button class="mini-button delete" data-kind="squirrel" data-id="${s.id}">Supprimer</button></div></div></article>`}).join('');
  return sectionIntro('Mes Écureuils','Des projets financés progressivement')+`<div class="stats"><div class="stat glass-card"><span>Mis de côté</span><strong>${money(sum(data.squirrels,s=>s.saved))}</strong></div><div class="stat glass-card"><span>Objectifs</span><strong>${money(sum(data.squirrels,s=>s.target))}</strong></div><div class="stat glass-card"><span>Projets</span><strong>${data.squirrels.length}</strong></div></div><div class="list">${cards||empty()}</div>`;
}
function squirrelForm(){return `<form class="form-card glass-card" id="squirrelForm"><h2>Détails de l’Écureuil</h2><div class="form-grid"><div class="field"><label>Nom</label><input required name="name" placeholder="Ex. Voyage Vienne"></div><div class="field"><label>Montant visé (€)</label><input required type="number" min="0" step="0.01" name="target"></div><div class="field full"><label>Description</label><textarea name="description"></textarea></div><div class="field"><label>Déblocage</label><select name="unlockMode" id="unlockMode"><option value="date">À une date</option><option value="target">Quand la somme est atteinte</option></select></div><div class="field"><label>Date de départ</label><input type="date" name="unlockDate" id="unlockDate"></div><div class="field"><label>Somme initiale (€)</label><input type="number" min="0" step="0.01" name="saved" value="0"></div><div class="field"><label>Catégories (séparées par virgules)</label><input name="categories" placeholder="Transport, Hôtel"></div></div><div class="form-actions"><button type="button" class="secondary" data-go-tab="list">Annuler</button><button class="primary">Créer</button></div></form>`}

function eagleView(){ if(route.tab==='preview')return eaglePreview();if(route.tab==='euro')return euroView();return eagleVisual(); }
function eagleVisual(){
  const months=['Nov','Déc','Jan','Fév','Mar','Avr'];
  const categories=[...new Set(data.kangaroos.flatMap(k=>[k.category,...k.expenses.map(e=>e.category)]))].filter(Boolean).sort();
  const recurringExpenses=data.kangaroos.flatMap(k=>k.expenses.map(e=>({...e,parentCategory:k.category}))).filter(e=>e.periodic);
  const filteredExpenses=visualFilters.category==='all' ? recurringExpenses : recurringExpenses.filter(e=>e.category===visualFilters.category||e.parentCategory===visualFilters.category);
  const monthlyOut=sum(filteredExpenses,e=>e.amount);
  const monthlySavings=data.squirrels.length ? sum(data.squirrels,s=>Math.max(0,s.target-s.saved))/12 : 0;
  const series=[];
  if(visualFilters.types.has('lizards')) series.push({key:'lizards',label:'Lézards',value:data.monthlyIncome,color:'purple'});
  if(visualFilters.types.has('kangaroos')) series.push({key:'kangaroos',label:'Kangourous',value:monthlyOut,color:'orange'});
  if(visualFilters.types.has('squirrels')) series.push({key:'squirrels',label:'Écureuils',value:monthlySavings,color:'green'});
  const max=Math.max(1,...series.map(x=>x.value));
  const count=Math.min(Number(visualFilters.period),months.length);
  return sectionIntro('Vue d’ensemble','Filtre les données réellement affichées dans le graphique')+
  `<section class="filters glass-card"><div class="filter-row">
    <button class="chip ${visualFilters.types.size===3?'active':''}" data-filter-type="all">Tout</button>
    <button class="chip ${visualFilters.types.has('lizards')?'active':''}" data-filter-type="lizards">Lézards</button>
    <button class="chip ${visualFilters.types.has('kangaroos')?'active':''}" data-filter-type="kangaroos">Kangourous</button>
    <button class="chip ${visualFilters.types.has('squirrels')?'active':''}" data-filter-type="squirrels">Écureuils</button>
    <select class="filter-select" id="periodFilter" aria-label="Période"><option value="3" ${visualFilters.period==='3'?'selected':''}>3 mois</option><option value="6" ${visualFilters.period==='6'?'selected':''}>6 mois</option></select>
    <select class="filter-select" id="categoryFilter" aria-label="Catégorie"><option value="all">Toutes catégories</option>${categories.map(c=>`<option value="${escapeHTML(c)}" ${visualFilters.category===c?'selected':''}>${escapeHTML(c)}</option>`).join('')}</select>
    <p class="filter-caption">Les boutons peuvent être combinés. Le filtre de catégorie s’applique aux dépenses Kangourous.</p>
  </div></section>
  <div class="stats"><div class="stat glass-card"><span>Revenus mensuels</span><strong class="positive">${money(data.monthlyIncome)}</strong></div><div class="stat glass-card"><span>Dépenses filtrées</span><strong class="negative">${money(monthlyOut)}</strong></div><div class="stat glass-card"><span>Marge mensuelle</span><strong>${money(data.monthlyIncome-monthlyOut-monthlySavings)}</strong></div></div>
  <section class="chart glass-card" aria-label="Graphique filtré">${series.length ? series.flatMap(item=>months.slice(-count).map(m=>`<div class="bar-group"><div class="bar ${item.color==='green'?'green':''}" style="height:${Math.max(5,item.value/max*100)}%;${item.color==='orange'?'background:linear-gradient(180deg,var(--orange),#b76725)':''}" title="${item.label} : ${money(item.value)}"></div><small>${m}<br>${item.label.slice(0,3)}</small></div>`)).join('') : '<div class="chart-empty">Sélectionne au moins un type de données.</div>'}</section>`;
}
function eaglePreview(){ const costs=sum(data.kangaroos,k=>k.budget);const future=sum(data.squirrels,s=>Math.max(0,s.target-s.saved));const saved=sum(data.squirrels,s=>s.saved);const available=data.monthlyIncome+saved;const need=costs+future;const diff=available-need;return sectionIntro('Prévisualisation','Est-ce que le plan complet est faisable ?')+`<div class="stats"><div class="stat glass-card"><span>Lézards mensuels</span><strong>${money(data.monthlyIncome)}</strong></div><div class="stat glass-card"><span>Kangourous prévus</span><strong>${money(costs)}</strong></div><div class="stat glass-card"><span>Écureuils à compléter</span><strong>${money(future)}</strong></div></div><section class="preview-result glass-card"><div class="signal">${diff>=0?'✓':'!'}</div><h2>${diff>=0?'Plan faisable':'Plan à ajuster'}</h2><p>${diff>=0?`Il resterait ${money(diff)} après financement.`:`Il manque ${money(Math.abs(diff))} pour tout financer immédiatement.`}</p><small>Calcul : Lézards mensuels + sommes déjà de côté − budgets Kangourous − reste des objectifs Écureuils.</small><div class="form-actions"><button type="button" class="export-button" id="exportXlsx">⇩ Exporter toutes les données en XLSX</button></div></section>`}
function euroView(){return sectionIntro('Convertisseur Euro','Traduis un prix en jours de travail')+`<form id="euroForm" class="form-card glass-card"><div class="form-grid"><div class="field"><label>Revenu mensuel net (€)</label><input name="income" type="number" min="0.01" step="0.01" required value="${data.monthlyIncome}"></div><div class="field"><label>Jours travaillés par mois</label><input name="days" type="number" min="1" step="1" required value="21"></div><div class="field full"><label>Prix de l’article (€)</label><input name="price" type="number" min="0" step="0.01" required value="50"></div></div><div class="form-actions"><button class="primary">Convertir</button></div><div id="euroResult"></div></form>`}
function sectionIntro(h,p){return `<header class="section-head"><div><span class="eyebrow">Vaulty</span><h1>${h}</h1><p>${p}</p></div></header>`}

function exportAllToXlsx(){
  if(typeof XLSX==='undefined'){ notify('Export indisponible : connexion requise au premier chargement'); return; }
  const wb=XLSX.utils.book_new();
  const overview=[
    ['Indicateur','Valeur'],
    ['Revenu mensuel',data.monthlyIncome],
    ['Total des revenus enregistrés',sum(data.incomes,x=>x.amount)],
    ['Budget total des Kangourous',sum(data.kangaroos,x=>x.budget)],
    ['Total mis de côté',sum(data.squirrels,x=>x.saved)],
    ['Objectifs Écureuils',sum(data.squirrels,x=>x.target)],
    ['Date d’export',new Date().toLocaleString('fr-FR')]
  ];
  const incomes=data.incomes.map(x=>({ID:x.id,Type:x.type,'Catégorie':x.category,'Désignation':x.name,'Montant EUR':x.amount,Date:x.date}));
  const kangaroos=data.kangaroos.map(k=>({ID:k.id,Nom:k.name,Description:k.description,'Catégorie':k.category,'Budget EUR':k.budget,'Dépenses EUR':sum(k.expenses,e=>e.amount),'Reste EUR':k.budget-sum(k.expenses,e=>e.amount)}));
  const expenses=data.kangaroos.flatMap(k=>k.expenses.map(e=>({'ID Kangourou':k.id,Kangourou:k.name,'ID Dépense':e.id,'Catégorie':e.category,Description:e.description,'Montant EUR':e.amount,'Périodique':e.periodic?'Oui':'Non','Date de début':e.startDate})));
  const squirrels=data.squirrels.map(x=>({ID:x.id,Nom:x.name,Description:x.description,'Mode de déblocage':x.unlockMode,'Date de déblocage':x.unlockDate||'','Objectif EUR':x.target,'Épargné EUR':x.saved,'Disponible EUR':x.saved-sum(x.expenses||[],e=>e.amount),'Catégories':(x.categories||[]).join(', ')}));
  const squirrelExpenses=data.squirrels.flatMap(s=>(s.expenses||[]).map(e=>({'ID Écureuil':s.id,Écureuil:s.name,'ID Dépense':e.id||'',Catégorie:e.category||'',Description:e.description||'','Montant EUR':Number(e.amount)||0,Date:e.date||''})));
  const add=(name,rows,isAoa=false)=>{const ws=isAoa?XLSX.utils.aoa_to_sheet(rows):XLSX.utils.json_to_sheet(rows.length?rows:[{Information:'Aucune donnée'}]);ws['!cols']=Array.from({length:Math.max(1,Object.keys(rows[0]||{}).length)},(_,i)=>({wch:i===0?22:18}));XLSX.utils.book_append_sheet(wb,ws,name)};
  add('Synthèse',overview,true); add('Lézards',incomes); add('Kangourous',kangaroos); add('Dépenses Kangourous',expenses); add('Écureuils',squirrels); add('Dépenses Écureuils',squirrelExpenses);
  const raw=Object.keys(localStorage).map(key=>({Clé:key,Valeur:localStorage.getItem(key)})); add('LocalStorage brut',raw);
  XLSX.writeFile(wb,`Vaulty-export-${new Date().toISOString().slice(0,10)}.xlsx`);
  notify('Extraction XLSX créée');
}

function bindActions(){
 document.querySelectorAll('[data-filter-type]').forEach(btn=>btn.addEventListener('click',()=>{const type=btn.dataset.filterType;if(type==='all'){visualFilters.types=new Set(['lizards','kangaroos','squirrels']);}else{visualFilters.types.has(type)?visualFilters.types.delete(type):visualFilters.types.add(type);}render();}));
 const periodFilter=document.querySelector('#periodFilter');if(periodFilter)periodFilter.addEventListener('change',e=>{visualFilters.period=e.target.value;render()});
 const categoryFilter=document.querySelector('#categoryFilter');if(categoryFilter)categoryFilter.addEventListener('change',e=>{visualFilters.category=e.target.value;render()});
 const exportButton=document.querySelector('#exportXlsx');if(exportButton)exportButton.addEventListener('click',exportAllToXlsx);
 document.querySelectorAll('[data-go]').forEach(x=>x.addEventListener('click',()=>go(x.dataset.go,x.dataset.go==='eagle'?'visual':'list')));
 document.querySelectorAll('[data-go-tab]').forEach(x=>x.addEventListener('click',()=>go(route.page,x.dataset.goTab)));
 const incomeForm=document.querySelector('#incomeForm');if(incomeForm)incomeForm.addEventListener('submit',e=>{e.preventDefault();const x=formDataObject(e.currentTarget);x.id=uid();x.amount=Number(x.amount);if(x.type==='Mensuel')data.monthlyIncome=x.amount;data.incomes.unshift(x);persist('Lézard ajouté');go('lizards','list')});
 const kangarooForm=document.querySelector('#kangarooForm');if(kangarooForm)kangarooForm.addEventListener('submit',e=>{e.preventDefault();const x=formDataObject(e.currentTarget);x.id=uid();x.budget=Number(x.budget);x.expenses=[];data.kangaroos.unshift(x);persist('Kangourou créé');go('kangaroos','list')});
 const squirrelForm=document.querySelector('#squirrelForm');if(squirrelForm)squirrelForm.addEventListener('submit',e=>{e.preventDefault();const x=formDataObject(e.currentTarget);x.id=uid();x.target=Number(x.target);x.saved=Number(x.saved);x.categories=x.categories.split(',').map(v=>v.trim()).filter(Boolean);x.expenses=[];data.squirrels.unshift(x);persist('Écureuil créé');go('squirrels','list')});
 document.querySelectorAll('.delete').forEach(btn=>btn.addEventListener('click',()=>{if(!confirm('Supprimer cet élément ?'))return;const map={income:'incomes',kangaroo:'kangaroos',squirrel:'squirrels'};data[map[btn.dataset.kind]]=data[map[btn.dataset.kind]].filter(x=>x.id!==btn.dataset.id);persist('Élément supprimé')}));
 document.querySelectorAll('.expense-add').forEach(btn=>btn.addEventListener('click',()=>{app.innerHTML=sectionIntro('Nouvelle dépense','Affecte une somme au Kangourou')+expenseInline(data.kangaroos.find(x=>x.id===btn.dataset.id));bindActions();window.scrollTo({top:0,behavior:'smooth'})}));
 const expenseForm=document.querySelector('#expenseForm');if(expenseForm)expenseForm.addEventListener('submit',e=>{e.preventDefault();const x=formDataObject(e.currentTarget);x.id=uid();x.amount=Number(x.amount);x.periodic=x.periodic==='on';data.kangaroos.find(k=>k.id===e.currentTarget.dataset.parent).expenses.unshift(x);persist('Dépense ajoutée');go('kangaroos','list')});
 document.querySelectorAll('.save-add').forEach(btn=>btn.addEventListener('click',()=>{const s=data.squirrels.find(x=>x.id===btn.dataset.id);const amount=Number(prompt(`Somme à ajouter à ${s.name} (€) :`));if(amount>0){s.saved+=amount;persist('Somme mise de côté')}}));
 document.querySelectorAll('.transfer').forEach(btn=>btn.addEventListener('click',()=>{const from=data.squirrels.find(x=>x.id===btn.dataset.id);const choices=data.squirrels.filter(x=>x.id!==from.id);if(!choices.length)return notify('Crée un second Écureuil');const to=choices.find(x=>x.name.toLowerCase()===String(prompt(`Vers quel Écureuil ?\n${choices.map(x=>x.name).join(', ')}`)).toLowerCase());if(!to)return notify('Écureuil introuvable');const amount=Number(prompt('Montant à transférer (€) :'));if(amount>0&&amount<=from.saved){from.saved-=amount;to.saved+=amount;persist('Transfert réalisé')}else notify('Montant invalide')}));
 const euroForm=document.querySelector('#euroForm');if(euroForm)euroForm.addEventListener('submit',e=>{e.preventDefault();const x=formDataObject(e.currentTarget);const daily=Number(x.income)/Number(x.days);const workDays=Number(x.price)/daily;const weeks=workDays/5;document.querySelector('#euroResult').innerHTML=`<div class="calculator-result">${workDays.toFixed(1)} jours</div><p>Soit environ <strong>${weeks.toFixed(1)} semaine(s)</strong> de travail, sur une base de 5 jours par semaine. Valeur d’une journée : ${money(daily)}.</p>`});
}

document.querySelector('#homeButton').addEventListener('click',()=>go('home','list'));
document.querySelector('#resetButton').addEventListener('click',()=>{if(confirm('Réinitialiser toutes les données de démonstration ?')){data=resetData();render();notify('Vaulty réinitialisé')}});
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();
