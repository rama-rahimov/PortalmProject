const express = require('express');
const _ = require('lodash');
const moment = require('moment');
const { authenticate } = require('../middlewares/authenticate.js');
const { midRequest } = require('./soap.js') ;
const db = require('../models');

const router = express.Router();

function* asyncArrayItemGenerator(array) {
  yield* array;
}

router.get('/updateAllData', authenticate, (req, res) => {
  const { fin } = req.currentUser;
  db.children
    .findAll({
      where: { user_id: req.currentUser.id, deleted: 0 },
      include: [{ model: db.fin_data, required: false }],
    })
    .then((children) => {
      midRequest('/getPersonRelations', { pin: fin }, async (response) => {
        const { status, data } = response;
        const childs = children || [];
        if (status && (data || []).length > 0) {
          for (const child of asyncArrayItemGenerator(
            data.filter(
              (c) => c.relationType === 'Child' && c.status === 'Active'
            )
          )) {
            const { dateOfBirthStr, pin } = child.relative;
            db.children
              .findOne({
                attributes: ['user_id'],
                where: { fin: pin, deleted: 0 },
              })
              .then((dbchild) => {
                if (!dbchild)
                  childs.push({
                    fin: pin,
                    birth_date: moment(dateOfBirthStr).format('DD.MM.YYYY'),
                  });
              });
          }
        }
        for (const child of asyncArrayItemGenerator(childs)) {
          const pin = child.fin.length !== 7 ? null : child.fin;
          if (pin || child.utis_code)
            await updateChild(
              pin,
              child.birth_date,
              child.utis_code,
              req.currentUser.id
            ).then((rrr) => {});
        }
        res.json(true);
      });
    });
});

router.get('/check_fin/:fin', authenticate, (req, res) => {
  const { fin } = req.params;
  /*querySync(`SELECT * FROM (SELECT fin FROM users UNION ALL (SELECT fin FROM children WHERE deleted=0 )) t1 WHERE fin=? limit 1`, [fin]).then(user => {
    res.json(!!user);
  });*/
  if (fin != req.currentUser.fin)
    db.children.findOne({ where: { fin, deleted: 0 } }).then((user) => {
      res.json(!!user);
    });
  else res.json(false);
});

/**
 * @api {post} /children/save/  Save
 * @apiName Save
 * @apiGroup Children
 * @apiPermission none
 *
 * @apiDescription Uşaqların qeydiyyatı
 *
 * @apiParam (Request body) {String} id <code>id</code>
 * @apiParam (Request body) {String} fin <code>fin</code>
 * @apiParam (Request body) {String} first_name <code>first_name</code>
 * @apiParam (Request body) {String} last_name <code>last_name</code>
 * @apiParam (Request body) {String} father_name <code>father_name</code>
 * @apiParam (Request body) {String} birth_date <code>birth_date</code>
 * @apiParam (Request body) {String} gender <code>gender</code>
 * @apiParam (Request body) {String} series <code>series</code>
 * @apiParam (Request body) {String} number <code>number</code>
 * @apiParam (Request body) {String} giving_authority <code>giving_authority</code>
 * @apiParam (Request body) {String} giving_date <code>giving_date</code>
 * @apiParam (Request body) {String} exp_date <code>exp_date</code>
 * @apiParam (Request body) {String} district <code>district</code>
 * @apiParam (Request body) {String} born_country <code>born_country</code>
 * @apiParam (Request body) {String} actual_address <code>actual_address</code>
 * @apiParam (Request body) {String} citizenship <code>citizenship</code>
 * @apiParam (Request body) {String} address <code>address</code>
 * @apiParam (Request body) {String} image <code>image</code>
 * @apiParam (Request body) {String} social_status <code>social_status</code>
 * @apiParam (Request body) {String} city <code>city</code>
 * @apiParam (Request body) {String} region <code>region</code>
 * @apiParam (Request body) {String} current_enterprise <code>current_enterprise</code>
 * @apiParam (Request body) {String} grade <code>grade</code>
 * @apiParam (Request body) {String} teaching_language <code>teaching_language</code>
 * @apiParam (Request body) {String} parent_type <code>parent_type</code>
 * @apiParam (Request body) {String} type <code>type</code>
 * @apiParam (Request body) {String} birth_certificate_no <code>birth_certificate_no</code>
 * @apiParamExample {json} Request-Example:
 *     {
 *        "file_data": {
 *            "id": 1, "fin": "", "first_name": "", "last_name": "", "father_name": "", "birth_date": "", "gender": "", "series": "",
 *  "number": "", "giving_authority": "", "giving_date": "", "exp_date": "", "district": "", "born_country": "", "actual_address": "",
 * "citizenship": "", "address": "", "image": "", "social_status": "", "city": "", "region": "", "current_enterprise": "",
 *   "grade": "", "teaching_language": "", "parent_type": "", "type": "", "birth_certificate_no": ""
 *        }
 *     }
 * @apiSampleRequest off
 * @apiSuccessExample {json} Success-Example
 *        { "message": "Uşağın məlumatları uğurla dəyişdirildi!" }
 *
 * @apiError (400 Bad Request) none
 * @apiErrorExample {json} Response (already children exist):
 *     { "err": "Bu uşaq artıq sistemdə var" }
 *
 * @apiErrorExample {json} Response (error):
 *     { "err": "Xəta baş verdi" }
 */

router.post('/save', authenticate, (req, res) => {
  let {
    id,
    fin,
    first_name,
    last_name,
    father_name,
    birth_date,
    gender,
    series,
    number,
    giving_authority,
    exp_date,
    born_country,
    edu_level,
    citizenship,
    citizenshipId,
    address,
    city,
    region,
    current_enterprise,
    grade,
    teaching_language,
    parent_type,
    type,
    birth_certificate_no,
    school_code,
    utis_code,
  } = req.body;

  if (Number(type) === 3 && !fin) {
    fin = 'UC' + utis_code;
  }
  if ((fin || '').toLowerCase() != (req.currentUser.fin || '').toLowerCase()) {
    db.children
      .findOne({ attributes: ['id'], where: { fin, deleted: 0 } })
      .then((check_children) => {
        if ((check_children || {}).id && check_children.id != id) {
          res.json({ success: false, err: 'Bu uşaq artıq sistemdə var!' });
        } else {
          db.children
            .findOne({
              attributes: ['id'],
              where: { user_id: req.currentUser.id, id: id || 0, deleted: 0 },
            })
            .then((children) => {
              if ((children || {}).id) {
                db.children
                  .update(
                    {
                      type,
                      fin,
                      birth_certificate_no,
                      city,
                      region,
                      edu_level,
                      current_enterprise,
                      grade: !!grade ? grade : null,
                      teaching_language,
                      parent_type,
                      school_code,
                      utis_code,
                    },
                    { where: { id } }
                  )
                  .then((data) => {
                    if (data.error) {
                      res.json({ success: false, error: data.error });
                    } else {
                      if (Number(citizenshipId) > 2)
                        db.fin_data
                          .findOne({ attributes: ['fin'], where: { fin } })
                          .then((check_fin) => {
                            if (!check_fin) {
                              db.fin_data
                                .create({
                                  fin,
                                  first_name,
                                  last_name,
                                  father_name,
                                  birth_date,
                                  gender,
                                  series,
                                  number,
                                  giving_authority,
                                  exp_date,
                                  born_country,
                                  citizenship,
                                  address,
                                })
                                .then((fin_data) => {
                                  if (fin_data.error) {
                                    res.json({
                                      success: false,
                                      err: 'Xəta baş verdi.',
                                    });
                                  } else {
                                    res.json({
                                      id: children.id,
                                      success: true,
                                      message:
                                        'Uşağın məlumatları uğurla əlavə edildi!',
                                    });
                                  }
                                });
                            } else {
                              db.fin_data
                                .update(
                                  {
                                    first_name,
                                    last_name,
                                    father_name,
                                    birth_date,
                                    gender,
                                    series,
                                    number,
                                    giving_authority,
                                    exp_date,
                                    born_country,
                                    citizenship,
                                    address,
                                  },
                                  { where: { fin } }
                                )
                                .then((fin_data) => {
                                  if (fin_data.error) {
                                    res.json({
                                      success: false,
                                      err: 'Xəta baş verdi.',
                                    });
                                  } else {
                                    res.json({
                                      id: children.id,
                                      success: true,
                                      message:
                                        'Uşaqın məlumatları uğurla dəyişdirildi!',
                                    });
                                  }
                                });
                            }
                          });
                      else
                        res.json({
                          id: children.id,
                          success: true,
                          message: 'Uşağın məlumatları uğurla əlavə edildi!',
                        });
                    }
                  });
              } else {
                db.children
                  .create({
                    user_id: req.currentUser.id,
                    type,
                    fin,
                    birth_certificate_no,
                    edu_level,
                    city,
                    region,
                    current_enterprise,
                    grade: !!grade ? grade : null,
                    teaching_language,
                    parent_type,
                    utis_code,
                    school_code,
                  })
                  .then((data) => {
                    if (data.error) {
                      res.json({ success: false, error: data.error });
                    } else {
                      if (Number(citizenshipId) > 2)
                        db.fin_data
                          .findOne({ attributes: ['fin'], where: { fin } })
                          .then((check_fin) => {
                            if (!check_fin) {
                              db.fin_data
                                .create({
                                  fin,
                                  first_name,
                                  last_name,
                                  father_name,
                                  birth_date,
                                  gender,
                                  series,
                                  number,
                                  giving_authority,
                                  exp_date,
                                  born_country,
                                  citizenship,
                                  address,
                                })
                                .then((fin_data) => {
                                  if (fin_data.error) {
                                    //console.log("fin_data_insert_error", user.error);
                                    res.json({
                                      success: false,
                                      err: 'Xəta baş verdi.',
                                    });
                                  } else {
                                    res.json({
                                      id: data,
                                      success: true,
                                      message: 'Uşaq uğurla əlavə edildi!',
                                    });
                                  }
                                });
                            } else {
                              db.fin_data
                                .update(
                                  {
                                    first_name,
                                    last_name,
                                    father_name,
                                    birth_date,
                                    gender,
                                    series,
                                    number,
                                    giving_authority,
                                    exp_date,
                                    born_country,
                                    citizenship,
                                    address,
                                  },
                                  { where: { fin } }
                                )
                                .then((fin_data) => {
                                  if (fin_data.error) {
                                    //console.log("fin_data_insert_error", fin_data.error);
                                    res.json({
                                      success: false,
                                      err: 'Xəta baş verdi.',
                                    });
                                  } else {
                                    res.json({
                                      id: data,
                                      success: true,
                                      message: 'Uşaq uğurla əlavə edildi!',
                                    });
                                  }
                                });
                            }
                          });
                      else {
                        res.json({
                          id: data,
                          success: true,
                          message: 'Uşaq uğurla əlavə edildi!',
                        });
                      }
                    }
                  });
              }
            });
        }
      });
  } else {
    res.json({ success: false, err: 'Xəta baş verdi.' });
  }
});

/**
 * @api {get} /children/by_id/:id Child
 * @apiName Child
 * @apiGroup Children
 * @apiPermission none
 *
 * @apiDescription Uşağın id nömrəsinə göre məkumatlarını gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 */
router.get('/by_id/:id', authenticate, (req, res) => {
  const { id } = req.params;
  db.children
    .findOne({
      where: { user_id: req.currentUser.id, id, deleted: 0 },
      include: [{ model: db.fin_data, required: false }],
    })
    .then((children) => {
      if (children) res.json(children);
      else res.json({});
    });
});

/**
 * @api {get} /children/all All children
 * @apiName All children
 * @apiGroup Children
 * @apiPermission none
 *
 * @apiDescription Bütün uşaqların məkumatlarını gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 */

router.get('/all', authenticate, (req, res) => {
  db.children
    .findAll({
      where: { user_id: req.currentUser.id, deleted: 0 },
      include: [{ model: db.fin_data, required: false }],
    })
    .then((children) => {
      res.json(children);
    });
});

/**
 * @api {get} /children/delete/:id Child delete
 * @apiName Child delete
 * @apiGroup Children
 * @apiPermission none
 *
 * @apiDescription Uşaq məkumatlarını silir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 */

router.get('/delete/:id', authenticate, (req, res) => {
  const { id } = req.params;
  db.children.update({ deleted: 1 }, { where: { id } }).then((data) => {
    if (data.error) {
      res.json({ success: false, error: data.error });
    } else {
      db.children
        .findAll({
          where: { user_id: req.currentUser.id, deleted: 0 },
          include: [{ model: db.fin_data, required: false }],
        })
        .then((children) => {
          res.json(children);
        });
    }
  });
});

module.exports = router;
