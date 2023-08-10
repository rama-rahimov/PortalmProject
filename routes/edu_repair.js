const express = require("express") ;
const { authenticate, global_authenticate } = require("../middlewares/authenticate.js") ;
const db = require('../models');
require('dotenv').config() ;

const rp = require("request-promise") ;

const router = express.Router();

/**
 * @api {post} /edu_repair/ /
 * @apiName Education repair
 * @apiGroup edu repair
 * @apiPermission none
 *
 * @apiParam (Request body) {String} edu_repair_id <code>edu_repair_id</code>
 * @apiParam (Request body) {String} status <code>status</code>
 * @apiParam (Request body) {String} reason <code>reason</code>
 * @apiParam (Request body) {String} message <code>message</code>
 * @apiParam (Request body) {String} teaching_group <code>teaching_group</code>
 * @apiParam (Request body) {String} date_of_freezing_edu <code>date_of_freezing_edu</code>
 * @apiParam (Request body) {String} number_of_order_freezing_edu <code>number_of_order_freezing_edu</code>
 * @apiParam (Request body) {String} number <code>number</code>
 * @apiParam (Request body) {String} date <code>date</code>
 * @apiParam (Request body) {String} file <code>file</code>
 * 
 * @apiParamExample {json} Request-Example:
 * { "edu_repair_id": "", "status": "", "reason": "", "message": "", "teaching_group": "", "date_of_freezing_edu": "", "number_of_order_freezing_edu": "", "number": "", "date": "", "file": "" }
 * @apiSampleRequest off
 */



router.post('/', global_authenticate, (req, res) => {
    const { edu_repair_id, status, reason, message, teaching_group, date_of_freezing_edu, number_of_order_freezing_edu, number, date, file } = req.body;

    if (date_of_freezing_edu && number_of_order_freezing_edu) {  
        db.edu_repair_apply.update({date_of_freezing_edu, number_of_order_freezing_edu}, {where:{id: edu_repair_id}}).then(() => { });
    }
    db.edu_repair_apply.update({status}, {where:{id: edu_repair_id}}).then(() => { });
    db.notifications.destroy({where:{service:"edu_repair", fin:edu_repair_id, title:status}}).then(() => {
        db.notifications.create({service:'edu_repair', fin:edu_repair_id, title:status, description:message}).then(() => { });
    });

    res.json({ succes: true, message: 'Məlumat uğurla dəyişdirdi!' });
})

/**
 * @api {get} /edu_repair/last 
 * @apiName last
 * @apiGroup edu repair
 * @apiPermission none
 *
 * @apiDescription tehsil berpassi müraciətini gətirir
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

router.get('/last', authenticate, (req, res) => { 
    db.edu_repair_apply.findOne({where:{user_id:req.currentUser.id}}).then(apply => {
        if (apply && apply.error) {
            res.json({ error: apply.error });
        } else if (apply) {   
            db.edu_repair_educations.findAll({where:{edu_repair_apply_id:apply.id}}).then(educations => {
                db.edu_repair_files.findAll({where:{edu_repair_apply_id:apply.id}}).then(certificates => {
                    res.json({ ...apply, certificates, educations });
                });
            });
        } else {
            res.json({});
        }
    });
});

/**
 * @api {get} /edu_repair/pts_all_list pts all list
 * @apiName pts all list
 * @apiGroup edu repair
 * @apiPermission none
 *
 * @apiDescription pese tehsil siyahi gətirir
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

router.get('/pts_all_list', authenticate, (req, res) => {
    rp.get({ url: `${process.env.VACANCIES_HOST}:${process.env.VACANCIES_PORT}/api/student_restor/all_list`, form: {}, headers: { 'authorization': 'Bearer ' + process.env.VACANCIES_TOKEN } }).then(body => {
        res.json(body ? JSON.parse(body) : null);
    }).catch(err => console.log(err.message));
});

/**
 * @api {get} /edu_repair/get_user_restored_data get user restored data
 * @apiName get user restored data
 * @apiGroup edu repair
 * @apiPermission none
 *
 * @apiDescription yenilenmis istifadeci melumati gətirir
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

router.post('/get_user_restored_data', authenticate, (req, res) => {
    rp.get({ url: `${process.env.VACANCIES_HOST}:${process.env.VACANCIES_PORT}/api/student_restor/get_user_restored_data/${req.body.fin}`, form: {}, headers: { 'authorization': 'Bearer ' + process.env.VACANCIES_TOKEN } }).then(body => {
        res.json(body ? JSON.parse(body) : null);
    }).catch(err => console.log(err));
});

/**
 * @api {post} /edu_repair/save/ save
 * @apiName Education repair
 * @apiGroup edu repair
 * @apiPermission none
 *
 * @apiParam (Request body) {String} dataForm.country <code>country</code>
 * @apiParam (Request body) {String} dataForm.phone <code>phone</code>
 * @apiParam (Request body) {String} dataForm.first_name <code>first_name</code>
 * @apiParam (Request body) {String} dataForm.last_name <code>last_name</code>
 * @apiParam (Request body) {String} dataForm.father_name <code>father_name</code>
 * @apiParam (Request body) {String} dataForm.birth_date <code>birth_date</code>
 * @apiParam (Request body) {String} dataForm.address <code>address</code>
 * @apiParam (Request body) {String} dataForm.actual_address <code>actual_address</code>
 * @apiParam (Request body) {String} dataForm.citizenship <code>citizenship</code>
 * @apiParam (Request body) {String} dataForm.email <code>email</code>
 * @apiParam (Request body) {String} dataForm.is_address_current <code>is_address_current</code>
 * @apiParam (Request body) {String} dataForm.fin <code>fin</code>
 * @apiParam (Request body) {String} dataForm.edu_institution <code>edu_institution</code>
 * @apiParam (Request body) {String} dataForm.name_of_other_enterprise <code>name_of_other_enterprise</code>
 * @apiParam (Request body) {String} dataForm.apartment <code>apartment</code>
 * @apiParam (Request body) {String} dataForm.specialty <code>specialty</code>
 * @apiParam (Request body) {String} dataForm.name_of_other_specialty <code>name_of_other_specialty</code>
 * @apiParam (Request body) {String} dataForm.year_of_admission <code>year_of_admission</code>
 * @apiParam (Request body) {String} dataForm.date_of_freezing_edu <code>date_of_freezing_edu</code>
 * @apiParam (Request body) {String} dataForm.teaching_group <code>teaching_group</code>
 * @apiParam (Request body) {String} dataForm.reason_for_freezing_edu <code>reason_for_freezing_edu</code>
 * @apiParam (Request body) {String} dataForm.number_of_order_freezing_edu <code>number_of_order_freezing_edu</code>
 * @apiParam (Request body) {String} dataForm.education_level <code>education_level</code>
 * @apiParam (Request body) {String} dataForm.education_base <code>education_base</code>
 * @apiParam (Request body) {String} dataForm.education_fees <code>education_fees</code>
 * @apiParam (Request body) {String} dataForm.education_duration <code>education_duration</code>,
 * @apiParam (Request body) {String} dataForm.specialty_code <code>specialty_code</code>,
 * @apiParam (Request body) {String} dataForm.edu_direction <code>edu_direction</code>,
 * @apiParam (Request body) {String} dataForm.section <code>section</code>,
 *
 * @apiParamExample {json} Request-Example:
 * { "specialty_code": "","edu_direction": "", "section": "", "country": "", "phone": "", "first_name": "", "last_name": "", "father_name": "", "birth_date": "", "address": "", "actual_address": "", "citizenship": "", "email": "", "is_address_current": "", "fin": "", "edu_institution": "", "name_of_other_enterprise": "", "apartment": "", "specialty": "", "name_of_other_specialty": "", "year_of_admission": "", "date_of_freezing_edu": "", "teaching_group": "", "reason_for_freezing_edu": "", "number_of_order_freezing_edu": "", "education_level": "", "education_base": "", "education_fees": "", "education_duration": "", "certificates": "" }
 * @apiSampleRequest off
 */

router.post('/save', authenticate, (req, res) => {

    const { step, dataForm, status } = req.body;
    const { certificates, educations, specialty } = dataForm;

    saveApply(status ? 1 : 0, step, dataForm, req.currentUser.id, (result) => {
        (async () => {
            if (result.id) { 
                db.notifications.destroy({where:{service:"edu_repair", fin:result.id, title:Number(status) ? 1 : 0}}).then(() => {
                    db.notifications.create({ service: 'edu_repair', fin: result.id, title: (Number(status) ? 1 : 0), description: Number(status) ? "Sizin müraciət qeydə alındı. " : "Siz müraciətinizi tamamlamamısınız. Müraciətin qeydə alınması üçün zəhmət olmasa müraciətinizi tamamlayasınız." }).then(() => {
                    });
                });

                await (new Promise(((resolve) => {
                    let resultCount = Number(status) || 2;
                    db.edu_repair_educations.destroy({where:{edu_repair_apply_id:result.id}}).then(() => {
                        // console.log(educations)
                        if ((educations || []).length > 0) {
                            educations.flatMap(item => {
                                 item.edu_repair_apply_id = result.id ;
                                 item.user_id = req.currentUser.id ;
                            });
                            db.edu_repair_educations.bulkCreate(educations).then(() => {
                                resultCount++;
                                if (resultCount == 4) {
                                    resolve(true);
                                }
                            });
                        } else {
                            resultCount++;
                            if (resultCount == 4) {
                                resolve(true);
                            }
                        }
                    });
                            
                    db.edu_repair_files.destroy({where:{edu_repair_apply_id:result.id}}).then(() => {
                        if (certificates) {
                            certificates.flatMap(item => {
                                item.edu_repair_apply_id = result.id
                            });

                            db.edu_repair_files.bulkCreate(certificates).then(() => {
                                resultCount++;
                                    if (resultCount == 4) {
                                        resolve(true);
                                    }
                            });
                        } else {
                            resultCount++;
                            if (resultCount == 4) {
                                resolve(true);
                            }
                        }
                    });

                    delete dataForm.certificates;
                    if (status == 1) {

                        resultCount++;
                        if (resultCount === 4) {
                            resolve(true);
                        }

                        rp.post({
                            url: `${process.env.VACANCIES_HOST}:${process.env.VACANCIES_PORT}/api/student_restor/apply`, form: {
                                ...dataForm,
                                edu_repair_files: (certificates || []),
                                educations: (educations || []),
                                id: result.id,
                                fin: req.currentUser.fin,
                                user_id: req.currentUser.id,
                            }, headers: { 'authorization': `Bearer ${process.env.VACANCIES_TOKEN}` }
                        }).then(body => { }).catch(err => console.log(err.message));
                    }

                }))).then(e => console.log('then', e)).catch(e => console.log('catch', e));
            }
            res.json(result);
        })();
    });
});


module.exports = router;

function saveApply(status, step, dataForm, user_id, callback) {
    const { id, country, phone, first_name, last_name, father_name, birth_date, address, actual_address, genderId,
        citizenship, email, is_address_current, fin, edu_institution, name_of_other_enterprise, apartment, specialty,
        name_of_other_specialty, year_of_admission, date_of_freezing_edu, teaching_group, reason_for_freezing_edu,
        number_of_order_freezing_edu, education_level, education_base, education_fees, education_duration, borncity,
        specialty_code, edu_direction, section, course, name_of_other_apartment, social_status, social_scan } = dataForm;
    if (id) { 
        db.edu_repair_apply.findAll({attributes:['id', 'user_id'], where:{id}}).then(edu_repair_apply => {
            if (edu_repair_apply) {
                if (Number(user_id) !== Number(edu_repair_apply.user_id)) {
                    callback({ error: 'Invalid user id' });
                } else {
                    db.edu_repair_apply.update({
                        status, step, country, phone, first_name, last_name, father_name, birth_date, address, actual_address,
                        citizenship, email, is_address_current, fin, edu_institution, name_of_other_enterprise, apartment, specialty,
                        name_of_other_specialty, year_of_admission, date_of_freezing_edu, teaching_group, reason_for_freezing_edu,
                        number_of_order_freezing_edu, education_level, education_base, education_fees, education_duration,
                        specialty_code, edu_direction, section, genderId, borncity, course, name_of_other_apartment, social_status, social_scan
                    }, {where:{id}}).then(edu_repair_apply_update => {
                        if (edu_repair_apply_update.error) {
                            callback({ error: edu_repair_apply_update.error });
                        } else {
                            callback({ id });
                        }
                    });
                }
            } else {
                callback({ error: 'edu repair apply by id not found' });
            }
        });
    } else {
        db.edu_repair_apply.create({
            user_id, status, step, country, phone, first_name, last_name, father_name, birth_date, address, actual_address,
            citizenship, email, is_address_current, fin, edu_institution, name_of_other_enterprise, apartment, specialty,
            name_of_other_specialty, year_of_admission, date_of_freezing_edu, teaching_group, reason_for_freezing_edu,
            number_of_order_freezing_edu, education_level, education_base, education_fees, education_duration,
            specialty_code, edu_direction, section, genderId, borncity, course, name_of_other_apartment, social_status, social_scan
        }).then(applyId => {
            if (applyId.error) {
                callback({ error: applyId.error });
            } else {
                callback({ id: applyId });
            }
        });
    }
}