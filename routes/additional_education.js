const express = require("express") ;
const _ = require("lodash") ;
const db = require('../models');
const { Sequelize, Op, where } = require('sequelize');
const { atisLogin } = require("../middlewares/helper") ;
const axios = require("axios") ;
const { authenticate } = require("../middlewares/authenticate") ;


const router = express.Router();


const reject_statuses = [8, 14, 15];
const approve_statuses = [12, 13];
const finish_statuses = [...reject_statuses, ...approve_statuses];

router.get('/last_times', authenticate, (req, res) => {
    const citizenshipId = Number(req.currentUser.citizenshipId) === 1 ? 1 : 2;
    atisLogin((token) => {
    if (token) {
    const options = {
    method: 'GET',
    headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
    },
    timeout: process.env.TIMEOUT || 8000,
    url: `${process.env.ATIS_HOST}/api/tq/limit/tn/dashboard`
    };
    axios(options).then(({ data }) => {
    console.log(data);
    if (((data || {}).dashboard || []).length > 0) {
    res.json(data.dashboard.filter(l => l.educationTypeId === 2 && l.citizenShipId === citizenshipId).map(l => ({
    endDate: l.endDate,
    message_az: l.dashboardMsgAz,
    message_en: l.dashboardMsgEn
    })));
    } else {
    res.json([]);
    }
    }).catch(e => {
    console.log({ e })
    res.json([]);
    })
    }
    });
});



router.get('/activeLimits', authenticate, (req, res) => {
    const { wasReturned } = req.query;
    const citizenshipId = Number(req.currentUser.citizenshipId) === 1 ? 1 : 2;
    atisLogin((token) => {
    if (token) {
    const options = {
    method: 'GET',
    headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
    },
    timeout: process.env.TIMEOUT || 8000,
    url: `${process.env.ATIS_HOST}/api/tq/limit/tn?wasReturned=${wasReturned}`
    };
    axios(options).then(({ data }) => {
    if (((data || {}).limits || []).length > 0) {
    // console.log(data.limits);
    const arr = data.limits.filter(l => Number(l.citizenshipId) === Number(citizenshipId) && Number(l.educationTypeId) === 2)
    const response = {
    activeReceptionLines: _.uniq(arr.map(l => l.receptionLineId)),
    activeEducationStageId: _.uniq(arr.map(l => l.educationStageId)),
    activeEducationalBaseIds: _.uniq(arr.map(l => l.educationalBaseId)),
    activeEducationLevelIds: _.uniq(arr.map(l => l.educationLevelId)),
    }
    res.json(response);
    } else {
    res.json({});
    }
    }).catch(e => {
    console.log(e);
    res.json([]);
    })
    }
    });
});

/**
 * @api {get} /additional_education/by_id/:id by_id
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
    db.additional_educations.findOne({attributes:['id'], 
    where:{user_id:req.currentUser.id, id}, 
    include:[{model:db.additional_educations_private_data}]}).then(apply => {
    if (apply) {
    db.additional_educations_other_docs.findAll({
    where:{additional_education_id:id}}).then(other_docs  =>  {
    res.json({apply, other_docs}) ;
    })
    }
    else res.json({});
    });
});


/**
 * @api {post} /additional_education/payment/sendPaymentChekScan payment send Payment Chek Scan
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
    check_scan: paymentChekScan, global_id: 'A' + id
    },
    url: `${process.env.ATIS_HOST}/api/tq/student/payment/receipt`
    };
    axios(options).then(() => { 
    db.notifications.destroy({where:{service:"additional_education", fin:id, title:11}}).then(() => {  
    db.notifications.create({ service: 'additional_education', fin: id, title: 11 }).then(() => {
    db.additional_educations.update({ paymentChekScan, status: 11, payment_method: 3 }, { where:{ id } }).then(() => {
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
    url: `${process.env.ATIS_HOST}/api/debts/education-amount/first-admission/student/${'A' + id}`,
    headers: {
    Authorization: 'Bearer ' + token
    }
    }).then(post_result => {
    console.log({ post_result: post_result.data })
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
    url: `${process.env.ATIS_HOST}/api/debts/education-amount/first-admission/student/${'A' + id}`,
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
    "date": paymentDetails.createdDate || moment(new Date()).format("yyyy-mm-dd"),
    "totalAmount": paymentDetails.total_amount,
    "amount": paymentDetails.remain_debt,
    "serviceCode": paymentDetails.serviceCode,
    "paymentReceiverCode": paymentDetails.paymentReceiverCode
    }
    ]
    },
    url: `${process.env.EDUPAY_URL}/initiate-payment`
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
 * @api {get} /additional_education/all all
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
    db.additional_educations.findAll({attributes:['id', 'paymentChekScan', 
    'educationLevelId', 'reject_description', 'reject_files',
    'EducationStageId', 'institutionAtisId', 'EntranceYear', 
    'educationFormId', 'status', 'institutionAtisId', 'paymentTypeId'], 
    where:{user_id: req.currentUser.id}, order:[['id', 'DESC']]}).then(apply => {
    res.json(apply);
    });
});

/**
 * @api {get} /additional_education/check_apply check apply
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
    const citizenshipId = Number(req.currentUser.citizenshipId) === 1 ? 1 : 2;
    atisLogin((token) => {
    if (token) {
    const options = {
    method: 'GET',
    headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
    },
    timeout: process.env.TIMEOUT || 8000,
    url: `${process.env.ATIS_HOST}/api/tq/limit/tn`
    };
    axios(options).then(({ data }) => {
    if (((data || {}).limits || []).length > 0) {
    const arr = data.limits.filter(l => Number(l.citizenshipId) === Number(citizenshipId) && Number(l.educationTypeId) === 2)
    if (arr.length > 0) {
    db.additional_educations.findAll({ 
    where:{[Op.and]:[Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('create_date')), (new Date()).getFullYear()), 
    {fin:req.currentUser.fin}, {status:{[Op.notIn]:finish_statuses}}]}}).then(appeals => {
    const appealsCount = appeals.length ;
    const count = citizenshipId === 1 ? 1 : 5;
    if ((appealsCount || {}) < count) {
    res.json(true);
    } else {
    res.json(false);
    }
    });
    } else {
    res.json(false);
    }
    } else {
    res.json(false);
    }
    }).catch(() => {
    res.json(false);
    })
    } else {
    res.json(false);
    }
    });
});


/**
 * @api {post} /additional_education/save/ save
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
    const { other_docs } = dataForm;
    const lang = req.headers.language || "az";
    if ((req.currentUser.fin || "").toLowerCase() != (dataForm.fin.toLowerCase() || "").toLowerCase() || 
    (!!dataForm.first_name && (req.currentUser.first_name || "").toLowerCase() != (dataForm.first_name || "").toLowerCase()) || 
    (!!dataForm.last_name && (req.currentUser.last_name || "").toLowerCase() != (dataForm.last_name || "").toLowerCase())) {
    res.json({ error: 'Səhifəni yeniləyin', refresh: true });
    } else {
    saveApply(Number(status) === 2 ? 2 : 0, step, dataForm, req.currentUser, lang, (result) => {
    if (result.id) {
    db.notifications.destroy({where:{service:"additional_education", fin:result.id, title:(Number(status) === 1 ? 1 : 0)}}).then(() => {
    db.notifications.create({ service: 'additional_education', fin: result.id, 
    title: Number(status) === 1 ? 1 : 0, description: "", extra_data: "" }).then(() => {
    db.additional_educations_other_docs.destroy({where:{additional_education_id:result.id}}).then(() => {
    if (other_docs) {
    other_docs.flatMap(item => {
    item.additional_education_id = result.id ;
    });
    db.additional_educations_other_docs.bulkCreate(other_docs).then(() => {
    if (Number(status) === 1) {
    sendDataToATIS(dataForm, req.currentUser, result.id, (r) => {
    db.additional_educations.update({ status: (r === 0 ? 15 : 1), isSend: r ? 1 : 0 }, 
    {where:{ id: result.id }}).then(() => {
    if (r === 0)
    db.notifications.create({ service: 'additional_education', 
    fin: result.id, title: 15 }).then(() => {
    res.json({ ...result, r });
    });
    else
    res.json({ ...result, r });
    });
    }, result.aS);
    } else {
    res.json(result);
    }
    });
    } else {
    if (Number(status) === 1) {
    sendDataToATIS(dataForm, req.currentUser, result.id, (r) => {
    db.additional_educations.update({ status: (r === 0 ? 15 : 1), 
        isSend: r ? 1 : 0 }, { where:{ id: result.id } }).then(() => {
    if (r === 0)
    db.notifications.create({ service: 'additional_education', fin: result.id, title: 15 }).then(() => {
    res.json({ ...result, r });
    });
    else
    res.json({ ...result, r });
    });
    }, result.aS);
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


module.exports = router;

function sendDataToATIS(dataForm, user, globalId, callback, status = 0) {
    const { fin, citizenshipId, image } = user;
    const {
        EducationStageId, educationLevelId, institutionAtisId, entranceSpecialty, educationFormId,
        educationLanguageId, paymentTypeId, entranceSpecialtyPaymentAmount, specialtyPassword,
        previousEduStageId, previousEduLevelId, passportScan, scanningCertificateOfHealth,
        previousEducationDocument, previousEducationLegalizedDocument, previousEducationTranslatedDocument,
        certificateOfLanguageInstruction, have_residence_permit, previousInstitutionName,
        middle_name, secondarySpecialEducationDiplomaScan, equivalenceOfSpecialtyDocScan,

        first_name, last_name, father_name, birth_date, actual_region, birth_certificate,
        actual_address, email, genderId, passport_series, passport_number, other_docs, basicEducation,
        citizenship, address, maritalStatus, adress_in_foreign, last_live_country, phone, country_code,
        specialtyName, entranceSubSpecialty, factorStudyAz, teachingYear, additionalEducationTypeId,
        previousSpecialtyName, graduationYear, documentType, documentNo, previousSpecialtyCode,
        previousInstitution, previousSpecialty, admissionYear, previousBasicEducation, ReceptionLineId
    } = dataForm;
    const postData = {
        EducationTypeId: 2,
        globalId: 'A' + globalId,
        educationalBaseId: basicEducation,
        factorStudyAz,
        ReceptionLineId,
        previousSpecialtyCode,
        previousInstitution,
        previousSpecialty,
        previousBasicEducation,
        admissionYear,
        teachingYear: teachingYear ? `${teachingYear}/${Number(teachingYear) + 1}` : null,
        entranceSubSpecialty: entranceSubSpecialty || null,
        specialtyName,
        additionalEducationTypeId,
        EducationStageId,// select (ATIS)
        educationLevelId,// select (ATIS)
        institutionAtisId,// select (ATIS)
        entranceSpecialty,// select (ATIS)
        educationFormId,// select (ATIS)
        educationLanguageId,// select (ATIS)
        paymentTypeId, //  select (ATIS)
        previousEduStageId, // select (ATIS)
        previousEduLevelId,// select (ATIS)
        previousInstitutionName,
        previousSpecialtyName,
        graduationYear,
        documentType,
        documentNo,
        entranceSpecialtyPaymentAmount: Number(entranceSpecialtyPaymentAmount) > 0 ? entranceSpecialtyPaymentAmount : null, // int
        specialtyPassword, // int   
        passportScan,// file link
        scanningCertificateOfHealth,// file link
        previousEducationDocument,// file link
        previousEducationLegalizedDocument,// file link
        previousEducationTranslatedDocument,// file link
        certificateOfLanguageInstruction,// file link
        equivalenceOfSpecialtyDocScan,// file link
        secondarySpecialEducationDiplomaScan,// file link
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
        other_documents: (other_docs || []),
        status: 1,
        fin,
        EntranceYear: teachingYear || new Date().getFullYear()
    };
    atisLogin((token) => {
    if (token) {
    const checkOptions = {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
    },
    data: {
    wasReturned: status == 2 ? 1 : 0,
    EducationTypeId: 2,
    ReceptionLineId,
    Preparation: null,
    EducationalBaseId: basicEducation,
    InstitutionAtisId: institutionAtisId,
    additionalEducationTypeId,
    CitizenshipId: Number(citizenshipId) === 1 ? 1 : 2,
    EducationLevelId: educationLevelId,
    EducationStageId: EducationStageId,
    EducationYear: teachingYear || new Date().getFullYear()
    },
    timeout: process.env.TIMEOUT || 8000,
    url: `${process.env.ATIS_HOST}/api/tq/limit/param`
    };
    axios(checkOptions).then((check_result) => {
    if ((check_result.data || {}).success) {
    const options = {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
    },
    data: postData,
    url: `${process.env.ATIS_HOST}/api/tq/student/application`
    };
    axios(options).then((atisResult) => {
    console.log({ atisResult: atisResult.data })
    callback(true)
    }).catch(e => {
    console.log('atis e', { error: e })
    if (Object.keys(e).length > 0)
    callback(false)
    })
    } else {
    if ([0, 2].includes(Number((check_result.data || {}).code)))
    callback(0)
    else
    callback(false)
    }
    }).catch(e => {
    console.log('atis check e', { error: e })
    if (Object.keys(e).length > 0)
    callback(false)
    })
    } else {
    callback(false)
    }
    });

}

function saveApply(status, step, dataForm, user, lang, callback) {
    const { fin } = user;
    const user_id = user.id;
    const {
    EducationStageId, educationLevelId, institutionAtisId, entranceSpecialty, additionalEducationTypeId,
    educationFormId, educationLanguageId, paymentTypeId, entranceSpecialtyPaymentAmount, specialtyPassword,
    previousEduStageId, previousEduLevelId, passportScan, scanningCertificateOfHealth, previousEducationDocument,
    previousEducationLegalizedDocument, previousEducationTranslatedDocument, certificateOfLanguageInstruction,
    middle_name, specialtyName, secondarySpecialEducationDiplomaScan, equivalenceOfSpecialtyDocScan, previousSpecialtyCode,
    paymentChekScan, cartType, cardBinCode, first_name, last_name, father_name, birth_date, actual_region, have_residence_permit,
    is_address_current, actual_address, n_country, email, genderId, passport_series, passport_number, country_code,
    citizenship, address, maritalStatus, adress_in_foreign, last_live_country, phone, birth_certificate, ReceptionLineId,
    id, previousInstitutionName, entranceSubSpecialty, factorStudyAz, teachingYear, documentType, documentNo, basicEducation,
    previousInstitution, previousSpecialty, previousSpecialtyName, admissionYear, graduationYear, previousBasicEducation } = dataForm;
    const EntranceYear = teachingYear || new Date().getFullYear();
    // let queryString = '';
    // let queryDatas = [];
    // queryString = db.additional_educations.findOne({attributes:['id', 'status'], where:{status:{[Op.notIn]:reject_statuses}, user_id, id}}) ;
    // queryDatas = [reject_statuses, user_id, id];

    const count = user.citizenshipId === 1 ? 1 : 5 ;
    db.additional_educations.findAll({where:{status:{[Op.notIn]:reject_statuses}, user_id}}).then(check => {
    const countAdditEducat = check.length ;
    if (countAdditEducat <= count) {
    db.additional_educations.findOne({attributes:['id', 'status'], 
    where:{status:{[Op.notIn]:reject_statuses}, user_id, id}}).then(async (apply) => {
    const aS = (apply || {}).status || 0;
    if ([0, 2].includes(aS)) {
    if (!id || (apply || {}).id) {
    if (apply) {
    db.additional_educations.update({
    fin, user_id, status, step, EducationStageId, educationLevelId, institutionAtisId,
    educationFormId, educationLanguageId, paymentTypeId, entranceSpecialtyPaymentAmount,
    specialtyPassword, passportScan, scanningCertificateOfHealth, previousEducationDocument,
    previousEducationTranslatedDocument, certificateOfLanguageInstruction, secondarySpecialEducationDiplomaScan,
    equivalenceOfSpecialtyDocScan, previousEducationLegalizedDocument, additionalEducationTypeId,
    entranceSpecialty, factorStudyAz, teachingYear, previousInstitutionName, ReceptionLineId,
    graduationYear, documentType, documentNo, previousEduStageId, previousEduLevelId, basicEducation,
    paymentChekScan, cartType, cardBinCode, EntranceYear, specialtyName, previousBasicEducation,
    previousInstitution, previousSpecialty, previousSpecialtyName, admissionYear,
    entranceSubSpecialty, previousSpecialtyCode, update_date: new Date()
    }, {where:{ id: apply.id }}).then(applyResult => {
    if (applyResult.error) {
    callback({ error: applyResult.error, aS });
    } else {
    db.additional_educations_private_data.update({
    fin, user_id, first_name, last_name, father_name, birth_date, actual_region, birth_certificate, have_residence_permit,
    is_address_current, actual_address, n_country, email, genderId, passport_series, passport_number,
    citizenship, address, maritalStatus, adress_in_foreign, last_live_country, phone, middle_name, country_code
    }, { where:{ additional_education_id: apply.id } }).then(applyResult2 => {
    if (applyResult2.error) {
    callback({ error: applyResult2.error });
    } else {
    callback({ id: apply.id, aS });
    }
    });
    }
    });
    } else {
    db.additional_educations.create({
    fin, user_id, status, step, EducationStageId, educationLevelId, institutionAtisId,
    educationFormId, educationLanguageId, paymentTypeId, entranceSpecialtyPaymentAmount,
    specialtyPassword, passportScan, scanningCertificateOfHealth, previousEducationDocument,
    previousEducationTranslatedDocument, certificateOfLanguageInstruction, secondarySpecialEducationDiplomaScan,
    equivalenceOfSpecialtyDocScan, previousEducationLegalizedDocument, additionalEducationTypeId,
    entranceSpecialty, factorStudyAz, teachingYear, previousInstitutionName, ReceptionLineId,
    graduationYear, documentType, documentNo, previousEduStageId, previousEduLevelId, basicEducation,
    paymentChekScan, cartType, cardBinCode, EntranceYear, specialtyName, previousBasicEducation,
    previousInstitution, previousSpecialty, previousSpecialtyName, admissionYear,
    entranceSubSpecialty, previousSpecialtyCode, update_date: new Date()
    }).then(applyId => {
    if (applyId.error) {
    callback({ error: applyId.error });
    } else {
    db.additional_educations_private_data.create({
    fin, additional_education_id: applyId, user_id, 
    first_name, last_name, father_name, birth_date, 
    actual_region, have_residence_permit, is_address_current, 
    actual_address, n_country, email, genderId, 
    passport_series, passport_number, country_code, citizenship, 
    address, maritalStatus, adress_in_foreign, last_live_country, 
    phone, middle_name, birth_certificate
    }).then(r1 => {
    if (r1.error) { 
    db.additional_educations.destroy({where:{id:applyId}}).then(() => {
    callback({ error: r1.error });
    });
    //delete
    } else {

    callback({ id: applyId, aS });
    }
    });
    }
    });
    }
    } else {
    callback({ error: lang === "az" ? 'Aktiv  müraciətiniz var!' : 'You have an active application!' });
    }
    //  });
    } else {
    callback({ error: lang === "az" ? 'Aktiv  müraciətiniz var!' : 'You have an active application!' });
    }
    });
    } else {
    callback({ error: lang === "az" ? 'Aktiv  müraciətiniz var!' : 'You have an active application!' });
    }
    });
}