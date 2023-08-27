const express = require("express") ;
const querystring = require("querystring") ;
const _ = require("lodash") ;
const db = require('../models') ;
const axios = require("axios") ;
const { authenticate } = require("../middlewares/authenticate.js") ;
const { Op, Sequelize, where } = require("sequelize") ;

//import { querySyncForMap, querySync } from "../middlewares/db";
//import { isValidPassword, toAuthJSON } from "../middlewares/authenticate";

const router = express.Router();


const active_statuses = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 22, 23, 24, 25, 26, 27, 30];
const success_statuses = [13, 14, 15, 28, 29];
const reject_statuses = [16, 17, 18, 19, 20, 21, 31];



const sendFun = (calback) => {                                                      
    db.student_appeals.findOne({attributes:[['fin', 'apply_fin'], 
    ['id', 'apply_id']], where:{status:1, isSend:0}, 
    order:Sequelize.literal('rand()'), 
    include:[{model:db.student_appeals_private_data, required:false, 
    include:[{model:db.student_appeals_parent_data, required:false, 
    include:[{model:db.student_appeals_common_data, required:false}]}]}]}).then(apply => {
    if (apply) {                     
    db.student_appeals_other_docs.findAll({
    where:{student_appeal_id:apply.apply_id}}).then(other_docs => {
    db.users.findAll({attributes:['id', 'email', 'role', 'phone', 'country_code', 'citizenshipId', 'asanLogin'], 
    where:{fin:apply.apply_fin}, include:[{model:db.fin_data, required:false}]}).then(user => {
    if (user) {
    sendDataToATIS({ ...apply, other_docs }, user, apply.apply_id, (sendResult) => {
    //count++;
    if (sendResult) {
    db.student_appeals.update({ isSend: 1 }, { where:{ id: apply.apply_id }}).then(() => {
    setTimeout(() => {
    sendFun(calback);
    }, 500);

    });
    } else {
    setTimeout(() => {
    db.student_appeals.update({ isSend: 2 }, { where:{ id: apply.apply_id } }).then(() => {
    setTimeout(() => {
    sendFun(calback);
    }, 500);

    });
    }, 500);
    }
    });
    } else {
    setTimeout(() => {
    sendFun(calback);
    }, 500);
    }
    });
    });
    }
    else
    calback(true);
    });
}
/*
router.get('/SWA', (req, res) => {
    sendFun((r) => {
        res.json(r)

    });
});*/

router.post('/sendStatus', authenticate, (req, res) => {
    const { id, educationLevelId, ReceptionLineId, status } = req.body;
    const approve = [12, 10, 12, 12, 12, 12, 12, 12, 12, 12, 12];
    const reject = [13, 13, 13, 14, 13, 13, 13, 13, 13, 13, 13];
    db.student_appeals.findAll({ 
    where:{user_id:req.currentUser.id, status:13}}).then((a) => {
    const countA = a.length ;
    console.log({
    data: {
    RequestId: id,
    StatusId: (status === 13 ? (educationLevelId >= 5 ? 17 : approve[Number(ReceptionLineId)]) 
    : (educationLevelId >= 5 ? 18 : reject[Number(ReceptionLineId)])),
    ReceptionLineId
    }
    })
    if (countA === 0) {
    atisLogin((token) => {
    if (token) {
    axios({
    method: 'POST',
    url: `${process.env.ATIS_HOST}/api/tq/student/status/change`,
    headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + token
    },
    data: {
    RequestId: id,
    StatusId: (status === 13 ? (educationLevelId >= 5 ? 17 : approve[Number(ReceptionLineId)]) 
    : (educationLevelId >= 5 ? 18 : reject[Number(ReceptionLineId)])),
    ReceptionLineId
    }
    }).then(({ data }) => {
    if (data && data.success) {
    if (status === 13) {      
    db.student_appeals.findAll({where:{user_id, 
    status:{[Op.in]:active_statuses}}}).then(async (appeals) => {

    for (let apply of appeals) {
    if (apply.id != id)               
    db.notifications.destroy({where:{service:"student_appeal", fin:apply.id, title:20}}).then(() => {
    db.notifications.create({ service: 'student_appeal', fin: apply.id, 
    title: 20, description: "", extra_data: "" }).then(() => {
                                                    
    db.student_appeals.update({ status: 20 },
    { where:{ id: apply.id } }).then(() => { });
    });
    }); 
    }
    db.notifications.destroy({where:{service:"student_appeal", fin:id, 
    title:Number(ReceptionLineId) === 1 ? 12 : 13}}).then(() => {
    db.notifications.create({ service: 'student_appeal', fin: id, 
    title: Number(ReceptionLineId) === 1 ? 12 : 13, 
    description: "", extra_data: "" }).then(() => {
    db.student_appeals.update({ 
    status: Number(ReceptionLineId) === 1 ? 12 : 13 }, {where:{ id }}).then(() => {
    res.json(true);
    });
    });
    });
    });
    } else {  
    db.notifications.destroy({where:{service:'student_appeal', fin:id, title:20}}).then(() => {
    db.notifications.create({ service: 'student_appeal', fin: id, title: 20, description: "", extra_data: "" }).then(() => {
    db.student_appeals.update({ status: 20 }, {where:{ id }}).then(() => {
    res.json(true);
    });
    });
    });
    }

    } else {
    res.json(false);
    }
    }).catch(e => {
    if (e.response) {
    console.log(e.response.data);
    } else {
    console.log(e);
    }
    if (Object.keys(e).length > 0)
    res.json(false);
    })
    } else {
    res.json(false);
    }
    });
    }
    else {
    res.json(false);
    }
    });
});


/**
 * @api {get} /student_apply/by_id/:id by_id
 * @apiName by_id
 * @apiGroup Student Apply
 * @apiPermission none
 *
 * @apiDescription Tələbə müraciətini gətirir
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
    db.student_appeals.findOne({
    attributes:['id'], where:{user_id:req.currentUser.id, id}, 
    include:[{model:db.student_appeals_private_data, required:false, 
    include:[{model:db.student_appeals_parent_data, required:false, 
    include:[{model:db.student_appeals_common_data, required:false}]}]}]}).then(apply => {
    if (apply) {                                         
    db.student_appeals_other_docs.findAll({where:{student_appeal_id:id}}).then(other_docs => {
    res.json({apply, other_docs});
    });
    }
    else
    res.json({});
    });
});

/**
 * @api {post} /student_apply/checkCustomPassword check Custom Password
 * @apiName check Custom Password
 * @apiGroup Student Apply
 * @apiPermission none
 *
 * @apiDescription sifre yoxlamasi
 * 
 * @apiParam (Request body) {String} customPassword <code>customPassword</code> of the user.
 * @apiParam (Request body) {String} dataForm <code>dataForm</code> of the phone.
 * @apiParamExample {json} Request-Example:
 *     { "customPassword": "", "dataForm": {} }
 * @apiSampleRequest off
 */

router.post('/checkCustomPassword', authenticate, (req, res) => {
    const { customPassword, ReceptionLineId } = req.body;
    db.custompasswords.findOne({
    where:{password:customPassword, line:ReceptionLineId}}).then(check => {
    res.json({ status: !!check, showStageId: (check || {}).stage || '' });
    });
});

/**
 * @api {get} /student_apply/get_dim_data get_dim_data
 * @apiName get dim data
 * @apiGroup Student Apply
 * @apiPermission none
 *
 * @apiDescription imtahan gətirir
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

router.get('/get_dim_data/:ReceptionLineId', authenticate, (req, res) => {
    const { ReceptionLineId } = req.params;      
    const { reject_statuses } = req.body ;     //ozum elave elemishem
    
    db.dim_datas.findOne({where:{fin: req.currentUser.fin, ReceptionLineId, isFinish:0}, 
    include:[{model:db.student_appeals, required:false, 
    attributes:[[db.sequelize.fn("ifNUll", Sequelize.col('status'), 0), 'STATUS'],['id', 's_id']], 
    where:{[Op.and]:[{[Op.or]:[{status:{[Op.notIn]:reject_statuses}}, {status:{[Op.is]:null}}]}, 
    {[Op.or]:[db.sequelize.where(db.sequelize.fn('YEAR', Sequelize.col('create_date')),(new Date()).getFullYear()), 
    {create_date:{[Op.is]:null}}]}]}, order:[['status', 'DESC']], include:[{model:db.atis_enterprises, 
    required:false, attributes:[['name', 'e_name']]}]}]}).then(dim_data => {
    res.json(dim_data);
    });
});

router.get('/checkDimData', authenticate, (req, res) => {  
    db.dim_datas.findOne({attributes:['ReceptionLineId'], 
    where:{ReceptionLineId:{[Op.in]:[8,7,1]}, isFinish:0, 
    fin:req.currentUser.fin}}).then(dim_data => {
    res.json(Number((dim_data || {}).ReceptionLineId) || 0);
    });
});

/**
 * @api {get} /student_apply/payment/debt/:id debt
 * @apiName debt
 * @apiGroup Student Apply
 * @apiPermission none
 *
 * @apiDescription Tələbə borcunu gətirir
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

router.get('/payment/debt/:id', authenticate, (req, res) => {
    const { id } = req.params;
    atisLogin((token) => {
    if (token) {
    axios({
    method: 'GET',
    url: `${process.env.ATIS_HOST}/api/debts/education-amount/first-admission/student/${id}`,
    headers: {
    Authorization: 'Bearer ' + token
    }
    }).then(post_result => {
    res.json(post_result.data.amount);
    }).catch(e => {
    if (e.response) {
    console.log(e.response.data);
    } else {
    console.log(e);
    }
    if (Object.keys(e).length > 0)
    res.json({ error: 'api error' });
    })
    } else {
    res.json({ error: 'token error' })
    }
    });
});

/**
 * @api {post} /student_apply/payment/sendPaymentChekScan payment send Payment Chek Scan
 * @apiName payment send Payment Chek Scan
 * @apiGroup Student Apply
 * @apiPermission none
 *
 * @apiDescription sifre yoxlamasi
 * 
 * @apiParam (Request body) {String} customPassword <code>customPassword</code> of the user.
 * @apiParam (Request body) {String} dataForm <code>dataForm</code> of the phone.
 * @apiParamExample {json} Request-Example:
 *     { "customPassword": "", "dataForm": {} }
 * @apiSampleRequest off
 */

router.post('/payment/sendPaymentChekScan', authenticate, (req, res) => {
    const { paymentChekScan, id } = req.body;
    atisLogin((token) => {
    if (token) {
    const options = {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
    },
    timeout: process.env.TIMEOUT || 8000,
    data: {
    check_scan: paymentChekScan, global_id: id
    },
    url: `${process.env.ATIS_HOST}/api/tq/student/payment/receipt`
    };
    axios(options).then((r) => {  
    db.notifications.destroy({where:{service:'student_appeal', fin:id, title:30}}).then(() => {
    db.notifications.create({ service: 'student_appeal', fin: id, title: 30 }).then(() => {
    db.student_appeals.update({ paymentChekScan, status: 30, payment_method: 3 }, 
    {where:{ id }}).then(() => {
    res.json(true)
    });
    });
    });
    }).catch(e => {
    if (e.response) {
    console.log(e.response.data);
    } else {
    console.log(e);
    }
    if (Object.keys(e).length > 0)
    res.json(false)
    })
    } else {
    console.log(false)
    res.json(false)
    }
    });
});

/**
 * @api {post} /student_apply/payment/get_url payment get_url
 * @apiName payment get_url
 * @apiGroup Student Apply
 * @apiPermission none
 *
 * @apiDescription sifre yoxlamasi
 * 
 * @apiParam (Request body) {String} id <code>id</code>
 * @apiParam (Request body) {String} cardBinCode <code>cardBinCode</code>
 * @apiParamExample {json} Request-Example:
 *     { "id": "", "cardBinCode": "" }
 * @apiSampleRequest off
 */

router.post('/payment/get_url', authenticate, (req, res) => {
    const { id, cardBinCode } = req.body;
    atisLogin((token) => {
    if (token) {
    axios({
    method: 'GET',
    url: `${process.env.ATIS_HOST}/api/debts/education-amount/first-admission/student/${id}`,
    headers: {
    Authorization: 'Bearer ' + token
    }
    }).then(post_result => {
    const paymentDetails = post_result.data.amount;
    axios({
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    auth: {
    username: 'edumedia',
    password: 'P@ssword'
    },
    data: {
    "redirectURL": "https://portal.edu.az/student/dashboard",
    "cardBinCode": cardBinCode,
    "transactionId": paymentDetails.transactionId,
    "account": {
    "scCode": paymentDetails.scCode,
    "identificationType": req.currentUser.citizenshipId == 1 ? "IAMAS" : (req.currentUser.citizenshipId == 2 ? "VMMS" : "ACC1"),
    "code": req.currentUser.citizenshipId < 3 ? req.currentUser.fin : paymentDetails.invoice,
    "address": req.currentUser.address,
    "name": req.currentUser.first_name,
    "surname": req.currentUser.last_name,
    "patronymic": req.currentUser.father_name
    },
    "invoices": [
    {
    "code": paymentDetails.invoice,
    "date": paymentDetails.createdDate || "2021-06-09",//new Date(),
    "totalAmount": paymentDetails.total_amount,
    "amount": paymentDetails.remain_debt,
    "serviceCode": paymentDetails.serviceCode,
    "paymentReceiverCode": paymentDetails.paymentReceiverCode
    }
    ]
    },
    url: `http://192.168.100.196:4449/initiate-payment`
    }).then((r) => {
    res.json(r.data)
    }).catch(e => {
    if (e.response) {
    console.log(e.response.data);
    } else {
    console.log(e);
    }
    if (Object.keys(e).length > 0)
    res.json(false)
    });
    }).catch(e => {
    if (e.response) {
    console.log(e.response.data);
    } else {
    console.log(e);
    }
    if (Object.keys(e).length > 0)
    res.json(false);
    })
    } else {
    res.json(false);
    }
    });
});

/**
 * @api {get} /student_apply/all all
 * @apiName all
 * @apiGroup Student Apply
 * @apiPermission none
 *
 * @apiDescription hamisini gətirir
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
    db.student_appeals.findAll({attributes:['id', 'paymentChekScan', 
    'educationLevelId', 'ReceptionLineId', 'reject_description', 
    'reject_files', 'EducationStageId', 'institutionAtisId', 
    'EntranceYear', 'educationFormId', 'status', 'paymentTypeId'], 
    where:{user_id:req.currentUser.id}, order:[['id', 'DESC']], 
    include:[{model:db.student_appeals_common_data, required:false, 
    attributes:['studentLoan']}]}).then(apply => {
    res.json(apply);
    });
});

/**
 * @api {get} /student_apply/check_apply check apply
 * @apiName check apply
 * @apiGroup Student Apply
 * @apiPermission none
 *
 * @apiDescription yoxlanilmis basvuru
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
    const {active_statuses, reject_statuses} = req.body ;
    db.receptionline.findAll({where:{is_delete:0}}).then(receptionLine => {
    if (req.currentUser.citizenshipId === 1) { 
    const docIsActive = _.some(receptionLine, (r) => r.ATIS_ID === 3 && r.group != 'Əcnəbi vətəndaşlar');
    const dimIsActive = _.some(receptionLine, 
    (r) => [1, 2, 5, 6, 7, 8, 9].includes(r.ATIS_ID) && r.group != 'Əcnəbi vətəndaşlar');
    db.student_appeals.findAll({
    where:{[Op.and]:[db.sequelize.where(db.sequelize.fn('YEAR', db.sequelize.col('create_date')), (new Date()).getFullYear()),
    {fin:req.currentUser.fin}, {ReceptionLineId:3}, 
    {status:{[Op.notIn]: reject_statuses }}]}}).then(doc_appeals => {
    if (docIsActive && doc_appeals.length === 0) {
    res.json(true);
    } else if (dimIsActive) {                               
    db.dim_datas.findOne({where:{fin:req.currentUser.fin}, 
    include:[{model:db.student_appeals, required:false, attributes:['status'], 
    where:{[Op.and]:[{[Op.or]:[{status:{[Op.notIn]:reject_statuses}}, 
    {status:{[Op.is]:null}}]}, {[Op.or]:
    [db.sequelize.where(db.sequelize.fn('YEAR', db.sequelize.col('create_date')), (new Date()).getFullYear() ), 
    {create_date:{[Op.is]:null}}]}]}, order:[['status', 'DESC']]}]}).then(dim_appeals => {
    if (dim_appeals.length > 0 && _.every(dim_appeals, (a) => a.status === null)) {
    res.json(true);
    } else {
    res.json(false);
    }
    });
    } else {
    res.json(false);
    }
    })
    } else {
    const anyIsActive = _.some(receptionLine, (r) => ![7, 8].includes(r.ATIS_ID) && r.group == 'Əcnəbi vətəndaşlar');
    const dimIsActive = _.some(receptionLine, (r) => [7, 8].includes(r.ATIS_ID) && r.group == 'Əcnəbi vətəndaşlar');
    db.student_appeals.findOne({where:{[Op.and]:[db.sequelize.where(db.sequelize.fn('YEAR', 
    db.sequelize.col('create_date')), (new Date()).getFullYear()), 
    {fin:req.currentUser.fin}, {status:13}]}}).then(isFinis => { 
    if (isFinis) {
    res.json(false);                                                                          
    } else {      
    db.student_appeals.findAll({where:{[Op.and]:[db.sequelize.where(Sequelize.fn('YEAR', 
    db.sequelize.col('create_date')), (new Date()).getFullYear()),
    {fin:req.currentUser.fin}, {status:active_statuses}/*, {ReceptionLineId:!anyIsActive ? [0] 
    : receptionLine.filter((r) => ![7, 8].includes(r.ATIS_ID) && r.group == 'Əcnəbi vətəndaşlar').map(r => r.ATIS_ID)}*/]}}).then(doc_appeals => {
    if (anyIsActive && doc_appeals.length < 5) {
    res.json(true);
    } else if (dimIsActive) {                                                                                          
    db.dim_datas.findOne({where:{fin:req.currentUser.fin}, include:[{model:db.student_appeals, required:false, 
    attributes:['status'], where:{[Op.and]:[{[Op.or]:[{status:{[Op.notIn]:reject_statuses}}, 
    {status:{[Op.is]:null}}]}, {[Op.or]:[db.sequelize.where(db.sequelize.fn('YEAR', 
    db.sequelize.col('create_date')), (new Date()).getFullYear()), 
    {create_date:{[Op.is]:null}}]}]}, order:[['status', 'DESC']]}]}).then(dim_appeals => {
    if (dim_appeals.length > 0 && _.every(dim_appeals, (a) => a.status === null)) {
    res.json(true);
    } else {
    res.json(false);
    }
    });
    } else {
    res.json(false);
    }
    })
    }
    })
    }
    });
});


/**
 * @api {post} /student_apply/save/ save
 * @apiName save
 * @apiGroup Student Apply
 * @apiPermission none
 *
 * @apiDescription Tələbə qeydiyyat
 * 
 * @apiParam (Request body) {String} step <code>step</code> of the user.
 * @apiParam (Request body) {String} dataForm <code>dataForm</code> of the phone.
 * @apiParamExample {json} Request-Example:
 *     { "step": "", "dataForm": {} }
 * @apiSampleRequest off
 */


router.post('/save', authenticate, (req, res) => {
    const { status, step, dataForm } = req.body;
    const { other_docs } = dataForm ;
    if ((req.currentUser.fin || "").toLowerCase() != (dataForm.fin.toLowerCase() || "").toLowerCase() || 
    (!!dataForm.first_name && (req.currentUser.first_name || "").toLowerCase() != (dataForm.first_name || "").toLowerCase()) || 
    (!!dataForm.last_name && (req.currentUser.last_name || "").toLowerCase() != (dataForm.last_name || "").toLowerCase())) {
    res.json({ error: 'Səhifəni yeniləyin', refresh: true });
    } else {
    saveApply(0, step, dataForm, req.currentUser, (result) => {
    if (result.id) { 
    db.notifications.destroy({where:{service:'student_appeal', 
    fin:result.id, title:(!!status ? 1 : 0)}}).then(() => {
    db.notifications.create({ service: 'student_appeal', 
    fin: result.id, title: !!status ? 1 : 0, description: "" /*!!status ? 'Sizin müraciətiniz baxılma mərhələsindədir, araşdırıldıqdan sonra sizə geri dönüş ediləcəkdir.' : 'Müraciətinizin araşdırılması üçün ərizə formasında tələb olunan bütün məlumatların doldurulub, göndərilməsi tələb olunur.'*/, extra_data: "" }).then(() => {
    db.student_appeals_other_docs.destroy({where:{student_appeal_id:result.id}}).then(() => {
    if (other_docs) {
    other_docs.flatMap(item => {
    item.student_appeal_id = result.id ;
    });
    db.student_appeals_other_docs.bulkCreate(other_docs).then((saod) => {
    if (!!status) {
    sendDataToATIS(dataForm, req.currentUser, result.id, (r) => {
    db.student_appeals.update({ status: 1, isSend: r ? 1 : 0 }, {where:{ id: result.id }}).then(() => {
    res.json(result);
    });
    /* if (r) {
    update('student_appeals', { status: 1 }, { id: result.id }, () => {
    res.json(result);
    });
    } else {
    res.json(result);
    }*/
    });
    } else {
    res.json(result);
    }
    });
    } else {
    if (!!status) {
    sendDataToATIS(dataForm, req.currentUser, result.id, (r) => {
    db.student_appeals.update({ status: 1, isSend: r ? 1 : 0 }, 
    {where:{ id: result.id }}).then(() => {
    res.json(result);
    });
    /* if (r) {
    update('student_appeals', { status: 1 }, { id: result.id }, () => {
    res.json(result);
    });
    } else {
    res.json(result);
    }*/
    });
    } else {
    res.json(result);
    }
    }
    });
    });
    });
    } else {
    res.json(result);
    }
    });
    }
});


module.exports = router ;

function sendDataToATIS(dataForm, user, globalId, callback) {
    const { fin, citizenshipId, image } = user;
    const {
        ReceptionLineId, EducationStageId, educationLevelId, institutionAtisId, entranceSpecialty, subordinateSpecialization,
        educationFormId, educationLanguageId, paymentTypeId, entranceSpecialtyPaymentAmount, specialtyPassword,
        previousEduStageId, previousEduLevelId, passportScan, scanningCertificateOfHealth, previousEducationDocument,
        previousEducationLegalizedDocument, previousEducationTranslatedDocument, certificateOfLanguageInstruction,
        personnelRegistrationCard, biographyDocScan, photo3x4, workCertificateScan, workExperienceScan, have_residence_permit,
        publishedScientificWorksScan, publishedScientificWorkListScan, diplomaOfHigherEducationScan, previousInstitutionName,
        identityDocumentScan, diplomaOfDoctorOfPhilosophyScan, specialtyDimCode, basicEducation, pointsOnEntrance,
        dimNo, schoolDiplomaScan, higherSchoolDiplomaScan, higherVocationalEducationDiplomaScan, middle_name,
        secondarySpecialEducationDiplomaScan, highEducationDiplomaScan, equivalenceOfSpecialtyDocScan, preparation,
        medicalActivityDocScan, healthCertificateScan, militaryRegistrationDocumentScan, militaryIDDocumentScan,
        first_name, last_name, father_name, birth_date, actual_region, birth_certificate, militaryService,
        actual_address, email, genderId, passport_series, passport_number, documentStatusIDP, other_docs,
        citizenship, address, maritalStatus, adress_in_foreign, last_live_country, phone, country_code,
        specialtyName, socialOtherDoc, description, socialDescription, socialStep, socialDecisionReason,
        changeName, territorialIntegrityDisability, birthCertificate, changeNameDoc, typeHeroism, territorialIntegrityDeath,
        militaryOperationMissing, militaryOperationDeath, degreeKinship, marriageCertificate, birthCertificateOfMartyredChild,
        certificateFamilyComposition, certificateFamilyCompositionOther, documentConfirmingDisability, degreeDisability,
        degreeDisabilityIDoc, degreeDisabilityIIDoc, reasonOrphanhood, deprivationParentalCare, documentParentsUnknown,
        deathCertificateParents, deprivationParentalCareDoc2, deprivationParentalCareDoc3, deprivationParentalCareDoc4,
        deprivationParentalCareDoc5, deprivationParentalCareDoc6, deprivationParentalCareDoc7, deprivationParentalCareDoc8,
        doubleScholarship, studentLoan, studentLoanType, customPassword, previousBasicEducation, checkCustomPassword,
        entranceSubSpecialization, entranceSubSpecialty, entranceSpecialization, factorStudyAz, teachingYear,
        parent_s_docType, parent_s_actual_region, parent_s_fin, parent_s_type, parent_s_citizenshipId,
        parent_s_genderId, parent_s_actual_address, parent_s_country_code, parent_s_phone,
        parent_s_absence_reason, parent_s_confirming_document, parent_is_address_current,
        parent_s_first_name, parent_s_last_name, parent_s_father_name, parent_s_birth_date,
        parent_s_series, parent_s_number, semester, preparation_amount,

        parent_absence_reason, parent_docType, parent_actual_region, parent_fin,
        parent_type, parent_genderId, parent_actual_address, parent_phone, parent_country_code,
        parent_confirming_document, parent_s_is_address_current, parent_first_name, parent_last_name,
        parent_father_name, parent_birth_date, parent_series, parent_number, parent_citizenshipId
    } = dataForm ; 
    db.fin_data.findOne({where:{fin:parent_s_fin || ""}}).then(p_s => {
    db.fin_data.findOne({where:{fin:parent_fin || ""}}).then(p => {
    const postData = {
    globalId,
    preparation,
    factorStudyAz,
    teachingYear: teachingYear ? `${teachingYear}/${Number(teachingYear) + 1}` : null,
    entranceSubSpecialization: entranceSubSpecialization || null,
    entranceSubSpecialty: entranceSubSpecialty || null,
    entranceSpecialization: entranceSpecialization || null,
    custom_password: customPassword,
    previousBasicEducation,
    specialtyName,
    semester,
    militaryService,
    ReceptionLineId,// select (ATIS)
    EducationStageId,// select (ATIS)
    educationLevelId,// select (ATIS)
    institutionAtisId,// select (ATIS)
    entranceSpecialty,// select (ATIS)
    subordinateSpecialization,// select (ATIS)
    educationFormId,// select (ATIS)
    educationLanguageId,// select (ATIS)
    paymentTypeId, //  select (ATIS)
    educationalBaseId: basicEducation, // select (ATIS)
    previousEduStageId, // select (ATIS)
    previousEduLevelId,// select (ATIS)
    entranceSpecialtyPaymentAmount: Number(preparation) === 1 ? preparation_amount : entranceSpecialtyPaymentAmount, // int
    specialtyPassword, // int   
    specialtyDimCode, // int 
    pointsOnEntrance, // int 
    dimNo, // int 
    previousInstitutionName,
    passportScan,// file link
    scanningCertificateOfHealth,// file link
    previousEducationDocument,// file link
    previousEducationLegalizedDocument,// file link
    previousEducationTranslatedDocument,// file link
    certificateOfLanguageInstruction,// file link
    personnelRegistrationCard,// file link
    biographyDocScan,// file link
    photo3x4, // file link
    workCertificateScan,// file link
    workExperienceScan,// file link
    publishedScientificWorksScan,// file link
    publishedScientificWorkListScan,// file link
    diplomaOfHigherEducationScan,// file link
    identityDocumentScan,// file link
    diplomaOfDoctorOfPhilosophyScan,// file link              
    schoolDiplomaScan,// file link
    higherSchoolDiplomaScan,// file link
    higherVocationalEducationDiplomaScan,// file link
    secondarySpecialEducationDiplomaScan,// file link
    highEducationDiplomaScan,// file link
    equivalenceOfSpecialtyDocScan,// file link
    medicalActivityDocScan,// file link
    healthCertificateScan,// file link
    militaryRegistrationDocumentScan,// file link
    militaryIDDocumentScan, // file link
    privateDatas: {
    have_residence_permit,
    birth_certificate,
    middleName: middle_name,
    citizenshipId,
    image: (image || "").replace('data:image/jpeg;base64,', '') || null,
    first_name,
    last_name,
    father_name,
    birth_date,// date (24.07.1988)
    actual_region,
    actual_address,
    email,
    genderId, // 1 kisi, 2 qadin
    passport_series,
    passport_number: (!!passport_number ? passport_number : fin),
    citizenship, //ISO3 Country code (AZE, GEO)
    address,
    maritalStatus, // 1 evli, 2 subay, 3 nogahi pozulmus
    adress_in_foreign,
    last_live_country,//ISO3 Country code (AZE, GEO)
    phone: '+' + (country_code || "") + (phone || "")  //+994502024402
    },
    parentPrivateDatas: {
    ...(parent_s_citizenshipId <= 2 && (p_s || {}).fin ? {
    parent_s_citizenshipId,
    parent_s_confirming_document,
    parent_s_docType,
    parent_s_first_name: p_s.first_name,
    parent_s_last_name: p_s.last_name,
    parent_s_father_name: p_s.father_name,
    parent_s_birth_date: p_s.birth_date,// date (24.07.1988)
    parent_s_actual_region,
    parent_s_citizenship: p_s.citizenship, //ISO3 Country code (AZE, GEO)
    parent_s_fin,
    parent_s_series: p_s.series,
    parent_s_number: p_s.number,
    parent_s_type,  //int  1 Valideyn, 2 Himayədar, 3 Qəyyum
    parent_s_genderId, // 1 kisi, 2 qadin
    parent_s_address: p_s.address,
    parent_s_phone: parent_s_phone ? ('+' + (parent_s_country_code || "") + (parent_s_phone || "")) : null,
    parent_s_absence_reason
    } : {
    parent_s_citizenshipId,
    parent_s_confirming_document,
    parent_s_docType,
    parent_s_first_name,
    parent_s_last_name,
    parent_s_father_name,
    parent_s_birth_date,// date (24.07.1988)
    parent_s_fin,
    parent_s_series,
    parent_s_number,
    parent_s_type,  //int  1 Valideyn, 2 Himayədar, 3 Qəyyum
    parent_s_genderId, // 1 kisi, 2 qadin                          
    parent_s_phone: parent_s_phone ? ('+' + (parent_s_country_code || "") + (parent_s_phone || "")) : null,
    parent_s_absence_reason
    }),
    ...(parent_citizenshipId <= 2 && (p || {}).fin ? {
    parent_citizenshipId,
    parent_confirming_document,
    parent_absence_reason,
    parent_docType,
    parent_first_name: p.first_name,
    parent_last_name: p.last_name,
    parent_father_name: p.father_name,
    parent_birth_date: p.birth_date,// date (24.07.1988)
    parent_actual_region,
    parent_citizenship: p.citizenship, //ISO3 Country code (AZE, GEO)
    parent_fin,
    parent_series: p.series,
    parent_number: p.number,
    parent_type,  //int  1 Valideyn, 2 Himayədar, 3 Qəyyum
    parent_genderId, // 1 kisi, 2 qadin
    parent_address: p.address,
    parent_phone: (parent_country_code || parent_phone) ? ('+' + (parent_country_code || "") + (parent_phone || "")) : null
    } : {
    parent_citizenshipId,
    parent_confirming_document,
    parent_docType,
    parent_first_name,
    parent_last_name,
    parent_father_name,
    parent_birth_date,// date (24.07.1988)
    parent_fin,
    parent_series,
    parent_number,
    parent_type,  //int  1 Valideyn, 2 Himayədar, 3 Qəyyum
    parent_genderId, // 1 kisi, 2 qadin                          
    parent_phone: (parent_country_code || parent_phone) ? ('+' + (parent_country_code || "") + (parent_phone || "")) : null,
    parent_absence_reason
    }),
    },
    social_status: {
    doubleScholarship,
    studentLoan,
    studentLoanType,
    socialStep, socialDecisionReason, socialOtherDoc, description, socialDescription,
    changeName,
    territorialIntegrityDisability,
    birthCertificate,
    changeNameDoc,
    typeHeroism,
    territorialIntegrityDeath,
    militaryOperationMissing,
    militaryOperationDeath,
    degreeKinship,
    marriageCertificate,
    birthCertificateOfMartyredChild,
    certificateFamilyComposition,
    certificateFamilyCompositionOther,
    documentConfirmingDisability,
    degreeDisability,
    degreeDisabilityIDoc,
    degreeDisabilityIIDoc,
    reasonOrphanhood,
    deprivationParentalCare,
    documentParentsUnknown,
    deathCertificateParents,
    deprivationParentalCareDoc2,
    deprivationParentalCareDoc3,
    deprivationParentalCareDoc4,
    deprivationParentalCareDoc5,
    deprivationParentalCareDoc6,
    deprivationParentalCareDoc7,
    deprivationParentalCareDoc8,
    documentStatusIDP
    },
    other_documents: (other_docs || []),
    status: 1,
    fin,
    EntranceYear: teachingYear || new Date().getFullYear()
    };
    atisLogin((token) => {
    if (token) {
    const options = {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
    },
    data: postData,
    timeout: process.env.TIMEOUT || 8000,
    url: `${process.env.ATIS_HOST}/api/tq/student/application`
    };
    axios(options).then(result => {
    // console.log({ data: result.data })
    callback(true)
    }).catch(e => {
    // console.log({ error: e })
    if (Object.keys(e).length > 0)
    callback(false)
    })
    } else {
    callback(false)
    }
    });
    });
    });

}

function saveApply(status, step, dataForm, user, callback) {
    const { fin, citizenshipId } = user;
    const user_id = user.id;
    const {
        ReceptionLineId, EducationStageId, educationLevelId, institutionAtisId, entranceSpecialty, subordinateSpecialization,
        educationFormId, educationLanguageId, paymentTypeId, entranceSpecialtyPaymentAmount, specialtyPassword,
        previousEduStageId, previousEduLevelId, passportScan, scanningCertificateOfHealth, previousEducationDocument,
        previousEducationLegalizedDocument, previousEducationTranslatedDocument, certificateOfLanguageInstruction,
        personnelRegistrationCard, biographyDocScan, photo3x4, workCertificateScan, workExperienceScan, middle_name,
        publishedScientificWorksScan, publishedScientificWorkListScan, diplomaOfHigherEducationScan, customPassword,
        identityDocumentScan, diplomaOfDoctorOfPhilosophyScan, specialtyDimCode, basicEducation, pointsOnEntrance,
        dimNo, schoolDiplomaScan, higherSchoolDiplomaScan, higherVocationalEducationDiplomaScan, specialtyName,
        secondarySpecialEducationDiplomaScan, highEducationDiplomaScan, equivalenceOfSpecialtyDocScan, preparation,
        medicalActivityDocScan, healthCertificateScan, militaryRegistrationDocumentScan, militaryIDDocumentScan,
        paymentChekScan, cartType, cardBinCode, first_name, last_name, father_name, birth_date, actual_region, have_residence_permit,
        is_address_current, actual_address, n_country, email, genderId, passport_series, passport_number, country_code,
        citizenship, address, maritalStatus, adress_in_foreign, last_live_country, phone, birth_certificate, checkCustomPassword,
        socialOtherDoc, description, socialDescription, socialStep, socialDecisionReason, documentStatusIDP, militaryService,
        changeName, territorialIntegrityDisability, birthCertificate, changeNameDoc, typeHeroism, territorialIntegrityDeath,
        militaryOperationMissing, militaryOperationDeath, degreeKinship, marriageCertificate, birthCertificateOfMartyredChild,
        certificateFamilyComposition, certificateFamilyCompositionOther, documentConfirmingDisability, degreeDisability,
        degreeDisabilityIDoc, degreeDisabilityIIDoc, reasonOrphanhood, deprivationParentalCare, documentParentsUnknown,
        deathCertificateParents, deprivationParentalCareDoc2, deprivationParentalCareDoc3, deprivationParentalCareDoc4,
        deprivationParentalCareDoc5, deprivationParentalCareDoc6, deprivationParentalCareDoc7, deprivationParentalCareDoc8,
        doubleScholarship, studentLoan, studentLoanType, tur, id, previousInstitutionName, previousBasicEducation,
        parent_s_docType, parent_s_first_name, parent_s_last_name, parent_s_father_name, parent_s_birth_date,
        parent_s_actual_region, parent_s_citizenship, parent_s_fin, parent_s_series, parent_s_number, parent_s_type,
        parent_s_genderId, parent_s_actual_address, parent_s_address, parent_s_country_code, parent_s_phone,
        parent_s_absence_reason, parent_absence_reason, parent_docType, parent_first_name, parent_last_name,
        parent_father_name, parent_birth_date, parent_actual_region, parent_citizenship, parent_fin, parent_series,
        parent_number, parent_type, parent_genderId, parent_actual_address, parent_address, parent_phone,
        parent_country_code, parent_s_n_country, parent_n_country, parent_s_citizenshipId, parent_citizenshipId,
        parent_confirming_document, parent_s_confirming_document, parent_s_is_address_current, parent_is_address_current,
        entranceSubSpecialization, entranceSubSpecialty, entranceSpecialization, factorStudyAz, teachingYear, semester, preparation_amount , 
        reject_statuses , dimTUr, dimCode, diminstitutionAtisId, dimFin
    } = dataForm ;
    const EntranceYear = teachingYear || new Date().getFullYear();
    let queryString = '';
    if (citizenshipId === 1) {
    if (Number(ReceptionLineId) !== 3) {  
    queryString = db.student_appeals.findOne({attributes:['id', 'status'], 
    where:{status:{[Op.notIn]:reject_statuses}, user_id, ReceptionLineId:{[Op.ne]:3}}}) ;
    } else {        
    queryString = db.student_appeals.findOne({attributes:['id', 'status'], 
    where:{status:{[Op.notIn]:reject_statuses}, user_id, ReceptionLineId:3}}) ;
    }
    } else {
    if (Number(ReceptionLineId) > 6) {  
    queryString = db.student_appeals.findOne({attributes:['id', 'status'], 
    where:{status:{[Op.notIn]:reject_statuses}, user_id, ReceptionLineId:{[Op.gt]:6}}}) ;
    } else {  
    queryString = db.student_appeals.findOne({attributes:['id', 'status'], 
    where:{user_id, id: id || 0}}) ;
    }
    }
    queryString.then(async (apply) => {
        if ([0, 2].includes(((apply || {}).status || 0))) {
        let count = 0;
        let isFinish = false;
        if (citizenshipId !== 1 && Number(ReceptionLineId) <= 6) { 
        //year??????
        db.student_appeals.findAll({ 
        where:{ReceptionLineId, user_id, id:{[Op.ne]:id || 0}}}).then((data) => {
        count = data.length ;
        })
        //year??????  
        db.student_appeals.findAll({where:{user_id, status:13}}).then((data) => {
        count = data.length > 0;
        })
        }

        if (count < 3 && (!id || (apply || {}).id) && !isFinish) {
        //  querySync(`SELECT id FROM student_appeals WHERE status <12 and user_id=?`, [user_id]).then(apply => {
        if (apply) {
        db.dim_datas.create({tur:dimTUr, specialtyDimCode:dimCode, institutionAtisId:diminstitutionAtisId, fin:dimFin}).then(dimDatas =>{
        db.student_appeals.update({
        fin, user_id, status, step, ReceptionLineId, EducationStageId, educationLevelId, institutionAtisId, preparation,
        educationFormId, educationLanguageId, paymentTypeId, entranceSpecialtyPaymentAmount, specialtyPassword, checkCustomPassword,
        previousEduStageId, previousEduLevelId, passportScan, scanningCertificateOfHealth, previousEducationDocument,
        previousEducationLegalizedDocument, previousEducationTranslatedDocument, certificateOfLanguageInstruction,
        personnelRegistrationCard, biographyDocScan, photo3x4, workCertificateScan, workExperienceScan,
        publishedScientificWorksScan, publishedScientificWorkListScan, diplomaOfHigherEducationScan, entranceSpecialty,
        identityDocumentScan, diplomaOfDoctorOfPhilosophyScan, specialtyDimCode, basicEducation, pointsOnEntrance, factorStudyAz,
        dimNo, schoolDiplomaScan, higherSchoolDiplomaScan, higherVocationalEducationDiplomaScan, subordinateSpecialization,
        secondarySpecialEducationDiplomaScan, highEducationDiplomaScan, equivalenceOfSpecialtyDocScan, customPassword, teachingYear,
        medicalActivityDocScan, healthCertificateScan, militaryRegistrationDocumentScan, militaryIDDocumentScan, previousBasicEducation,
        paymentChekScan, cartType, cardBinCode, EntranceYear, militaryService, specialtyName, tur, previousInstitutionName,
        entranceSubSpecialization, entranceSubSpecialty, entranceSpecialization, semester, preparation_amount, update_date: new Date()
        }, {where: { id: apply.id }}).then((applyResult) => {
        if (applyResult.error) {
        callback({ error: applyResult.error });
        } else {
        db.student_appeals_private_data.update({
        fin, user_id, first_name, last_name, father_name, birth_date, actual_region, birth_certificate, have_residence_permit,
        is_address_current, actual_address, n_country, email, genderId, passport_series, passport_number,
        citizenship, address, maritalStatus, adress_in_foreign, last_live_country, phone, middle_name, country_code
        }, {where:{ student_appeal_id: apply.id }}).then((applyResult2) => {
        if (applyResult2.error) {
        callback({ error: applyResult2.error });
        } else {
        db.student_appeals_parent_data.update({
        fin, user_id, parent_s_docType, parent_s_first_name, parent_s_last_name, parent_s_father_name, parent_s_birth_date,
        parent_s_actual_region, parent_s_citizenship, parent_s_fin, parent_s_series, parent_s_number, parent_s_type,
        parent_s_genderId, parent_s_actual_address, parent_s_address, parent_s_country_code, parent_s_phone, parent_s_citizenshipId, parent_citizenshipId,
        parent_s_absence_reason, parent_absence_reason, parent_docType, parent_first_name, parent_last_name, parent_s_n_country, parent_n_country,
        parent_father_name, parent_birth_date, parent_actual_region, parent_citizenship, parent_fin, parent_series,
        parent_confirming_document, parent_s_confirming_document, parent_s_is_address_current, parent_is_address_current,
        parent_number, parent_type, parent_genderId, parent_actual_address, parent_address, parent_phone, parent_country_code
        }, {where:{ student_appeal_id: apply.id }}).then((applyResult3) => {
        if (applyResult3.error) {
        callback({ error: applyResult3.error });
        } else {
        db.student_appeals_common_data.update({
        user_id, socialOtherDoc, description, socialDescription, socialStep, socialDecisionReason,
        changeName, territorialIntegrityDisability, birthCertificate, changeNameDoc, typeHeroism, territorialIntegrityDeath,
        militaryOperationMissing, militaryOperationDeath, degreeKinship, marriageCertificate, birthCertificateOfMartyredChild,
        certificateFamilyComposition, certificateFamilyCompositionOther, documentConfirmingDisability, degreeDisability,
        degreeDisabilityIDoc, degreeDisabilityIIDoc, reasonOrphanhood, deprivationParentalCare, documentParentsUnknown,
        deathCertificateParents, deprivationParentalCareDoc2, deprivationParentalCareDoc3, deprivationParentalCareDoc4,
        deprivationParentalCareDoc5, deprivationParentalCareDoc6, deprivationParentalCareDoc7, deprivationParentalCareDoc8,
        documentStatusIDP, doubleScholarship, studentLoan, studentLoanType
        }, {where:{ student_appeal_id: apply.id }}).then((applyResult4) => {
        if (applyResult4.error) {
        callback({ error: applyResult4.error });
        } else {
        callback({ id: apply.id });
        }
        });
        }
        });
        }
        });
        }
        });
        })
        } else {
        db.student_appeals.create({
        fin, user_id, status, step, ReceptionLineId, EducationStageId, educationLevelId, institutionAtisId, preparation,
        educationFormId, educationLanguageId, paymentTypeId, entranceSpecialtyPaymentAmount, specialtyPassword, checkCustomPassword,
        previousEduStageId, previousEduLevelId, passportScan, scanningCertificateOfHealth, previousEducationDocument,
        previousEducationLegalizedDocument, previousEducationTranslatedDocument, certificateOfLanguageInstruction, customPassword,
        personnelRegistrationCard, biographyDocScan, photo3x4, workCertificateScan, workExperienceScan, semester, preparation_amount,
        publishedScientificWorksScan, publishedScientificWorkListScan, diplomaOfHigherEducationScan, entranceSpecialty,
        identityDocumentScan, diplomaOfDoctorOfPhilosophyScan, specialtyDimCode, basicEducation, pointsOnEntrance,
        dimNo, schoolDiplomaScan, higherSchoolDiplomaScan, higherVocationalEducationDiplomaScan, subordinateSpecialization,
        secondarySpecialEducationDiplomaScan, highEducationDiplomaScan, equivalenceOfSpecialtyDocScan, tur, previousBasicEducation,
        medicalActivityDocScan, healthCertificateScan, militaryRegistrationDocumentScan, militaryIDDocumentScan, teachingYear,
        paymentChekScan, cartType, cardBinCode, militaryService, EntranceYear, specialtyName, previousInstitutionName,
        entranceSubSpecialization, entranceSubSpecialty, entranceSpecialization, factorStudyAz, update_date: new Date()
        }).then((applyId) => {
        if (applyId.error) {
        callback({ error: applyId.error });
        } else {
        db.student_appeals_private_data.create({
        fin, student_appeal_id: applyId, user_id, first_name, last_name, father_name, birth_date, actual_region, have_residence_permit,
        is_address_current, actual_address, n_country, email, genderId, passport_series, passport_number, country_code,
        citizenship, address, maritalStatus, adress_in_foreign, last_live_country, phone, middle_name, birth_certificate
        }).then((r1) => {
        if (r1.error) { 
        db.student_appeals.destroy({where:{id:applyId}}).then(() => {
        callback({ error: r1.error });
        });
        //delete
        } else {
        db.student_appeals_parent_data.create({
        fin, student_appeal_id: applyId, user_id, parent_s_docType, parent_s_first_name, parent_s_last_name, parent_s_citizenshipId,
        parent_citizenshipId, parent_s_actual_region, parent_s_citizenship, parent_s_fin, parent_s_series, parent_s_number, parent_s_type,
        parent_confirming_document, parent_s_confirming_document, parent_s_is_address_current, parent_is_address_current,
        parent_s_genderId, parent_s_actual_address, parent_s_address, parent_s_country_code, parent_s_phone, parent_s_father_name,
        parent_s_absence_reason, parent_absence_reason, parent_docType, parent_first_name, parent_last_name, parent_s_birth_date,
        parent_father_name, parent_birth_date, parent_actual_region, parent_citizenship, parent_fin, parent_series, parent_country_code,
        parent_number, parent_type, parent_genderId, parent_actual_address, parent_address, parent_phone, parent_s_n_country, parent_n_country
        }).then((r2) => {
        if (r2.error) {  
        db.student_appeals.destroy({where:{id:applyId}}).then(() => {
        db.student_appeals_private_data.destroy({where:{id:r1}}).then(() => {
        callback({ error: r2.error });
        });
        });
        ///
        } else {
        db.student_appeals_common_data.create({
        student_appeal_id: applyId, user_id, socialOtherDoc, description, socialDescription, socialStep, socialDecisionReason,
        changeName, territorialIntegrityDisability, birthCertificate, changeNameDoc, typeHeroism, territorialIntegrityDeath,
        militaryOperationMissing, militaryOperationDeath, degreeKinship, marriageCertificate, birthCertificateOfMartyredChild,
        certificateFamilyComposition, certificateFamilyCompositionOther, documentConfirmingDisability, degreeDisability,
        degreeDisabilityIDoc, degreeDisabilityIIDoc, reasonOrphanhood, deprivationParentalCare, documentParentsUnknown,
        deathCertificateParents, deprivationParentalCareDoc2, deprivationParentalCareDoc3, deprivationParentalCareDoc4,
        deprivationParentalCareDoc5, deprivationParentalCareDoc6, deprivationParentalCareDoc7, deprivationParentalCareDoc8,
        documentStatusIDP, doubleScholarship, studentLoan, studentLoanType
        }).then((r3) => {
        if (r3.error) {  
        db.student_appeals.destroy({where:{id:applyId}}).then(() => {
        db.student_appeals_private_data.destroy({where:{id:r1}}).then(() => {
        db.student_appeals_parent_data.destroy({where:{id:r2}}).then(() => {
        callback({ error: r3.error });
        });
        });
        });
        } else {
        callback({ id: applyId });
        }
        });
        }
        });
        }
        });
        }
        });
        }
        } else {
        callback({ error: 'Activ müraciətiniz var!' });
        }
        //  });
        } else {
        callback({ error: 'Activ müraciətiniz var!' });
        }
    });
}

const atisLogin = (callback) => {
    const postData = querystring.stringify({
    'UserName': 'EDUMedia0508',
    'Password': 'n)/m<ySRNs7Af38n',
    'SecretKey': 'AtisI#_EB-R$T]2EKG!Key'
    });

    const options = {
    method: 'POST',
    headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: postData,
    timeout: process.env.TIMEOUT || 8000,
    url: `${process.env.ATIS_HOST}/api/tq/login`
    };

    axios(options).then(login_result => {
    //console.log('login_result: ', login_result.data)
    if (((login_result || {}).data || {}).access_token) {
    callback(((login_result || {}).data || {}).access_token);
    } else {
    callback(false);
    }
    }).catch(e => {
    console.log('login error: ', e)
    if (Object.keys(e).length > 0)
    callback(false)
    });
}
