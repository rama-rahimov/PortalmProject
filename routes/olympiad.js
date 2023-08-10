const express = require("express") ;
const fs = require("fs") ;
const db = require('../models');
const { querySyncForMap } = require("../middlewares/db.js") ;
const { request } = require("../middlewares/helper.js") ;
const { authenticate } = require("../middlewares/authenticate.js") ;
const { olympiad_apply } = require("../models/olympiad_apply.js") ;
const { smsSend } = require("../middlewares/sms.js") ;
const _ = require("lodash") ;
require('dotenv').config() ;
const { Op } = require("sequelize") ;

const router = express.Router();

/*
router.get('/send/sms', authenticate,(req, res) => {
    querySyncForMap(`SELECT DISTINCT t1.phone FROM (SELECT phone FROM users WHERE id IN (SELECT user_id FROM olympiad_apply WHERE STATUS =2 AND olympiad_type=1 AND phone IS NULL ) UNION  SELECT  phone FROM olympiad_apply WHERE STATUS =2 AND olympiad_type=1 AND phone IS NOT  NULL) t1`).then(phones => {
        let count = 0;
        phones.forEach(phone => {
            smsSend(phone, 'Şəxsi kabinetinizə buraxılış vərəqi yüklənmişdir. Pdf üzərinə vuraraq baxa bilərsiz. Imtahana gələrkən buraxılış vərəqi və vəsiqənizi götürməyi unutmayın.', (e) => {
                count++;
                //console.log({ e, count, phone });
            });
        });
    });
});
*/
/**
 * @api {get} /olympiad/olympiad_modules
 * @apiName olympiad_modules
 * @apiGroup olympiad
 * @apiPermission none
 *
 * @apiDescription olympiad modullariniz getirir
 *  
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */

router.get('/olympiad_modules', authenticate, (req, res) => {
    db.olympiad_modules.findAll({order:[['id', 'ASC']]}).then(olympiad_modules => {
        res.json(olympiad_modules);
    });
});

router.get('/exam_results/:apply_id', authenticate, (req, res) => {
    const { apply_id } = req.params;
    
    querySyncForMap(`SELECT ex.* FROM olympiad_apply_exam_results ex LEFT JOIN  olympiad_apply oa ON oa.id=ex.olympiad_apply_id WHERE oa.user_id=? AND oa.id=?`, [req.currentUser.id, apply_id]).then(exam_results => {
        res.json(exam_results);
    });
});


router.get('/bildiris/:token', /*authenticate,*/(req, res) => {
    const { token } = req.params;
    fs.readFile(`./uploads/bildiris/${token}.pdf`, (err, data) => {
        if (err) {
            res.status(404).send('File not found.');
        } else {
            res.end(Buffer.from(data, 'base64'));
            // res.end(data);
        }
    });
});

router.get('/olympiad_types/active/:fin', authenticate, (req, res) => {
    //status in (0,1) 
    const { fin } = req.params;  
    db.olympiad_apply.findAll({attributes:['olympiad_process_id'], where:{fin}}).then(olympiad_active_types => {
        res.json(olympiad_active_types);
    });
});


router.get('/olympiad_types', authenticate, (req, res) => {
    const options = {
        hostname: process.env.OLYMPIAD_HOST,
        port: process.env.OLYMPIAD_PORT,
        path: '/api/global/olympiad_types/active',
        headers: {
            Authorization: "Bearer " + process.env.OLYMPIAD_TOKEN
        }
    };

    request(null, options, (result) => {
        if (result.data) {
            res.json(result.data);
        } else {
            res.json({ error: 'Xəta baş veri.', err: result.err });
        }
    });
});

router.get('/check/:fin', authenticate, (req, res) => {
    const { fin } = req.params;
    const options = {
        hostname: process.env.OLYMPIAD_HOST,
        port: process.env.OLYMPIAD_PORT,
        path: '/api/global/olympiad_types/active',
        headers: {
            Authorization: "Bearer " + process.env.OLYMPIAD_TOKEN
        }
    };

    request(null, options, (result) => {
        //console.log(result);
        if ((result.data || []).length > 0) {  
            db.olympiad_apply.findAll({attributes:['olympiad_process_id'], where:{fin}}).then(olympiad_active_types => {
                const check = _.difference(result.data.map(o => Number(o.olympiad_process_id)), olympiad_active_types.map(o => Number(o.olympiad_process_id))).length > 0;
                res.json({ check, isHaveAplly: olympiad_active_types.length > 0 });
            });
        } else {
            res.json(false);
        }
    });
});

/**
 * @api {get} /olympiad/english_degree
 * @apiName english_degree
 * @apiGroup olympiad
 * @apiPermission none
 *
 * @apiDescription ingilis dili derecelerini getirir
 *  
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */

router.get('/english_degree', authenticate, (req, res) => {  
    db.english_degree.findAll({order:[['id', 'ASC']]}).then(english_degree => {
        res.json(english_degree);
    });
});

/**
 * @api {get} /olympiad/by_id/:id by_id
 * @apiName by_id
 * @apiGroup olympiad
 * @apiPermission none
 *
 * @apiDescription olympiad müraciətini gətirir
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

router.get('/by_id/:id', authenticate, (req, res) => {
    const { id } = req.params;
    if (id) {  
        db.olympiad_apply.findOne({where:{id, user_id:req.currentUser.id}}).then(apply => {
            if (apply) {   
                db.olympiad_certificates.findAll({where:{olympiad_apply_id:id}}).then(certificates => {
                    res.json({ ...apply, certificates });
                });
            } else {
                res.json({ error: 'olympiad_apply not found' });
            }
        });
    } else {
        res.json({ error: 'id incorrect' });
    }
});


/**
 * @api {post} /olympiad/save/ save
 * @apiName Save
 * @apiGroup olympiad
 * @apiPermission none
 *
 * @apiDescription olympiadya qeydiyyat müraciəti
 * @apiParam (Request body) {Number} child_id  <code>child_id</code>
 * @apiParam (Request body) {Number} status  <code>status</code>
 * @apiParam (Request body) {Number} step  <code>step</code>
 * @apiParam (Request body) {Object} dataForm  <code>dataForm</code>
 * @apiParam (Request body) {String} dataForm.olympiad_type <code>olympiad_type</code>
 * @apiParam (Request body) {String} dataForm.citizenship <code>citizenship</code>
 * @apiParam (Request body) {String} dataForm.fin <code>fin</code>
 * @apiParam (Request body) {String} dataForm.first_name <code>first_name</code>
 * @apiParam (Request body) {String} dataForm.last_name <code>last_name</code>
 * @apiParam (Request body) {String} dataForm.father_name <code>father_name</code>
 * @apiParam (Request body) {String} dataForm.birth_date <code>birth_date</code>
 * @apiParam (Request body) {String} dataForm.address <code>address</code>
 * @apiParam (Request body) {String} dataForm.is_address_current <code>is_address_current</code>
 * @apiParam (Request body) {String} dataForm.actual_address <code>actual_address</code>
 * @apiParam (Request body) {String} dataForm.country <code>country</code>
 * @apiParam (Request body) {String} dataForm.parent_type <code>parent_type</code>
 * @apiParam (Request body) {String} dataForm.email <code>email</code>
 * @apiParam (Request body) {String} dataForm.utis_code <code>utis_code</code>
 * @apiParam (Request body) {String} dataForm.city <code>city</code>
 * @apiParam (Request body) {String} dataForm.region <code>region</code>
 * @apiParam (Request body) {String} dataForm.current_enterprise <code>current_enterprise</code>
 * @apiParam (Request body) {String} dataForm.teaching_language <code>teaching_language</code>
 * @apiParam (Request body) {String} dataForm.grade <code>grade</code>
 * @apiParam (Request body) {String} dataForm.olympiad_module_id <code>olympiad_module_id</code>
 * @apiParam (Request body) {String} dataForm.english_indicator <code>english_indicator</code>
 * @apiParam (Request body) {String} dataForm.project_name <code>project_name</code>
 * @apiParam (Request body) {String} dataForm.name_of_scientific_adviser <code>name_of_scientific_adviser</code>
 * @apiParam (Request body) {String} dataForm.surname_of_scientific_adviser <code>surname_of_scientific_adviser</code>
 * @apiParam (Request body) {String} dataForm.phone_number_of_scientific_adviser <code>phone_number_of_scientific_adviser</code>
 * @apiParam (Request body) {String} dataForm.name_specialist_scientist <code>name_specialist_scientist</code>
 * @apiParam (Request body) {String} dataForm.surname_specialist_scientist <code>surname_specialist_scientist</code>
 * @apiParam (Request body) {String} dataForm.phone_number_specialist_scientist <code>phone_number_specialist_scientist</code>
 * @apiParam (Request body) {String} dataForm.phone <code>phone</code>
 * @apiParam (Request body) {Object[]} dataForm.certificates List of <code>certificate</code>
 * @apiParam (Request body) {String} dataForm.certificates.doc_scan certificate <code>doc_scan</code>

 * @apiParamExample {json} Request-Example:
 * { "step": "", "status": "", "child_id": "", "dataForm": { "olympiad_type": "", "citizenship": "", "fin": "", "first_name": "", "last_name": "", "father_name": "", "birth_date": "", "address": "", "is_address_current": "", "actual_address": "", "country": "", "email": "", "parent_type": "", "utis_code": "", "city": "", "region": "", "current_enterprise": "", "teaching_language": "", "grade": "", "olympiad_module_id": "", "english_indicator": "", "project_name": "", "name_of_scientific_adviser": "", "surname_of_scientific_adviser": "", "phone_number_of_scientific_adviser": "", "name_specialist_scientist": "", "surname_specialist_scientist": "", "phone_number_specialist_scientist": "", "phone": "", "certificates": [ { "doc_scan":"" }] } }
 * @apiSampleRequest off
 *
 */

router.post('/save', authenticate, (req, res) => {
    const { step, dataForm, status, child_id } = req.body;
    const { certificates } = dataForm;

    saveApply(!!status ? 1 : 0, step, dataForm, req.currentUser, child_id, async (result) => {

        if (result.id2)   
        db.olympiad_certificates.destroy({where:{olympiad_apply_id:result.id2}}).then(() => {
                if (certificates) {  
                    certificates.flatMap(item => {
                        item.olympiad_apply_id = result.id2 ;
                    });
                    db.olympiad_certificates.bulkCreate(certificates).then(() => {
                        db.notifications.destroy({where:{service:'olympiad_apply', fin:result.id2, title:(!!status ? 1 : 0)}}).then(() => {
                            db.notifications.create({
                                service: 'olympiad_apply', fin: result.id2, title: !!status ? 1 : 0, description: Number(dataForm.olympiad_type) === 1 && !!status ? 'Müraciətiniz tamamlanmışdır. Buraxılış barədə məlumat göndəriləcəkdir.' : "", extra_data: ""
                            }).then(() => {
                            });
                        });
                    });

                } else {         
                    db.notifications.destroy({where:{service:'olympiad_apply', fin:result.id2, title:(!!status ? 1 : 0)}}).then(() => {
                        db.notifications.create({ service: 'olympiad_apply', fin: result.id2, title: !!status ? 1 : 0, description: Number(dataForm.olympiad_type) === 1 && !!status ? 'Müraciətiniz tamamlanmışdır. Buraxılış barədə məlumat göndəriləcəkdir.' : "", extra_data: "" }).then(() => {

                        });
                    });
                }
            });

        if (result.id)  
        db.olympiad_certificates.destroy({where:{olympiad_apply_id:result.id}}).then(() => {
                if ((certificates || []).length > 0) { 
                    certificates.flatMap(item => {
                        item.olympiad_apply_id = result.id ;
                    });
                    db.olympiad_certificates.bulkCreate(certificates).then(() => {
                        db.notifications.destroy({where:{service:'olympiad_apply', fin:result.id, title:(!!status ? 1 : 0)}}).then(() => {
                            db.notifications.create({
                                service: 'olympiad_apply', fin: result.id, title: !!status ? 1 : 0, description: Number(dataForm.olympiad_type) === 1 && !!status ? 'Müraciətiniz tamamlanmışdır. Buraxılış barədə məlumat göndəriləcəkdir.' : "", extra_data: ""
                            }).then(() => {
                                res.json(result);
                            });
                        });
                    });
                } else { 
                    db.notifications.destroy({where:{service:"olympiad_apply", fin:result.id, title:(!!status ? 1 : 0)}}).then(() => {
                        db.notifications.create({ service: 'olympiad_apply', fin: result.id, title: !!status ? 1 : 0, description: Number(dataForm.olympiad_type) === 1 && !!status ? 'Müraciətiniz tamamlanmışdır. Buraxılış barədə məlumat göndəriləcəkdir.' : "", extra_data: "" }).then(() => {
                            res.json(result);
                        });
                    });
                }
            });
        else {
            res.json({ error: 'Xəta baş veri.'/*result.err*/ });
        }

    });
});


router.get('/all', authenticate, (req, res) => {  
    db.olympiad_apply.findAll({where:{user_id:req.currentUser.id}}).then(appeals => {
        res.json(appeals);
    });
});

module.exports = router ;

function saveApply(status, step, dataForm, user, child_id, callback) {
    const user_id = user.id;
    const image = null; //user.image;

    const { olympiad_type, citizenship, fin, first_name, last_name, father_name, birth_date, address,
        is_address_current, actual_address, country, email, utis_code, city, region, tl, takeTheSecondExam,
        current_enterprise, teaching_language, parent_type, videoUrl, olympiad_process_id, country_code,
        grade, olympiad_module_id, english_indicator, project_name, name_of_scientific_adviser,
        surname_of_scientific_adviser, phone_number_of_scientific_adviser, name_specialist_scientist,
        surname_specialist_scientist, phone_number_specialist_scientist, phone, certificates } = dataForm;

    if (fin) {
        const options = {
            hostname: process.env.OLYMPIAD_HOST,
            port: process.env.OLYMPIAD_PORT,
            path: '/api/global/olympiad_types/active',
            headers: {
                Authorization: "Bearer " + process.env.OLYMPIAD_TOKEN
            }
        };
        request(null, options, (result) => { 
            if (result.data && result.data.map(o => Number(o.id)).includes(Number(olympiad_type))) {
                db.olympiad_apply.findAll({attributes:['id', 'user_id', 'status'], where:{fin, status:{[Op.in]:[0, 1]}, olympiad_process_id}}).then(olympiad_app => {
                    if (olympiad_app) {
                        if (Number(user_id) !== Number(olympiad_app.user_id) || Number(olympiad_app.status) !== 0) {
                            callback({ error: 'Müraciət zamanı xəta baş  verdi!' }); 
                        } else { 
                            db.olympiad_apply.update({  
                                status: 0, step, olympiad_type, citizenship, fin, first_name, last_name, father_name, birth_date, takeTheSecondExam,
                                address, is_address_current, actual_address, country, email, parent_type, utis_code, videoUrl, olympiad_process_id,
                                city, region, current_enterprise, teaching_language, grade, olympiad_module_id, english_indicator,
                                project_name, name_of_scientific_adviser, surname_of_scientific_adviser, phone_number_of_scientific_adviser,
                                name_specialist_scientist, surname_specialist_scientist, phone_number_specialist_scientist, phone: phone || user.phone
                            }, { where:{ id: olympiad_app.id } }).then((olympiad_apply_update) => {
                                //console.log({ olympiad_apply_update });
                                if (olympiad_apply_update.error) {
                                    callback({ error: olympiad_apply_update.error });
                                } else if (Number(status) === 1) {
                                    sendRequest({
                                        certificates: (certificates || []).map(c => ({ doc_scan: (process.env.HOST + c.doc_scan) })),
                                        olympiad_process_id, olympiad_type, citizenship, fin, first_name, last_name, father_name, global_id: olympiad_app.id,
                                        birth_date, address, actual_address, country, email, utis_code, city, region, current_enterprise, country_code,
                                        teaching_language, grade, olympiad_module_id, english_indicator, project_name, name_of_scientific_adviser,
                                        surname_of_scientific_adviser, phone_number_of_scientific_adviser, name_specialist_scientist, image,
                                        surname_specialist_scientist, phone_number_specialist_scientist, phone, parent_type, videoUrl: !!videoUrl ? (process.env.HOST + videoUrl) : null
                                    }, (requestResult) => {
                                        if (requestResult.error) {
                                            callback({ error: requestResult.error });
                                        } else {   
                                            olympiad_apply.update({ status: 1 }, {where:{ id: olympiad_app.id }}).then(() => {
                                                callback({ id: olympiad_app.id });
                                            });
                                        }
                                    });
                                } else {
                                    callback({ id: olympiad_app.id });
                                }
                            });
                        }
                    } else {
                        db.olympiad_apply.create({
                            user_id, child_id, status: 0, step, olympiad_type, citizenship, fin, first_name, last_name, father_name, takeTheSecondExam,
                            birth_date, address, is_address_current, actual_address, country, email, parent_type, utis_code, tl, country_code,
                            city, region, current_enterprise, teaching_language, grade, olympiad_module_id, videoUrl, olympiad_process_id,
                            english_indicator, project_name, name_of_scientific_adviser, surname_of_scientific_adviser, phone_number_of_scientific_adviser,
                            name_specialist_scientist, surname_specialist_scientist, phone_number_specialist_scientist, phone,
                        }).then((applyId) => {
                            if (applyId.error) {
                                callback({ error: applyId.error });
                            } else if (Number(status) === 1) {
                                if (Number(takeTheSecondExam) === 1 && Number(olympiad_type) === 1) {
                                    db.olympiad_apply.create({
                                        user_id, child_id, status: 1, step, olympiad_type, citizenship, fin, first_name, last_name, father_name, takeTheSecondExam,
                                        birth_date, address, is_address_current, actual_address, country, email, parent_type, utis_code, tl, country_code,
                                        city, region, current_enterprise, teaching_language, grade, olympiad_module_id: 8, videoUrl, olympiad_process_id,
                                        english_indicator, project_name, name_of_scientific_adviser, surname_of_scientific_adviser, phone_number_of_scientific_adviser,
                                        name_specialist_scientist, surname_specialist_scientist, phone_number_specialist_scientist, phone,
                                    }).then((global_id2) => {
                                        sendRequest({
                                            certificates: (certificates || []).map(c => ({ doc_scan: (process.env.HOST, + c.doc_scan) })),
                                            olympiad_process_id, olympiad_type, citizenship, fin, first_name, last_name, father_name, global_id: applyId, global_id2,
                                            birth_date, address, actual_address, country, email, utis_code, city, region, current_enterprise, country_code,
                                            teaching_language, grade, olympiad_module_id, english_indicator, project_name, name_of_scientific_adviser,
                                            surname_of_scientific_adviser, phone_number_of_scientific_adviser, name_specialist_scientist, image, takeTheSecondExam, tl,
                                            surname_specialist_scientist, phone_number_specialist_scientist, phone, parent_type, videoUrl: (process.env.HOST + videoUrl)
                                        }, (requestResult) => {
                                            if (requestResult.error) {
                                                callback({ error: requestResult.error });
                                            } else { 
                                                db.olympiad_apply.update({ status: 1 }, {where:{ id: applyId }}).then(() => {
                                                    db.olympiad_apply.update({ status: 1, parent_id: applyId }, { where:{ id: global_id2 } }).then(() => {
                                                        smsSend(user.phone, 'Respublika Fenn Olimpiadasına qeydiyyatiniz tamamlanmishdir. İmtahana buraxilish barede melumat gonderilecekdir.', (e) => {
                                                            callback({ id: applyId, id2: global_id2 });
                                                        }, user.country_code);
                                                    });
                                                });
                                            }
                                        });
                                    });
                                } else {
                                    sendRequest({
                                        certificates: (certificates || []).map(c => ({ doc_scan: (process.env.HOST, + c.doc_scan) })),
                                        olympiad_process_id, olympiad_type, citizenship, fin, first_name, last_name, father_name, global_id: applyId,
                                        birth_date, address, actual_address, country, email, utis_code, city, region, current_enterprise, country_code,
                                        teaching_language, grade, olympiad_module_id, english_indicator, project_name, name_of_scientific_adviser,
                                        surname_of_scientific_adviser, phone_number_of_scientific_adviser, name_specialist_scientist, image, tl,
                                        surname_specialist_scientist, phone_number_specialist_scientist, phone, parent_type, videoUrl: (process.env.HOST + videoUrl)
                                    }, (requestResult) => {
                                        if (requestResult.error) {
                                            callback({ error: requestResult.error });
                                        } else {  
                                            db.olympiad_apply.update({ status: 1 }, { where:{ id: applyId } }).then(() => {
                                                smsSend(user.phone, 'Respublika Fenn Olimpiadasına qeydiyyatiniz tamamlanmishdir. İmtahana buraxilish barede melumat gonderilecekdir.', (e) => {
                                                    callback({ id: applyId });
                                                }, user.country_code);
                                            });
                                        }
                                    })
                                }
                            } else {
                                callback({ id: applyId });
                            }
                        });
                    }
                });
            } else {
                callback({ error: 'Müraciət zamanı xəta baş  verdi!' });
            }
        });

    } else {
        callback({ error: 'Müraciət zamanı xəta baş  verdi!' });
    }
}

const sendRequest = (data, callback) => {
    const options = {
        hostname: process.env.OLYMPIAD_HOST,
        port: process.env.OLYMPIAD_PORT,
        path: '/api/global/olympiad_apply',
        method: 'POST',
        headers: {
            Authorization: "Bearer " + process.env.OLYMPIAD_TOKEN
        }
    };
    request(data, options, (result) => {
        if ((result || {}).err) {
            callback({ error: (result || {}).err })
        } else {
            callback(result.data)
        }
    });
}