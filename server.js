const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
const DB_FILE = path.join(__dirname, 'db.json');
function getDB(){
  try{ return JSON.parse(fs.readFileSync(DB_FILE,'utf8')) }catch(e){
    return {
      settings: { bank: '8072428174', wa: '2347046327680', prices: [5000,10000,15000,18000,20000,25000,30000,35000,50000,80000] },
      users: [],
      orders: [],
      adminPass: 'biggest2026'
    }
  }
}
function saveDB(db){ fs.writeFileSync(DB_FILE, JSON.stringify(db,null,2)) }
app.get('/api/settings', (req,res)=>{ res.json(getDB().settings) });
app.get('/api/stats', (req,res)=>{
  const db=getDB();
  const today=new Date().toDateString();
  res.json({ total: db.users.length, today: db.users.filter(u=>u.date===today).length, orders: db.orders.length, users: db.users, ordersList: db.orders, settings: db.settings });
});
app.post('/api/join', (req,res)=>{
  const db=getDB();
  const {name,phone,plan}=req.body;
  db.users.push({name,phone,plan,date:new Date().toDateString(),time:new Date().toLocaleString()});
  db.orders.push({plan,name,time:new Date().toLocaleString()});
  saveDB(db);
  res.json({ok:true,total:db.users.length});
});
app.post('/api/order', (req,res)=>{
  const db=getDB();
  db.orders.push({plan:req.body.plan,time:new Date().toLocaleString()});
  saveDB(db);
  res.json({ok:true});
});
app.post('/api/login', (req,res)=>{
  const db=getDB();
  if(req.body.password===db.adminPass){ res.json({ok:true, settings:db.settings, users:db.users, orders:db.orders}) }
  else res.json({ok:false});
});
app.post('/api/save-settings', (req,res)=>{
  const db=getDB();
  if(req.body.password!==db.adminPass) return res.json({ok:false});
  db.settings={bank:req.body.bank,wa:req.body.wa,prices:req.body.prices};
  saveDB(db);
  res.json({ok:true,settings:db.settings});
});
app.post('/api/change-pass', (req,res)=>{
  const db=getDB();
  if(req.body.oldPass!==db.adminPass) return res.json({ok:false});
  db.adminPass=req.body.newPass;
  saveDB(db);
  res.json({ok:true});
});
app.get('*',(req,res)=>{ res.sendFile(path.join(__dirname,'index.html')) });
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>console.log('BIGGEST ENTERPRISE running on '+PORT));
