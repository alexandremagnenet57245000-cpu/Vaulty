const money = value => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(Number(value)||0);
const dateFR = value => value ? new Intl.DateTimeFormat('fr-FR').format(new Date(`${value}T12:00:00`)) : 'Non définie';
const sum = (items, selector = x => x) => items.reduce((total,item)=>total + Number(selector(item)||0),0);
const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const uid = () => crypto.randomUUID();
function formDataObject(form){ return Object.fromEntries(new FormData(form).entries()); }
