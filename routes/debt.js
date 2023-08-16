const express = require("express") ;
const querystring = require("querystring") ;
const _ = require("lodash") ;
const axios = require("axios").default ;
const db = require('../models');
const { authenticate } = require("../middlewares/authenticate");
const { Op } = require("sequelize");



const router = express.Router();


/**
 * @api {get} /debt/payment/debt/:id debt
 * @apiName debt
 * @apiGroup debt
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
                url: `${process.env.ATIS_HOST}/api/restoration-academic-debt/student/${id}`,
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
 * @api {post} /debt/payment/sendPaymentChekScan payment send Payment Chek Scan
 * @apiName payment send Payment Chek Scan
 * @apiGroup debt
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
                url: `${process.env.ATIS_HOST}/api/restoration-academic-debt/payment/receipt`
            };
            axios(options).then((r) => {
                // console.log({ r })
                res.json(true)
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
 * @api {post} /debt/payment/get_url payment get_url
 * @apiName payment get_url
 * @apiGroup debt
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
                url: `${process.env.ATIS_HOST}/api/restoration-academic-debt/student/${id}`,
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
                        "redirectURL": "https://portal.edu.az/debt/dashboard",
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
                    url: `http://192.168.140.200:4449/initiate-payment`
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
 * @api {get} /debt/all all
 * @apiName all
 * @apiGroup debt
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

router.get('/check', authenticate, (req, res) => {  
    getAtisData(`${process.env.ATIS_HOST}/api/restoration-academic-debt/invoices?fin=${req.currentUser.fin}`, (result) => {
        db.debt.findAll({where:{user_id:req.currentUser.id, status:{[Op.ne]:7}}, order:[['id', 'DESC']]}).then(appeals => {
            let showNewApply = false;
            if (result && result.data) {
                showNewApply = (result.data.data || []).filter(e => !(appeals || []).map(a => a.invoice).includes(e.invoice)).length > 0;
            }
            res.json({
                showNewApply,
                appeals
            });
        });

    })
});


router.get('/all', authenticate, (req, res) => {
    db.debt.findAll({where:{user_id:req.currentUser.id}, order:[['id', 'DESC']]}).then(apply => {
        res.json(apply);
    });
});


router.get('/student/info', authenticate, (req, res) => {
    atisLogin((token) => {
        if (token) {
            const options = {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                data: { fin: req.currentUser.fin },
                timeout: process.env.TIMEOUT || 8000,
                url: `${process.env.ATIS_HOST}/api/student/info`
            };
            axios(options).then(result => {
                if (result && result.data && result.data.studentInfo && result.data.studentInfo[0]) {
                    const data = result.data.studentInfo[0];
                    res.json({
                        level_of_education: data.educationStage,
                        education_institution: data.institution,
                        admission_year: data.entranceYear,
                        specialty: data.specialty,
                        specialty_password: data.specialtyCode,
                        education_type: data.educationForm,
                        education_language: data.educationLanguage
                    })
                } else {
                    res.json({});
                }
            })
        } else {
            res.json({});
        }
    });
});

router.get('/invoices', authenticate, (req, res) => {
    getAtisData(`${process.env.ATIS_HOST}/api/restoration-academic-debt/invoices?fin=${req.currentUser.fin}`, (result) => {
        if (result && result.data) {  
            db.debt.findAll({where:{user_id:req.currentUser.id, status:{[Op.ne]:7}}, order:[['id', 'DESC']]}).then(appeals => {
                const data = (result.data.data || []).map(e => ({ ...e, disabled: (appeals || []).map(a => a.invoice).includes(e.invoice) }));
                res.json(data)
            });
        } else {
            res.json([]);
        }
    })
});


/**
 * @api {get} /debt/by_id/:id by_id
 * @apiName by_id
 * @apiGroup debt
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
    db.debt.findOne({where:{user_id:req.currentUser.id, id}}).then(apply => {
        res.json(apply || {});
    });
});

/**
 * @api {post} /debt/save/ save
 * @apiName Debt
 * @apiGroup debt
 * @apiPermission none
 * 
 * @apiParam (Request body) {String} dataForm.first_name <code>first_name</code>
 * @apiParam (Request body) {String} dataForm.last_name <code>last_name</code>
 * @apiParam (Request body) {String} dataForm.father_name <code>father_name</code>
 * @apiParam (Request body) {String} dataForm.birth_date <code>birth_date</code>
 * @apiParam (Request body) {String} dataForm.address <code>address</code>
 * @apiParam (Request body) {String} dataForm.is_address_current <code>is_address_current</code>
 * @apiParam (Request body) {String} dataForm.actual_address <code>actual_address</code>
 * @apiParam (Request body) {String} dataForm.country <code>country</code>
 * @apiParam (Request body) {String} dataForm.phone <code>phone</code>
 * @apiParam (Request body) {String} dataForm.email <code>email</code>
 * @apiParam (Request body) {String} dataForm.confirm_email <code>confirm_email</code>
 * @apiParam (Request body) {String} dataForm.level_of_education <code>level_of_education</code>
 * @apiParam (Request body) {String} dataForm.education_level <code>education_level</code>
 * @apiParam (Request body) {String} dataForm.education_institution <code>education_institution</code>
 * @apiParam (Request body) {String} dataForm.education_base <code>education_base</code>
 * @apiParam (Request body) {String} dataForm.admission_year <code>admission_year</code>
 * @apiParam (Request body) {String} dataForm.specialty <code>specialty</code>
 * @apiParam (Request body) {String} dataForm.specialty_password <code>specialty_password</code>
 * @apiParam (Request body) {String} dataForm.sub_specialty <code>sub_specialty</code>
 * @apiParam (Request body) {String} dataForm.specialization <code>specialization</code>
 * @apiParam (Request body) {String} dataForm.sub_specialization <code>sub_specialization</code>
 * @apiParam (Request body) {String} dataForm.education_type <code>education_type</code>
 * @apiParam (Request body) {String} dataForm.education_language <code>education_language</code>
 * 
 * @apiParamExample {json} Request-Example:
 * { "first_name": "", "last_name": "", "father_name": "", "birth_date": "", "address": "", "is_address_current": "", "actual_address": "", "country": "", "phone": "", "email": "", "confirm_email": "", "level_of_education": "", "education_level": "", "education_institution": "", "education_base": "", "admission_year": "", "specialty": "", "specialty_password": "", "sub_specialty": "", "specialization": "", "sub_specialization": "", "education_type": "", "education_language": "" }
 * @apiSampleRequest off
 */

router.post('/save', authenticate, (req, res) => {

    const { step, dataForm, status } = req.body;

    saveApply(0, step, dataForm, req.currentUser.id, (result) => {
        if (result.id) {   
            db.notifications.destroy({where:{service:"debt", fin:result.id, title:(!!status ? 1 : 0)}}).then(() => {
                db.notifications.create({service: 'debt', fin: result.id, title: !!status ? 1 : 0, description: "", extra_data: "" }).then(() => {
                    if (!!status)
                        sendRequest({
                            ...dataForm,
                            RecoveryTypes: dataForm.RecoveryType,
                            global_id: result.id,
                            fin: req.currentUser.fin,
                            user_id: req.currentUser.id,
                        }, (r) => {
                            db.debt.update({ status: 1, isSend: r ? 1 : 0 }, { where:{ id: result.id } }).then(() => {
                                res.json(result);
                            });
                        });
                    else
                        res.json(result);
                });
            });
        } else {
            res.json(result);
        }
    });
});

module.exports = router;

function saveApply(status, step, dataForm, user_id, callback) {
    const { fin, id, first_name, last_name, father_name, birth_date, address, is_address_current,
        actual_address, country, phone, email, confirm_email, level_of_education,
        education_level, education_institution, education_base, admission_year,
        specialty, specialty_password, sub_specialty, specialization, citizenship,
        sub_specialization, education_type, education_language,
        invoice, subjectName, remainDebt, invoiceCreateDate, invoiceEndDate, RecoveryType } = dataForm ;
    if (fin) {  
        db.debt.findOne({attributes:['id', 'user_id'], where:{id}}).then(debt => {
            if (debt) {
                if (Number(user_id) !== Number(debt.user_id)) {
                    callback({ error: 'Invalid user_id' });
                } else {
                    db.debt.update({status, step, first_name, last_name, father_name, birth_date, address, is_address_current, actual_address,
                        country, phone, email, confirm_email, level_of_education, education_level, education_institution,
                        education_base, admission_year, specialty, specialty_password, sub_specialty, specialization,
                        sub_specialization, education_type, education_language, fin, citizenship,
                        invoice, subjectName, remainDebt, invoiceCreateDate, invoiceEndDate, RecoveryType}, {where:{ id: debt.id }}).then(debt_update => {
                        if (debt_update.error) {
                            callback({ error: debt_update.error });
                        } else {
                            callback({ id: debt.id });
                        }
                    });
                }
            } else {
                db.debt.create({user_id, status, step, first_name, last_name, father_name, birth_date, address, is_address_current, actual_address,
                    country, phone, email, confirm_email, level_of_education, education_level, education_institution,
                    education_base, admission_year, specialty, specialty_password, sub_specialty, specialization,
                    sub_specialization, education_type, education_language, fin, citizenship,
                    invoice, subjectName, remainDebt, invoiceCreateDate, invoiceEndDate, RecoveryType}).then(applyId => {
                    if (applyId.error) {
                        callback({ error: applyId.error });
                    } else {
                        callback({ id: applyId });
                    }
                });
            }
        });
    } else {
        callback({ error: 'fin not found' });
    }
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
        //console.log('login error: ', e)
        if (Object.keys(e).length > 0)
            callback(false)
    });
}

const sendRequest = (data, callback) => {

    atisLogin((token) => {
        if (token) {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                data,
                timeout: process.env.TIMEOUT || 8000,
                url: `${process.env.ATIS_HOST}/api/restoration-academic-debt/request`
            };
            axios(options).then(result => {
                //console.log({ data: result.data })
                callback(true)
            }).catch(e => {
                //console.log({ error: e })
                if (Object.keys(e).length > 0)
                    callback(false)
            })
        } else {
            callback(false)
        }
    });
};

const getAtisData = (url, callback,) => {
    atisLogin((token) => {
        if (token) {
            axios.get(url, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            }).then(result => {
                callback(result);
            }).catch(e => {
                if (Object.keys(e).length > 0) {
                    callback(false);
                }
            })
        } else {
            callback(false);
        }
    });
}