const express = require("express") ;
const { authenticate } = require("../middlewares/authenticate.js") ;
const moment = require("moment") ;
const axios = require('axios').default ;
const { Op } = require("sequelize");
const db = require('../models');
const { Sequelize } = require("sequelize");

const router = express.Router();

/**
 *
 * @api {get} /course/all
 * @apiName by_id
 * @apiGroup course
 * @apiPermission none
 *
 * @apiDescription kurslari gətirir
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
    db.course_appeals.findAll({where:{user_id:req.currentUser.id}, 
    include:[{model:db.appealed_courses, required:false ,
    where:{end_date:{[Op.gt]:db.sequelize.fn('NOW')}}, 
    order:[['create_date', 'DESC']]}]}).then(appeals => {
    res.json(appeals); 
    }); 
});

/**
 *
 * @api {get} /course/teaching_courses
 * @apiName teaching_courses
 * @apiGroup course
 * @apiPermission none
 *
 * @apiDescription kurslari gətirir
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


router.get('/teaching_courses', authenticate, (req, res) => {
  axios.get(process.env.VACANCIES_HOST +':'+ process.env.VACANCIES_PORT + "/api/cadet/teaching_courses_all_statusopen/?&teaching_year=32", {
  headers: { authorization: "Bearer " + process.env.VACANCIES_TOKEN } }).then(({ data }) => { res.json(data);
  }).catch((error) => {
  console.log(error)
  res.json({ success: false }) }) 
});

/**
 * İmtina almış şəxs təkrar müraciət edərkən
 */
router.get('/re-apply', authenticate, (req, res) => { 
    // const id =  req.params.id ;
    const { id } = req.body ;
    db.course_appeals.findOne({where:{id,status:3}}).then(apply => {
    if (apply) { 
    db.educations_for_course.findAll({
    where:{course_appeals_id:apply.id}}).then(educations => {
    db.appealed_courses.findAll({
    where:{course_appeals_id:apply.id}}).then(selectedCourses => {
    db.work_exp_list_for_course.findAll({
    where:{course_appeals_id:apply.id}}).then(work_exp_list_for_course => {
    db.emp_history_scans_for_course.findAll({
    where:{course_appeals_id:apply.id}}).then(emp_history_scans_for_course => {
    res.json({
    ...apply, educations, selectedCourses,
    work_exp_list: work_exp_list_for_course.length > 0 ? work_exp_list_for_course : [{}],
    emp_history_scans: emp_history_scans_for_course.length > 0 ? emp_history_scans_for_course : null
    }) }) }) }) })
    } else { 
    res.json({ success: false })} 
    }) 
});

/**
 *  Əvvəl ki təhsil məlumatlari
 */


router.get('/all/educations/:fin', authenticate, (req, res) => {
    const slug = "/api/main/alleducations/" + req.params.fin
    axios.get(process.env.VACANCIES_HOST + slug, {
    headers: {
    authorization: "Bearer " + process.env.VACANCIES_TOKEN
    }
    }).then(({ data }) => {
    res.json(data);
    }).catch((error) => {
    console.log(error);
    res.json({});
    });
});


/**
 *
 * @api {get} /course/by_id/:id by_id
 * @apiName by_id
 * @apiGroup course
 * @apiPermission none
 *
 * @apiDescription kurs gətirir
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
    db.course_appeals.findOne({where:{id:req.params.id}}).then(apply => {
    if (apply) {  
    db.educations_for_course.findAll({
    where:{course_appeals_id:apply.id}}).then(educations => {
    db.appealed_courses.findAll({
    where:{course_appeals_id:apply.id}}).then(selectedCourses => {
    db.work_exp_list_for_course.findAll({
    where:{course_appeals_id:apply.id}}).then(work_exp_list_for_course => {
    db.emp_history_scans_for_course.findAll({
    where:{course_appeals_id:apply.id}}).then(emp_history_scans_for_course => {
    res.json({
    ...apply, educations, selectedCourses,
    work_exp_list: work_exp_list_for_course.length > 0 ? work_exp_list_for_course : [{}],
    emp_history_scans: emp_history_scans_for_course.length > 0 ? emp_history_scans_for_course : null
    });  });  });  });  });
    } else {
    res.json({
    success: false
    }); } }); 
});


router.get('/lastData', authenticate, (req, res) => {
    db.course_appeals.findAll({
    where:{user_id:req.currentUser.id, status:{[Op.ne]: 0}}, 
    order:[["id", "DESC"]]}).then(apply => { res.json(apply); }); 
});

router.get('/last', authenticate, (req, res) => {
    db.appealed_courses.findAll({
    where:{user_id:req.currentUser.id, end_date:{[Op.gt]: new Date()}}, 
    order:[['create_date', 'DESC']]}).then(apply => { res.json(apply); });
});


router.get('/opencourse/applications/', authenticate, async (req, res) => {
    const { offset, limit } = req.query ;
    const csId = await db.course_appeals.findAll({
    attributes:['user_id']}) ;
    let obCsId = [] ;
    for (let i = 0; i < csId.length; i++) {
    obCsId.push(csId[i].user_id);
    }

    const like = {status :{[Op.gte]:1}, user_id:obCsId} ;

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
    like.name = {[Op.substring]:req.query.name} ;
    }
    let checkData = `LIMIT ${limit} OFFSET ${offset}`;
    if (req.query.forexport) {
    checkData = '';
    }
    if (req.query.financing) {
    like.financing = req.query.financing ;
    }
    // order by id desc

    db.course_appeals.findAll({attributes:[[db.sequelize.fn("CONCAT", 
    Sequelize.col("first_name"), " ", Sequelize.col("last_name"), " ", 
    Sequelize.col("father_name")), "full_name"], "lang", "training_motivation", 
    "training_date", "actual_region", "training_about", "training_about_text", 
    ["id", "course_appeals_id"], "fin",  "phone", "borncity"], include:[
    {model:db.appealed_courses, required:true, attributes:["id", "end_date",
    "enterprises_name", "corpus_name", "amount", "specialty_name", "oc_direction_name",
    "course_id", ["name", "course_name"], "status"], where:like}]}).then(data => {
    res.json(data);
    });
});


router.get('/opencourse/applications/:id', authenticate, async (req, res, next) => {
    const { offset, limit } = req.query;
    const enterprises_id = req.query.enterprises_id;
    const csId = await db.course_appeals.findAll({attributes:['user_id']}) ;
    let obCsId = [] ;
    for (let i = 0; i < csId.length; i++) {
    obCsId.push(csId[i].user_id) ;
    }

    const like = {status :{[Op.gte]:1}, user_id:obCsId, enterprises_id} ;

    if (req.query.corpus_id)  like.corpus_id = req.query.corpus_id ; 
    if (req.query.course_id)  like.course_id = req.query.course_id ;
    if (req.query.specialty_id)  like.specialty_code = req.query.specialty_id ; 
    if (req.query.status)  like.status = req.query.status ; 
    if (req.query.name)  like.name = {[Op.substring]:req.query.name} 
    let checkData = `LIMIT ${limit} OFFSET ${offset}`;
    if (req.query.forexport) checkData = '';
    if (req.query.financing) like.financing = req.query.financing ;

    // order by id desc
    let sql = db.course_appeals.findAll({attributes:[[db.sequelize.fn("CONCAT", 
    Sequelize.col("first_name"), " ", Sequelize.col("last_name"), " ",
    Sequelize.col("father_name")), "full_name"], 'lang', 'training_motivation', 
    'training_date', 'actual_region', 'training_about', 'training_about_text', 
    ['id', 'course_appeals_id'], 'fin', 'phone', 'borncity'],
    include:[{model:db.appealed_courses, required:true, attributes:[
    'end_date', 'enterprises_name', 'corpus_name', 'amount', 'specialty_name',
    'oc_direction_name', 'course_id', ['name', 'course_name'], 'status'], where:like}]});

    sql.then(data => {
    res.json(data);
    });
    });


/**
 *
 * @api {post} /support/save/ save
 * @apiName Save
 * @apiGroup support
 * @apiPermission none
 *
 * @apiParam (Request body) {String} dataForm.fin <code>fin</code>
 * @apiParam (Request body) {String} dataForm.citizenship <code>citizenship</code>
 * @apiParam (Request body) {String} dataForm.first_name <code>first_name</code>
 * @apiParam (Request body) {String} dataForm.last_name <code>last_name</code>
 * @apiParam (Request body) {String} dataForm.father_name <code>father_name</code>
 * @apiParam (Request body) {String} dataForm.birth_date <code>birth_date</code>
 * @apiParam (Request body) {String} dataForm.borncity <code>borncity</code>
 * @apiParam (Request body) {String} dataForm.address <code>address</code>
 * @apiParam (Request body) {String} dataForm.phone <code>phone</code>
 * @apiParam (Request body) {String} dataForm.email <code>email</code>
 * @apiParam (Request body) {String} dataForm.actual_address <code>actual_address</code>
 * @apiParam (Request body) {String} dataForm.is_address_current <code>is_address_current</code>
 * @apiParam (Request body) {String} dataForm.genderId <code>genderId</code>
 * @apiParam (Request body) {String} dataForm.position_type <code>position_type</code>
 * @apiParam (Request body) {String} dataForm.dq_point <code>dq_point</code>
 * @apiParam (Request body) {String} dataForm.miq_point <code>miq_point</code>
 *
 * @apiParamExample {json} Request-Example:
 * { "country": "", "fin": "", "citizenship": "", "first_name": "", "last_name": "", "father_name": "", "birth_date":
 * "", "borncity": "", "address": "", "phone": "", "email": "", "actual_address": "", "is_address_current":
 * "", "genderId": "", "position_type": "", "dq_point": "", "miq_point": "" }
 * @apiSampleRequest off
 *
 */

router.post('/save', authenticate, (req, res) => {
    const { step, dataForm, status } = req.body ;
    const { educations, appealed_courses, emp_history_scans, work_exp_list } = dataForm ;

    saveApply(!!status ? 1 : 0, step, dataForm, req.currentUser.id, async (result) => {
    if (result.id) {
    await (new Promise(function (resolve) {
    let resultCount = 2 ;        
    db.work_exp_list_for_course.destroy({where:{course_appeals_id:result.id}}).then(() => {
    if ((work_exp_list || []).length > 0) {

    work_exp_list.flatMap(item => {
    item.course_appeals_id = result.id ;
    item.user_id = req.currentUser.id ; 
    });

    db.work_exp_list_for_course.bulkCreate(work_exp_list).then(() => { 
    resultCount++ ;
    if (resultCount === 6) { resolve(true); } });
    } else { 
    resultCount++ ; 
    if (resultCount == 6) { resolve(true); } } });
                            
    db.emp_history_scans_for_course.destroy({where:{course_appeals_id:result.id}}).then(() => {
    if ((emp_history_scans || []).length > 0) {

    emp_history_scans.flatMap(item => {
    item.course_appeals_id = result.id ;
    item.user_id = req.currentUser.id ; 
    });

    db.emp_history_scans_for_course.bulkCreate(emp_history_scans).then(() => {
    resultCount++; 
    if (resultCount === 6) { resolve(true); } });
    } else { 
    resultCount++ ; 
    if (resultCount == 6) { resolve(true) } } });
                            
    db.educations_for_course.destroy({where:{course_appeals_id:result.id}}).then(() => {
    if ((educations || []).length > 0) { 

    educations.flatMap(item => {
    item.course_appeals_id = result.id ;
    item.user_id = req.currentUser.id ; 
    });

    db.educations_for_course.bulkCreate(educations).then(() => {
    resultCount++;
    if (resultCount === 6) {
    resolve(true); } });
    } else { resultCount++;
    if (resultCount == 6) {
    resolve(true);
    } } });
                        
    db.appealed_courses.destroy({where:{course_appeals_id:result.id, status:0}}).then(() => {
    if ((appealed_courses || []).length > 0) {

    appealed_courses.filter(c => Number(c.status) === 0).map(a => ({
    start_date: moment(a.start_date).format("YYYY-MM-DD"),
    end_date: moment(a.end_date).format("YYYY-MM-DD")}));

    appealed_courses.flatMap(item => {
    item.course_appeals_id = result.id ;
    item.status = !!status ? 1 : 0 ;
    item.user_id = req.currentUser.id ;
    });

    db.appealed_courses.bulkCreate(appealed_courses).then(check => {
    if (check) {
    //delete                         
    db.appealed_courses.findAll({where:{course_appeals_id:result.id}}).then((ars) => {
    let arsc = 0 ;  
    (ars || []).forEach(ar => {
    db.notifications.destroy({where:{service:'course_appeals', fin:ar.id, title:Number(status)}}).then((r) => {
    db.notifications.create({service: 'course_appeals',
    fin: ar.id,
    title: Number(status),
    description: Number(status) ? "Müraciətiniz göndərildi. Hal-hazırda müraciətinizə baxılır. " 
    : "Siz müraciətinizi tamamlamamısınız. Müraciətin qeydə alınması üçün zəhmət olmasa müraciətinizi tamamlayasınız."}).then((nn) => {
    console.log('nn', nn);
    arsc++ ;
    if (arsc === ars.length)
    resultCount++;
    if (resultCount === 6) {
    resolve(true);
    }
    }) }) }) }) } }) ;
                        
    } else {
    resultCount++ ;
    if (resultCount === 6) {
    resolve(true); } }});

    })).then(() => {
    }).catch(e =>
    console.log('catch', e)
    )}
    res.json(result);
    }) });

module.exports = router;

function saveApply(status, step, dataForm, user_id, callback) {

    const {
    id,
    country,
    fin,
    citizenship,
    first_name,
    last_name,
    father_name,
    training_motivation,
    actual_region,
    lang,
    lang_other_text,
    training_date,
    training_about,
    training_about_text,
    birth_date,
    borncity,
    address,
    phone,
    email,
    actual_address,
    is_address_current,
    genderId,
    position_type,
    dq_point,
    miq_point,
    country_code,
    militaryService,
    social_scan,
    social_status
    } = dataForm ;

    db.course_appeals.findOne({ attributes:['id', 'user_id'], 
    where:{id} }).then(course_appeals => {
    if (course_appeals) {
    if (Number(user_id) !== Number(course_appeals.user_id)) {
    callback({
    error: 'Invailid user_id'
    });
    } else {
    db.course_appeals.update({status,
    step,
    country,
    fin,
    citizenship,
    first_name,
    last_name,
    father_name,
    birth_date,
    borncity,
    address,
    phone,
    email,
    actual_address,
    is_address_current,
    genderId,
    position_type,
    country_code,
    actual_region,
    lang,
    lang_other_text,
    training_date,
    training_about,
    training_about_text,
    dq_point,
    miq_point,
    militaryService,
    social_scan,
    social_status,
    training_motivation }, {
    where:{id: course_appeals.id}}).then(course_appeals_update => {
    if (course_appeals_update.error) {
    callback({
    error: course_appeals_update.error
    });
    } else {
    callback({
    id: course_appeals.id }) } }) } } else {
    db.course_appeals.create({ user_id, 
    status,
    step,
    country,
    fin,
    citizenship,
    first_name,
    last_name,
    father_name,
    birth_date,
    borncity,
    address,
    phone,
    email,
    actual_address,
    is_address_current,
    genderId,
    position_type,
    country_code,
    actual_region,
    lang,
    lang_other_text,
    training_date,
    training_about,
    training_about_text,
    dq_point,
    miq_point,
    militaryService,
    social_scan,
    social_status,
    training_motivation}).then(applyId => {
    if (applyId.error) { callback({  error: applyId.error  });
    } 
    else { callback(
    { id: applyId }) 
    } })  } }) 
} 
