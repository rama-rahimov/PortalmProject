const express = require("express") ;
const jwt = require("jsonwebtoken") ;
const { isValidPassword, toAuthJSON } = require("../middlewares/authenticate.js") ;
const { request } = require("../middlewares/helper.js") ;
const soap = require("soap") ;
const db = require('../models');

const router = express.Router();


/**
 * @api {post} /auth/  user login
 * @apiName UserLogin
 * @apiGroup Auth
 * @apiPermission none
 *
 * @apiDescription User login olmasi ucun istifade edilir!
 * 
 * @apiParam (Request body) {Object} credentials <code>credentials</code>.
 * @apiParam (Request body) {String} credentials.password <code>password</code> of the user.
 * @apiParam (Request body) {String} credentials.email <code>email</code> of the user.
 * @apiParamExample {json} Request-Example:
 *     {
 *       "credentials":{ "email": "mail@mail.ru", "password": "test111111" }
 *     }
 * @apiSampleRequest off
 * @apiSuccess {String} result <code>ok</code> if everything went fine.
 * @apiSuccessExample {json} Success-Example
 *        { 
 *           "user":{
 *              "id":23,
 *              "email":"mail@mail.ru",
 *              "role":1,
 *              "phone":"505146623",
 *              "country_code":"994",
 *              "citizenshipId":6,
 *              "asanLogin":0,
 *              "fin":"wwww",
 *              "first_name":"ww",
 *              "last_name":"ww",
 *              "father_name":"ww",
 *              "birth_date":"02.11.2020",
 *              "gender":null,
 *              "series":null,
 *              "number":null,
 *              "giving_authority":null,
 *              "giving_date":null,
 *              "exp_date":null,
 *              "district":null,
 *              "born_country":null,
 *              "citizenship":null,
 *              "address":null,
 *              "actual_address":null,
 *              "image":null,
 *              "social_status":null,
 *              "i_start_date":null,
 *              "i_end_date":null,
 *              "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaW4iOiJ3d3d3IiwiaWF0IjoxNjA5MTYyNjg4fQ.ihBFrGdbL6We7uovQxz1hpGNKqtn1Tit06syBTNHiIE"
 *           }
 *        }
 *     
 *
 * @apiError (400 Bad Request) none
 *
 * @apiErrorExample {json} Response (example):
 *     {
 *       "errors":{ "global": "Şifrə düzgün deyil" }
 *     }
 */
router.post("/", (req, res) => {
  const isEng = (req.headers.language || "") === "en" ;
  const { email, password } = req.body; 
  db.users.findOne({attributes:['id', 'password', 'email', 'role', 'phone', 'country_code', 'fin', 'citizenshipId', 'asanLogin'], where:{email, asanLogin:0}, include:[{model:db.fin_data,  required:false}]}).then(user => {
  if (user) {
  if (isValidPassword(password, user.password)){
  delete user.password;
  res.json(toAuthJSON(user));
  } else {
  res.status(400).json({ errors: { global: !isEng ? "Şifrə düzgün deyil" : "Password is incorrect" } });
  }
  } else {
  res.status(400).json({ errors: { global: !isEng ? "İstifadəçi tapılmadı" : "User not found" } });
  }
  });
  });


/**
 * @api {post} /auth/asan_login  asan_login
 * @apiName UserAsanLogin
 * @apiGroup Auth
 * @apiPermission none
 *
 * @apiDescription User Asan Login istifade ederek login olmasi ucun istifade edilir!
 * 
 * @apiParam (Request body) {Object} credentials <code>credentials</code>.
 * @apiParam (Request body) {String} credentials.token asan login <code>token</code>.
 * @apiParamExample {json} Request-Example:
 *     {
 *       "credentials":{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaW4iOiJ3d3d3IiwiaWF0IjoxNjA5" }
 *     }
 * @apiSampleRequest off
 * @apiSuccess {String} result <code>ok</code> if everything went fine.
 * @apiSuccessExample {json} Success-Example
 *         { "user":{"id":23, "email":"mail@mail.ru", "role":1, "phone":"505146623", "country_code":"994","citizenshipId":6,"asanLogin":0,"fin":"wwww","first_name":"ww","last_name":"ww","father_name":"ww","birth_date":"02.11.2020","gender":null,"series":null,"number":null,"giving_authority":null,"giving_date":null,"exp_date":null,"district":null,"born_country":null,"citizenship":null,"address":null,"actual_address":null,"image":null,"social_status":null,"i_start_date":null,"i_end_date":null,"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaW4iOiJ3d3d3IiwiaWF0IjoxNjA5MTYyNjg4fQ.ihBFrGdbL6We7uovQxz1hpGNKqtn1Tit06syBTNHiIE"}}
 *
 * @apiError (400 Bad Request) Bad Request.
 *
 * @apiErrorExample Response (example):
 *       { "errors":{ "global": "Xəta baş verdi." } }
 */
router.post("/asan_login", (req, res) => {
  const { token } = req.body.credentials;

  const options = {
    hostname: 'apiasanlogin.my.gov.az',
    port: 443,
    path: '/ssoauthz/api/v1/token/check',
    method: 'GET',
    headers: {
      'Authorization': token
    }
  }

  request(null, options, (result) => {
    //console.log(result);
    if (result.data.status == 200) {
    var decoded = jwt.decode(token);
    var person = ((decoded || {}).main || {}).person || {};
    if (person.pin)
    (async () => {
    let user;
    let finData = {
    first_name: person.name,
    last_name: person.surname,
    father_name: person.fatherName  
    };                                                                                                                                                       
    db.users.findOne({attributes:['id', 'email', 'role', 'phone', 'country_code', 'citizenshipId', 'asanLogin'], where:{fin:person.pin}}).then(checkuser => {
    user = checkuser;
    }).catch(() => { });
    if (!user) {
    db.users.create({fin:person.pin, asanLogin:1}).then(insertuser => {
    if (insertuser) {
    user = {
    id: insertuser.insertId,
    asanLogin: 1,
    fin: person.pin
    }
    }
    }).catch((e) => { console.log(e) });
    }  
    db.fin_data.findOne({where:{fin:person.pin}}).then(checkfin_data => {
    if (checkfin_data) {
    finData = checkfin_data;
    }
    }).catch(() => { });
    if (!finData.birth_date) {
    await getSoapFindata(person.pin).then(soapFinData => {
    finData = soapFinData;
    }).catch(() => { });
    }
    saveFinData(person.pin, finData, (resultSave) => {
    if (resultSave.error || !user)
    res.status(400).json({ errors: { global: "Xəta baş verdi." } });
    else {
    res.json({
    user: toAuthJSON({
    ...user,
    ...finData
    })
    });
    }
    });
    })();
    } else
    res.status(400).json({ errors: { global: "Xəta baş verdi." } });
    });

    });

const saveFinData = (fin, finData, calcack) => {  
  db.fin_data.findOne({attributes:['fin'], where:{fin}}).then(check_fin => {
  if (!check_fin) { 
  db.fin_data.create({ ...finData, fin }).then(fin_dat => {
  if (fin_dat.error) {
  calcack({ error: fin_dat.error });
  //console.log("fin_data_insert_error", user.error);
  } else {
  calcack({ error: false });
  }
  });
  } else { 
  db.fin_data.update(finData, {where:{ fin }}).then(fin_dat => {
  if (fin_dat.error) {
  calcack({ error: fin_dat.error });
  //console.log("fin_data_insert_error", user.error);
  } else {
  calcack({ error: false });
  }
  });
  }
  });
  }


const getSoapFindata = (pin) => {
  return new Promise(function (resolve, reject) {
  soap.createClient(process.env.IAMAS_URL, { wsdl_options: { timeout: 8000 } }, (err, client) => {
  if (client) {
  client.getPersonalInfoByPinNew({ pin }, (err2, result3) => {
  if (result3 && result3["getPersonalInfoByPinNewResult"] && !result3["getPersonalInfoByPinNewResult"].faultCode) {
  resolve({
  first_name: result3["getPersonalInfoByPinNewResult"].Name || "-",
  last_name: result3["getPersonalInfoByPinNewResult"].Surname || "-",
  father_name: result3["getPersonalInfoByPinNewResult"].Patronymic || "-",
  district: result3["getPersonalInfoByPinNewResult"]["BirthPlace"].city,
  birth_date: result3["getPersonalInfoByPinNewResult"].birthDate || "-",
  born_country: result3["getPersonalInfoByPinNewResult"]["BirthPlace"].country,
  citizenship: result3["getPersonalInfoByPinNewResult"].citizenship,
  address: result3["getPersonalInfoByPinNewResult"]["Adress"].place,
  exp_date: result3["getPersonalInfoByPinNewResult"].expdate,
  gender: result3["getPersonalInfoByPinNewResult"].gender,
  giving_date: result3["getPersonalInfoByPinNewResult"].issueDate,
  giving_authority: result3["getPersonalInfoByPinNewResult"].policedept,
  image: result3["getPersonalInfoByPinNewResult"].photo ? `data:image/jpeg;base64,${result3["getPersonalInfoByPinNewResult"].photo}` : null,
  series: result3["getPersonalInfoByPinNewResult"].Seria,
  number: result3["getPersonalInfoByPinNewResult"].series,
  social_status: result3["getPersonalInfoByPinNewResult"].sosialStatus
  });
  } else {
  reject(null);
  }

  }, { timeout: 8000 });
  } else {
  reject(null);
  }
  });
  });
  }

module.exports = router;
