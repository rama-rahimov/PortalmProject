const express = require("express") ;
const axios = require("axios") ;
const moment = require("moment") ;
const db = require('../models');
const { authenticate } = require("../middlewares/authenticate.js") ;
const { getAge } = require("../middlewares/helper.js") ;
const { Op } = require("sequelize") ;

const router = express.Router();

/**
 * @api {get} /out_of_schools/check_by_id/:id check_by_id
 * @apiName check_by_id
 * @apiGroup OutOfSchools
 * @apiPermission none
 *
 * @apiDescription Məktəbdən kənar müraciəti yoxlayır
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

router.get('/check_by_id/:id', authenticate, (req, res) => {
    const { id } = req.params;  
    db.appeals_out_of_school.findAll({attributes:[[db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']], 
    where:{user_id:req.currentUser.id, children_id:id, status:{[Op.notIn]:[0]}}}).then(apply => { 
        res.json(Number((apply || {}).count || 0) == 0);
    });
});

/**
 * @api {get} /out_of_schools/by_id/:id by_id
 * @apiName by_id
 * @apiGroup OutOfSchools
 * @apiPermission none
 *
 * @apiDescription Məktəbdən kənar müraciət siyahısı gətirir
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
    db.appeals_out_of_school.findOne({where:{user_id:req.currentUser.id, id}}).then(apply => {
        if (apply)                                                  
        db.appealed_out_of_schools.findAll({where:{appeals_out_of_school_id:apply.id}, include:[{model:db.out_of_school_centers, required:false}]}).then(schools => {
                res.json({ ...apply, out_of_school_centers: schools || [] });
            });
        else
            res.json({});
    });
});

/**
 * @api {get} /out_of_schools/all all
 * @apiName all
 * @apiGroup OutOfSchools
 * @apiPermission none
 *
 * @apiDescription Məktəbdən kənar müraciətləri gətirir
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

router.get('/all', authenticate, (req, res) => { 
    db.appeals_out_of_school.findAll({attributes:[['id', 'a_id'], ['status', 'n_status']], where:{user_id:req.currentUser.id},  include:[{model:db.appealed_out_of_schools, required:false, attributes:[['id', 'n_id']], include:[{model:db.out_of_school_centers, required:false}]}]}).then(appeals => {
        res.json(appeals);
    });
});


router.get('/allOrgInfo',/* authenticate,*/(req, res) => {
    sendDataToMK('/mkApiOrgAndStudent/allOrgInfo', null, (result) => {
        res.json(result);
    });
});

router.get('/orgAndGroupInfoByCode/:orgCode',/* authenticate, */(req, res) => {
    const { orgCode } = req.params;
    sendDataToMK(`/mkApiOrgAndStudent/orgAndGroupInfoByCode?orgCode=${orgCode}`, null, (result) => {
        res.json(result);
    });
});

/**
 * @api {post} /out_of_schools/save/ save
 * @apiName Save
 * @apiGroup OutOfSchools
 * @apiPermission none
 *
 * @apiDescription Uşaqların qeydiyyatı
 * 
 * @apiParam (Request body) {String} step <code>step</code>
 * @apiParam (Request body) {String} status <code>status</code>
 * @apiParam (Request body) {String} children_id <code>children_id</code>
 * @apiParam (Request body) {String} first_name <code>first_name</code>
 * @apiParam (Request body) {String} last_name <code>last_name</code>
 * @apiParam (Request body) {String} father_name <code>father_name</code>
 * @apiParam (Request body) {String} birth_date <code>birth_date</code>
 * @apiParam (Request body) {String} address <code>address</code>
 * @apiParam (Request body) {String} actual_address <code>actual_address</code>
 * @apiParam (Request body) {String} genderId <code>genderId</code>
 * @apiParam (Request body) {String} city <code>city</code>
 * @apiParam (Request body) {String} region <code>region</code>
 * @apiParam (Request body) {String} current_enterprise <code>current_enterprise</code>
 * @apiParam (Request body) {String} grade <code>grade</code>
 * @apiParam (Request body) {String} teaching_language <code>teaching_language</code>
 * @apiParam (Request body) {String} parent_type <code>parent_type</code>
 * @apiParam (Request body) {String} health_cert_date <code>health_cert_date</code>
 * @apiParam (Request body) {String} health_cert_no <code>health_cert_no</code>
 * @apiParam (Request body) {String} health_cert_scan <code>health_cert_scan</code>
 * @apiParam (Request body) {String} photo_3x4_scan <code>photo_3x4_scan</code>
 * @apiParam (Request body) {String} birth_cert_scan <code>birth_cert_scan</code>
 * @apiParamExample {json} Request-Example:
 *     { "step": "", "status": "", "children_id": "", "first_name": "", "last_name": "", "father_name": "", "birth_date": "", "address": "", "actual_address": "", "genderId": "",
        "city": "", "region": "", "current_enterprise": "", "grade": "", "teaching_language": "", "parent_type": "",
        "health_cert_date": "", "health_cert_no": "", "health_cert_scan": "", "photo_3x4_scan": "", "birth_cert_scan": "" }
 * @apiSampleRequest off
 *
 */

router.post('/save', authenticate, (req, res) => {  // buna mutleq qayidib arashdirmaq lazimdir
    const { step, dataForm, status, children_id } = req.body;
    const { out_of_school_centers, first_name, last_name, father_name, birth_date, actual_address, genderId, region, grade } = dataForm;

    saveApply(status, step, dataForm, req.currentUser.id, children_id, (result) => {
        if (result.id)  
        db.appealed_out_of_schools.destroy({where:{appeals_out_of_school_id:result.id}}).then((out_of_school_centers) => {
                out_of_school_centers.flatMap(item => {
                    item.appeals_out_of_school_id = result.id ;
                });
                db.appealed_out_of_schools.bulkCreate(out_of_school_centers).then(() => {
                    if (Number(status) === 1) {
                        out_of_school_centers.flatMap(item => {
                            item.service = 'out_of_school' ;
                            item.fin = item.id ;
                            item.title = 1 ;
                        });
                        db.notifications.bulkCreate(out_of_school_centers).then(() => {
                            sendDataToMK('/mkApiOrgAndStudent/saveStudentInfo', {
                                "global_id": result.id,
                                "studentName": first_name,
                                "studentSurname": last_name,
                                "studentMiddleName": father_name,
                                "male": Number(genderId) === 1 ? "Kişi" : "Qadın",
                                "birthDate": moment(birth_date, "DD.MM.YYYY").format("YYYY-MM-DD"),
                                "studentStatus": Number(grade || "") > 0 ? "Məktəbli" : getAge(birth_date) <= 6 ? "Məktəbəqədər" : "Digər",
                                "address": actual_address,
                                "relativeType": Number(req.currentUser.genderId) === 1 ? "Ata" : "Ana",
                                "relativeSurname": req.currentUser.last_name,
                                "relativeName": req.currentUser.first_name,
                                "relativeMiddleName": req.currentUser.father_name,
                                "mobile": req.currentUser.country_code + req.currentUser.phone,
                                "relativeMail": req.currentUser.email,
                                "eduClass": grade,
                                "tendency": (out_of_school_centers || []).map(item => ({ id: item.out_of_school_id, name: item.tendency_name }))
                            }, (api_result) => { 
                                db.appeals_out_of_school.update({ isSend: api_result.successful ? 1 : 0 }, { where:{ id: result.id } }).then(() => {
                                    res.json(result);
                                });
                            }, "POST");
                        });
                    } else {
                        out_of_school_centers.flatMap(item => {
                            item.service = 'out_of_school' ;
                            item.fin = item.id ;
                            item.title = 1 ;
                        });

                        db.notifications.bulkCreate(out_of_school_centers).then(() => {
                            res.json(result);
                        });
                    }
                });
            });
        else
            res.json(result);
    });
});

module.exports = router;

function saveApply(status, step, dataForm, user_id, children_id, callback) {
    const {
        first_name, last_name, father_name, birth_date, address, actual_address, genderId,
        city, region, current_enterprise, grade, teaching_language, parent_type, id,
        health_cert_date, health_cert_no, health_cert_scan, photo_3x4_scan, birth_cert_scan
    } = dataForm ;
    db.appeals_out_of_school.findOne({attributes:['id'], where:{ user_id,  id}}).then(apply => {
        if ((apply || {}).id) { 
            db.appeals_out_of_school.update({
                first_name, last_name, father_name, birth_date, address, actual_address, genderId, step,
                city, region, current_enterprise, grade, teaching_language, status, user_id, children_id,
                health_cert_date, health_cert_no, health_cert_scan, photo_3x4_scan, birth_cert_scan, parent_type
            }, { where:{ id: apply.id } }).then((applyId) => {
                if (applyId.error) {
                    callback({ error: applyId.error });
                } else {
                    callback({ id: apply.id });
                }
            });
        } else {
            db.appeals_out_of_school.create({
                first_name, last_name, father_name, birth_date, address, actual_address, genderId, step,
                city, region, current_enterprise, grade, teaching_language, status, children_id, parent_type,
                health_cert_date, health_cert_no, health_cert_scan, photo_3x4_scan, birth_cert_scan, user_id
            }).then((applyId) => {
                if (applyId.error) {
                    callback({ error: applyId.error });
                } else {
                    callback({ id: applyId });
                }
            });
        }
    });
}


const sendDataToMK = (url, postData, callback, method = "GET") => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: process.env.TIMEOUT || 8000,
        url: `${process.env.MK_HOST}${url}`
    };
    if (postData) {
        options.data = postData;
    }

    axios(options).then(result => {
        if ((result || {}).data) {
            callback((result || {}).data);
        } else {
            callback(false);
        }
    }).catch(e => {
        console.log('MK error: ', e)
        if (Object.keys(e).length > 0)
            callback(false)
    });
}