const express = require('express') ;
const axios = require('axios') ;
const https = require('https') ;
const querystring = require('querystring') ;
const db = require('../models');
const {
  sequelize,
} = require('../middlewares/db.js') ;
const { service_left_bar } = require('../models/service_left_bar.js') ;
const { material_base } = require('../models/material_base.js') ;
const { authenticate } = require('../middlewares/authenticate.js') ;
const { saveFile, request } = require('../middlewares/helper.js') ;
const { smsSend } = require('../middlewares/sms.js') ;
require('dotenv').config(); 
const { Op, Sequelize } = require('sequelize') ;

const router = express.Router();

/**
 * @api {post} /main/save_file_dir/  save file
 * @apiName SaveFile
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription Faylların serverə yüklənməsi üçün istifadə edilir!
 *
 * @apiParam (Request body) {String} file_data <code>file_data</code> of the file.
 * @apiParam (Request body) {String} path <code>path</code> .
 * @apiParamExample {json} Request-Example:
 *     {"file_data": {
 *     "filedata": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAACAQA",
 *      "path": "studentphoto"
 *     }}
 * @apiSampleRequest off
 * @apiSuccessExample {String} Success-Example
 *        "/getfile/studentphoto~sekil%204-pbugv4p05z.png"
 *
 * @apiError (400 Bad Request) none
 */

router.post('/save_file_dir', authenticate, (req, res) => {
  const { file_data, path } = req.body;
  saveFile(file_data, path, req.currentUser.fin, (filename) => {
    res.json(filename);
  });
});

router.get(`/course/pese/data`, (req, res) => {
  res.json([]);
});

router.get('/course/show', authenticate, (req, res) => {
  axios
    .get(
      process.env.VACANCIES_HOST +
        '/api/cadet/teaching_courses_all_statusopen/?&teaching_year=32',
      {
        headers: {
          authorization: 'Bearer ' + process.env.VACANCIES_TOKEN,
        },
      }
    )
    .then(({ data }) => {
      res.json({
        openCourse: data,
      });
    })
    .catch((error) => {
      res.json({
        success: false,
      });
    });
});
/**
 * @api {post} /main/send_phone_for_verification/  confirm phone number check
 * @apiName sendPhoneForVerification
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription Mobil nömrəni yoxlamaq
 *
 * @apiParam (Request body) {String} phone <code>phone</code> of the user.
 * @apiParam (Request body) {String} country_code <code>country_code</code> of the phone_number.
 * @apiParamExample {json} Request-Example:
 *     { "phone": "111111111", "country_code": "+994" }
 * @apiSampleRequest off
 * @apiSuccessExample {json} Success-Example
 *        { "message": "Təsdiq kodu +994 111111111 nömrəsinə göndərildi" }
 *
 * @apiErrorExample {json} Response (already exist phone_number):
 *     { "err": "Bu nömrə ilə artıq qeydiyyatdan keçilib" }
 * @apiErrorExample {json} Response (out of time):
 *     { "err": "Yenidən göndərmək üçün gözləyin" }
 */

router.post('/send_phone_for_verification', async (req, res) => {
  const { phone, country_code } = req.body;

  const code = Math.floor(Math.random() * (999999 - 0 + 1)) + 0;
  const isEng = (req.headers.language || '') === 'en';
  const message = !isEng
    ? `Təsdiqləmə şifrəsi: ${code} Paylaşmayın!`
    : `Confirmation password: ${code} Do not share!`;

  
    db.users.findAll({ attributes: ['phone'], where: { phone, country_code } }).then((user) => {
    if (user) {
      res.json({
        err: !isEng
          ? 'Bu nömrə ilə artıq qeydiyyatdan keçilib'
          : 'It is already registered with this number',
      });
    } else {
        db.phone_verification.findAll({
          attributes: [
            'phone',
            'country_code',
            'number_wait_date',
            [
              db.sequelize.fn(
                'if',
                { number_wait_date: { [Op.lt]: db.sequelize.fn('NOW') } },
                1,
                0
              ),
              'expire',
            ],
          ],
          where: { phone, country_code },
        }).then((pd) => {
        if (pd) {
          if (Number(pd.expire) === 1) {
            smsSend(
              phone,
              message,
              () => {
                  db.phone_verification.update(
                    {
                      code,
                      verify: 0,
                      updated_date: db.sequelize.fn('NOW'),
                      count: 1,
                      number_wait_date: db.sequelize.literal(
                        `NOW() + INTERVAL 2 MINUTE`
                      ),
                    },
                    { where: { phone, country_code } }
                  ).then(() => {
                  res.json({
                    err: '',
                    message: !isEng
                      ? `Təsdiqləmə şifrəsi SMS vasitəsi ilə +${country_code} ${phone} nömrəsinə göndərildi.`
                      : `The confirmation code was sent to +${country_code} ${phone} via an SMS.` /*, csrf: req.new_csrf */,
                  });
                });
              },
              country_code
            );
          } else {
            res.json({
              err: !isEng
                ? 'Yenidən göndərmək üçün gözləyin'
                : 'Wait for it to resend',
            });
          }
        } else {
          smsSend(
            phone,
            message,
            () => {
                db.phone_verification.create({
                  phone,
                  country_code,
                  code,
                  created_date: db.sequelize.fn('NOW'),
                  number_wait_date: db.sequelize.literal(
                    `NOW() + INTERVAL 2 MINUTE`
                  ),
                }).then(() => {
                res.json({
                  err: '',
                  message: !isEng
                    ? `Təsdiqləmə şifrəsi SMS vasitəsi ilə +${country_code} ${phone} nömrəsinə göndərildi.`
                    : `The confirmation code was sent to +${country_code} ${phone} via an SMS.` /*, csrf: req.new_csrf */,
                });
              });
            },
            country_code
          );
        }
      });
    }
  });
});

/**
 * @api {post} /main/phone_verification_code/  enter code check phone_number
 * @apiName phoneVerificationCode
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription Koda görə nömrəni təsdiqləmə
 *
 * @apiParam (Request body) {String} phone <code>phone</code> of the user.
 * @apiParam (Request body) {String} code <code>code</code> of the phone.
 * @apiParam (Request body) {String} country_code <code>country_code</code> of the phone.
 * @apiParam (Request body) {Int} user_id <code>user_id</code> of the user. (not required)
 * @apiParamExample {json} Request-Example:
 *     { "phone": "111111111", "country_code": "+994", "code": "999999", "user_id": 1 }
 * @apiSampleRequest off
 * @apiSuccessExample {json} Success-Example
 *        { "message": "Nömrəniz təsdiqləndi" }
 *
 * @apiErrorExample {json} Response (invalid code):
 *     { "err": "Kod düzgün deyil" }
 */

router.post('/phone_verification_code', (req, res) => {
  const { phone, code, country_code, user_id } = req.body;
  const isEng = (req.headers.language || '') === 'en';
    db.phone_verification.findOne({
      attributes: ['id', 'count', 'code'],
      where: {
        phone,
        country_code,
        number_wait_date: { [Op.gt]: db.sequelize.fn('NOW') },
      },
    }).then((result) => {
    if (result && result.id) {
      if (
        Number(result.count || 0) < 5 &&
        String(result.code) === String(code)
      ) {
          db.phone_verification.update(
            { verify: 1 },
            { where: { id: result.id } }
          ).then(() => {
            if (user_id)
                db.users.update(
                  { phone, country_code },
                  { where: { id: user_id } }
                ).then(() => {
                  res.json({
                    err: '',
                    message: !isEng
                      ? 'Nömrəniz təsdiqləndi'
                      : 'Your number has been confirmed',
                  });
                }
              );
            else
              res.json({
                err: '',
                message: !isEng
                  ? 'Nömrəniz təsdiqləndi'
                  : 'Your number has been confirmed',
              });
          }
        );
      } else {
          db.phone_verification.update(
            { count: Number(result.count || 0) + 1 },
            { where: { id: result.id } }
          ).then(() => {
            if (Number(result.count || 0) < 5) {
              res.json({
                err: !isEng ? 'Kod düzgün deyil' : 'The code is incorrect',
              });
            } else {
              res.json({
                err: !isEng ? 'Limit aşıldı.' : 'Limit exceeded.',
                message: '',
              });
            }
          }
        );
      }
    } else {
      res.json({ err: !isEng ? 'Kod düzgün deyil' : 'The code is incorrect' });
    }
  });
});

router.post('/phone_verification_code_foredit', (req, res) => {
  const { phone, code, country_code } = req.body;
  const isEng = (req.headers.language || '') === 'en';
    db.phone_verification.findOne({
      attributes: ['id', 'count', 'code'],
      where: {
        phone,
        country_code,
        number_wait_date: { [Op.gt]: db.sequelize.fn('NOW') },
      },
    }).then((result) => {
    if (result && result.id) {
      if (
        Number(result.count || 0) < 5 &&
        String(result.code) === String(code)
      ) {
          db.phone_verification.update(
            { verify: 1, count: 0 },
            { where: { id: result.id } }
          ).then(() => {
            res.json({
              err: '',
              message: !isEng
                ? 'Nömrəniz təsdiqləndi'
                : 'Your number has been confirmed',
            });
          }
        );
      } else {
          db.phone_verification.update(
            { count: Number(result.count || 0) + 1 },
            { where: { id: result.id } }
          ).then(() => {
            if (Number(result.count || 0) < 5) {
              res.json({
                err: !isEng ? 'Kod düzgün deyil' : 'The code is incorrect',
              });
            } else {
              res.json({
                err: !isEng ? 'Limit aşıldı.' : 'Limit exceeded.',
                message: '',
              });
            }
          }
        );
      }
    } else {
      res.json({ err: !isEng ? 'Kod düzgün deyil' : 'The code is incorrect' });
    }
  });
});

/**
 * @api {post} /main/user_phone_verification_code/  user phone verification code
 * @apiName userPhoneVerificationCode
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription Koda görə nömrəni təsdiqləmə
 *
 * @apiParam (Request body) {String} email <code>email</code> of the user.
 * @apiParam (Request body) {String} phone_verification_code <code>phone_verification_code</code> of the phone.
 * @apiParamExample {json} Request-Example:
 *     { "email": "test@test.test", "phone_verification_code": "999999" }
 * @apiSampleRequest off
 * @apiSuccessExample {json} Success-Example
 *        { "message": "Nömrəniz təsdiqləndi" }
 *
 * @apiErrorExample {json} Response (invalid code):
 *     { "err": "Kod düzgün deyil" }
 * @apiErrorExample {json} Response (not found user):
 *     { "err": "İstifadəçi tapılmadı" }
 */

router.post('/user_phone_verification_code', (req, res) => {
  const { email, phone_verification_code } = req.body;
  const isEng = (req.headers.language || '') === 'en';
  db.users.findAll({ where: { email } }).then((u) => {
    if (u.phone)
        db.phone_verification.findAll({
          attributes: ['id', 'count', 'code'],
          where: {
            phone,
            country_code,
            number_wait_date: { [Op.gt]: db.sequelize.fn('NOW') },
          },
        }).then((result) => {
        if (result && result.id) {
          if (
            Number(result.count || 0) < 5 &&
            String(result.code) === String(phone_verification_code)
          ) {
              db.phone_verification.update(
                { verify: 1 },
                { where: { id: result.id } }
              ).then(() => {
                res.json({
                  err: '',
                  message: !isEng
                    ? 'Nömrəniz təsdiqləndi'
                    : 'Your number has been confirmed',
                });
              }
            );
          } else {
              db.phone_verification.update(
                { count: Number(result.count || 0) + 1 },
                { where: { id: result.id } }
              ).then(() => {
                if (Number(result.count || 0) < 5) {
                  res.json({
                    err: !isEng ? 'Kod düzgün deyil' : 'The code is incorrect',
                  });
                } else {
                  res.json({
                    err: !isEng ? 'Limit aşıldı.' : 'Limit exceeded.',
                    message: '',
                  });
                }
              }
            );
          }
        } else {
          res.json({
            err: !isEng ? 'Kod düzgün deyil' : 'The code is incorrect',
          });
        }
      });
    else
      res.json({
        err: !isEng ? 'İstifadəçi tapılmadı' : 'User not found',
        message: '',
      });
  });
});

/**
 * @api {post} /main/send_user_for_verification/ send user for verification
 * @apiName sendUserForVerification
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription E-poçta görə nömrəni təsdiqləmə
 *
 * @apiParam (Request body) {String} email <code>email</code> of the user.
 * @apiParam (Request body) {String} phone <code>phone</code> of the user.
 * @apiParamExample {json} Request-Example:
 *     { "email": "test@test.test", "phone": "+994 111111111" }
 * @apiSampleRequest off
 * @apiSuccessExample {json} Success-Example
 *        { "message": "Təsdiq kodu +994 111111111 nömrəsinə göndərildi" }
 *
 * @apiErrorExample {json} Response (invalid phone number):
 *     { "err": "Nömrə yanlışdır" }
 * @apiErrorExample {json} Response (out of time):
 *     { "err": "Yenidən göndərmək üçün gözləyin" }
 */

router.post('/send_user_for_verification', (req, res) => {
  const { email, phone } = req.body;
  const code = Math.floor(Math.random() * (999999 - 0 + 1)) + 0;
  const isEng = (req.headers.language || '') === 'en';
  const message = !isEng
    ? `Təsdiqləmə şifrəsi: ${code} Paylaşmayın!`
    : `Confirmation password: ${code} Do not share!`;
    db.phone_verification.findAll({
      attributes: ['id', 'count'],
      where: {
        phone: email,
        country_code: 1,
        number_wait_date: { [Op.gt]: sequelize.fn('NOW') },
      },
    }).then((eChek) => {
    if (Number((eChek || {}).count || 0) < 5) {
      db.users.findAll({ where: { email } }).then((u) => {
        if (u && u.phone && phone == u.phone.substring(u.phone.length - 4)) {
            db.phone_verification.findAll({
              attributes: [
                'phone',
                'country_code',
                'number_wait_date',
                [
                  sequelize.fn(
                    'if',
                    { number_wait_date: { [Op.lt]: db.sequelize.fn('NOW') } },
                    1,
                    0
                  ),
                  'expire',
                ],
              ],
              where: { phone: u.phone, country_code: u.country_code },
            }).then((pd) => {
            if (pd) {
              if (Number(pd.expire) === 1) {
                smsSend(
                  u.phone,
                  message,
                  () => {
                      db.phone_verification.update(
                        {
                          code,
                          verify: 0,
                          count: 1,
                          updated_date: db.sequelize.fn('NOW'),
                          number_wait_date: db.sequelize.literal(
                            `NOW() + INTERVAL 2 MINUTE`
                          ),
                        },
                        {
                          where: {
                            phone: u.phone,
                            country_code: u.country_code,
                          },
                        }
                      ).then(() => {
                      res.json({
                        err: '',
                        message: !isEng
                          ? `Təsdiqləmə şifrəsi SMS vasitəsi ilə +${u.country_code} ${u.phone} nömrəsinə göndərildi.`
                          : `The confirmation code was sent to +${u.country_code} ${u.phone} via an SMS.` /*, csrf: req.new_csrf */,
                      });
                    });
                  },
                  u.country_code
                );
              } else {
                res.json({
                  err: !isEng
                    ? 'Yenidən göndərmək üçün gözləyin'
                    : 'Wait for it to resend',
                });
              }
            } else {
              smsSend(
                u.phone,
                message,
                () => {
                    db.phone_verification.create({
                      phone: u.phone,
                      country_code: u.country_code,
                      code,
                      created_date: db.sequelize.fn('NOW'),
                      number_wait_date: db.sequelize.literal(
                        `NOW() + INTERVAL 2 MINUTE`
                      ),
                    }).then(() => {
                    res.json({
                      err: '',
                      message: !isEng
                        ? `Təsdiqləmə şifrəsi SMS vasitəsi ilə +${u.country_code} ${u.phone} nömrəsinə göndərildi.`
                        : `The confirmation code was sent to +${u.country_code} ${u.phone} via an SMS.` /*, csrf: req.new_csrf */,
                    });
                  });
                },
                u.country_code
              );
            }
          });
        } else {
          if (eChek) {
              db.phone_verification.update(
                { count: Number(eChek.count || 0) + 1 },
                { where: { id: eChek.id } }
              ).then(() => {
              res.json({
                err: !isEng ? 'Nömrə yanlışdır.' : 'The number is incorrect.',
                message: '',
              });
            });
          } else {
              db.phone_verification.create({
                phone: email,
                country_code: '1',
                code: '1',
                created_date: db.sequelize.fn('NOW'),
                number_wait_date: db.sequelize.literal(
                  `NOW() + INTERVAL 2 MINUTE`
                ),
              }).then(() => {
              res.json({
                err: !isEng ? 'Nömrə yanlışdır.' : 'The number is incorrect.',
                message: '',
              });
            });
          }
        }
      });
    } else {
      res.json({
        err: !isEng ? 'Limit aşıldı.' : 'Limit exceeded.',
        message: '',
      });
    }
  });
});

/**
 * @api {post} /main/get_user_phone/ get user phone
 * @apiName getUserPhone
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription E-poçta görə nömrəni əldə et
 *
 * @apiParam (Request body) {String} email <code>email</code> of the user.
 * @apiParamExample {json} Request-Example:
 *     { "email": "test@test.test" }
 * @apiSampleRequest off
 * @apiSuccessExample {json} Success-Example
 *        { "phone": "11111", "country_code": "+994" }
 *
 * @apiErrorExample {json} Response (not found user):
 *     { "err": "İstifadəçi tapılmadı" }
 */

router.post('/get_user_phone', (req, res) => {
  const { email } = req.body;
  const isEng = (req.headers.language || '') === 'en';
  console.log({ isEng, la: req.headers.language });
  db.users.findAll({ where: { email } }).then((u) => {
    if (u && u.phone)
      res.json({
        err: '',
        message: '',
        phone: u.phone.substring(0, u.phone.length - 4),
        country_code: u.country_code,
      });
    else
      res.json({
        err: !isEng ? 'İstifadəçi tapılmadı' : 'User not found',
        message: '',
      });
  });
});

/**
 * @api {post} /main/get_user_email_and_phone/ get user phone
 * @apiName getUserEmailAndPhone
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription FİN və Doğum tarixinə görə E-poçt və nömrəni əldə etmə
 *
 * @apiParam (Request body) {String} fin <code>fin</code> of the user.
 * @apiParam (Request body) {String} birth_date <code>birth_date</code> of the user.
 * @apiParamExample {json} Request-Example:
 *     { "fin": "XXXXXXX", birth_date: "20.02.2002"}
 * @apiSampleRequest off
 * @apiSuccessExample {json} Success-Example
 *        { "phone": "11111", "country_code": "+994", "email": "email@mail.com" }
 *
 * @apiErrorExample {json} Response (not found user):
 *     { "err": "İstifadəçi tapılmadı" }
 */

router.post('/get_user_email_and_phone', (req, res) => {
  const { fin, birth_date } = req.body;
  const isEng = (req.headers.language || '') === 'en';
  db.users.findAll({
      attributes: ['phone', 'country_code', 'email'],
      where: { fin },
      include: [{ model: db.fin_data, required: false, where: { birth_date } }],
    }).then((u) => {
    if (u && u.phone)
      res.json({
        err: '',
        message: '',
        phone: u.phone.substring(0, u.phone.length - 4),
        country_code: u.country_code,
        email: u.email,
      });
    else
      res.json({
        err: !isEng ? 'İstifadəçi tapılmadı' : 'User not found',
        message: '',
      });
  });
});

/**
 * @api {post} /main/send_email_for_verification/ send email for verification
 * @apiName sendEmailForVerification
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription E-poçta görə nömrəni təsdiqləmə
 *
 * @apiParam (Request body) {String} email <code>email</code> of the user.
 * @apiParamExample {json} Request-Example:
 *     { "email": "test@test.test" }
 * @apiSampleRequest off
 * @apiSuccessExample {json} Success-Example
 *        { "message": "Təsdiq kodu +994 111111111 nömrəsinə göndərildi" }
 *
 * @apiErrorExample {json} Response (out of time):
 *     { "err": "Yenidən göndərmək üçün gözləyin" }
 */

router.post('/send_email_for_verification', (req, res) => {
  const { email } = req.body;
  const code = 1; //Math.floor(Math.random() * (999999 - 0 + 1)) + 0;
  const message = `Elektron Tələbə Sənəd Qebulu Sistemi ucun qeydiyyat sifresi: ${code}`;
  db.users.findAll({ where: { email } }).then((user) => {
    if (user) {
      res.json({ err: 'Bu email ilə artıq qeydiyyatdan keçilib' });
    } else {
      db.phone_verification.findAll({
          attributes: ['phone', 'country_code', 'number_wait_date'],
          where: { phone: email },
        }).then((pd) => {
        if (pd) {
          if (pd.number_wait_date) {
            db.phone_verification.findAll({
                attributes: ['id'],
                where: {
                  phone: email,
                  number_wait_date: { [Op.gte]: sequelize.fn('NOW') },
                },
              }).then((is) => {
              if (!is) {
                //smsSend(phone, message, () => { });
                db.phone_verification.update(
                    {
                      code,
                      updated_date: db.sequelize.fn('NOW'),
                      number_wait_date: db.sequelize.literal(
                        `NOW() + INTERVAL 2 MINUTE`
                      ),
                    },
                    { where: { phone: email } }
                  ).then(() => {});
                res.json({
                  err: '',
                  message: `Təsdiq kodu ${email} adresinizə göndərildi` /*, csrf: req.new_csrf */,
                });
              } else {
                res.json({ err: 'Yenidən göndərmək üçün gözləyin' });
              }
            });
          } else {
            //smsSend(phone, message, () => { });

            db.phone_verification.update(
                {
                  code,
                  updated_date: db.sequelize.fn('NOW'),
                  number_wait_date: db.sequelize.literal(
                    `NOW() + INTERVAL 2 MINUTE`
                  ),
                },
                { where: { phone: email } }
              ).then(() => {});
            res.json({
              err: '',
              message: `Təsdiq kodu ${email} adresinizə göndərildi` /*, csrf: req.new_csrf */,
            });
          }
        } else {
          //smsSend(phone, message, () => { });

          db.phone_verification.create({
              phone,
              code,
              created_date: db.sequelize.fn('NOW'),
              number_wait_date: db.sequelize.literal(`NOW() + INTERVAL 2 MINUTE`),
            }).then(() => {});
          res.json({
            err: '',
            message: `Təsdiq kodu ${email} adresinizə göndərildi` /*, csrf: req.new_csrf */,
          });
        }
      });
    }
  });
});

/**
 * @api {post} /main/email_verification_code/ email verification code
 * @apiName emailVerificationCode
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription E-poçtun təsdiqləməsi
 *
 * @apiParam (Request body) {String} email <code>email</code> of the user.
 * @apiParam (Request body) {String} code <code>code</code> of the phone.
 * @apiParamExample {json} Request-Example:
 *     { "email": "test@test.test", "code": "999999" }
 * @apiSampleRequest off
 * @apiSuccessExample {json} Success-Example
 *        { "message": "Email adresiniz təsdiqləndi" }
 *
 * @apiErrorExample {json} Response (invalid code):
 *     { "err": "Kod düzgün deyil" }
 */

router.post('/email_verification_code', (req, res) => {
  const { email, code } = req.body;
  db.phone_verification.findAll({
      attributes: ['phone'],
      where: { phone: email, code },
    }).then((result) => {
    if (result && result.phone) {
      res.json({ err: '', message: 'Email adresiniz təsdiqləndi' });
    } else {
      res.json({ err: 'Kod düzgün deyil' });
    }
  });
});

/**
 * @api {get} /main/enterprises enterprises
 * @apiName enterprises
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription enterprises siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */
//peshe
router.get('/enterprises', authenticate, (req, res) => {
  db.enterprises_31.findAll({ where: { deleted: 0 }, order: [['name', 'ASC']] }).then((rows) => res.json(rows));
});

/**
 * @api {get} /main/regions regions
 * @apiName regions
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription regions siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */
router.get('/regions', authenticate, (req, res) => {
  db.districts.findAll({ where: { deleted: 0 }, order: [['name', 'ASC']] }).then((rows) => res.json(rows));
});
/**
 * @api {get} /main/specialty specialty
 * @apiName specialty
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription specialty siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */
router.get('/specialty', authenticate, (req, res) => {
  db.specialty_31.findAll({ where: { deleted: 0 }, order: [['name', 'ASC']] }).then((rows) => res.json(rows));
});
/**
 * @api {get} /main/education_base education_base
 * @apiName education_base
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription education_base siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */
router.get('/education_base', authenticate, (req, res) => {
  db.education_base.findAll({ order: [['name', 'ASC']] }).then(
    (result) => res.json(result)
  );
});
/**
 * @api {get} /main/material_base material_base
 * @apiName material_base
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription material_base siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */
router.get('/material_base', authenticate, (req, res) => {
  material_base.findAll({ order: [['name', 'ASC']] }).then(
    (result) => res.json(result)
  );
});
/**
 * @api {get} /main/teaching_language teaching_language
 * @apiName teaching_language
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription teaching_language siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */
router.get('/teaching_language', authenticate, (req, res) => {
  db.teaching_language.findAll({ order: [['name', 'ASC']] }).then(
    (result) => res.json(result)
  );
});
/**
 * @api {get} /main/education_duration education_duration
 * @apiName education_duration
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription education_duration siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */
router.get('/education_duration', authenticate, (req, res) => {
  db.education_duration.findAll({ order: [['name', 'ASC']] }).then((result) => res.json(result));
});
/**
 * @api {get} /main/universities universities
 * @apiName universities
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription universities siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */
router.get('/universities', authenticate, (req, res) => {
  db.universities.findAll({ group: ['name'], order: [['name', 'ASC']] }).then((result) => res.json(result));
});
/**
 * @api {get} /main/utis_schools utis_schools
 * @apiName utis_schools
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription utis_schools siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */
router.get('/utis_schools', authenticate, (req, res) => {
  db.utis_schools.findAll({ order: [['name', 'ASC']] }).then(
    (result) => res.json(result)
  );
});
/**
 * @api {get} /main/schools_new schools_new
 * @apiName schools_new
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription schools_new siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */
router.get('/schools_new', authenticate, (req, res) => {
  db.schools_new.findAll({ group: ['name'], order: [['name', 'ASC']] }).then((row) => res.json(result || []));
});
/**
 * @api {get} /main/uni_specialties uni_specialties
 * @apiName uni_specialties
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription uni_specialties siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */
router.get('/uni_specialties', authenticate, (req, res) => {
  db.uni_specialties.findAll({ group: ['name'], order: [['name', 'ASC']] }).then((result) => res.json(result));
});
/**
 * @api {get} /main/school_specialties school_specialties
 * @apiName school_specialties
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription school_specialties siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */
router.get('/school_specialties', authenticate, (req, res) => {
  db.school_specialties.findAll({ group: ['name'], order: [['name', 'ASC']] }).then((result) => res.json(result));
});

/**
 * @api {post} /main/out_of_school_centers out_of_school_centers
 * @apiName out_of_school_centers
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription out_of_school_centers siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */
router.post('/out_of_school_centers', authenticate, (req, res) => {
  // const { name } = req.body;
  // querySyncForMap(`SELECT * FROM out_of_school_centers  where  name=? ORDER BY name ASC`, [name]).then(result => res.json(result));
  db.out_of_school_centers.findAll({ order: [['name', 'ASC']] }).then((result) => res.json(result));
});
/**
 * @api {get} /main/country country
 * @apiName country
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription country siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */
router.get('/country', (req, res) => {
  const langKey = (req.headers.language || '') === 'en' ? 'nameEn' : 'name';
  db.country.findAll({ order: [[langKey, 'ASC']] }).then(
    (result) => res.json(result.map((r) => ({ ...r, name: r[langKey] })))
  );
});
/**
 * @api {get} /main/subjects subjects
 * @apiName subjects
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription subjects siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */
router.get('/subjects', authenticate, (req, res) => {
  db.subjects.findAll({ order: [['name', 'ASC']] }).then(
    (result) => res.json(result)
  );
});
/**
 * @api {get} /main/scientific_type scientific_type
 * @apiName scientific_type
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription scientific_type siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */
router.get('/scientific_type', authenticate, (req, res) => {
  db.scientific_type.findAll({ order: [['name', 'ASC']] }).then(
    (result) => res.json(result)
  );
});
/**
 * @api {get} /main/services services
 * @apiName services
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription services siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */
router.get('/services', authenticate, (req, res) => {
  const langKey = (req.headers.language || '') === 'en' ? 'En' : '';
  db.services.findAll({ order: [['preference', 'ASC']] }).then(
    (result) => {
      res.json(
        result.map((r) => ({
          ...r,
          title: r['title' + langKey],
          description: r['description' + langKey],
        }))
      );
    }
  );
});
/**
 * @api {post} /main/services services
 * @apiName services
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription services siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 * @apiParamExample {json} Request-Example:
 *     { "serviceName": "edu_docs" }
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */
router.post('/service_left_bar', authenticate, (req, res) => {
  const { serviceName } = req.body;
  const langKey = (req.headers.language || '') === 'en' ? 'En' : '';
    service_left_bar.findAll({
      where: { service_name: serviceName },
      order: [['id', 'ASC']],
    }).then((result) =>
    res.json(result.map((r) => ({ ...r, title: r['title' + langKey] })))
  );
});

/**
 * @api {get} /main/vacancies vacancies
 * @apiName vacancies
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription vacancies siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */
router.get('/vacancies', authenticate, (req, res) => {
  axios
    .get(
      `${process.env.VACANCIES_HOST}:${
        process.env.VACANCIES_PORT
      }/api/vacancy/plans?teaching_year=${new Date().getFullYear() - 1}`,
      {
        headers: { authorization: 'Bearer ' + process.env.VACANCIES_TOKEN },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      }
    )
    .then(({ data }) => res.json(data));
});

/**
 * @api {get} /main/notifications_by/:service notifications_by
 * @apiName notifications_by
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription vacancies siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Error response:
 *     { "error": "service tapilmadi" }
 */
router.get('/notifications_by/:service/:fin', authenticate, (req, res) => {
  const { service, fin } = req.params;

  if (service)
  db.notifications.findAll({
        where: { service, fin: fin || req.currentUser.fin },
        order: [['id', 'DESC']],
      }).then((result) => res.json(result));
  else res.json({ error: 'service tapilmadi' });
});

/////// ATIS \\\\\\\\

/**
 * @api {get} /main/atis_enterprises atis_enterprises
 * @apiName atis_enterprises
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription atis_enterprises siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */

router.get('/atis_enterprises', authenticate, (req, res) => {
  const langKey = (req.headers.language || '') === 'en' ? 'nameEn' : 'name';

    db.atis_enterprises.findAll({
      group: ['ATIS_ID'],
      order: [['name', 'ASC']],
      include: [
        {
          model: db.ent_sp_join,
          required: false,
          attributes: [
            [
              db.sequelize.fn('GROUP_CONCAT', Sequelize.col('specialty_ATIS_ID')),
              'specialty_ATIS_ID',
            ],
          ],
        },
      ],
    }).then((result) =>
    res.json(
      (result || []).map((e) => ({
        ...e,
        name: e[langKey],
        specialty_ATIS_ID:
          (e.specialty_ATIS_ID && e.specialty_ATIS_ID.split(',')) || [],
      }))
    )
  );
});

router.post('/foreigner_enterprises', authenticate, (req, res) => {
  const { EducationLevelId, EducationStageId, preparation } = req.body;
  const isNull = Object.keys(req.body).length === 0;
  const langKey = (req.headers.language || '') === 'en' ? 'nameEn' : 'name';
  atisLogin((token) => {
    if (token) {
      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        // timeout: process.env.TIMEOUT || 8000,
        data: isNull
          ? {}
          : {
              educationlevelid:
                Number(EducationStageId) === 1 ? '' : EducationLevelId,
              educationstageid: EducationStageId,
              preparation: Number(preparation) === 1 ? true : false,
            },
        url: `${process.env.ATIS_HOST}/api/tq/institutions`,
      };
      axios(options)
        .then((result) => {
          res.json(
            ((result.data || {}).institution || []).map((e) => ({
              ATIS_ID: e.atidId,
              name: e[langKey] || e.name,
            }))
          );
        })
        .catch((e) => {
          if (e.response) {
            console.log(e.response.data);
          } else {
            console.log(e);
          }
          if (Object.keys(e).length > 0) res.json([]);
        });
    } else {
      res.json([]);
    }
  });
});

/**
 * @api {get} /main/atis_specialty atis_specialty
 * @apiName atis_specialty
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription atis_specialty siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Error response:
 *     { "error": "table tapilmadi" }
 *
 */

/**
 * @api {get} /main/EducationLevel EducationLevel
 * @apiName EducationLevel
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription EducationLevel siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Error response:
 *     { "error": "table tapilmadi" }
 */

/**
 * @api {get} /main/EducationStage EducationStage
 * @apiName EducationStage
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription EducationStage siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Error response:
 *     { "error": "table tapilmadi" }
 */

/**
 * @api {get} /main/EducationLanguage EducationLanguage
 * @apiName EducationLanguage
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription EducationLanguage siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Error response:
 *     { "error": "table tapilmadi" }
 */

/**
 * @api {get} /main/FormOfEducation FormOfEducation
 * @apiName FormOfEducation
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription FormOfEducation siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Error response:
 *     { "error": "table tapilmadi" }
 */

/**
 * @api {get} /main/payment_types payment_types
 * @apiName payment_types
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription payment_types siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Error response:
 *     { "error": "table tapilmadi" }
 */

/**
 * @api {get} /main/specializations specializations
 * @apiName specializations
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription specializations siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Error response:
 *     { "error": "table tapilmadi" }
 */

/**
 * @api {get} /main/ReceptionLine ReceptionLine
 * @apiName ReceptionLine
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription ReceptionLine siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Error response:
 *     { "error": "table tapilmadi" }
 */

/**
 * @api {get} /main/ent_sp_join ent_sp_join
 * @apiName ent_sp_join
 * @apiGroup Main
 * @apiPermission none
 *
 * @apiDescription ent_sp_join siyahısı gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} Error response:
 *     { "error": "table tapilmadi" }
 */

const tables = [
  'atis_specialty',
  'EducationLevel',
  'EducationStage',
  'sub_specializations',
  'EducationLanguage',
  'FormOfEducation',
  'payment_types',
  'sub_specialities',
  'specializations',
  'ReceptionLine',
  'ent_sp_join',
  'government_agencies',
  'atis_enterprises',
  'formofeducation',
  'doc_enterprises',
  'doc_specialities',
];

const atisTables = [
  'foreigner_specialities',
  'foreigner_specializations',
  'foreigner_sub_specializations',
  'foreigner_sub_specialities',
];
const atisTablesKeys = {
  foreigner_specialities: 'specialty',
  foreigner_specializations: 'specializationsVM',
  foreigner_sub_specializations: 'childSpecializationsVM',
  foreigner_sub_specialities: 'childSpecialties',
};

router.get('/:table', authenticate, (req, res) => {
  const { table } = req.params;
  const langKey = (req.headers.language || '') === 'en' ? 'nameEn' : 'name';
  if (table) {
    if (tables.includes(table)) {
      db.table.findAll({ order: [['id', 'ASC']] }).then(
        (result) => res.json(result.map((r) => ({ ...r, name: r[langKey] })))
      );
    } else if (atisTables.includes(table)) {
      atisData(table, (data) => {
        res.json(
          ((data || {})[atisTablesKeys[table]] || []).map((e) => ({
            e,
            name: e[langKey] || e.name,
            ATIS_ID: e.atisId,
            specialization_ATIS_ID: e.specializationAtisId,
            enterprise_ATIS_ID: e.institutionAtisId,
            specialty_ATIS_ID: e.specialtyAtisId,
            specialty_code: e.specialtyCode,
            paymentTypeId: e.paymentTypeId,
            educationLanguageId: e.educationLanguageId,
            educationFormId: e.educationFormId,
            EducationStageId: e.educationStageId,
            educationLevelId: e.educationLevelId,
            teachingYear: (e.teachingYear || '').split('/')[0],
            entranceSpecialtyPaymentAmount: e.paymentAmount,
            preparation_amount: e.preparationAmount,
          }))
        );
      });
    } else {
      res.json({ error: 'table tapilmadi' });
    }
  } else {
    res.json({ error: 'table tapilmadi' });
  }
});

module.exports =  router;

const atisData = (key, callback) => {
  const params = {
    foreigner_specialities: 'specialty',
    foreigner_sub_specialities: 'childspecialty',
    foreigner_sub_specializations: 'childspecialization',
    foreigner_specializations: 'specialization',
  };

  atisLogin((token) => {
    if (token) {
      axios({
        method: 'GET',
        url: `${process.env.ATIS_HOST}/api/tq/${params[key]}/paymentamounts`,
        headers: {
          Authorization: 'Bearer ' + token,
        },
      })
        .then((result) => {
          callback(result.data);
        })
        .catch((e) => {
          if (e.response) {
            console.log(e.response.data);
          } else {
            console.log(e);
          }
          if (Object.keys(e).length > 0) callback([]);
        });
    } else {
      callback([]);
    }
  });
};

const atisLogin = (callback) => {
  const postData = querystring.stringify({
    UserName: 'EDUMedia0508',
    Password: 'n)/m<ySRNs7Af38n',
    SecretKey: 'AtisI#_EB-R$T]2EKG!Key',
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: postData,
    timeout: process.env.TIMEOUT || 8000,
    url: `${process.env.ATIS_HOST}/api/tq/login`,
  };

  axios(options)
    .then((login_result) => {
      //console.log('login_result: ', login_result.data)
      if (((login_result || {}).data || {}).access_token) {
        callback(((login_result || {}).data || {}).access_token);
      } else {
        callback(false);
      }
    })
    .catch((e) => {
      console.log('login error: ', e);
      if (Object.keys(e).length > 0) callback(false);
    });
};
