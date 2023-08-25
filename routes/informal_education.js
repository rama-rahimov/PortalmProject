const express = require("express") ;
const {authenticate} = require("../middlewares/authenticate.js") ;
const db = require('../models');
require('dotenv').config() ;
const { Sequelize } = require("sequelize") ;

const router = express.Router();
router.get('/apply/session', authenticate, (req, res) => { 
    db.informal_edu_session_date.findAll({where:{status:1}, order:[['id', 'DESC']]}).then((resData) => {
    if (resData.length) {
    res.json(resData);
    } else {
    res.json([resData]);
    }
    }).catch(error => {
    res.json(error);
    })
});

router.post('/payment', (req, res) => {
    const {apply_id, module_id} = req.body;
    const fin = apply_id;
    const service = "informal_edu";
    if (module_id) { 
    db.informal_edu_user_modules.update({payment_status:1, status:6}, 
    {where:{inf_education_apply_id:apply_id, module_id}}).then((resData) => {
    if (resData) {  // resData qaytarir amma resData.affectedRows qaytarmir
    const title = 6;
    const description = "Modul üzrə ödəniş edildi";
    db.notifications.create({service, fin, title, description}).then((resNotification) => {
    console.log(resNotification)
    });
    res.json({
    status: true,
    message: "Ödəniş edildi"
    })
    } else {
    res.json({
    status: false,
    message: "Ödəniş xəta"
    })
    }
    }).catch(error => {
    res.json(error)
    })
    } else {    
    db.informal_edu_appeals.update({payment_status:1, apply_status:3}, 
    {where:{id:apply_id}}).then((resData) => {
    if (resData) {
    const title = 3;
    const description = "Nəzəri imtahana ödəniş edildi";
    db.notifications.create({service, fin, title, description}).then((resNotification) => {
    console.log(resNotification)
    });
    res.json({
    status: true,
    message: "Ödəniş edildi"
    })
    } else {
    res.json({
    status: false,
    message: "Ödəniş xəta"
    })
    }
    }).catch(error => {
    res.json(error)
    })
    }
})

/**

 Müraciət tamamlandıqdan sonra müraciətçinin seçdiyi ixtisasın hansı sessiya
 üzrə aktiv edildiyini teyin edib müraciətçinin müraciətini həmin sessiya
 uyğun olduuğunu təyin edib müracəti həmin sessiyaya ilə qəbul etmək

 hele ki istifade edilmir

 */

const apply_session_appointment = (apply_id, user_id, fin, ATIS_ID, specialty_ATIS_ID, callback) => {
    db.informal_edu_session_specializations.findAll({attributes:['id', 'session_id', 'specialty_id', 
    'specialty_status'], where:{specialty_status:1}, order:[['id', 'DESC']], 
    include:[{model:db.informal_edu_specializations, required:true, 
    attributes:[['id', 'spc_id'],
    'ATIS_ID', 'specialty_ATIS_ID', 'specialty_group_name', 'specialty'], 
    where:{ATIS_ID, specialty_ATIS_ID}}]}).then(resData => {
    if (resData.length === 1) { 
    db.informal_edu_appeals.update({session_id:apply_id}, {
    where:{id:user_id, fin}}).then(resUpdateData => {
    if (resUpdateData) {
    callback({
    status: true,
    message: "e"
    })
    } else {
    callback({
    status: false
    })
    }
    }).catch(error => {
    callback({
    error: error
    })
    })
    } else {
    callback({
    status: false
    })
    }
    }).catch(error => {
    callback({
    error: error
    })
    })
}

/**
 *
 *  Müraciət
 *
 *  Yadda saxla - Təsdiq et
 *
 */

router.post('/save', authenticate, (req, res) => {
    const {step, dataForm, status} = req.body;
    const {fin} = dataForm;
    const user_id = req.currentUser.id ; 
    db.informal_edu_appeals.findOne({
    where:{user_id, fin}}).then(resApply => {
    if (resApply) {

    /**
     * Əyər heç bir müraciət yoxsa bu hiss müraciət yaradır
     * */

    if ([0, 12].includes(resApply.apply_status)) {

    const {
    citizenship,
    fin, first_name, last_name,
    father_name, social_status,
    birth_date, genderId,
    address, is_address_current, spc,
    actual_address, borncity, country,
    social_scan, phone, email,
    confirm_email, id_copy,
    work_exp, social_card_number,
    doc_scan2, status
    } = dataForm ;

    const id = resApply.id;
    const apply_date = req.body.status === 1 ? now() : null;
    const apply_status = req.body.status;

    const spcl = spc.split('_');
    const session_id = spcl[0];
    const ATIS_ID = spcl[1];
    const specialty_ATIS_ID = spcl[2];
    const sn = spcl[3];
    db.informal_edu_appeals.update({
    session_id,
    citizenship,
    fin,
    first_name,
    last_name,
    father_name,
    social_status,
    birth_date,
    genderId,
    address,
    is_address_current,
    ATIS_ID,
    specialty_ATIS_ID,
    sn,
    actual_address,
    borncity,
    country,
    social_scan,
    phone,
    email,
    confirm_email,
    id_copy,
    work_exp,
    social_card_number,
    doc_scan2,
    apply_date,
    step,
    apply_status: (req.body.status === 1 && req.body.dataForm.status === 12) ? 1 : apply_status
    }, { where:{ id }}).then((resUpApply) => {

    if (resUpApply === true) {
    /*** Bildiriş* */
    notificationSend("informal_edu", id, status, (resNotification) => {

    })  
    db.informal_edu_previous_info.destroy({
    where:{inf_education_apply_id: id}}).then((resPrDelete) => {
    previous_education_info(id, dataForm, (resData) => {

    })
    }); 
    db.informal_edu_work_experience.destroy({
    where:{inf_education_apply_id: id}}).then((resWorkDelete) => {
    work_experience(id, dataForm, (resData) =>
    {});
    }) 
    db.informal_edu_knowledge_and_skills.destroy({
    where:{inf_education_apply_id: id}}).then((resKnDelete) => {
    knowledge_and_skill(id, dataForm, (resData) => {
    });
    });
    if (req.body.status === 1) {
    res.json({
    status: true,
    message: "Məlumat təsdiqləndi",
    })
    } else if (req.body.status === 0) {
    res.json({
    status: true,
    message: "Məlumat yeniləndi",
    })
    }
    }
    });
    } else if (resApply.apply_status === 1) {
    res.json({
    status: true,
    message: "Müraciətinizi artıq təsdiqləmisiz",
    })
    } else {
    res.json({
    status: true,
    message: "Məlumat tapılmadı"
    })
    }
    } else {

    /**
     *
     * Əyər heç bir müraciət yoxdursa bu hiss yeni müraciət yaradır
     *
     * */

    db.informal_edu_apply(step, status, req.currentUser.id, dataForm, (resApplyId) => {
    if (!resApplyId.error) {
    /**
     * Bildiriş
     * */
    notificationSend("informal_edu", resApplyId, status, (resNotification) => {
    /**console.log(resNotification)*/
    })
    previous_education_info(resApplyId, dataForm, (resData) => {
    /** console.log(resData)*/
    })
    work_experience(resApplyId, dataForm, (resData) => {
    /**console.log(resData)*/
    });
    knowledge_and_skill(resApplyId, dataForm, (resData) => {
    /**console.log(resData)*/
    });
    res.json({
    status: true,
    message: "Müraciət əlavə edildi"
    })
    } else {
    res.json({
    status: false,
    message: "ERROR 2"
    })
    }
    });
    }
    });
})

/**
 *
 * Bildirişin  göndərilməsi
 *
 * @param service
 * @param fin
 * @param status
 * @param callback
 *
 */

const notificationSend = (service, fin, status, callback) => {
    db.notifications.destroy({where:{service, fin, title:Number(status) ? 1 : 0}}).then(() => {
    const title = status;
    const description = (status === 1 ? `Sizin müraciət qeydə alındı. ` 
    : `Siz müraciətinizi tamamlamamısınız.  Müraciətin qeydə alınması üçün zəhmət olmasa müraciətinizi tamamlayasınız.`);
    db.notifications.create({service, fin, title, description}).then((resNotification) => {
    callback(resNotification)
    });
    });
}

/**
 *
 * Müraciətdən sonra modul seçimi
 *
 */

router.post('/apply/module/save', authenticate, (req, res) => {
    const {moduleListSelected2, status} = req.body;
    const user_id = req.currentUser.id;
    const fin = req.currentUser.fin;
    db.informal_edu_appeals.findOne({where:{user_id, fin, apply_status:5}}).then(resApply => {
    if (resApply) {
    moduleListSelected2.flatMap(item => {
    item.user_id = user_id ;
    item.inf_education_apply_id = resApply.id ;
    item.status = 5 ;
    });
    db.informal_edu_user_modules.bulkCreate(moduleListSelected2).then((resData) => {
    if (resData) {
    res.json({
    status: true
    })
    } else {
    res.json({
    status: false
    })
    }
    });
    } else {
    res.json({
    status: false,
    message: "ERROR 1"
    })
    }
    }).catch(resErrorApply => {
    res.json(resErrorApply)
    })
})

/**
 *
 * Şəxsi məlumatlar
 *
 **/

const informal_edu_apply = (step, status, user_id, dataForm, callback) => {

    const {
    citizenship, fin, first_name,
    last_name, father_name,
    social_status, birth_date, genderId,
    address, is_address_current,
    spc, actual_address, borncity,
    country, confirm_email, id_copy,
    social_scan, phone, email, 
    work_exp, social_card_number, doc_scan2,
    } = dataForm;

    const apply_date = status === 1 ? now() : null;
    const apply_status = status;

    const spcl = spc.split('_');
    const session_id = spcl[0];
    const ATIS_ID = spcl[1];
    const specialty_ATIS_ID = spcl[2];
    const sn = spcl[3];

    db.informal_edu_appeals.create({
    session_id, user_id, citizenship, fin, first_name, 
    last_name, father_name, social_status, birth_date, 
    genderId, address, is_address_current, ATIS_ID, 
    specialty_ATIS_ID, sn, actual_address, borncity, 
    country, social_scan, phone, email, confirm_email, 
    id_copy, work_exp, social_card_number, doc_scan2, 
    apply_date, step, apply_status
    }).then((applyId) => {
    if (applyId.error) {
    callback(applyId.error)
    } else {
    callback(applyId)
    }
    })
}

/**
 *
 * Əvvəl ki təhsil məlumatları
 *
 * */

const previous_education_info = (inf_education_apply_id, dataAll, callback) => {
    const {educations} = dataAll;
    if (typeof educations !== "undefined") {
    educations.flatMap(item => {
    item.inf_education_apply_id = inf_education_apply_id ;
    });

    db.informal_edu_previous_info.bulkCreate(educations).then((resData) => {
    callback(resData)
    });
    } else {
    callback({previous_education_info: false})
    }
}

/**
 *
 * İş tarixcəsi
 *
 * */

const work_experience = (inf_education_apply_id, dataAll, callback) => {
    const {work_exp_list} = dataAll;
    if (typeof work_exp_list !== "undefined") {
    work_exp_list.flatMap(item => {
    item.inf_education_apply_id = inf_education_apply_id ;
    });
    db.informal_edu_work_experience.bulkCreate(work_exp_list).then((resData) => {
    callback(resData)
    });
    } else {
    callback({work_experience: false});
    }
}

/**
 *
 * Bilik və bacarıqları
 *
 * */

const DataInsert = (inf_education_apply_id, file_type, allFiles, callback) => {
    if (typeof allFiles !== "undefined") {
    for (let i = 0; i < allFiles.length; i++) {
    const file_name = file_type === "document" ? allFiles[i].skills_exp : allFiles[i].sample_pic;
    db.informal_edu_knowledge_and_skills.create({inf_education_apply_id, file_type, file_name}).then((resData) => {
    callback(resData)
    });
    }
    }
}

const knowledge_and_skill = (inf_education_apply_id, dataAll, callback) => {
    const {skills_exp, sample_pic} = dataAll;
    DataInsert(inf_education_apply_id, 'document', skills_exp, (resData) => {
    callback(resData)
    });
    DataInsert(inf_education_apply_id, 'image', sample_pic, (resData) => {
    callback(resData)
    });
}

/**
 *
 * İxtisaslar
 *
 * */


router.get('/specializations', authenticate, async (req, res) => { 
    const iesd = await db.informal_edu_session_date.findAll({attributes:['id'] , 
    where:{apply_status:1}});
    let iEsd = [] ;
    for (let i = 0; i < iesd.length; i++) {
    iEsd.push(iesd[i].id); 
    }
   return  db.informal_edu_session_specializations.findAll({
    attributes:['id', 'session_id', 'specialty_id', 'specialty_status'],
    where:{specialty_status:1, type:'specialty', session_id:iEsd}, 
    order:[['id', 'DESC']], include:[{model:db.informal_edu_specializations , 
    required:true, attributes:[['id', 'spc_id'], 'ATIS_ID', 'sn', 
    'specialty_ATIS_ID', 'specialty_group_name', 'specialty', ['specialty', 'name'], 
    [Sequelize.fn("CONCAT", Sequelize.col("ATIS_ID"), "_", Sequelize.col("specialty_ATIS_ID"),
    "_", Sequelize.col("sn")), "spc"]], group:['ATIS_ID']}]}).then(result => {
    res.json(result);
    }).catch(err => {
    res.json(err);
    console.log(err);
    });
});

/**
 *
 * Modullar
 *
 * */

router.post('/modules', authenticate, (req, res) => {

    const {session_id, sn} = req.body.credentials;
    db.informal_edu_session_specializations.findAll({where:{session_id, module_status:1}, 
    include:[{model:db.informal_edu_specialty_modules, required:true, 
    attributes:[['id', 'module_id'], 'sn', ['name', 'module_name']], 
    where:{sn}}]}).then(resModule => {
    res.json({
    modules: resModule !== null ? resModule.length > 1 ? resModule : [resModule] : null
    });
    });
});

/**
 *
 * Müraciət məlumatları step-lərə görə çağrılacaq
 * 
 *
 * */



router.get('/apply/show', authenticate, async (req, res) => { 
    const user_id = req.currentUser.id ;
    const fin = req.currentUser.fin ; 

    db.informal_edu_appeals.findOne({where:{user_id, fin}, 
    include:{model:db.informal_edu_specializations, required:false, 
    attributes:['specialty']}}).then(resApply => {
    const apply_id = resApply.id;
    db.informal_edu_previous_info.findAll({
    where:{inf_education_apply_id:apply_id}}).then(resPreviousInfo => {
    db.informal_edu_knowledge_and_skills.findAll({
    attributes:[['file_name', 'sample_pic']], where:{file_type:"image", 
    inf_education_apply_id:apply_id}}).then(resSamplePic => {
    db.informal_edu_knowledge_and_skills.findAll({
    attributes:[['file_name', 'skills_exp']], where:{file_type:"document", 
    inf_education_apply_id:apply_id}}).then(resSkillsExp => {
    db.informal_edu_work_experience.findAll({
    where:{inf_education_apply_id:apply_id}}).then(resWorkExperience => {
    db.informal_edu_user_modules.findAll({
    attributes:['user_id', 'inf_education_apply_id', 'module_id', 
    [db.sequelize.fn("IF", {"user_id" : 0 }, 1, 1), 'status'], // if status ishlemir chunki status uniquedir amma bashqalari ishleyir
    ['payment_status', 'module_payment_status'], 
    [db.sequelize.fn("IF", {"payment_status" : 0 }, 
    'Ödəniş edilməyib', 'Ödəniş edilib'), 'module_payment_message']],
    where:{user_id, inf_education_apply_id:apply_id}, 
    include:[{model:db.informal_edu_module_documents, required:false, 
    attributes:['certificate', 'protocol', 'extract'], include:[{model:db.informal_edu_specialty_modules, 
    required:false, attributes:['name'/*, 'module_name'*/], 
    include:[{model:db.informal_edu_status_messages,
    required:true, attributes:[['message', 'module_status_message']]}]
    }]}]}).then(resModules => {
    res.json({
    id: resApply.id,
    session_id: resApply.session_id,
    country: resApply.country,
    phone: resApply.phone,
    first_name: resApply.first_name,
    last_name: resApply.last_name,
    father_name: resApply.father_name,
    birth_date: resApply.birth_date,
    address: resApply.address,
    actual_address: resApply.actual_address,
    citizenship: resApply.citizenship,
    email: resApply.email,
    is_address_current: resApply.is_address_current,
    fin: resApply.fin,
    ATIS_ID: resApply.ATIS_ID,
    specialty_ATIS_ID: resApply.specialty_ATIS_ID,
    sn: resApply.sn,
    specialty: resApply.specialty,
    spc: resApply.session_id + "_" + resApply.ATIS_ID + "_" + resApply.specialty_ATIS_ID + "_" + resApply.sn,
    name_of_other_specialty: resApply.name_of_other_specialty,
    edu_direction: resApply.edu_direction,
    genderId: resApply.genderId,
    borncity: resApply.borncity,
    social_status: resApply.social_status,
    social_scan: resApply.social_scan,
    educations: resPreviousInfo !== null ? resPreviousInfo.length > 1 ? resPreviousInfo : [resPreviousInfo] : [],
    confirm_email: resApply.confirm_email,
    work_exp_list: resWorkExperience !== null ? resWorkExperience.length > 1 ? resWorkExperience : [resWorkExperience] : [{}],
    work_exp: resApply.work_exp,
    id_copy: resApply.id_copy,
    doc_scan2: resApply.doc_scan2,
    social_card_number: resApply.social_card_number,
    payment_status: resApply.payment_status,
    sample_pic: resSamplePic !== null ? resSamplePic.length > 1 ? resSamplePic : [resSamplePic] : [{}],
    skills_exp: resSkillsExp !== null ? resSkillsExp.length > 1 ? resSkillsExp : [resSkillsExp] : [{}],
    theo_extract: resApply.theo_extract != null ? req.protocol + "://" + req.headers.host + "/api/getfile/extract/theo/" + resApply.theo_extract : null,
    prac_extract: resApply.prac_extract != null ? req.protocol + "://" + req.headers.host + "/api/getfile/extract/prac/" + resApply.prac_extract : null,
    modules: resModules !== null ? resModules.length > 1 ? resModules : [resModules] : [{}],
    module_status: resModules !== null ? 1 : 0,
    step: resApply.step,
    status: resApply.apply_status
    });
    });
    });
    });
    });
    });
    }).catch(resErrorApply => {
    res.json({
    status: 0
    })
    })
});

/**
 *
 *   Müraciət tarixcəsi
 *
 *   api/informal-education/apply/history
 *
 *   method : get
 *
 */

router.get('/apply/history', authenticate, async (req, res) => {
    const app = [] ;
    const user_id = req.currentUser.id ;
    const apply = await db.informal_edu_appeals.findOne({attributes:['id','session_id', 'user_id', 'apply_status', 'ATIS_ID' , 'specialty_ATIS_ID' ,
    [db.sequelize.fn("if", "apply_status" > 5, 'Nəzəri imtahandan keçdi', 'Nəzəri imtahandan keçmədi'), 'theo_exam_message']], where:{user_id}});
    const session_name = await db.informal_edu_session_date.findOne({attributes:['name'], 
    where:{id:apply.session_id}});
    const specialty = await db.informal_edu_specializations.findAll({attributes:['specialty'], 
    where:{ATIS_ID:apply.ATIS_ID, specialty_ATIS_ID: apply.specialty_ATIS_ID}});
    const theo_minimum_point = await db.informal_edu_session_date.findOne({
    attributes:['theo_minimum_point'], where:{id:apply.session_id}});
    const theo_questions_number = await db.informal_edu_session_date.findOne({
    attributes:['theo_questions_number'], where:{id:apply.session_id}});
    const theo_value = await db.informal_edu_session_exam_results.findAll({
    attributes:['theo_value'], where:{inf_education_apply_id:apply.id , session_id:apply.session_id}});
    const theo_exam_date = await db.informal_edu_session_date.findOne({attributes:['theo_exam_date'], where:{id:apply.session_id}});
    const exam_not_passed = await db.informal_edu_session_exam_results.findAll({attributes:['exam_not_passed'], 
    where:{inf_education_apply_id:apply.id, session_id:apply.session_id}});
    app.push(session_name);
    app.push(specialty);
    app.push(theo_minimum_point);
    app.push(theo_questions_number);
    app.push(theo_value);
    app.push(theo_exam_date);
    app.push(exam_not_passed);

    
    if (typeof(app) === 'object') {
    res.json(app);
    } else {
    res.json({
    status: false,
    message: "Məlumat mövcud deyil"
    });
    }
});

/**
 *
 *   Təkrar müraciət
 *
 *   api/informal-education/re-apply
 *
 *   method : POST
 *
 */

router.post('/re-apply', (req, res) => {
    console.log(req.body)
    res.json(req.body)
});

module.exports = router ;