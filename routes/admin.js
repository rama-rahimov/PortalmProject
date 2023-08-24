const express = require('express'); "express";
const { authenticate, toAuthJSON } = require('../middlewares/authenticate') ;
const { insert, querySyncForMap } = require('../middlewares/db.js') ;
const db = require('../models');
const { Sequelize } = require("sequelize") ;

const router = express.Router();

router.get('/getUser/:fin', authenticate, (req, res) => {
  const { fin } = req.params;
  const isAdmin = Number(req.currentUser.role) === 10 ; 
  if (isAdmin) { 
  db.users.findOne({attributes:['id', 'email', 'role', 'phone', 'country_code', 'citizenshipId', 'asanLogin'], where:{fin}, 
  include:[{model:db.fin_data, required:false}]}).then(async user => {
  const child = await db.children.findOne({where:{fin}});
  if(!child){
  await db.children.create({fin, user_id:user.id, type: 2});
  }
  await db.fin_data.update({children_fin:fin}, {where:{fin}});
  db.children.findOne({where:{fin, deleted:0}, 
  include:[{model:db.fin_data, required:false}]}).then(children => {
  if (children && children.user_id == (user || {}).id) 
  db.users.findOne({attributes:['id', 'email', 'role', 'phone', 'country_code', 'citizenshipId', 'asanLogin'], 
  where:{id:children.user_id}, include:[{model:db.fin_data, required: false}]}).then(children_user => {
  res.json({ user: user ? toAuthJSON(user) : null, children, children_user: children_user ? toAuthJSON(children_user) : null });
  });
  else
  res.json({ user: user ? toAuthJSON(user) : null, children, children_user: null });
  });
  });
  } else {
  res.status(401).json({ errors: { global: "Token not correct" } });
  }
  });

router.post('/report_services', authenticate, async (req, res) => {
  let { startDate, endDate, service_id } = req.body;
  const isAdmin = Number(req.currentUser.role) === 10
  if (isAdmin) {
  let where = '';
  if (!startDate) {
  startDate = '2000-01-01 00:00:00' ;
  }
  if (!endDate) {
  startDate = '2200-01-01 00:00:00' ;
  }
  if (service_id) {
  where = 'where t1.service_id=?' ;
  }

//   const eee = await E_documents_apply.findAll({attributes:[[Sequelize.fn("COUNT", Sequelize.col("id")),
//   "count"]], where:{status:{[Op.ne]:0}, update_date:{[Op.gte]:startDate}, update_date:{[Op.lte]:endDate}}}) ; 

//   const ooA = await olympiad_apply.findAll({attributes:[[Sequelize.fn("COUNT", Sequelize.col("id")), "count"]], 
//   where:{status:{[Op.ne]:0}, create_date:{[Op.gte]:startDate}, create_date:{[Op.lte]:endDate}}});

//  const apOuF = await Appeals_out_of_school.findAll({attributes:[[Sequelize.fn("COUNT", Sequelize.col("id")), "count"]],
//   where:{status:{[Op.ne]:0}, create_date:{[Op.gte]:startDate}, create_date:{[Op.lte]:endDate}}});
  
//   const atudCount = await student_appeals.findAll({attributes:[[Sequelize.fn("COUNT", Sequelize.col("id")), "count"]],
//   where:{status:{[Op.ne]:0}, create_date:{[Op.gte]:startDate}, create_date:{[Op.lte]:endDate}}});

//   const saCount = await support_apply.findAll({attributes:[[Sequelize.fn("COUNT", Sequelize.col("id")), "count"]], 
//   where:{status:{[Op.ne]:0}, create_date:{[Op.gte]:startDate}, create_date:{[Op.lte]:endDate}}});

//   const vaF = await Vacancy_appeals.findAll({attributes:[[Sequelize.fn("COUNT", Sequelize.col("id")), "count"]],
//   where:{status:{[Op.ne]:0}, is_director:0, creation_date:{[Op.gte]:startDate}, creation_date:{[Op.lte]:endDate}}});

//   const vaFCount = await Vacancy_appeals.findAll({attributes:[[Sequelize.fn("COUNT", Sequelize.col("id")), "count"]],
//   where:{status:{[Op.ne]:0}, is_director:1, creation_date:{[Op.gte]:startDate}, creation_date:{[Op.lte]:endDate}}});

//   let sum = [] ;
//   sum.push( Object.values(eee[0])[0].count ) ; 
//   sum.push(Object.values(ooA[0])[0].count);
//   sum.push(Object.values(apOuF[0])[0].count);
//   sum.push(Object.values(atudCount[0])[0].count);
//   sum.push(Object.values(saCount[0])[0].count);
//   sum.push(Object.values(vaF[0])[0].count);
//   sum.push(Object.values(vaFCount[0])[0].count);

//   if(sum){
//     return res.json(sum) ;
//   }

    querySyncForMap(`SELECT t1.*,t2.title FROM (
        SELECT COUNT(ID) AS count, 16 AS service_id FROM e_documents_apply WHERE STATUS!=0 AND update_date >=? AND  update_date<=?
        UNION ALL
        SELECT COUNT(ID) AS count, 7 AS service_id FROM olympiad_apply WHERE STATUS!=0 AND create_date >=? AND  create_date<=?
        UNION ALL
        SELECT COUNT(ID) AS count, 4 AS service_id FROM appeals_out_of_school WHERE STATUS!=0 AND create_date >=? AND  create_date<=?
        UNION ALL
        SELECT COUNT(ID) AS count, 5 AS service_id FROM student_appeals WHERE STATUS!=0 AND create_date >=? AND  create_date<=? 
        UNION ALL
        SELECT COUNT(ID) AS count, 15 AS service_id FROM support_apply WHERE STATUS!=0 AND create_date >=? AND  create_date<=? 
        UNION ALL
        SELECT COUNT(ID) AS count, 1 AS service_id FROM vacancy_appeals WHERE STATUS!=0 AND is_director=0 AND creation_date >=? AND  creation_date<=?
        UNION ALL
        SELECT COUNT(ID) AS count, 12 AS service_id FROM vacancy_appeals WHERE STATUS!=0 AND is_director=1 AND creation_date >=? AND  creation_date<=?)
        t1 LEFT JOIN services t2 ON t2.id = t1.service_id ${where}`,
      [
        startDate, endDate,
        startDate, endDate,
        startDate, endDate, 
        startDate, endDate,
        startDate, endDate,
        startDate, endDate,
        startDate, endDate,
        service_id
      ]).then(result => {
        res.json(result);
      });
  } else {
  res.status(401).json({ errors: { global: "Token not correct" } });
  }
  });


router.post('/email_update', authenticate, (req, res) => {
  const isEng = (req.headers.language || "") === "en";
  const { email, fin, description } = req.body;
  const isAdmin = Number(req.currentUser.role) === 10;
  if (isAdmin) { 
  db.users.findOne({where:{fin}}).then((check) => {
  if (check)   
  db.users.findOne({where:{email}}).then(u => {
  const countUser = u.length ;
  if (countUser == 0) 
  db.users.update({email}, {where:{fin}}).then(() => {
  //admin_update_log 
  insert('admin_update_log', { old: check.email, new: email, fin, description, user_id: req.currentUser.id }, () => {
  res.json({ message: !isEng ? 'E-poçt uğurla dəyişdirildi!' : 'Email changed successfully!' });
  });
  });
  else
  res.json({ err: !isEng ? 'E-poçt istifadə edilir' : 'Email is used', message: '' });
  });
  else
  res.json({ err: !isEng ? "İstifadəçi tapılmadı" : "User not found", message: '' })
  });
  } else {
  res.json({ err: "Non correct token" });
  }
  });

router.post('/phone_update', authenticate, (req, res) => {
  const isEng = (req.headers.language || "") === "en";
  const { phone, country_code, fin, description } = req.body;
  const isAdmin = Number(req.currentUser.role) === 10;
  if (isAdmin) { 

  db.users.findOne({where:{fin}}).then((check) => { 
  if (check) 
  db.users.findOne({where:{phone, country_code}}).then(u => {
  const countUser = u.length ;
  if (countUser == 0) 
  db.users.update({phone, country_code}, {where:{fin}}).then(() => { 
  //admin_update_log
  insert('admin_update_log', { old: (check.country_code + '-' + check.phone), new: (country_code + '-' + phone), fin, 
  description, user_id: req.currentUser.id }, () => {
  res.json({ message: !isEng ? 'nomre uğurla dəyişdirildi!' : 'Phone changed successfully!' });
  });
  });
  else
  res.json({ err: !isEng ? 'nomre istifadə edilir' : 'Phone is used', message: '' });
  });
  else
  res.json({ err: !isEng ? "İstifadəçi tapılmadı" : "User not found", message: '' })
  });
  } else {
  res.json({ err: "Non correct token" });
  }
  });

module.exports = router;