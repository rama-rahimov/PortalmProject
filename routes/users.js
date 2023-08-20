const express = require("express") ;
const { authenticate, generateJWT, setPassword, isValidPassword } = require("../middlewares/authenticate.js") ;
const {Op, Sequelize} = require('sequelize') ;
const db = require('../models');


const router = express.Router();

/**
 * @api {post} /users/ user registration
 * @apiName user registration
 * @apiGroup Users
 * @apiPermission none
 *
 * @apiDescription İstifadəçi qeydiyyatı
 * 
 * @apiParam (Request body) {String} email <code>email</code> of the user.
 * @apiParam (Request body) {String} password <code>password</code> of the user.
 * @apiParam (Request body) {String} phone <code>phone</code> of the user.
 * @apiParam (Request body) {String} country_code <code>country_code</code> of the user.
 * @apiParam (Request body) {String} fin <code>fin</code> of the user.
 * @apiParam (Request body) {String} citizenshipId <code>citizenshipId</code> of the user.
 * @apiParam (Request body) {String} first_name <code>first_name</code> of the user.
 * @apiParam (Request body) {String} last_name <code>last_name</code> of the user.
 * @apiParam (Request body) {String} father_name <code>father_name</code> of the user.
 * @apiParam (Request body) {String} birth_date <code>birth_date</code> of the user.
 * @apiParam (Request body) {String} gender <code>gender</code> of the user.
 * @apiParam (Request body) {String} series <code>series</code> of the user.
 * @apiParam (Request body) {String} number <code>number</code> of the user.
 * @apiParam (Request body) {String} giving_authority <code>giving_authority</code> of the user.
 * @apiParam (Request body) {String} giving_date <code>giving_date</code> of the user.
 * @apiParam (Request body) {String} exp_date <code>exp_date</code> of the user.
 * @apiParam (Request body) {String} district <code>district</code> of the user.
 * @apiParam (Request body) {String} born_country <code>born_country</code> of the user.
 * @apiParam (Request body) {String} citizenship <code>citizenship</code> of the user.
 * @apiParam (Request body) {String} address <code>address</code> of the user.
 * @apiParam (Request body) {String} image <code>image</code> of the user.
 * @apiParam (Request body) {String} social_status <code>social_status</code> of the user.
 * @apiParam (Request body) {String} docType <code>docType</code> of the user.
 * @apiParamExample {json} Request-Example:
 *     { "email": "", "password": "", "phone": "", "country_code": "", "fin": "", "citizenshipId": "", "first_name": "", "last_name": "", "father_name": "", "birth_date": "", "gender": "", "series": "", "number": "", "giving_authority": "", "giving_date": "", "exp_date": "", "district": "", "born_country": "", "citizenship": "", "address": "", "image": "", "social_status": "", "docType": "" }
 * @apiSampleRequest off
 * @apiSuccessExample {json} Success-Example
 *        { "message": "Qeydiyyat uğurla tamamlandı" }
 *
 * @apiErrorExample {json} Response (error):
 *     { "err": "Xəta baş verdi" }
 * @apiErrorExample {json} Response (already user exist):
 *     { "err": "İstifadəçi sistemdə var" }
 * @apiErrorExample {json} Response (email is empty):
 *     { "err": "Email boş ola bilməz" }
 */ 

router.post("/", (req, res) => {
  const isEng = (req.headers.language || "") === "en" ;
  let { email, password, phone, country_code, fin, citizenshipId, first_name, last_name, father_name, birth_date, gender, series, number, giving_authority, giving_date, exp_date, district, born_country, citizenship, address, image, social_status} = req.body;
  /*if (citizenshipId == 2) {
    fin = docType + fin;
  }*/  
  if (email) { 
    db.users.findOne({attributes:['id'], where: {[Op.or]: [{ email }, { fin },({phone, country_code})]}}).then(has_user => {
      if (has_user) {
        res.json({ success: false, err: !isEng ? 'İstifadəçi sistemdə var.' : 'The user is in the system.' });
      } else {
        db.phone_verification.findOne({attributes:['id'], where:{phone, country_code, verify:1}}).then(verify => {
          if (!verify) {
            res.json({ success: false, err: !isEng ? 'Nömrə təsdiq edilməyib.' : 'The number has not been confirmed.' });
          } else {
            const passwordHash = setPassword(password);
            db.users.create({email, phone, country_code, fin, citizenshipId, password: passwordHash}).then(user => { // qebula gonder -> user.insertId, fin
              if (user.error) {
                //console.log("user_insert_error", user.error);
                res.json({ success: false, err: !isEng ? 'Xəta baş verdi.' : 'An error occurred.' });
              } else {
                if (Number(citizenshipId) > 2) {
                  db.fin_data.findOne({attributes:['fin'], where:{fin}}).then(check_fin => {
                    if (!check_fin) {
                      db.fin_data.create({fin, first_name, last_name, father_name, birth_date, gender, series, number, giving_authority, giving_date, exp_date, district, born_country, citizenship, address, image, social_status}).then(fin_data => {
                        if (fin_data.error) {
                          //console.log("fin_data_insert_error", user.error);
                          res.json({ success: false, err: !isEng ? 'Xəta baş verdi.' : 'An error occurred.' });
                        } else {
                          res.json({ success: true, message: !isEng ? 'Qeydiyyat uğurla tamamlandı!' : 'Registration completed successfully!' });
                        }
                      });
                    } else { 
                      db.fin_data.update({first_name, last_name, father_name, birth_date, gender, series, number, giving_authority, giving_date, exp_date, district, born_country, citizenship, address, image, social_status}, {where:{fin}}).then(fin_data => {
                        if (fin_data.error) {
                          //console.log("fin_data_insert_error", fin_data.error);
                          res.json({ success: false, err: !isEng ? 'Xəta baş verdi.' : 'An error occurred.' });
                        } else {
                          res.json({ success: true, message: !isEng ? 'Qeydiyyat uğurla tamamlandı!' : 'Registration completed successfully!' });
                        }
                      });
                    }
                  });
                } else {
                  res.json({ success: true, message: !isEng ? 'Qeydiyyat uğurla tamamlandı!' : 'Registration completed successfully!' });
                }
              }
            });
          }
        });
      }
    });
  } else {
    res.json({ success: false, err: !isEng ? 'Email boş ola bilməz.' : 'Email cannot be empty.' }) ;
  }
});

/**
 * @api {get} /users/current_user current_user
 * @apiName current_user
 * @apiGroup Users
 * @apiPermission none
 *
 * @apiDescription Aktiv istifadəçi məlumatlarını gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *  
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */

router.get("/current_user", authenticate, (req, res) => {
  if (req.currentUser) {
    res.json({
       user: req.currentUser,
        token: generateJWT(req.currentUser)
    });
  } else {
    res.json(false);
  }
});

/**
 * @api {get} /users/check_email/:email check_email
 * @apiName check_email
 * @apiGroup Users
 * @apiPermission none
 *
 * @apiDescription E-poçta göre istifadəçi məlumatlarını gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *  
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */

router.get('/check_email/:email', (req, res) => {
  const { email } = req.params; 
  db.users.findOne({where:{email}}).then(user => {
    res.json(!!user);
  });
});

/**
 * @api {get} /users/check_fin/:fin check_fin
 * @apiName check_fin
 * @apiGroup Users
 * @apiPermission none
 *
 * @apiDescription Finə göre istifadəçi məlumatlarını gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *  
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */

router.get('/check_fin/:fin', (req, res) => {
  const { fin } = req.params;
  /*querySync(`SELECT * FROM (SELECT fin FROM users UNION ALL (SELECT fin FROM children WHERE deleted=0 )) t1 WHERE fin=? limit 1`, [fin]).then(user => {
    res.json(!!user);
  });*/ 
  db.users.findOne({where:{fin}}).then(user => {
    res.json(!!user);
  });
});

/**
 * @api {post} /users/reset_pass reset_pass
 * @apiName reset_pass
 * @apiGroup Users
 * @apiPermission none
 *
 * @apiDescription Şifrə yeniləmə
 * 
 * @apiParam (Request body) {String} email <code>email</code> of the user.
 * @apiParam (Request body) {String} phone_verification_code <code>phone_verification_code</code> of the user.
 * @apiParam (Request body) {String} password <code>password</code> of the user.
 * @apiParam (Request body) {String} confirm_password <code>confirm_password</code> of the user.
 * @apiParamExample {json} Request-Example:
 *     { "email": "", "phone_verification_code": "", "password": "", "confirm_password": "" }
 * @apiSampleRequest off
 * @apiSuccessExample {json} Success-Example
 *        { "message": "Şifrəniz uğurla dəyişdirildi" }
 *
 * @apiErrorExample {json} Response (not found user):
 *     { "err": "İsifadəçi tapılmadı" }
 * @apiErrorExample {json} Response (password incorrect):
 *     { "err": "Şifrəni düzgün daxil edin" }
 * @apiErrorExample {json} Response (incorrect code):
 *     { "err": "Kod düzgün deyil" }
 */

router.post('/reset_pass', (req, res) => {
  const isEng = (req.headers.language || "") === "en";
  const { email, phone_verification_code, password, confirm_password } = req.body;
  db.users.findOne({where:{email}}).then(u => {
    if (u.phone)
      db.phone_verification.findOne({attributes:['phone', 'country_code', 'number_wait_date'], where:{phone: u.phone, country_code: u.country_code, code:phone_verification_code}}).then(result => {
        if (result && result.phone) { 
          if (password === confirm_password) {
            db.users.update({password:setPassword(password), asanLogin:0}, {where:{email}}).then(() => {
              res.json({ message: !isEng ? 'Şifrəniz uğurla dəyişdirildi!' : 'Your password has been successfully changed!' });
            });
          } else {
            res.json({ err: !isEng ? 'Şifrəni düzgün daxil edin!' : 'Enter the password correctly!' });
          }
        } else {
          res.json({ err: !isEng ? 'Kod düzgün deyil' : 'Code is incorrect' });
        }
      });
    else
      res.json({ err: !isEng ? 'İsifadəçi tapılmadı' : 'User not found', message: '' });
  });
});

/**
 * @api {post} /users/email_update email_update
 * @apiName email update
 * @apiGroup Users
 * @apiPermission none
 *
 * @apiDescription E-poct yeniləmə
 * 
 * @apiParam (Request body) {String} email <code>email</code> of the user.
 * @apiParamExample {json} Request-Example:
 *     { "email": "" }
 * @apiSampleRequest off
 * @apiSuccessExample {json} Success-Example
 *        { "message": "E-poctunuz uğurla dəyişdirildi" }
 *
 * @apiErrorExample {json} Response (this email already exist):
 *     { "err": "E-poçt istifadə edilir" }
 */

router.post('/email_update', authenticate, (req, res) => {
  const isEng = (req.headers.language || "") === "en";
  const { email, old_password } = req.body;
  const user_id = req.currentUser.id; 
  db.users.findOne({where:{id:user_id}}).then((check) => {
    if (check && isValidPassword(old_password, check.password))
      db.users.findAll({attributes:[[db.sequelize.fn('COUNT', Sequelize.col('id')), 'count']], where:{email}}).then(u => {
        if (Object.entries(u)[0][0] === '0')
          db.users.update({email}, {where:{id:user_id}}).then(() => {
            res.json({ message: !isEng ? 'E-poçt uğurla dəyişdirildi!' : 'Email changed successfully!' });
          });
        else
          res.json({ err: !isEng ? 'E-poçt istifadə edilir' : 'Email is used', message: '' });
      });
    else
      res.json({ err: !isEng ? 'Köhnə şifrənizi səhv daxil etmisiniz!' : 'You entered your old password incorrectly!', message: '' })
  });
});

/**
 * @api {post} /users/number_update number_update
 * @apiName number update
 * @apiGroup Users
 * @apiPermission none
 *
 * @apiDescription Telefon nömrəsi yeniləmə
 * 
 * @apiParam (Request body) {String} phone_number <code>phone_number</code> of the user.
 * @apiParamExample {json} Request-Example:
 *     { "phone_number": "" }
 * @apiSampleRequest off
 * @apiSuccessExample {json} Success-Example
 *        { "message": "Telefon nömrəsi uğurla dəyişdirildi" }
 *
 * @apiErrorExample {json} Response (this email already exist):
 *     { "err": "Telefon nömrəsi istifadə edilir" }
 */

router.post('/phone_number_update', authenticate, (req, res) => {
  const { phone, phone_verification_code, country_code, old_password } = req.body;
  const user_id = req.currentUser.id;  
  const isEng = (req.headers.language || "") === "en";
  db.users.findOne({where:{id:user_id}}).then((check) => {
    if (check && isValidPassword(old_password, check.password))
      db.users.findOne({attributes:['phone'], where:{phone, country_code}}).then(user => {
        if (user) {
          res.json({ err: !isEng ? 'Bu nömrə ilə artıq qeydiyyatdan keçilib' : 'It is already registered with this number' });
        } else {
          db.phone_verification.findOne({attributes:['id', 'count', 'code'], where:{phone, country_code, verify:1, count:0}}).then(result => {
            if (result && result.id) {
              if (Number(result.count || 0) < 5 && String(result.code) === String(phone_verification_code)) {
                db.users.update({phone, country_code}, {where:{id: user_id}}).then(() => {
                  res.json({ err: '', message: !isEng ? 'Nömrəniz uğurla dəyişdirildi' : 'Number changed successfully!' });
                });
              } else {
                if (Number(result.count || 0) < 5) {
                  res.json({ err: !isEng ? 'Kod düzgün deyil' : 'The code is incorrect' });
                } else {
                  res.json({ err: !isEng ? 'Limit aşıldı.' : 'Limit exceeded.', message: '' });
                }
              }
            } else {
              res.json({ err: !isEng ? 'Kod düzgün deyil2' : 'The code is incorrect' });
            }
          });
        }
      });
    else
      res.json({ err: !isEng ? 'Köhnə şifrənizi səhv daxil etmisiniz!' : 'You entered your old password incorrectly!', message: '' })
  });
});

/**
 * @api {post} /users/password_update password_update
 * @apiName password update
 * @apiGroup Users
 * @apiPermission none
 *
 * @apiDescription Şifrə yeniləmə
 * 
 * @apiParam (Request body) {String} password <code>password</code> of the user.
 * @apiParamExample {json} Request-Example:
 *     { "password": "" }
 * @apiSampleRequest off
 * @apiSuccessExample {json} Success-Example
 *        { "message": "Şifrəniz uğurla dəyişdirildi" }
 *
 */

router.post('/password_update', authenticate, (req, res) => {
  const isEng = (req.headers.language || "") === "en";
  const { password, old_password } = req.body;
  const user_id = req.currentUser.id;
  if ((password || "").length > 5) 
    db.users.findOne({where:{id:user_id}}).then(check => {
      if (check && isValidPassword(old_password, check.password))
        db.users.update({password:setPassword(password)}, {where:{id:user_id}}).then(() => {
          res.json({ message: !isEng ? 'Şifrəniz uğurla dəyişdirildi!' : 'Your password has been successfully changed!' });
        });
      else
        res.json({ err: !isEng ? 'Köhnə şifrənizi səhv daxil etmisiniz!' : 'You entered your old password incorrectly!', message: '' })
    });
  else
    res.json({ err: !isEng ? 'Şifrəniz minimum 6 xarakter olmalıdır!' : 'Your password must be at least 6 characters!', message: '' });
});

module.exports = router ;