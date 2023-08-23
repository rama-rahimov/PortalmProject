const express = require("express") ;
const axios = require("axios") ;
const querystring = require("querystring") ;
const _ = require("lodash") ;
const fs = require("fs") ;
const hmacSHA512 = require('crypto-js/hmac-sha512.js') ;
const Base64 = require('crypto-js/enc-base64.js') ;
const { querySync } = require("../middlewares/db.js") ;
const { authenticate } = require("../middlewares/authenticate.js") ;
const readyDoc = require("../middlewares/edoc.js") ;
const db = require('../models');
require('dotenv').config() ;
const soap = require('soap');
const { Op, Sequelize } = require("sequelize") ;
const router = express.Router();

/*

router.get('/test', (req, res) => {
    const doc_scan = '/getfile/doc_scan~aray%C4%B1s%CC%A7%20pts%20(1)-cs347xnda2k.docx';
    const doc_scan_path = decodeURI(doc_scan).replace('/getfile/doc_scan~', '/var/www/sexsi_kabinet/api/uploads/doc_scan/')
    fs.readFile(filePath(doc_scan), { encoding: 'base64' }, (err, data) => {
        console.log({ err, data });
        if (!err) {
            const conctentType = data.substr(0, 4) !== 'data' ? 'data:image/png;base64,' : '';
            fileBase64 = (conctentType + data);
        }
        res.json(true);
    });
});*/

router.get('/test/:fin/:edu_level/:entranceYear/:direction', (req, res) => {
    const { edu_level, fin, entranceYear, direction } = req.params;
    const data = {
    fin,
    entranceYear,
    educationLevelId: edu_level,
    educationStageId: Number(direction) === 2 ? 2 : 1
    };
    getAtisData(data, (result) => {
    if (result && result.data && result.data.studentInfo && result.data.studentInfo[0]) {
    const data = result.data.studentInfo[0];
    res.json({
    country: 'AZƏRBAYCAN',
    // edu_level: data.educationLevel,
    specialty: data.specialty,
    educationForm: data.educationForm,
    paymentType: data.paymentType,
    entranceYear: data.entranceYear,
    course: data.course,
    region: data.region,///???
    grade: data.grade,///???
    educationLanguage: data.educationLanguage,
    edu_duration: data.educationDuration,
    edu_institution: data.institution,
    })

    } else {
    res.json({});
    }
    })
    });


router.get('/statistika/:p', async (req, res) => {
    const { exclude } = req.query;
    const { p } = req.params;
    let date = p.split('-')[0] || String(new Date().getDate());
    let endDate = p.split('-')[1] || '';
    let endWhere = {status:3} ;
    let extraString = [ 'edu_level', 'document_purpose', 'entranceYear', 'direction', [db.sequelize.fn("COUNT", Sequelize.col("id")), 'count']] ;

    if (date.split('.').length === 1) {
    date = String(new Date().getYear() + 1900).substring(2, 4) + '.' + String(new Date().getMonth() + 1001).substring(2, 4) + '.' + date;
    } else if (date.split('.').length === 2) {
    date = String(new Date().getYear() + 1900).substring(2, 4) + '.' + date;
    } else {
    date = date.split('.').slice(0, 3).join('.');
    

    if (endDate) {
    if (endDate.split('.').length === 1) {
    endDate = String(new Date().getYear() + 1900).substring(2, 4) + '.' + String(new Date().getMonth() + 1001).substring(2, 4) + '.' + endDate;
    } else if (endDate.split('.').length === 2) {
    endDate = String(new Date().getYear() + 1900).substring(2, 4) + '.' + endDate;
    } else {
    endDate = endDate.split('.').slice(0, 3).join('.');
    }
    let endDateChan = 20 + endDate.replaceAll('.', '-') + ' 23:59:59'  ;
    endWhere.update_date =  {[Op.lt]:endDateChan} ;
    }

    if (exclude) {
    if (exclude.includes('eduLevel')) {
    extraString.splice(0,0) ;
    }
    if (exclude.includes('entranceYear')) {
    extraString.splice(2, 2);
    }
    if (exclude.includes('purpose')) {
    extraString.splice(1, 1); 
    }
    }

    //console.log("SELECT direction" + extraString + ", count(id) AS count FROM e_documents_apply WHERE update_date >'20" + date.replace('.', '-') + " 00:00:00' " + endWhere + " AND STATUS=3 GROUP BY direction" + extraString);
    db.e_documents_apply.findAll({attributes:extraString, where:endWhere, group:['direction']}).then(result => {
    let response = `<html>
<head>
<style>
table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}
td, th {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}
tr:nth-child(even) {
  background-color: #dddddd;
}
</style>
</head>
<body>
<table>
    <tr>
        <th>İstiqamət</th>
        ${extraString.includes('document_purpose') ? '<th>Təyinatı</th>' : ''}
        ${extraString.includes('edu_level') ? '<th>Təhsil səviyyəsi</th>' : ''}
        ${extraString.includes('entranceYear') ? '<th>Qəbul ili</th>' : ''}
        <th>Sayı</th>
    </tr>`;
        (result || []).forEach((r) => {
            response += `<tr>
        <td>${(_.find(directions, (e) => e.id === Number(r.direction)) || { name: '' }).name}</td>
        ${extraString.includes('document_purpose') ? `<td>${(_.find(document_purposes, (e) => e.id === Number(r.document_purpose)) || { name: '' }).name}</td>` : ''}
        ${extraString.includes('edu_level') ? `<td>${Number(r.direction) !== 5 ? (_.find(eduLevels, (e) => e.id === Number(r.edu_level) && e.direction === Number(r.direction)) || { name: '' }).name : ''}</td>` : ''}
        ${extraString.includes('entranceYear') ? `<td>${![2, 4].includes(Number(r.direction)) ? '' : r.entranceYear}</td>` : ''}
        <td>${r.count}</td>
    </tr>
`;
        });

        response += `</table>
</body>
</html>`;

    res.send(response);

    /*res.json((result || []).map((r) => ({
    'İstiqamət': (_.find(directions, (e) => e.id === Number(r.direction)) || { name: '' }).name,
    'Təyinatı': (_.find(document_purposes, (e) => e.id === Number(r.document_purpose)) || { name: '' }).name,
    'Təhsil səviyyəsi': Number(r.direction) !== 5 ? (_.find(eduLevels, (e) => e.id === Number(r.edu_level) && e.direction === Number(r.direction)) || { name: '' }).name : '' ,
    'Qəbul ili': ![2, 4].includes(Number(r.direction)) ? '' : r.entranceYear,
    'say': r.count
    })));*/
    });
    }});

router.post('/getReferenceData', authenticate, async (req, res) => {
    const { document_purpose, edu_level, direction, entranceYear, readOnly, id } = req.body;
    let check_sql = '' ;
    let check_sql_array = [];  
    switch (Number(direction)) {                                                                                                                               
    case 1:
    check_sql =  db.e_documents_apply.findAll({attributes:[[db.sequelize.fn("COUNT", "id"), 'count'], 
    [db.sequelize.fn("SUM", db.sequelize.literal(`CASE WHEN status < 2 THEN 1 ELSE 0 END`)), 'status_count']], 
    where:{[Op.and]:[{user_id:req.currentUser.id}, {document_purpose}, {edu_level}, {direction}, {entranceYear:{[Op.is]:null}}, 
    {status:{[Op.ne]:2}},{[Op.or]:[db.sequelize.where(db.sequelize.fn("ADDDATE", "update_date" , 
    db.sequelize.literal(`INTERVAL ${Number(document_purpose === 1 ? 30 : 3000)} DAY`)< db.sequelize.fn("NOW"))), 
    {status:0}]}, {id: id ? {[Op.ne]:id} : ''}]}}) ;
    break;
    case 2:  
    check_sql =  db.e_documents_apply.findAll({attributes:[[db.sequelize.fn("COUNT", "id"), 'count']], 
    where:{[Op.and]:[{user_id:req.currentUser.id}, {document_purpose}, {edu_level}, {direction}, {entranceYear}, 
    db.sequelize.where(db.sequelize.fn("ADDDATE", "update_date" , db.sequelize.literal(`INTERVAL 30 DAY`)> db.sequelize.fn("NOW"))), 
    {status:{[Op.ne]:0}}, {id: id ? {[Op.ne]:id} : ''}]}}) ; 
    break;
    case 3:  
    check_sql =  db.e_documents_apply.findAll({attributes:[[db.sequelize.fn("COUNT", "id"), 'count']], 
    where:{[Op.and]:[{user_id:req.currentUser.id}, {document_purpose}, {edu_level}, {direction}, {entranceYear:{[Op.is]:null}}, 
    db.sequelize.where(db.sequelize.fn("ADDDATE", "update_date" , db.sequelize.literal(`INTERVAL 30 DAY`)< db.sequelize.fn("NOW"))), 
    {status:{[Op.ne]:0}}, {id: id ? {[Op.ne]:id} : ''}]}}) ;
    break;
    case 4:  
    check_sql =   db.e_documents_apply.findAll({attributes:[[db.sequelize.fn("COUNT", "id"), 'count']], 
    where:{[Op.and]:[{user_id:req.currentUser.id}, {document_purpose}, {edu_level:{[Op.is]:null}}, {direction}, {entranceYear}, 
    db.sequelize.where(db.sequelize.fn("ADDDATE", "update_date" , db.sequelize.literal(`INTERVAL 30 DAY`)> db.sequelize.fn("NOW"))), 
    {status:{[Op.ne]:0}}, {id: id ? {[Op.ne]:id} : ''}]}}) ;
    break;
    case 5:        
    check_sql = db.e_documents_apply.findAll({attributes:[[db.sequelize.fn("COUNT", "id"), 'count']], 
    where:{[Op.and]:[{user_id:req.currentUser.id}, {document_purpose}, {edu_level:{[Op.is]:null}}, {direction}, {entranceYear:{[Op.is]:null}}, 
    db.sequelize.where(db.sequelize.fn("ADDDATE", "update_date" , db.sequelize.literal(`INTERVAL 30 DAY`)> db.sequelize.fn("NOW"))), 
    {status:{[Op.ne]:0}}, {id: id ? {[Op.ne]:id} : ''}]}}) ;
    break;
    }
   
  
    check_sql.then(check => {
    if ((Number((check || {}).count) === 0 || readOnly) && (!id || check)) {
    if (Number(direction) === 1) {
    sendRequest({
    RequestKey: 'Ncs9Pheqw42bkpsfMqux03klqwjJ4bNeUNcs9Pheklqw',
    /* StatusCode: 1,
    EducationLevelCode: 7,
    PIN: '5HMC722'*/
    StatusCode: document_purpose,
    EducationLevelCode: edu_level,
    PIN: req.currentUser.fin 
    }, 'GetInfoByPIN', (r) => {
    if ((((((r.result || {}).GetInfoByPINResult || {}).ResponseDetails || {}).ResponseDetail || [])[0] || {}).Name) {
    const data = r.result.GetInfoByPINResult.ResponseDetails.ResponseDetail[0];
    res.json({
    program: (_.find(programs, (e) => e.id === Number(data.Program)) || { name: '' }).name,
    PrivateCode: data.PrivateCode,
    edu_institution: data.UniversitetName,
    country: data.CountryName,
    specialty: data.SpecialtyName,
    edu_duration: (data.StartDate && data.StartDate.getFullYear() || "") + '-' + (data.GraduateDate && data.GraduateDate.getFullYear() || "")
    });
    } else {
    res.json({});
    }
    });
    } else if ([2, 4].includes(Number(direction))) {
    getAtisData({
    fin: req.currentUser.fin,
    entranceYear,
    educationLevelId: edu_level,
    educationStageId: Number(direction) === 2 ? 2 : 1
    }, (result) => {
    if (result && result.data && result.data.studentInfo && result.data.studentInfo[0]) {
    const data = result.data.studentInfo[0];
    res.json({
    country: 'AZƏRBAYCAN',
    // edu_level: data.educationLevel,
    specialty: data.specialty,
    educationForm: data.educationForm,
    paymentType: data.paymentType,
    entranceYear: data.entranceYear,
    course: data.course,
    region: data.region,///???
    grade: data.grade,///???
    educationLanguage: data.educationLanguage,
    edu_duration: data.educationDuration,
    edu_institution: data.institution,
    })

    } else {
    res.json({});
    }
    })
    } else if (Number(direction) === 3) {
    getPTSData({
    fin: req.currentUser.fin,
    education_level: edu_level,
    type: Number(document_purpose) === 1 ? 1 : 2
    }, (result) => {
    if (((result || {}).data || {}).success) {
    const data = result.data.studentinfo;
    res.json({
    country: 'AZƏRBAYCAN',
    //  edu_level: data.education_level_name,
    specialty: data.specialty_name,
    educationForm: data.education_form,
    paymentType: data.tuition,
    entranceYear: data.admission_year,
    course: data.course,
    educationLanguage: data.teaching_language_name,
    edu_duration: data.education_duration_name,
    edu_institution: data.enterprises_name,
    })
    } else {
    res.json({});
    }
    })
    } else if (Number(direction) === 5) {
    getExamData({
    fin: req.currentUser.fin,
    }, (result) => {
    if ((((result || {}).data || {}).data || [])[0]) {
    res.json({ exam_datas: result.data.data })
    } else {
    res.json({});
    }
    })
    }
    else
    res.json({});
    } else {
    res.json({ count: Number((check || {}).count), status_count: Number((check || {}).status_count) });
    }
    });
    });

/**
 * @api {get} /e-reference/all
 * @apiName by_id
 * @apiGroup e-reference
 * @apiPermission none
 *
 * @apiDescription senedleri gətirir
 *
 * @apiHeader {String} Authorization token
 * @apiHeaderExample {Header} Header-Example
 *     "Authorization: Beare 5f048fe"
 *  
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 */

router.get('/all', authenticate, (req, res) => {
    db.e_documents_apply.findAll({where:{user_id:req.currentUser.id}, order:[['id', 'DESC']], 
    include:[{model:db.e_documents, required: false, attributes:['pdf_diplom_url', 'hash']}]}).then(appeals => {
    res.json(appeals) }) });


/**
 * @api {get} /e-reference/by_id/:id by_id
 * @apiName by_id
 * @apiGroup e-reference
 * @apiPermission none
 *
 * @apiDescription sened müraciətini gətirir
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
    db.e_documents_apply.findOne({ where:{ id,  user_id:req.currentUser.id} }).then(apply => {
    if (apply) { 
    db.e_document_files.findAll({where:{e_documents_apply_id:id}}).then(certificates => {
    res.json({ ...apply, certificates });
    });
    } else {
    res.json({ error: 'e_reference_apply not found' });
    }
    });
    } else {
    res.json({ error: 'id incorrect' });
    }
    });

/**
 * @api {post} /e-reference/save/ save
 * @apiName Save
 * @apiGroup e-reference
 * @apiPermission none
 *
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
 * @apiParam (Request body) {String} dataForm.direction <code>direction</code>
 * @apiParam (Request body) {String} dataForm.edu_level <code>edu_level</code>
 * @apiParam (Request body) {String} dataForm.document_purpose <code>document_purpose</code>
 * @apiParam (Request body) {String} dataForm.programs_type <code>programs_type</code>
 * @apiParam (Request body) {String} dataForm.reference_provided <code>reference_provided</code>
 * @apiParam (Request body) {String} dataForm.government_agency <code>government_agency</code>
 * @apiParam (Request body) {String} dataForm.program <code>program</code>
 * @apiParam (Request body) {String} dataForm.edu_institution <code>edu_institution</code>
 * @apiParam (Request body) {String} dataForm.level_of_edu <code>level_of_edu</code>
 * @apiParam (Request body) {String} dataForm.specialty <code>specialty</code>
 * @apiParam (Request body) {String} dataForm.edu_duration <code>edu_duration</code>
 *
 * @apiParamExample {json} Request-Example:
 * { "country": "", "phone": "", "first_name": "", "last_name": "", "father_name": "", "birth_date": "", "address": "", "actual_address": "", "citizenship": "", "email": "", "is_address_current": "", "fin": "", "direction": "", "edu_level": "", "document_purpose": "", "programs_type": "", "reference_provided": "", "government_agency": "", "program": "", "edu_institution": "", "level_of_edu": "", "specialty": "", "edu_duration": "" }
 * @apiSampleRequest off
 */

router.post('/save', authenticate, (req, res) => {

    const { step, dataForm, status } = req.body;
    const { certificates } = dataForm;

    saveApply(0, step, dataForm, req.currentUser.id, (result) => {
    //console.log('save end ', result)

    if (result.id)  
    db.e_document_files.destroy({where:{e_documents_apply_id:result.id}}).then(() => {
    if (certificates) {
    certificates.flatMap(item => {
    item.e_documents_apply_id =  result.id
    });
    db.e_document_files.bulkCreate(certificates).then(() => {
    sendData(status, dataForm, result.id, () => {
    res.json(result)
    });
    });
    } else {
    sendData(status, dataForm, result.id, () => {
    res.json(result);
    });
    }
    });
    else
    res.json(result);
    });
    });



module.exports = router;

function saveApply(status, step, dataForm, user_id, callback) {
    const { id, country, country_code, phone, first_name, last_name, father_name, birth_date, address, actual_address, citizenship, email,
    is_address_current, fin, direction, edu_level, document_purpose, programs_type, reference_provided, government_agency, entranceYear,
    program, edu_institution, level_of_edu, specialty, edu_duration, actual_region } = dataForm;

    if (id) {
                
    db.e_documents_apply.findOne({attributes:['id', 'user_id'], where:{id}}).then(e_reference_apply => {
    if (e_reference_apply) {
    if (Number(user_id) !== Number(e_reference_apply.user_id)) {
    callback({ error: 'Invailid user_id' });
    } else {
    db.e_documents_apply.update({status, step, country, country_code, phone, first_name, last_name, father_name, birth_date, address, actual_address, citizenship, email,
    is_address_current, fin, direction, edu_level, document_purpose, programs_type, reference_provided, government_agency,
    program, edu_institution, level_of_edu, specialty, edu_duration, actual_region, entranceYear, update_date: new Date().toISOString().slice(0, 19).replace('T', ' ')}, {where:{id}}).then(e_reference_apply_update => {
    if (e_reference_apply_update.error) {
                            callback({ error: e_reference_apply_update.error });
    } else {
    callback({ id });
    }
    });
    }
    } else {
    callback({ error: 'support apply by id not found' });
    }
    });
    } else {
        
    db.e_documents_apply.create({user_id, status, step, country, country_code, phone, first_name, last_name, father_name, birth_date, address, actual_address, citizenship, email,
    is_address_current, fin, direction, edu_level, document_purpose, programs_type, reference_provided, government_agency,
    program, edu_institution, level_of_edu, specialty, edu_duration, actual_region, entranceYear, update_date: new Date().toISOString().slice(0, 19).replace('T', ' ')}).then(applyId => {
    if (applyId.error) {
    callback({ error: applyId.error });
    } else {
    callback({ id: applyId });
    }
    });
    }
    }



function sendData(status, dataForm, id, callback) {
    if (status) {
    if (Number(dataForm.direction) === 1) {
    if (Number(dataForm.document_purpose) === 1) {
    const doc_scan = ((dataForm.certificates || [])[0] || {}).doc_scan || "";
    let ext = "";
    let fileBase64 = "";
    if (doc_scan) {
    ext = doc_scan.substr(doc_scan.lastIndexOf(".") + 1, doc_scan.length);
    }
    //const doc_scan_path = decodeURI(doc_scan).replace('/getfile/doc_scan~', '/var/www/sexsi_kabinet/api/uploads/doc_scan/')
    fs.readFile(filePath(doc_scan), { encoding: 'base64' }, (err, data) => {
    if (!err) {
    const conctentType = data.substr(0, 4) !== 'data' ? 'data:image/png;base64,' : '';
    fileBase64 = data;
    // fileBase64 = (conctentType + data);
    }
    /*console.log({
    RequestKey: 'Ncs9Pheqw42bkpsfMqux03klqwjJ4bNeUNcs9Pheklqw',
    TransactionID: id,
    PrivateCode: dataForm.PrivateCode,
    FileBase64: fileBase64,
    FileExtension: ext,
    Description: dataForm.description || ""
    });*/
    sendRequest({
    RequestKey: 'Ncs9Pheqw42bkpsfMqux03klqwjJ4bNeUNcs9Pheklqw',
    TransactionID: id,
    PrivateCode: dataForm.PrivateCode,
    FileBase64: fileBase64,
    FileExtension: ext,
    Description: dataForm.description || ""
    }, 'CreateEdocument', (r) => {
    updateStatus(id, r.result && r.result.CreateEdocumentResult && r.result.CreateEdocumentResult.Status === 200, callback, 1);
    });
    });
    } else {
    createReferencePdf(id, (docNo) => {
    updateStatus(id, docNo, callback);
    });
    }
    }
    else if ([2, 4].includes(Number(dataForm.direction))) {

    createATISReferencePdf(id, (docNo) => {
    updateStatus(id, docNo, callback);
    });
    }
    else if ([3].includes(Number(dataForm.direction))) {
    createPTSReferencePdf(id, (docNo) => {
    updateStatus(id, docNo, callback);
    });
    }
    else if ([5].includes(Number(dataForm.direction))) {
    createExamReferencePdf(id, (docNo) => {
    updateStatus(id, docNo, callback);
    });
    }
    else { 
    db.notifications.destroy({where:{service:"reference", fin:id, title:0}}).then(() => {
    db.notifications.create({service: 'reference', fin: id, title: 0, 
    description: 'Siz müraciətinizi tamamlamamısınız. Müraciətinizin qeydə alınması  üçün zəhmət olmasa müraciətinizi tamamlayın', extra_data: ""}).then(() => {
    callback(false);
    }
    )});
    }
    } else {  
    db.notifications.destroy({where:{service:"reference", fin:id, title:0}}).then(() => {
    db.notifications.create({service: 'reference', fin: id, title: 0, 
    description: 'Siz müraciətinizi tamamlamamısınız. Müraciətinizin qeydə alınması  üçün zəhmət olmasa müraciətinizi tamamlayın', extra_data: "" }).then(() => {
    callback(true);
    }
    )});
    }
    }

const updateStatus = (id, docNo, callback, status = 3) => {
    db.notifications.destroy({where:{service:"reference", fin:id, title:(docNo ? 1 : 0)}}).then(() => {
    db.notifications.create({service: 'reference', fin: id, title: !!docNo ? 1 : 0, description: !!docNo ? 'Sizin müraciətiniz qeydə alınmışdır.' 
    : 'Siz müraciətinizi tamamlamamısınız. Müraciətinizin qeydə alınması  üçün zəhmət olmasa müraciətinizi tamamlayın', extra_data: "" }).then(() => {
    if (docNo) { 
    db.e_documents_apply.update({ status, docNo: status === 1 ? null : docNo },{where:{ id }}).then(() => {
    callback(true);
    });
    } else {
    callback(false);
    }
    }
    )});
    }

const sendRequest = (data, func, callback) => {
    soap.createClient("http://127.0.0.1/getfile/wsdl~xreference.wsdl", {
    wsdl_options: {
    timeout: 18000
    }
    }, (err, client) => {
    if (client) {
    let clientFunction = null ;
    if (func === 'GetInfoByPIN') {
    clientFunction = client.GetInfoByPIN;
    } else {
    clientFunction = client.CreateEdocument
    }
    clientFunction(data, (err2, result) => {
    //console.log({ err: err2, result });
    callback({ err: err2, result });
    }, { timeout: 18000 });
    } else {
    callback({ err, result: null });
    }
    });
    }

const getAtisData = (data, callback) => {
    //const fins = ['691GQYW', '661XWP2', '', '61FYRD9'];
    //console.log(`${process.env.ATIS_HOST}/api/student/info?fin=${/*data.fin*/fins[Number(data.educationLevelId || 0)]}${data.entranceYear ? '&EntranceYear=' + data.entranceYear : ''}${data.educationLevelId ? '&EducationLevelId=' + data.educationLevelId : ''}${data.educationStageId ? '&EducationStageId=' + data.educationStageId : ''}`);
    atisLogin((token) => {
    if (token) {
    axios.post(`${process.env.ATIS_HOST}/api/student/info`, { Fin: data.fin, EntranceYear: data.entranceYear || '', 
    EducationLevelId: data.educationLevelId || '', EducationStageId: data.educationStageId || '' }, {
    headers: {
    'Authorization': 'Bearer ' + token
    }
    }).then(result => {
    //console.log(result.data)
    callback(result);
    }).catch(e => {
    console.log({ e })
    if (Object.keys(e).length > 0) {
    callback(false);
    } 
    })
    } else {
    callback(false);
    }
    });
    }

const getExamData = (data, callback) => {
    axios.post(`${process.env.EXAM_HOST}/api/exam_points`, data/*{
        "fin": "2GV5BCP"
    }*/, {
    headers: {
    'token': process.env.EXAM_TOKEN
    }
    }).then(result => {
    callback(result);
    }).catch(e => {
    console.log('getExamData response:', e.message);
    if (Object.keys(e).length > 0) {
    callback(false);
    }
    });
    }

const getPTSData = (data, callback) => {

    axios.post(`${process.env.VACANCIES_HOST}:${process.env.VACANCIES_PORT}/api/users/student/info`, data /*{
        "fin": "7M0629Y", "education_level": 1, "type": 1
    }*/, {
    headers: {
    'Authorization': 'Bearer ' + process.env.VACANCIES_TOKEN
    }
    }).then(result => {
    callback(result);
    }).catch(e => {
    if (Object.keys(e).length > 0) {
    callback(false);
    }
    });
    }

const filePath = (f) => {
    var file = f.replace('/getfile/', '').split('~');
    var up;
    if (file[3]) {
        up = './uploads/' + file[0] + '/' + file[1] + '/' + file[2] + '/' + file[3]
    } else if (file[2]) {
        up = './uploads/' + file[0] + '/' + file[1] + '/' + file[2]
    } else if (file[1]) {
        up = './uploads/' + file[0] + '/' + file[1]
    } else {
        up = './uploads/' + file[0]
    }
    return decodeURI(up);
}

function makeid(length) {
    var result = [];
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
    result.push(characters.charAt(Math.floor(Math.random() *
    charactersLength)));
    }
    return result.join('');
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
    url: `${process.env.ATIS_HOST}/api/tq/login`
    };

    axios(options).then(login_result => {
    if (((login_result || {}).data || {}).access_token) {
    callback(((login_result || {}).data || {}).access_token);
    } else {
    callback(false);
    }
    });
    }



const eduLevels = [
    {
        id: 2,
        name: 'Bakalavriat',
        direction: 1
    },
    {
        id: 3,
        name: 'Magistratura',
        direction: 1
    },
    {
        id: 7,
        name: 'F.e.d. / Doktorantura',
        direction: 1
    },
    {
        id: 1,
        name: 'Bakalavriat',
        direction: 2
    },
    {
        id: 2,
        name: 'Əsas (baza) tibb təhsili',
        direction: 2
    },
    {
        id: 3,
        name: 'Magistratura',
        direction: 2
    },
    {
        id: 4,
        name: 'Rezidentura',
        direction: 2
    },
    {
        id: 5,
        name: 'Doktorantura (Adyunktura): Fəlsəfə doktoru',
        direction: 2
    },
    {
        id: 6,
        name: 'Doktorantura (Adyunktura): Elmlər doktoru',
        direction: 2
    }
];

const document_purposes = [
    {
        id: 6,
        name: 'Məzun olmaq barədə'
    },
    {
        id: 1,
        name: 'Təhsil almaq barədə'
    },
    {
        id: 2,
        name: 'İmtahan nəticələri barədə'
    }
];

const exam_types = [
    { id: 'MİQ', name: 'Müəllimlərin İşə Qəbulu' },
    { id: 'DQ', name: 'Diaqnostik Qiymətləndirmə' },
    { id: 'DQ', name: 'Diaqnostik Qiymətləndirmə' },
    { id: 'DİQ', name: 'Direktorların İşə Qəbulu' }
];

const directions = [
    {
        id: 1,
        name: 'Xaricdə təhsil'
    },
    {
        id: 2,
        name: 'Ali təhsil'
    },
    {
        id: 3,
        name: 'Peşə təhsili'
    },
    {
        id: 4,
        name: 'Orta ixtisas təhsili'
    },
    {
        id: 5,
        name: 'Təhsil verənlər'
    },
]
const programs = [
    { id: 10, name: '2007-2015-ci illərdə Azərbaycan gənclərinin xarici ölkələrdə təhsili üzrə Dövlət Proqramı' },
    { id: 20, name: '2019-2023-cü illər üçün Azərbaycan Respublikasında ali təhsil sisteminin beynəlxalq rəqabətliliyinin artırılması üzrə Dövlət Proqramı' }
]
function createReferencePdf(id, callback) { 
    db.e_documents_apply.findOne({where:{id}, include:[{model:db.government_agencies, required:false, attributes:[['r_name', 'ga_name']]}]}).then(result => {
    if (result) {
    const reference_provided = Number(result.reference_provided) === 2 ? result.ga_name : "TƏLƏB OLUNAN YERƏ TƏQDİM EDİLMƏSİ ÜÇÜN VERİLİR.";
    sendRequest({
    RequestKey: 'Ncs9Pheqw42bkpsfMqux03klqwjJ4bNeUNcs9Pheklqw',
    /*StatusCode: 1,
    EducationLevelCode: 7,
    PIN: '5HMC722' */
    StatusCode: Number(result.document_purpose),
    EducationLevelCode: Number(result.edu_level),
    PIN: result.fin
    }, 'GetInfoByPIN', (r) => {
    if ((((((r.result || {}).GetInfoByPINResult || {}).ResponseDetails || {}).ResponseDetail || [])[0] || {}).Name) {
    const data = r.result.GetInfoByPINResult.ResponseDetails.ResponseDetail[0];
    var t = new Date().toISOString().slice(0, 10).split('-');
    genrationNumber('RX', (docNo) => {
    const hash = genrateHash(docNo);
    readyDoc({
    program: (_.find(programs, (e) => e.id === Number(data.Program)) || { name: '' }).name,
    document_purpose_type: Number(result.document_purpose),
    filename: makeid(8) + id + makeid(8),
    first_name: data.Name,
    last_name: data.Surname,
    fin: data.PIN,
    birth_date: data.BirthDate,
    direction: 'XARİCDƏ TƏHSİL',
    document_purpose: data.StatusName + ' OLMASI',
    country: data.CountryName,
    edu_level: (_.find(eduLevels, (e) => e.id === Number(data.EducationLevelCode) && e.direction === Number(result.direction)) || { name: '' }).name,
    specialty: data.SpecialtyName,
    edu_duration: (data.StartDate && data.StartDate.getFullYear() || "") + '-' + (data.GraduateDate && data.GraduateDate.getFullYear() || ""),
    reference_provided,
    edu_institution: data.UniversitetName,
    document_series_number: docNo,
    hash,
    type: Number(result.direction)
    }, (filename) => {
    if (filename) {  
    db.e_documents.findAll({where:{document_no:docNo}}).then(checkDocument => {
    var endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    var end_date = Number(result.document_purpose) !== 1 ? endDate.toISOString().split('T')[0] : '2090-01-01';
    if (checkDocument && checkDocument.id) {
    db.e_documents.update({
    fin: result.fin, diplom_cat_id: 5, document_name: 'ARAYIŞ', pdf_diplom_url: process.env.HOST + '/getfile/reference~' + filename + '.pdf', 
    img_diplom_url: process.env.HOST + '/getfile/reference~' + filename + '-0.png', hash,
    end_date,
    file_details: JSON.stringify({
    document_name: 'ARAYIŞ',
    direction: 'Xaricdə təhsil',
    document_purpose: (_.find(document_purposes, (r) => r.id === Number(result.document_purpose)) || {}).name,
    given_date: t[2] + '.' + t[1] + '.' + t[0]
    })
    }, {where:{document_no: docNo}}).then(() => {
    callback(docNo);
    });
    } else {
    db.e_documents.create({
    fin: result.fin, diplom_cat_id: 5, document_no: docNo, document_name: 'ARAYIŞ', pdf_diplom_url: process.env.HOST + '/getfile/reference~' + filename + '.pdf', 
    img_diplom_url: process.env.HOST + '/getfile/reference~' + filename + '-0.png', hash,
    end_date,
    file_details: JSON.stringify({
    document_name: 'ARAYIŞ',
    direction: 'Xaricdə təhsil',
    document_purpose: (_.find(document_purposes, (r) => r.id === Number(result.document_purpose)) || {}).name,
    given_date: t[2] + '.' + t[1] + '.' + t[0]
    })
    }).then(() => {
    callback(docNo);
    }) ;
    }
    });
    } else {
    callback(false);
    }
    })
    });
    } else {
    callback(false);
    }
    });
    } else {
    callback(false);
    }
    });
    };


function createATISReferencePdf(id, callback) {
    db.e_documents_apply.findOne({where:{id}, include:[{model:db.government_agencies, required:false, attributes:[['r_name', 'ga_name']]}]}).then(result => {
    if (result) {
    const reference_provided = Number(result.reference_provided) === 2 ? result.ga_name : "TƏLƏB OLUNAN YERƏ TƏQDİM EDİLMƏSİ ÜÇÜN VERİLİR.";
    getAtisData({
    fin: result.fin,
    entranceYear: result.entranceYear,
    educationLevelId: result.edu_level,
    educationStageId: Number(result.direction) === 2 ? 2 : 1
    }, (r) => {
    if (r && r.data && r.data.studentInfo && r.data.studentInfo[0]) {
    const data = r.data.studentInfo[0];
    var t = new Date().toISOString().slice(0, 10).split('-');
    genrationNumber('R' + (Number(result.direction) === 2 ? 'A' : 'O'), (docNo) => {
    //console.log('docNo', docNo)
    const hash = genrateHash(docNo);
    readyDoc({
    ...result,
    filename: makeid(8) + id + makeid(8),
    direction: (_.find(directions, (e) => e.id === Number(result.direction)) || { name: '' }).name,
    document_purpose: (_.find(document_purposes, (r) => r.id === Number(result.document_purpose)) || {}).name,
    country: 'AZƏRBAYCAN',
    edu_level: data.educationLevel,
    specialty: data.specialty,
    educationForm: data.educationForm,
    paymentType: data.paymentType,
    entranceYear: data.entranceYear,
    course: data.course,
    region: data.region,///???
    grade: data.grade,///???
    educationLanguage: data.educationLanguage,
    edu_duration: data.educationDuration,
    reference_provided,
    edu_institution: data.institution,
    document_series_number: docNo,
    hash,
    type: Number(result.direction)
    }, (filename) => {
    if (filename) {  
    db.e_documents.findAll({where:{document_no:docNo}}).then(checkDocument => {
    var endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    var end_date = endDate.toISOString().split('T')[0];
    if (checkDocument && checkDocument.id) {
    db.e_documents.update({
    fin: result.fin, diplom_cat_id: 5, document_name: 'ARAYIŞ', pdf_diplom_url: process.env.HOST + '/getfile/reference~' + filename + '.pdf',
    img_diplom_url: process.env.HOST + '/getfile/reference~' + filename + '-0.png', hash,
    end_date,
    file_details: JSON.stringify({
    document_name: 'ARAYIŞ',
    direction: (_.find(directions, (e) => e.id === Number(result.direction)) || { name: '' }).name,
    document_purpose: (_.find(document_purposes, (r) => r.id === Number(result.document_purpose)) || {}).name,
    given_date: t[2] + '.' + t[1] + '.' + t[0]
    })
    }, {where:{ document_no: docNo }}).then(() => {
    callback(docNo);
    });
    } else {
    db.e_documents.create({
    fin: result.fin, diplom_cat_id: 5, document_no: docNo, document_name: 'ARAYIŞ', pdf_diplom_url: process.env.HOST + '/getfile/reference~' + filename + '.pdf', 
    img_diplom_url: process.env.HOST + '/getfile/reference~' + filename + '-0.png', hash,
    end_date,
    file_details: JSON.stringify({
    document_name: 'ARAYIŞ',
    direction: (_.find(directions, (e) => e.id === Number(result.direction)) || { name: '' }).name,
    document_purpose: (_.find(document_purposes, (r) => r.id === Number(result.document_purpose)) || {}).name,
    given_date: t[2] + '.' + t[1] + '.' + t[0]
    })
    }).then(() => {
    callback(docNo);
    });
    }
    });
    } else {
    callback(false);
    }
    })
    })
    } else {
    callback(false);
    }
    });
    } else {
    callback(false);
    }
    });
    };



function createPTSReferencePdf(id, callback) {  
    db.e_documents_apply.findOne({where:{id}, include:[{model:db.government_agencies, required:false, attributes:[['r_name', 'ga_name']]}]}).then(result => {
    if (result) {
    const reference_provided = Number(result.reference_provided) === 2 ? result.ga_name : "TƏLƏB OLUNAN YERƏ TƏQDİM EDİLMƏSİ ÜÇÜN VERİLİR.";
    getPTSData({
    fin: result.fin,
    education_level: result.edu_level,
    type: Number(result.document_purpose) === 1 ? 1 : 2
    }, (apiResult) => {
    if (((apiResult || {}).data || {}).success) {
    const data = apiResult.data.studentinfo;
    var t = new Date().toISOString().slice(0, 10).split('-');
    genrationNumber('RP', (docNo) => {
    const hash = genrateHash(docNo);
    readyDoc({
    ...result,
    filename: makeid(8) + id + makeid(8),
    direction: (_.find(directions, (e) => e.id === Number(result.direction)) || { name: '' }).name,
    document_purpose: (_.find(document_purposes, (r) => r.id === Number(result.document_purpose)) || {}).name,
    country: 'AZƏRBAYCAN',
    edu_level: data.education_level_name,
    specialty: data.specialty_name,
    educationForm: data.education_form,
    paymentType: data.tuition,
    entranceYear: data.admission_year,
    course: data.course,
    educationLanguage: data.teaching_language_name,
    edu_duration: data.education_duration_name,
    edu_institution: data.enterprises_name,
    reference_provided,
    document_series_number: docNo,
    hash,
    type: Number(result.direction)
    }, (filename) => {
    if (filename) {  
    db.e_documents.findAll({where:{document_no:docNo}}).then(checkDocument => {
    var endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    var end_date = endDate.toISOString().split('T')[0];

    if (checkDocument && checkDocument.id) {
    db.e_documents.update({
    fin: result.fin, diplom_cat_id: 5, document_name: 'ARAYIŞ', pdf_diplom_url: process.env.HOST + '/getfile/reference~' + filename + '.pdf', 
    img_diplom_url: process.env.HOST + '/getfile/reference~' + filename + '-0.png', hash,
    end_date,
    file_details: JSON.stringify({
    document_name: 'ARAYIŞ',
    direction: 'Peşə təhsili',
    document_purpose: (_.find(document_purposes, (r) => r.id === Number(result.document_purpose)) || {}).name,
    given_date: t[2] + '.' + t[1] + '.' + t[0]
    })
    }, {where:{ document_no: docNo }}).then(() => {
    callback(docNo);
    });
    } else {
    db.e_documents.create({
    fin: result.fin, diplom_cat_id: 5, document_no: docNo, document_name: 'ARAYIŞ', pdf_diplom_url: process.env.HOST + '/getfile/reference~' + filename + '.pdf', 
    img_diplom_url: process.env.HOST + '/getfile/reference~' + filename + '-0.png', hash,
    end_date,
    file_details: JSON.stringify({
    document_name: 'ARAYIŞ',
    direction: 'Peşə təhsili',
    document_purpose: (_.find(document_purposes, (r) => r.id === Number(result.document_purpose)) || {}).name,
    given_date: t[2] + '.' + t[1] + '.' + t[0]
    })
    }).then(() => {
        callback(docNo);
    });
    }
    });
    } else {
        callback(false);
    }
    })
    })
    } else {
    callback(false);
    }
    });
    } else {
    callback(false);
    }
    });
    };


function createExamReferencePdf(id, callback) {
    db.e_documents_apply.findOne({where:{id}, 
    include:[{model:db.government_agencies, required:false, attributes:[['r_name', 'ga_name']]}]}).then(result => {
    if (result) {
    //console.log('start result', result);
    const reference_provided = Number(result.reference_provided) === 2 ? result.ga_name : "TƏLƏB OLUNAN YERƏ TƏQDİM EDİLMƏSİ ÜÇÜN VERİLİR.";
    getExamData({
    fin: result.fin
    }, (apiResult) => {
    if ((((apiResult || {}).data || {}).data || [])[0]) {

    const exam_datas = apiResult.data.data;
    //console.log('start exam_datas', exam_datas);
    var t = new Date().toISOString().slice(0, 10).split('-');
    genrationNumber('RH', (docNo) => {
    const hash = genrateHash(docNo);
    readyDoc({
    ...result,
    filename: makeid(8) + id + makeid(8),
    document_purpose: (_.find(document_purposes, (r) => r.id === Number(result.document_purpose)) || {}).name,
    direction: (_.find(directions, (e) => e.id === Number(result.direction)) || { name: '' }).name,
    country: 'AZƏRBAYCAN',
    reference_provided,
    document_series_number: docNo,
    exam_datas: exam_datas.map(e => ({ ...e, type: (_.find(exam_types, (r) => r.id === e.exam_id) || {}).name })),
    hash,
    type: Number(result.direction)
    }, (filename) => {
    //console.log('start filename', filename);
    if (filename) { 
    db.e_documents.findAll({where:{document_no:docNo}}).then(checkDocument => {
    var endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    var end_date = endDate.toISOString().split('T')[0];

    if (checkDocument && checkDocument.id) {
    db.e_documents.update({
    fin: result.fin, diplom_cat_id: 5, document_name: 'ARAYIŞ', pdf_diplom_url: process.env.HOST + '/getfile/reference~' + filename + '.pdf', 
    img_diplom_url: process.env.HOST + '/getfile/reference~' + filename + '-0.png', hash,
    end_date,
    file_details: JSON.stringify({
    document_name: 'ARAYIŞ',
    direction: 'İnsan resursları',
    document_purpose: (_.find(document_purposes, (r) => r.id === Number(result.document_purpose)) || {}).name,
    given_date: t[2] + '.' + t[1] + '.' + t[0]
    })
    }, {where:{ document_no: docNo }}).then(() => {
    callback(docNo);
    });
    } else {
    db.e_documents.create({
    fin: result.fin, diplom_cat_id: 5, document_no: docNo, document_name: 'ARAYIŞ', pdf_diplom_url: process.env.HOST + '/getfile/reference~' + filename + '.pdf', 
    img_diplom_url: process.env.HOST + '/getfile/reference~' + filename + '-0.png', hash,
    end_date,
    file_details: JSON.stringify({
    document_name: 'ARAYIŞ',
    direction: 'İnsan resursları',
    document_purpose: (_.find(document_purposes, (r) => r.id === Number(result.document_purpose)) || {}).name,
    given_date: t[2] + '.' + t[1] + '.' + t[0]
    })
    }).then(() => {
    callback(docNo);
    });
    }
    });
    } else {
    callback(false);
    }
    })
    })
    } else {
    callback(false);
    }
    });
    } else {
    callback(false);
    }
    });
    };


function genrateHash(docNo) {
return Base64.stringify(hmacSHA512(docNo, process.env.DiplomPrivateKey));
//return crypto.createHmac('sha256', process.env.DiplomPrivateKey).update(genrateDocNo(id)).digest("base64");
}

function genrationNumber(s, callBack) {
querySync(`SELECT getRandomDocNo(?) AS docNo`, [s]).then((result) => {
callBack(result.docNo);
});
}


