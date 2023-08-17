const express = require("express") ;
const jwt = require("jsonwebtoken") ;
const db = require('../models');
const { smsSend, checkBalance } = require("../middlewares/sms.js") ;
const { sms_temp_datas } = require("../models/sms_temp_datas.js") ;
const { support_apply } = require("../models/support_apply.js") ;
const { global_authenticate } = require("../middlewares/authenticate.js") ;
const { createReferencePdf } = require('./e-reference.js');
const _ = require("lodash") ;
/*import querystring from "querystring";
import { querySyncForMap, querySync, insert, update } from "../middlewares/db";
import { request } from "../middlewares/helper";
import { number } from "prop-types";*/



const router = express.Router();

/**
 * @api {get} /global/secret_token/:type secret token
 * @apiName secret token
 * @apiGroup global
 * @apiPermission none
 *
 * @apiDescription token gətirir
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

router.get('/secret_token/:type', (req, res) => {
    const { type } = req.params;
    res.json(jwt.sign(
        {
            type,
            time: new Date(),
            secret: process.env.JWT_GLOBAL_SECRET2
        },
        process.env.JWT_GLOBAL_SECRET
    ));
});
/*
router.get('/check', (req, res) => {
    checkBalance((r) => {
        res.json(r)
    })
});*/
router.get('/send_sms', (req, res) => {   

    db.sms_temp_datas.findAll({where:{status:0}}).then(async (numbers) => {
        let count = 1;
        //const message = 'RFO İnformatika uzre shexsi kabinet melumatlari:\r\nlogin: {login}\r\nsifre: {pass}\r\nlink: {link}\r\nEtrafli melumat ucun https://portal.edu.az';
        for (const n of numbers) {
            await new Promise(function (resolve, reject) {
                //
                smsSend(n.phone, `Tehsil muessisine qebulla bagli portal.edu.az-da müvafiq muessiseye qeydiyyat etmelisiniz. Eks halda qebulunuz tesdiqlenmeyecek. Son tarix: 25.07.2022 12.00`, (r) => {
                    if (!r.sent) {
                        console.log(r);
                    }
                    console.log(count); 
                    count++;
                    resolve(true);
                }, '994');
            }).then(() => { 
                db.sms_temp_datas.update({ status: 1 }, {where:{ fin: n.fin }}).then(() => { });
            });
        }
    })
});

/**
 * @api {post} /global/reference reference
 * @apiName Reference
 * @apiGroup global
 * @apiPermission none
 * 
 * @apiParam (Request body) {String} transactionID <code>transactionID</code>
 * @apiParam (Request body) {String} status <code>status</code>
 * @apiParam (Request body) {String} message <code>message</code>
 * 
 * @apiParamExample {json} Request-Example:
 * { "isDoctoral": "", "status": "", "message": "" }
 * @apiSampleRequest off
 */

router.post('/reference', global_authenticate, (req, res) => {
    if (req.currentGlobalUser.type == 'reference') {
        const { transactionID, status, message } = req.body; 
        db.e_documents_apply.findOne({where:{id:transactionID}}).then((check) => {
            if (check) { 
                db.e_documents_apply.update({ status }, { where:{ id: transactionID } }).then((applyId) => {
                    if (applyId.error) {
                        res.json({ error: 'Məlumat dəyişdirilə bilmədi!', success: false });
                    } else {        
                        db.notifications.destroy({where:{service:"reference", fin:transactionID, title:status}}).then(() => {
                            db.notifications.create({ service: 'reference', fin: transactionID, title: status, description: message }).then(() => {
                                if (Number(status) === 3) {
                                    createReferencePdf(transactionID, (docNo) => {
                                        if (docNo) { 
                                            db.e_documents_apply.update({ docNo }, { where:{ id: transactionID } }).then(() => {
                                                res.json({ message: 'Məlumat uğurla dəyişdirdi!', status, success: true });
                                            });
                                        } else
                                            res.json({ error: 'Məlumat dəyişdirilə bilmədi!', success: false });
                                    })
                                } else {
                                    res.json({ message: 'Məlumat uğurla dəyişdirdi!', status, success: true });
                                }
                            });
                        });
                    }
                });
            } else {
                res.json({ message: 'Müraciət tapılmadı!', success: false });
            }
        });
    } else {
        res.status(401).json({ error: "Non correct token", success: false });
    }
});

/**
 * @api {post} /global/edu_repair edu_repair
 * @apiName Edu repair
 * @apiGroup global
 * @apiPermission none
 * 
 * @apiParam (Request body) {String} edu_repair_id <code>edu_repair_id</code>
 * @apiParam (Request body) {String} status <code>status</code>
 * @apiParam (Request body) {String} message <code>message</code>
 * @apiParam (Request body) {String} reason <code>reason</code>
 * 
 * @apiParamExample {json} Request-Example:
 * { "edu_repair_id": "", "status": "", "message": "", "reason": "" }
 * @apiSampleRequest off
 */

router.post('/edu_repair', global_authenticate, (req, res) => {
    //if (req.currentGlobalUser.type == 'edu_repair') {
    const { edu_repair_id, status, reason, message, global_id } = req.body;
    db.edu_repair_apply.update({ status }, { where :{ id: edu_repair_id } }).then((applyId) => {
        if (applyId.error) {
            res.status(304).json({ succes: false, error: 'Məlumat dəyişdirilə bilmədi!' });
        } else {  
            db.notifications.destroy({ where:{ service:"edu_repair", fin: edu_repair_id, title:status} }).then(() => {
                db.notifications.create({ service: 'edu_repair', fin: global_id, title: status, description: message }).then(() => {
                    res.json({ succes: true, message: 'Məlumat uğurla dəyişdirdi!' });
                });
            });
        }
    });
    /*  } else {
          res.status(401).json({ error: "Non correct token" });
      }*/
});

/**
 * @api {post} /global/course course
 * @apiName Course
 * @apiGroup global
 * @apiPermission none
 * 
 * @apiParam (Request body) {String} user_id <code>user_id</code>
 * @apiParam (Request body) {String} course_appeals_id <code>course_appeals_id</code>
 * @apiParam (Request body) {String} course_id <code>course_id</code>
 * @apiParam (Request body) {String} status <code>status</code>
 * @apiParam (Request body) {String} slug <code>slug</code>
 * @apiParam (Request body) {String} reasonMessage <code>reasonMessage</code>
 * 
 * @apiParamExample {json} Request-Example:
 * { "user_id": "", "course_appeals_id": "", "course_id": "", "status": "", "slug": "", "reasonMessage": "" }
 * @apiSampleRequest off
 */

router.post('/course', /*global_authenticate,*/(req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    //if (req.currentGlobalUser.name == 'rahman') {
    const { user_id, course_appeals_id, course_id, status, slug, reasonMessage } = req.body ;
    //console.log(req.body) ;
    let data ;
    let credentials ;
    if (slug == 'apply') {
        data = { status, reasonMessage };
        credentials = { user_id, course_appeals_id, course_id };
    } else {
        res.status(405).json({ errors: { message: "Non correct slug" } });
    }
    if (data && credentials) {  
        db.appealed_courses.update(data, {where:credentials}).then((applyId) => {
            if (applyId.error) {
                res.status(304).json({ error: 'Məlumat dəyişdirilə bilmədi!' });
            } else {
                res.json({ message: 'Məlumat uğurla dəyişdirdi!' });
            }
        });
    }
    /* } else {
         res.status(401).json({ errors: { message: "Non correct token1" } });
     }*/
});

/**
 * @api {post} /global/e_documents e_documents
 * @apiName E-documents
 * @apiGroup global
 * @apiPermission none
 * 
 * @apiParam (Request body) {String} docNo <code>docNo</code>
 * @apiParam (Request body) {String} brithDate <code>brithDate</code>
 * 
 * @apiParamExample {json} Request-Example:
 * { "docNo": "", "brithDate": "" }
 * @apiSampleRequest off
 */

router.post('/e_documents', global_authenticate, (req, res) => {
    if (req.currentGlobalUser.type == 'edugov') {
        const { docNo, brithDate } = req.body; 
        db.e_documents.findAll({where:{document_no:docNo}, include:[{model:db.fin_data, required:false, where:{birth_date:brithDate}}]}).then(result => {
            res.json({
                success: true, diploms: (result || []).map(r => {  // sadece result qaytaranda normal ishleyir amma bu cur yox
                    delete r.id;
                    //delete r.hash;
                    return { ...r, file_details: JSON.parse(r.file_details) }
                })
            });
        });
    } else {
        res.status(401).json({ success: false, error: "Non correct token" });
    }
});

/**
 * @api {post} /global/e_document/by_hash e document by hash
 * @apiName E-documents by hash
 * @apiGroup global
 * @apiPermission none
 * 
 * @apiParam (Request body) {String} hash <code>hash</code>
 * 
 * @apiParamExample {json} Request-Example:
 * { "hash": "" }
 * @apiSampleRequest off
 */

router.post('/e_document/by_hash', global_authenticate, (req, res) => {
    if (req.currentGlobalUser.type == 'edugov') {
        const { hash } = req.body; 
        db.e_documents.findOne({where:{hash}}).then(result => {
            if (result && result.id) {
                delete result.id;
                // delete result.hash;
                res.json({ success: true, diplom: result });
            } else {
                res.json({ success: false, error: "Document not found" });
            }

        });
    } else {
        res.status(401).json({ success: false, error: "Non correct token" });
    }
});

router.post('/tms/changeStatus', global_authenticate, (req, res) => {
    let { id, result, forIntegration, statusDescription, statusId, message, dublicateId } = req.body;
    let status = 3;
    if (req.currentGlobalUser.type == 'tms' && Number(status || "") > 0) {
        // const extra = {};
        switch (statusId) {
            case 1030: status = 1; statusDescription = 'Sizin müraciətiniz baxılma mərhələsindədir, araşdırıldıqdan sonra sizə geri dönüş ediləcəkdir.'; break;
            case 1031: status = 2; break;
            case 1035: status = 4; statusDescription = 'Müraciətinizin icrası dayandırılmışdır. Cari mövzu ilə əlaqədar yeniliklər olduğu halda yeni müraciət göndərməyiniz xahiş olunur.'; break;
            case 1036: status = 5; statusDescription = 'Müraciətinizin icrası təxirə salınmışdır. Müraciətiniz yenidən icraata alındıqdan sonra Sizə məlumat veriləcək, eyni mövzu ilə yeni müraciətin göndərilməməsi xahiş olunur.'; break;
            case 1037: status = 6; break;
            case 4: status = 3; statusDescription = 'Müraciətinizin araşdırılması tamamlanmışdır.'; break;
            default: status = statusId;
        }
        if (status && forIntegration) {  
            db.notifications.destroy({where:{service:'support', fin:id, title:status}}).then(() => {
                db.notifications.create({ service: 'support', fin: id, title: status, description: statusDescription, extra_data: result }).then(() => {
                    db.support_apply.update((result ? { status, result } : { status }), {where: { tms_id: id } }).then(() => {
                        res.json({ succes: true });
                    });
                });
            });
        } else {
            res.json({ succes: false });
        }
    } else {
        res.json({ succes: false, message: "Non correct token" });
    }
});

router.post('/tms/save', global_authenticate, (req, res) => {
    let status = 4 ;
    if (req.currentGlobalUser.type == 'tms' && Number(status || "") > 0) {
        const { fin, files } = req.body;
        saveTmsApply(req.body, (result) => {
            if (result.id) { 
                db.notifications.create({ service: 'support', fin: result.id, title: 1, description: 'Sizin müraciətiniz baxılma mərhələsindədir, araşdırıldıqdan sonra sizə geri dönüş ediləcəkdir.', extra_data: "" }).then(() => {
                    db.support_files.destroy({where:{support_apply_id:result.id}}).then((certificates) => {
                        if (certificates) {
                            files.flatMap(item => {
                                item.support_apply_id = result.id ;
                            });
                            db.support_files.bulkCreate(files).then(() => {
                                res.json({ succes: true });
                            });
                        } else {
                            res.json({ succes: true });
                        }
                    });
                });
            } else {
                res.json({ succes: false, message: "Insert error" });
            }
        });
    } else {
        res.json({ succes: false, message: "Non correct token" });
    }
});



function saveTmsApply(data, callback) {
    const { id, apply_type, education_type, contingent, child_citizenship, child_fin, child_utis_code,
        child_first_name, child_last_name, child_father_name, child_birth_date, child_address, country_code,
        child_is_address_current, child_actual_address, child_city, child_region, child_current_enterprise,
        child_teaching_language, child_grade, child_parent_type, theme, city, region, current_enterprise, child_id,
        consent, general_information, description_application, citizenship, fin, first_name, born_country, area_id,
        last_name, father_name, birth_date, address, is_address_current, actual_address, country, email, phone } = data;
    if (id) { 
        db.support_apply.create({
            child_id, status: 1, step: 3, apply_type, education_type, contingent, child_citizenship, child_fin, child_utis_code,
            child_first_name, child_last_name, child_father_name, child_birth_date, child_address, country_code,
            child_is_address_current, child_actual_address, child_city, child_region, child_current_enterprise,
            child_teaching_language, child_grade, child_parent_type, theme, city, region, current_enterprise, tms_id: id,
            consent, general_information, description_application, citizenship, fin, first_name, born_country, area_id,
            last_name, father_name, birth_date, address, is_address_current, actual_address, country, email, phone
        }).then((applyId) => {
            if (applyId.error) {
                callback({ error: applyId.error });
            } else {
                callback({ id: applyId });
            }
        });
    }
}


module.exports = router ;