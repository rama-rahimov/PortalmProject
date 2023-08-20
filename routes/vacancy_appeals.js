const express = require('express') ;
const axios = require("axios") ;
const db = require('../models');
const https = require("https") ;
const { insertList } = require("../middlewares/db.js") ;
const { authenticate } = require("../middlewares/authenticate.js") ;
require('dotenv').config();
const { Op, Sequelize } = require("sequelize") ;

// import { querySyncForMap, querySync } from "../middlewares/db";
// import { isValidPassword, toAuthJSON } from "../middlewares/authenticate";

const router = express.Router();

const year = new Date().getFullYear();

/**
 * @api {get} /vacancy_appeals/ vacancy_appeals
 * @apiName vacancy_appeals
 * @apiGroup Vacancy Appeals
 * @apiPermission none
 *
 * @apiDescription Vakansiya müraciətləri
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

router.get('/', authenticate, (req, res) => { 
    const {year} = req.query ;
    db.vacancy_appeals.findOne({where:{ user_id: req.currentUser.id, is_director:0, year}}).then(apply => {
        if (apply)
            res.json(apply);
        else
            res.json({});
    });
});

router.get('/miq_ballar/:fin', authenticate, (req, res) => { 
    db.miq_neticeler.findOne({where:{fin:req.params.fin}}).then(row => res.json(row));
});


/**
 * @api {get} /vacancy_appeals/director vacancy_appeals
 * @apiName vacancy_appeals
 * @apiGroup Vacancy Appeals
 * @apiPermission none
 *
 * @apiDescription Direktor Vakansiya müraciətləri
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

router.get('/director', authenticate, (req, res) => {  
    db.vacancy_appeals.findAll({where:{user_id:req.currentUser.id, is_director:1, year:req.query.year}}).then(apply => {
        if (apply)
            res.json(apply);
        else
            res.json({});
    });
});


/**
 * @api {get} /vacancy_appeals/check_apply_director check_apply_director
 * @apiName check_apply_director
 * @apiGroup Vacancy Appeals
 * @apiPermission none
 *
 * @apiDescription Müraciətləri yoxlama
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

router.get('/check_apply_director', authenticate, (req, res) => {
    db.vacancy_appeals.findAll({where:{user_id:req.currentUser.id, year:req.query.year, status:{[Op.gt]:0}, is_director:1}}).then(apply => {
        let count = 0;
        for (let i = 1 ; i <= apply.length; i++) { 
            count =+  i  ;
        }
        res.json((count || 0) > 0);
    });
});


/**
 * @api {get} /vacancy_appeals/check_apply check_apply
 * @apiName check_apply
 * @apiGroup Vacancy Appeals
 * @apiPermission none
 *
 * @apiDescription Müraciətləri yoxlama
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

router.get('/check_apply', authenticate, (req, res) => {
    db.vacancy_appeals.findAll({where:{user_id:req.currentUser.id, year:req.query.year, status:{[Op.gt]:0}, is_director:0}}).then(apply => {
        let count = 0;
        for (let i = 1 ; i <= apply.length; i++) { 
            count =+  i  ;
        }
        res.json((count || 0) > 0);
    });
});

// educations, academic_degrees, rewards, work_exp_list, emp_history_scans, teaching_aids, appealed_vacancies
router.get('/extra_data/:table_name/:id', authenticate, async (req, res) => {
    const { id, table_name } = req.params; 
    let result ;
    if (['educations', 'academic_degrees', 'rewards', 'work_exp_list', 'emp_history_scans', 'teaching_aids', 'appealed_vacancies'].includes(table_name)){
        switch (table_name) {
            case 'educations':
                result = await db.educations.findAll({where:{user_id:req.currentUser.id, vacancy_appeals_id:id}}) ;
                break ;
            case 'academic_degrees':
                result = await db.academic_degrees.findAll({where:{user_id:req.currentUser.id, vacancy_appeals_id:id}}) ;
                break
            case 'rewards':
                result = await db.rewards.findAll({where:{user_id:req.currentUser.id, vacancy_appeals_id:id}}) ;
                break ;
            case 'work_exp_list':
                result = await db.work_exp_list.findAll({where:{user_id:req.currentUser.id, vacancy_appeals_id:id}}) ;
                break ;
            case 'emp_history_scans':
                result = await db.emp_history_scans.findAll({where:{user_id:req.currentUser.id, vacancy_appeals_id:id}}) ;
                break ;
            case 'teaching_aids':
                result = await db.teaching_aids.findAll({where:{user_id:req.currentUser.id, vacancy_appeals_id:id}}) ;
                break ;
            case 'appealed_vacancies':
                result = await db.appealed_vacancies.findAll({where:{user_id:req.currentUser.id, vacancy_appeals_id:id}}) ;
          }

          res.json(result);
    }
    else
        res.json({ error: 'table not found' });
});

/**
 * @api {get} /vacancy_appeals/has_draft has draft
 * @apiName has draft
 * @apiGroup Vacancy Appeals
 * @apiPermission none
 *
 * @apiDescription draft yoxlanisi
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

router.get('/has_draft/dmiq', authenticate, (req, res) => {  
    db.vacancy_appeals.findAll({attributes:['creation_date', 'status'], where:{user_id:req.currentUser.id, is_director:1, year:req.query.year}}).then(result => {
        res.json(result);
    });
});

router.get('/has_draft/miq', authenticate, (req, res) => { 
    db.vacancy_appeals.findAll({attributes:['creation_date', 'status'], where:{user_id:req.currentUser.id, is_director:0, year:req.query.year}}).then(result => {
        res.json(result);
    });
});

/**
 * @api {get} /vacancy_appeals/appealed_vacancies appealed_vacancies
 * @apiName appealed_vacancies
 * @apiGroup Vacancy Appeals
 * @apiPermission none
 *
 * @apiDescription Qəbul edilen müraciətlər
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

router.get('/appealed_vacancies', authenticate, (req, res) => {   
    db.appealed_vacancies.findAll({where:{user_id:req.currentUser.id}, order:[['priority', 'ASC']] , include:[{model:db.vacancy_appeals, required:false, attributes:['is_director'], where:{year:req.query.year}}]}).then(result => {
        res.json(result);
    });
});

/**
 * @api {get} /vacancy_appeals/dq_miq_exam dq_miq_exam
 * @apiName dq_miq_exam
 * @apiGroup Vacancy Appeals
 * @apiPermission none
 *
 * @apiDescription Müəllimlərin işə qəbulu imtahan nəticələri
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

router.get('/dq_miq_exam', authenticate, async (req, res) => {
    const dq = await db.dq_miq_exam.findOne({attributes:[[db.sequelize.fn("CONCAT", 
    Sequelize.col("fenn"), ";", Sequelize.col("umumi_bal")), 'concat']], where:{imtahan:'dq', umumi_bal:{[Op.ne]:0}, fin:req.currentUser.fin}, 
    order:[['tarix', 'DESC']]});
    const miq = await db.dq_miq_exam.findOne({attributes:[[db.sequelize.fn("CONCAT", 
    Sequelize.col("fenn"), ";", Sequelize.col("umumi_bal")), 'concat']], where:{imtahan:{[Op.ne]:'dq'}, umumi_bal:{[Op.ne]:0}, fin:req.currentUser.fin}, 
    order:[['tarix', 'DESC']]});
    let exam ;
    if(dq !== null) exam = dq ;
    if(miq !== null) exam = miq ;
        if (exam) {
            res.json(exam);
        }
        else
            res.json({});
}) ;


/**
 * @api {post} /vacancy_appeals save
 * @apiName save
 * @apiGroup Vacancy Appeals
 * @apiPermission none
 *
 * @apiDescription Qeydiyyatı
 * 
 * @apiParam (Request body) {String} step <code>step</code>
 * @apiParam (Request body) {String} status <code>status</code>
 * @apiParam (Request body) {String} dataForm.educations <code>educations</code>
 * @apiParam (Request body) {String} dataForm.academic_degrees <code>academic_degrees</code>
 * @apiParam (Request body) {String} dataForm.rewards <code>rewards</code>
 * @apiParam (Request body) {String} dataForm.work_exp_list <code>work_exp_list</code>
 * @apiParam (Request body) {String} dataForm.teaching_aids <code>teaching_aids</code>
 * @apiParam (Request body) {String} dataForm.appealed_vacancies <code>appealed_vacancies</code>
 * @apiParam (Request body) {String} dataForm.emp_history_scans <code>emp_history_scans</code>
 * @apiParamExample {json} Request-Example:
 *     { "educations": "", "academic_degrees": "", "rewards": "", "work_exp_list": "", "teaching_aids": "", "appealed_vacancies": "", "emp_history_scans": "", "step": "", "status": "" }
 * @apiSampleRequest off
 */

router.post('/save', authenticate, (req, res) => {
    /*  res.json({ error: 'Qəbul dayandırılıb!' }); */


    const { step, dataForm, status } = req.body;
    let { educations, academic_degrees, rewards, work_exp_list, teaching_aids, appealed_vacancies, emp_history_scans } = dataForm;

    // work_exp_list = work_exp_list.filter(i => Object.values(i).filter(i => i).length > 0);

    saveVacancyApply(status, step, dataForm, req.currentUser.id, (result) => {
        (async () => {
            if (result.id) {
                await (new Promise(((resolve) => {
                    let resultCount = Number(status) || 2;
                    saveArrayToVacancyApply(result.id, req.currentUser.id, educations, 'educations', ["user_id", "vacancy_appeals_id", "education_type", "abroad_education_type", "enterprises", "edu_name",
                        "doc_scan", "country", "specialty", "teaching_language", "material_base", "doc_series_number", "admission_date",
                        "graduate_date", "education_level", "diplom_series_number", "education_duration", "region", "edu_base", "given_date"], () => { resultCount++; if (resultCount == 9) { resolve(true); } });
                    saveArrayToVacancyApply(result.id, req.currentUser.id, academic_degrees, 'academic_degrees', ["user_id", "vacancy_appeals_id", "academic_degree_date", "academic_degree"], () => { resultCount++; if (resultCount == 9) { resolve(true); } });
                    saveArrayToVacancyApply(result.id, req.currentUser.id, emp_history_scans, 'emp_history_scans', ["user_id", "vacancy_appeals_id", "doc_scan"], () => { resultCount++; if (resultCount == 9) { resolve(true); } });
                    saveArrayToVacancyApply(result.id, req.currentUser.id, rewards, 'rewards', ["user_id", "vacancy_appeals_id", "rewarding_doc", "rewarding_date", "rewarding"], () => { resultCount++; if (resultCount == 9) { resolve(true); } });
                    saveArrayToVacancyApply(result.id, req.currentUser.id, work_exp_list, 'work_exp_list', ["user_id", "isApi", "salary", "area_of_activity", "start_date", "end_date", "vacancy_appeals_id", "company", "employer", "contract_type", "position", "work_type", "description"], () => { resultCount++; if (resultCount == 9) { resolve(true); } });
                    saveArrayToVacancyApply(result.id, req.currentUser.id, teaching_aids, 'teaching_aids', ["user_id", "vacancy_appeals_id", "aid_name", "aid_publication_date"], () => { resultCount++; if (resultCount == 9) { resolve(true); } });
                    saveArrayToVacancyApply(result.id, req.currentUser.id, appealed_vacancies, 'appealed_vacancies', ["user_id", "vacancy_appeals_id", "status", "vacancy_id", "districts", "enterprises", "corpuses", "modules", "vacant_load", "vacant_place", "teaching_language", "staff_oc_direction", "priority", "position", "position_id"], (s, r) => {
                        if (r && Number(status) && r.affectedRows) {
                            for (let index = 0; index < r.affectedRows; index++) {
                                db.notifications.create({ service: 'vacancy_appeals', fin: (r.insertId + index), title: 1, description: 'Müraciətiniz qeydə alındı. Hazırda Sizin müraciətinizə baxılır.' }).then(() => { });
                            }
                        }
                        resultCount++; if (resultCount == 9) { resolve(true); }
                    });
                    const options = {
                        hostname: process.env.VACANCIES_HOST,
                        port: process.env.VACANCIES_PORT,
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${process.env.VACANCIES_TOKEN}`
                        }
                    };
                    if (status == 1)
                        axios.post(`${process.env.VACANCIES_HOST}:${process.env.VACANCIES_PORT}/api/vacancy/apply`, {
                            ...dataForm,
                            author_books: rewards,
                            is_author_book: dataForm.has_rewards,
                            id: result.id,
                            fin: req.currentUser.fin,
                            user_id: req.currentUser.id,
                        }, { headers: { 'authorization': `Bearer ${process.env.VACANCIES_TOKEN}` }, httpsAgent: new https.Agent({ rejectUnauthorized: false }) }).then(() => {
                            resultCount++;
                            if (resultCount == 9) {
                                resolve(true);
                            }
                        });
                }))).then(() => { }).catch(e => console.log('catch', e));
            }
            res.json(result);
        })();
    });
});

router.post('/remove_draft', authenticate, (req, res) => {
    const vacancy_appeals_id = req.body.id;

    if (vacancy_appeals_id) {    
        db.educations.destroy({where:{ vacancy_appeals_id }}).then(() => {
        db.academic_degrees.destroy({where:{ vacancy_appeals_id }}).then(() => {
        db.emp_history_scans.destroy({where:{ vacancy_appeals_id }}).then(() => {
        db.rewards.destroy({where:{vacancy_appeals_id}}).then(() => {
        db.work_exp_list.destroy({where:{vacancy_appeals_id}}).then(() => {
        db.teaching_aids.destroy({where:{ vacancy_appeals_id }}).then(() => {
        db.appealed_vacancies.destroy({where:{ vacancy_appeals_id }}).then(() => {
        db.vacancy_appeals.findOne({where:{ id: vacancy_appeals_id }}).then(() => {
        res.end();
        }); }); }); }); }); }); }); });
    } else res.send();
});

router.get('/get_vacancy_appeals_status/:id', authenticate, (req, res) => {
    const id = req.params.id;
    axios.get(`${process.env.VACANCIES_HOST}:${process.env.VACANCIES_PORT}/api/vacancy/get_vacancy_appeals_status/${id}`, {
        headers: { 'authorization': `Bearer ${process.env.VACANCIES_TOKEN}` },
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
    }).then(result => {
        res.send(result.data);
    }).catch(e => {
        console.log(e.message);
    });
});

router.get('/get_vacancy_modules/:p', authenticate, (req, res) => {
    const p = req.params.p;
    axios.get(`${process.env.VACANCIES_HOST}:${process.env.VACANCIES_PORT}/api/vacancy/modules/${p}`, {
        headers: { 'authorization': `Bearer ${process.env.VACANCIES_TOKEN}` },
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
    }).then(result => {
        res.send(result.data);
    });
});

router.get('/get_positions/:p', authenticate, (req, res) => {
    const p = req.params.p;
    axios.get(`${process.env.VACANCIES_HOST}:${process.env.VACANCIES_PORT}/api/main/position/${p}`, {
        headers: { 'authorization': `Bearer ${process.env.VACANCIES_TOKEN}` },
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
    }).then(result => {
        res.send(result.data);
    });
});

router.get('/staff_oc_direction', authenticate, (req, res) => {
    axios.get(`${process.env.VACANCIES_HOST}:${process.env.VACANCIES_PORT}/api/main/staff_oc_direction`, {
        headers: { 'authorization': `Bearer ${process.env.VACANCIES_TOKEN}` },
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
    }).then(result => {
        res.send(result.data);
    });
});

module.exports = router ;

function saveVacancyApply(status, step, dataForm, user_id, callback) {
    const {
        first_name, last_name, father_name, birth_date, has_teaching_aids,
        borncity, address, phone, email, social_status, has_current_work,
        actual_address, addresscity, is_address_current, genderId, miq_subject, dq_subject,
        position, position_type, dq_point, miq_point, has_rewards, social_scan,
        has_academic_degree, work_exp, pedagogical_exp, is_director, choose_position, year
    } = dataForm;

    db.vacancy_appeals.findOne({attributes:['id'], where:{user_id, year, is_director:(is_director || 0)}}).then(vacancy_appeals => {
        if ((vacancy_appeals || {}).id) {
            db.vacancy_appeals.update({
                first_name, last_name, father_name, birth_date,
                borncity, address, phone, email, social_status,
                actual_address, addresscity, is_address_current, genderId, position,
                position_type, dq_point, miq_point, has_rewards, miq_subject, dq_subject,
                has_academic_degree, work_exp, pedagogical_exp, social_scan,
                step, has_teaching_aids, has_current_work, status, choose_position: choose_position || ""
            }, {where:{ id: vacancy_appeals.id }}).then((applyId) => {
                if (applyId.error) {
                    callback({ error: applyId.error });
                } else {
                    callback({ id: vacancy_appeals.id });
                }
            });
        } else {
            db.vacancy_appeals.create({
                first_name, last_name, father_name, birth_date,
                borncity, address, phone, email, social_status, year,
                actual_address, addresscity, is_address_current, genderId, position, is_director: (is_director || 0),
                position_type, dq_point, miq_point, has_rewards, miq_subject, dq_subject,
                has_academic_degree, work_exp, pedagogical_exp, social_scan,
                user_id, has_teaching_aids, has_current_work, step, status, choose_position: choose_position || ""
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

function saveArrayToVacancyApply(vacancy_appeals_id, user_id, arrayData, table_name, datakeys, callback, extra) {
    arrayData = (arrayData || []).filter(d => Object.keys(d).length > 0);
    if (arrayData.length > 0) 
    db.table_name.destroy({where:{user_id, vacancy_appeals_id}}).then((q) => {
            insertList(table_name, arrayData, datakeys, { ...(extra || {}), user_id, vacancy_appeals_id }, callback);
        }).catch(err => callback({ error2: err.sqlMessage }));
    else
        callback(null);
}