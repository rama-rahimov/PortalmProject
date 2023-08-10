const express = require("express") ;
const jwt = require("jsonwebtoken") ;
const db = require('../models');
const { querySync, querySyncForMap } = require("../middlewares/db") ;
const { smsSend } = require("../middlewares/sms") ;
const { global_authenticate } = require("../middlewares/authenticate") ;
const { createReferencePdf } = require('./e-reference') ;
const _ = require("lodash") ;
const { Op } = require("sequelize") ;

const student_sms = {
    az: [
        {
            id: 10, message: "Tehsil muessisesine qebulla bagli shexsi kabinetinize bildirish gonderilmishdir, www.portal.edu.az daxil olaraq bildirishi yoxlamaginiz xahish olunur."
        },
        {
            id: 2, message: "Tehsil muessisesine qebulla bagli shexsi kabinetinize bildirish gonderilmishdir, www.portal.edu.az daxil olaraq bildirishi yoxlamaginiz xahish olunur."
        },
        {
            id: 12, message: "Tehsil muessisesine qebulla bagli shexsi kabinetinize bildirish gonderilmishdir, www.portal.edu.az daxil olaraq bildirishi yoxlamaginiz xahish olunur."
        },
        {
            id: 14, message: "Tehsil muessisesine qebulla bagli shexsi kabinetinize bildirish gonderilmishdir, www.portal.edu.az daxil olaraq bildirishi yoxlamaginiz xahish olunur."
        },
        {
            id: 15, message: "Tehsil muessisesine qebulla bagli shexsi kabinetinize bildirish gonderilmishdir, www.portal.edu.az daxil olaraq bildirishi yoxlamaginiz xahish olunur."
        },
        {
            id: 16, message: "Tehsil muessisesine qebulla bagli shexsi kabinetinize bildirish gonderilmishdir, www.portal.edu.az daxil olaraq bildirishi yoxlamaginiz xahish olunur."
        },
        {
            id: 17, message: "Tehsil muessisesine qebulla bagli shexsi kabinetinize bildirish gonderilmishdir, www.portal.edu.az daxil olaraq bildirishi yoxlamaginiz xahish olunur."
        }
    ],
    en: [
        {
            id: 10, message: "Dear applicant, a notification has been sent to your personal account regarding admission to the educational institution, please sign in to the portal and check the notification. www.portal.edu.az"
        },
        {
            id: 2, message: "Dear applicant, a notification has been sent to your personal account regarding admission to the educational institution, please sign in to the portal and check the notification. www.portal.edu.az"
        },
        {
            id: 12, message: "Dear applicant, a notification has been sent to your personal account regarding admission to the educational institution, please sign in to the portal and check the notification. www.portal.edu.az"
        },
        {
            id: 14, message: "Dear applicant, a notification has been sent to your personal account regarding admission to the educational institution, please sign in to the portal and check the notification. www.portal.edu.az"
        },
        {
            id: 15, message: "Dear applicant, a notification has been sent to your personal account regarding admission to the educational institution, please sign in to the portal and check the notification. www.portal.edu.az"
        },
        {
            id: 16, message: "Dear applicant, a notification has been sent to your personal account regarding admission to the educational institution, please sign in to the portal and check the notification. www.portal.edu.az"
        },
        {
            id: 17, message: "Dear applicant, a notification has been sent to your personal account regarding admission to the educational institution, please sign in to the portal and check the notification. www.portal.edu.az"
        }
    ]
}
const router = express.Router();

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



router.post('/e_documents', global_authenticate, (req, res) => {
    if (req.currentGlobalUser.type == 'edugov') {
        const { docNo, brithDate } = req.body;  
        db.e_documents.findAll({where:{document_no:docNo}, include:[{model:db.fin_data, required:false, where:{birth_date:brithDate}}]}).then(result => {
            res.json({
                success: true, diploms: (result || []).map(r => {
                    delete r.id;
                    // delete r.hash;
                    return { ...r, file_details: JSON.parse(r.file_details) }
                })
            });
        });
    } else {
        res.status(401).json({ success: false, error: "Non correct token" });
    }
});

router.post('/e_document/by_hash', global_authenticate, (req, res) => {
    if (req.currentGlobalUser.type == 'edugov') {
        const { hash } = req.body; 
        db.e_documents.findAll({where:{hash}}).then(result => {
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


/**
 * @api {post} /global/mig/ mig
 * @apiName Mig
 * @apiGroup global
 * @apiPermission none
 * 
 * @apiParam (Request body) {String} user_id <code>user_id</code>
 * @apiParam (Request body) {String} vacancy_appeals_id <code>vacancy_appeals_id</code>
 * @apiParam (Request body) {String} vacancy_id <code>vacancy_id</code>
 * @apiParam (Request body) {String} status <code>status</code>
 * @apiParam (Request body) {String} slug <code>slug</code>
 * @apiParam (Request body) {String} vacant_load <code>vacant_load</code>
 * @apiParam (Request body) {String} vacant_place <code>vacant_place</code>
 * @apiParam (Request body) {String} reasonMessage <code>reasonMessage</code>
 * @apiParam (Request body) {String} message <code>message</code>
 * @apiParam (Request body) {String} general_value <code>general_value</code>
 * @apiParam (Request body) {String} error_value <code>error_value</code>
 * @apiParam (Request body) {String} unanswered_value <code>unanswered_value</code>
 * 
 * @apiParamExample {json} Request-Example:
 * { "user_id": "", "vacancy_appeals_id": "", "vacancy_id": "", "status": "", "slug": "", "vacant_load": "", "vacant_place": "", "reasonMessage": "", "message": "", "general_value": "", "error_value": "", "unanswered_value": "" }
 * @apiSampleRequest off
 */


router.post('/mig', /*global_authenticate,*/(req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    //if (req.currentGlobalUser.name == 'rahman') {
    const { user_id, vacancy_appeals_id, vacancy_id, status, slug, vacant_load, vacant_place, reasonMessage, message, general_value, error_value, unanswered_value, has } = req.body;
    //console.log(req.body);

    if ([13].includes(Number(status))) {
        if (general_value || error_value || unanswered_value) {
            db.vacancy_appeals.update({ general_value, error_value, unanswered_value }, { where:{ id: vacancy_appeals_id } }).then(() => {
                res.json({ message: 'Məlumat uğurla dəyişdirdi!' });
            });
        }
    } else {

        let data;
        let credentials;

        if (slug == 'apply') {
            data = { status, reasonMessage };
            credentials = { user_id, vacancy_appeals_id, vacancy_id };
        } else if (slug == 'vacancy') {
            data = { vacant_load, vacant_place };
            credentials = { vacancy_id };
        } else {
            return res.status(405).json({ errors: { message: "Non correct slug" } });
        }

        if (data && credentials) {
            if (Number(status) < 8) {
                credentials = { user_id, vacancy_appeals_id }; 
            }

            if (reasonMessage && reasonMessage != '') {
                data.reasonMessage = reasonMessage 
            }
            db.appealed_vacancies.update(data , {where:credentials}).then(async (applied) => {
                if (applied.error) {
                    res.status(304).json({ error: 'Məlumat dəyişdirilə bilmədi!' });
                } else {
                    let nfin = '';  

                    if (Number(status) === 4 && has != "director") {
                        credentials.vacancy_id = vacancy_id ;
                        nfin = await db.appealed_vacancies.findAll({attributes:['id'], where:credentials});
                        db.notifications.destroy({where:{service:"vacancy_appeals", fin:{[Op.in]:nfin.id}, title:status}}).then(() => {
                            
                            db.notifications.create({ service: 'vacancy_appeals', fin: nfin.id, title: data.status, description: message[Number(data.status)] }).then(() => { });
                        });
                        credentials.vacancy_id = {[Op.ne]:vacancy_id} ;
                        
                        nfin = await Appealed_vacancies.findAll({attributes:['id'], where:credentials});

                        for (const fin of JSON.parse(JSON.stringify(nfin))) { 
                            db.notifications.destroy({where:{service:"vacancy_appeals", fin:fin.id, title:5}}).then(() => {
                                db.appealed_vacancies.update({status:5}, {where :{id:fin.id}}).then(() => {
                                    db.notifications.create({ service: 'vacancy_appeals', fin: fin.id, title: 5, description: message[7] }).then(() => { });
                                });
                            });
                        }
                    } if (Number(status) === 6) {
                        credentials.vacancy_id = vacancy_id ;  
                        nfin = await db.appealed_vacancies.findAll({ attributes:['id'], where:credentials });
                                                                
                        db.notifications.destroy({where:{service:"vacancy_appeals", fin:{[Op.in]: nfin.id}, title:status}}).then(() => {
                             
                            db.notifications.create({ service: 'vacancy_appeals', fin: nfin.id, title: data.status, description: message[Number(data.status)] }).then(() => { });
                        });
                            credentials.vacancy_id = {[Op.ne]:vacancy_id} ;  
                        nfin = await db.appealed_vacancies.findAll({attributes:['id'], where:credentials});

                        for (const fin of JSON.parse(JSON.stringify(nfin))) {
                            db.notifications.destroy({where:{service:"vacancy_appeals", fin:fin.id, title:7}}).then(() => {
                                db.appealed_vacancies.update({status:7}, {where:{id:fin.id}}).then(() => {
                                    db.notifications.create({ service: 'vacancy_appeals', fin: fin.id, title: 7, description: message[7] }).then(() => { });
                                });
                            });
                        }
                    } else {
                        nfin = await db.appealed_vacancies.findAll({attributes:['id'], where:credentials});

                        for (const fin of JSON.parse(JSON.stringify(nfin))) { 
                            db.notifications.destroy({where:{service:"vacancy_appeals", fin:{[Op.in]:fin.id}, title:status}}).then(() => {
                                db.notifications.create({ service: 'vacancy_appeals', fin: fin.id, title: status, description: message[Number(status)] }).then(() => { });
                            });
                        }
                    }

                    res.json({ message: 'Məlumat uğurla dəyişdirdi!' });
                }
            });

        }
        /* } else {
             res.status(401).json({ errors: { message: "Non correct token1" } });
         }*/
    }
});
// order by sa.id desc
router.post('/student_info', global_authenticate, (req, res) => {
    const { id, fin } = req.body;
    if (req.currentGlobalUser.type == 'student_apply') {
        // const param = id || fin;
        // const qPrama = id ? ' sa.id=?' : 'sa.fin=? order by sa.id desc';
        // {id: id ? id : false, fin: fin ? fin: false}
        const param = id || fin;
        const qPrama = id ?  {id:id} : {fin:fin} ;  

        db.student_appeals.findAll({attributes:[['id', 'apply_id']], include:[{model:db.student_appeals_private_data, required:false, include:[{model:db.student_appeals_parent_data, required:false, include:[{model:db.student_appeals_common_data, required:false}]}]}]}).then(apply => {
            if (apply) {   
                db.student_appeals_other_docs.findAll({where:{student_appeal_id:apply.apply_id}}).then(other_docs => {
                    res.json({ ...apply, other_docs });
                });
            }
            else
                res.json({ error: 'not found' });
        });
    } else {
        res.json({});
    }
});

router.post('/student/apply', global_authenticate, (req, res) => {
    const { isDoctoral, globalId, status, message, file, paymentTypeId, entranceSpecialtyPaymentAmount } = req.body;
    if (req.currentGlobalUser.type == 'student_apply' && Number(status || "") > 0) {
        const extra = {}; 
        db.student_appeals.findAll({where:{id:globalId}, include:[{model: db.users, required:false, attributes:['phone', 'country_code', ['citizenshipId', 'cid']]}]}).then((check) => {
            if (check) {
                const lang = Number(check.cid) === 1 ? 'az' : 'en';
                if (Number(status) === 10 && Number(check.paymentTypeId) === 1) {
                    res.status(401).json({ message: 'Müraciət dövlət sifarişi olduğundan əyişdirilə bilmədi!', success: false });
                } else {
                    if (isDoctoral && [3, 6].includes(Number(check.ReceptionLineId))) {
                        if (Number(status) === 10) {
                            extra.paymentTypeId = 2;
                            extra.entranceSpecialtyPaymentAmount = entranceSpecialtyPaymentAmount;
                        } else if (Number(status) === 13) {
                            extra.paymentTypeId = 1;
                        } else if (Number(status) === 12) {
                            extra.paymentTypeId = paymentTypeId;
                        }
                    }
                    db.student_appeals.update({ status, reject_files: file || "", reject_description: message || "", ...extra }, {where:{ id: globalId }}).then((applyId) => {
                        if (applyId.error) {
                            res.status(401).json({ error: 'Məlumat dəyişdirilə bilmədi!', success: false });
                        } else {
                            db.notifications.create({ service: 'student_appeal', fin: globalId, title: status, description: message, extra_data: (file || "") }).then(() => {
                                const message = (_.find(student_sms[lang], (s) => s.id === Number(status)) || {}).message;
                                if (message) {
                                    smsSend(check.phone, message, () => {
                                        res.json({ message: 'Məlumat uğurla dəyişdirdi!', success: true });
                                    }, check.country_code);
                                } else {
                                    res.json({ message: 'Məlumat uğurla dəyişdirdi!', success: true });
                                }
                            });
                        }
                    });
                }
            } else {
                res.status(401).json({ message: 'Müraciət tapılmadı!', success: false });
            }
        });
    } else {
        res.status(401).json({ errors: { message: "Non correct token" } });
    }
});


router.post('/debt/changeStatus', global_authenticate, (req, res) => {
    const { enterprice, globalId, status, message, file } = req.body;
    if (req.currentGlobalUser.type == 'student_apply' && Number(status || "") > 0) {
        const extra = {};
        if (enterprice) {
            extra.directed_enterprise = enterprice;
        }  

        db.debt.findAll({where:{id:globalId}}).then((check) => {
            if (check) { 

                db.debt.update({ status, reject_files: file || "", reject_description: message || "", ...extra }, {where:{ id: globalId }}).then((applyId) => {
                    if (applyId.error) {
                        res.status(401).json({ error: 'Məlumat dəyişdirilə bilmədi!', success: false });
                    } else {
                        db.notifications.create({ service: 'debt', fin: globalId, title: status, description: message, extra_data: (file || ""), key: Number(status || "") === 2 ? enterprice : "" }).then(() => {
                            res.json({ message: 'Məlumat uğurla dəyişdirdi!', success: true });
                        });
                    }
                });
            } else {
                res.status(401).json({ message: 'Müraciət tapılmadı!', success: false });
            }
        });
    } else {
        res.status(401).json({ errors: { message: "Non correct token" } });
    }
});


router.post('/out_of_schools/statusChange', global_authenticate, (req, res) => {
    const { global_id, status, message, tendency_id } = req.body;
    if (req.currentGlobalUser.type == 'out_of_schools') {  
        db.appealed_out_of_schools.findAll({where:{appeals_out_of_school_id:global_id, tendency_id}}).then((check) => {
            if (check) {
                db.appealed_out_of_schools.update({status}, { where:{ id: check.id } }).then((applyId) => {
                    if (applyId.error) {
                        res.status(401).json({ error: 'Məlumat dəyişdirilə bilmədi!', success: false });
                    } else {
                        
                        db.notifications.destroy({where:{service:"out_of_school", fin:check.id, title:status}}).then(() => {
                            db.notifications.create({ service: 'out_of_school', fin: check.id, title: status, description: message }).then(() => {
                                res.json({ message: 'Məlumat uğurla dəyişdirdi!', success: true });
                            });
                        });
                    }
                });
            } else {
                res.status(401).json({ message: 'Müraciət tapılmadı!', success: false });
            }
        });
    } else {
        res.status(401).json({ errors: { message: "Non correct token" } });
    }
});

router.post('/reference', global_authenticate, (req, res) => {
    if (req.currentGlobalUser.type == 'reference') {
        const { transactionID, status, message } = req.body;  
        db.e_documents_apply.findAll({where:{id:transactionID}}).then((check) => {
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


router.post('/olympiad_apply', global_authenticate, (req, res) => {
    if (req.currentGlobalUser.type == 'olympiad_admin') {
        const { global_id, exam_result, docUrl, enterprise_name, room_no, seat_no, status, message, file } = req.body;
        db.olympiad_apply.update({ exam_result, docUrl, enterprise_name, room_no, seat_no, status }, {where:{ id: global_id }}).then((applyId) => {
            if (applyId.error) {
                res.status(304).json({ error: 'Məlumat dəyişdirilə bilmədi!' });
            } else { 
                db.notifications.destroy({where:{service:"olympiad_apply", fin:global_id, title:status}}).then(() => {
                    db.notifications.create({ service: 'olympiad_apply', fin: global_id, title: status, description: message, extra_data: (file || docUrl || "") }).then(() => {
                        res.json({ message: 'Məlumat uğurla dəyişdirdi!' });
                    });
                });
            }
        });
    } else {
        res.status(401).json({ error: "Non correct token" });
    }
});

// router.post('/edu_repair', global_authenticate, (req, res) => {
//     // if (req.currentGlobalUser.type == 'edu_repair') {
//     const { edu_repair_id, status, reason, message } = req.body;
//     update('edu_repair_apply', { status }, { id: edu_repair_id }, (applyId) => {
//         if (applyId.error) {
//             res.status(304).json({ succes: false, error: 'Məlumat dəyişdirilə bilmədi!' });
//         } else {
//             querySync(`Delete FROM notifications WHERE service='edu_repair' and fin=? and title=?`, [edu_repair_id, status]).then(() => {
//                 insert('notifications', { service: 'edu_repair', fin: global_id, title: status, description: message }, () => {
//                     res.json({ succes: true, message: 'Məlumat uğurla dəyişdirdi!' });
//                 });
//             });
//         }
//     });
//     /*  } else {
//           res.status(401).json({ error: "Non correct token" });
//       } */
// });

router.post('/edu_repair', global_authenticate, (req, res) => {
    const { edu_repair_id, status, reason, message, teaching_group, date_of_freezing_edu, number_of_order_freezing_edu, number, date, file } = req.body;

    if (date_of_freezing_edu && number_of_order_freezing_edu) {  
        db.edu_repair_apply.update({date_of_freezing_edu, number_of_order_freezing_edu}, {where:{id:edu_repair_id}}).then(() => { });
    } 

    db.edu_repair_apply.update({status}, {where:{id:edu_repair_id}}).then(() => { });
    db.notifications.destroy({where:{service:"edu_repair", fin:edu_repair_id, title:status}}).then(() => {
        db.notifications.create({service:"edu_repair", fin:edu_repair_id, title:status, description:message}).then(() => { });
    });

    res.json({ succes: true, message: 'Məlumat uğurla dəyişdirdi!' });
})

router.post('/course', /* global_authenticate, */(req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    // if (req.currentGlobalUser.name == 'rahman') {
    const { user_id, course_appeals_id, course_id, status, slug, reasonMessage } = req.body;
    // console.log(req.body);
    let data;
    let credentials;
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
     } */
});


// rahman add - 12.08.2021

router.post('/outside', global_authenticate, (req, res) => {
    const { query, credentials, type } = req.body;
    if (type == 1) {
        querySync(query, credentials).then(cb => res.json(cb));
    } else if (type == 2) {
        querySyncForMap(query, credentials).then(cb => res.json(cb));
    }
});

router.post("/pts_new_status_from_qebul", global_authenticate, (req, res) => {
    const { id, title, description } = req.body; // id - user_id
    db.notifications.create({ service: 'pts', fin: id, title, description }).then(() => {
        res.json({ success: true });
    });
});


router.post('/change/applicant/status', global_authenticate, (req, res) => {
    const { applicant, status, reason } = req.body;  
    db.course_appeals.findAll({where:{id:applicant.course_appeals_id}}).then(checkCourseAppeals => {
        console.log({ checkCourseAppeals })
        if (checkCourseAppeals) {  
            db.notifications.destroy({where:{service:'course_appeals', fin:applicant.id, title:status}}).then((r) => {
                db.notifications.create({ service: 'course_appeals', fin: applicant.id, title: status, description: reason }).then((r2) => {
                    db.appealed_courses.update({status}, {where:{id:applicant.id}}).then(() => {
                        // console.log({ success: true })
                        res.json({
                            success: true
                        })
                    })
                })
            })
        } else {
            res.json({
                success: false
            })
        }
    });
});

router.get('/opencourse/applications/', global_authenticate, async (req, res) => {
    const { offset, limit } = req.query;

    const csId = await db.course_appeals.findAll({attributes:['user_id']}) ;
    let obCsId = [] ;
    for (let i = 0; i < csId.length; i++) {
        obCsId.push(csId[i].user_id);
    }

    const like = {status :{[Op.gte]:1}, user_id:obCsId} ;
    const likeCs = {} ;


    if (req.query.enterprises_id) {
        like.enterprises_id = req.query.enterprises_id ;
    }
    if (req.query.corpus_id) {
        like.corpus_id = req.query.corpus_id ;
    }
    if (req.query.course_id) {
        like.course_id = req.query.course_id ;
    }
    if (req.query.specialty_id) {
        like.specialty_code = req.query.specialty_id ;
    }
    if (req.query.status) {
        like.status = req.query.status ;
    }
    if (req.query.name) {
        like.name = {[Op.substring]: req.query.name} ;
    }
    let checkData = `LIMIT ${limit} OFFSET ${offset}`;
    if (req.query.forexport) {
        checkData = '';
    }

    if (req.query.financing) {
        like.financing = req.query.financing ;
    }
    if (req.query.teaching_language) {
        like.teaching_language = {[Op.substring]:req.query.teaching_language} ;
    }
    if (req.query.training_date) {
        likeCs.training_date = {[Op.substring]:req.query.training_date} ;
    }
    // order by id desc

    db.course_appeals.findAll({attributes:[[Sequelize.fn("CONCAT", 
    Sequelize.col("first_name"), " ", Sequelize.col("last_name"), " ",Sequelize.col("father_name")),
     "full_name"], "country", "fin", "citizenship", "birth_date", "borncity", "address", "phone", "email",
      "actual_address", "is_address_current",
      "genderId", "position_type", "dq_point", "miq_point", "user_id",  "status", "step", "country_code", 
      "militaryService", "social_status", "social_scan", "actual_region", "lang", "training_date", "training_about",
       "training_about_text", "training_motivation", ["id", "course_appeals_id"]], where:likeCs, include:[{
        model:Appealed_courses, required:true, where:like }]})
        .then(data => {
            res.json((data || []).map(d => ({ ...d, id: d.ap_id })));
        });
});

router.get('/opencourse/applications/:id', global_authenticate, async (req, res, next) => {
    const { offset, limit } = req.query;

    const csId = await db.course_appeals.findAll({attributes:['user_id']}) ;
    let obCsId = [] ;
    for (let i = 0; i < csId.length; i++) {
        obCsId.push(csId[i].user_id);
    }
    
    const enterprises_id = req.params.id;

    const like = {status :{[Op.gte]:1}, user_id:obCsId, enterprises_id} ;
    const likeCs = {} ;

    
    if (req.query.corpus_id) {
        like.corpus_id = req.query.corpus_id ;
    }
    if (req.query.course_id) {
        like.course_id = req.query.course_id ;
    }
    if (req.query.specialty_id) {
        like.specialty_code = req.query.specialty_id ;
    }
    if (req.query.status) {
        like.status = req.query.status ;
    }
    if (req.query.name) {
        like.name = {[Op.substring]:req.query.name} ;
    }
    if (req.query.teaching_language) {
        like.teaching_language = {[Op.substring]:req.query.teaching_language} ;
    }
    let checkData = `LIMIT ${limit} OFFSET ${offset}`;
    if (req.query.forexport) {
        checkData = '';
    }
    if (req.query.training_date) {
        likeCs.training_date = {[Op.substring]:req.query.training_date} ;
    }
    if (req.query.financing) {
        like.financing = req.query.financing ;
    }
    // order by id desc

    let sql = db.course_appeals.findAll({attributes:[[Sequelize.fn("CONCAT", 
    Sequelize.col("first_name"), " ", Sequelize.col("last_name"), " ",Sequelize.col("father_name")),
     "full_name"], "country", "fin", "citizenship", "birth_date", "borncity", "address", "phone", "email",
      "actual_address", "is_address_current",
      "genderId", "position_type", "dq_point", "miq_point", "user_id",  "status", "step", "country_code", 
      "militaryService", "social_status", "social_scan", "actual_region", "lang", "training_date", "training_about",
       "training_about_text", "training_motivation", ["id", "course_appeals_id"]], where:likeCs, include:[{
        model:db.appealed_courses, required:true, where:like }]});
    sql.then(data => {
        res.json((data || []).map(d => ({ ...d, id: d.ap_id })));
    })
});

router.get('/applicant/data/:user_id/:ap_id', global_authenticate, (req, res) => {
    let { user_id, ap_id } = req.params;  
    try {  
        db.educations_for_course.findAll({where:{user_id, course_appeals_id:ap_id}}).then(edu_data => {
            db.course_appeals.findAll({attributes:['country', 'address', 'phone', 'email', 'actual_address', 'actual_region'], where:{user_id}}).then(contact_data => {
                res.json({
                    edu_data,
                    contact_data
                });
            })
        });
    } catch (error) {
        res.json({
            message: "xeta",
            edu_data: [],
            contact_data: []
        })
    }
});
router.get('/apply/by/id/:id', global_authenticate, (req, res) => { 

    db.course_appeals.findAll({where:{id:req.params.id}}).then(apply => {
        if (apply) { 
            db.educations_for_course.findAll({where:{course_appeals_id:apply.id}}).then(educations => {
                db.appealed_courses.findAll({where:{course_appeals_id:apply.id}}).then(selectedCourses => {
                    res.json({
                        ...apply, educations, selectedCourses,
                    });
                });
            });
        } else {
            res.json({ success: false });
        }
    });
});

module.exports = router;

