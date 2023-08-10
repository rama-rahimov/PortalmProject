const express = require("express") ;
const db = require('../models');
const { authenticate } = require("../middlewares/authenticate.js") ;
const axios = require("axios") ;
const fs = require("fs") ;
require('dotenv').config() ; 
const { Op } = require("sequelize") ;



const router = express.Router();

/**
 * @api {get} /support/all
 * @apiName by_id
 * @apiGroup support
 * @apiPermission none
 *
 * @apiDescription destek müraciətlerini gətirir
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
    db.support_apply.findAll({where:{fin:req.currentUser.fin}, order:[['id', 'DESC']]}).then(appeals => {
        res.json(appeals);
    });
});


router.get('/status/:id/:tmsId', authenticate, (req, res) => {
    const { id, tmsId } = req.params;
    sendRequest({ username: 'portaledu', password: 'portaledu123' },
        '/Apiservice/api/Account/Authenticate', 'POST', null,
        (data) => {
            if (data && data.token) {
                sendRequest(null, `/Apiservice/api/tms/integration/GetIssues/${tmsId}`, 'GET', data.token,
                    (data2) => {
                        const s = ((data2.issues || [])[0] || {}).statusId || 0;
                        const result = ((data2.issues || [])[0] || {}).result || "";
                        const forIntegration = ((data2.issues || [])[0] || {}).forIntegration;
                        let statusDescription = ((data2.issues || [])[0] || {}).statusDescription || "";
                        let status = 0;
                        switch (s) {
                            case 1030: status = 1; statusDescription = 'Sizin müraciətiniz baxılma mərhələsindədir, araşdırıldıqdan sonra sizə geri dönüş ediləcəkdir.'; break;
                            case 1031: status = 2; break;
                            case 1035: status = 4; statusDescription = 'Müraciətinizin icrası dayandırılmışdır. Cari mövzu ilə əlaqədar yeniliklər olduğu halda yeni müraciət göndərməyiniz xahiş olunur.'; break;
                            case 1036: status = 5; statusDescription = 'Müraciətinizin icrası təxirə salınmışdır. Müraciətiniz yenidən icraata alındıqdan sonra Sizə məlumat veriləcək, eyni mövzu ilə yeni müraciətin göndərilməməsi xahiş olunur.'; break;
                            case 1037: status = 6; break;
                            case 4: status = 3; statusDescription = 'Müraciətinizin araşdırılması tamamlanmışdır.'; break;
                            default: status = s;
                        }
                        if (status && forIntegration) {  
                            db.notifications.destroy({where:{service:'support', fin:id, title:status}}).then(() => {
                                db.notifications.create({ service: 'support', fin: id, title: status, description: statusDescription, extra_data: result }).then(() => {
                                    db.support_apply.update((result ? { status, result } : { status }), {where:{ tms_id: tmsId }}).then(() => {
                                        res.json({ id: tmsId, status, isUpdate: true });
                                    });
                                });
                            });
                        } else {
                            res.json({ id, status, isUpdate: false });
                        }
                    }
                );
            } else {
                res.json(data);
            }
        }
    );
});

router.post('/getfieldvalues', /*authenticate, */(req, res) => {
    const { fieldCode, derection_type, directions, applicant, m_city } = req.body;
    sendRequest({ username: 'portaledu', password: 'portaledu123' },
        '/Apiservice/api/Account/Authenticate', 'POST', null,
        (data) => {
            if (data && data.token) {
                const requestData = {
                    fieldCode: fieldCode
                };
                if (fieldCode === "areas" && derection_type && directions && applicant) {
                    requestData.FilterFields = [{
                        filterFieldCode: "derection_type",
                        value: derection_type
                    },
                    {
                        filterFieldCode: "directions",
                        value: directions
                    },
                    {
                        filterFieldCode: "applicant",
                        value: applicant
                    }]
                } else if (fieldCode === "m_enterprise" && m_city && directions) {
                    requestData.FilterFields = [{
                        filterFieldCode: "m_city",
                        value: m_city
                    },
                    {
                        filterFieldCode: "directions",
                        value: directions
                    }];
                }
                // const 
                sendRequest(requestData, '/Apiservice/api/tms/UService/GetFieldValues/', 'POST', data.token,
                    (data2) => {
                        res.json(data2);
                    }
                );
            } else {
                res.json(data);
            }
        }
    );
});


/**
 * @api {get} /support/by_id/:id by_id
 * @apiName by_id
 * @apiGroup support
 * @apiPermission none
 *
 * @apiDescription destek müraciətini gətirir
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
        db.support_apply.findOne({where:{id, fin:req.currentUser.fin}}).then(apply => {
            if (apply) {       
                db.support_files.findAll({where:{support_apply_id:id}}).then(certificates => {
                    res.json({ ...apply, certificates });
                });
            } else {
                res.json({ error: 'support_apply not found' });
            }
        });
    } else {
        res.json({ error: 'id incorrect' });
    }
});

/**
 * @api {post} /support/save/ save
 * @apiName Save
 * @apiGroup support
 * @apiPermission none
 *
 * @apiParam (Request body) {String} dataForm.apply_type <code>apply_type</code>
 * @apiParam (Request body) {String} dataForm.education_type <code>education_type</code>
 * @apiParam (Request body) {String} dataForm.contingent <code>contingent</code>
 * @apiParam (Request body) {String} dataForm.child_citizenship <code>child_citizenship</code>
 * @apiParam (Request body) {String} dataForm.child_fin <code>child_fin</code>
 * @apiParam (Request body) {String} dataForm.child_utis_code <code>child_utis_code</code>
 * @apiParam (Request body) {String} dataForm.child_first_name <code>child_first_name</code>
 * @apiParam (Request body) {String} dataForm.child_last_name <code>child_last_name</code>
 * @apiParam (Request body) {String} dataForm.child_father_name <code>child_father_name</code>
 * @apiParam (Request body) {String} dataForm.child_birth_date <code>child_birth_date</code>
 * @apiParam (Request body) {String} dataForm.child_address <code>child_address</code>
 * @apiParam (Request body) {String} dataForm.child_is_address_current <code>child_is_address_current</code>
 * @apiParam (Request body) {String} dataForm.child_actual_address <code>child_actual_address</code>
 * @apiParam (Request body) {String} dataForm.child_city <code>child_city</code>
 * @apiParam (Request body) {String} dataForm.child_region <code>child_region</code>
 * @apiParam (Request body) {String} dataForm.child_current_enterprise <code>child_current_enterprise</code>
 * @apiParam (Request body) {String} dataForm.child_teaching_language <code>child_teaching_language</code>
 * @apiParam (Request body) {String} dataForm.child_grade <code>child_grade</code>
 * @apiParam (Request body) {String} dataForm.child_parent_type <code>child_parent_type</code>
 * @apiParam (Request body) {String} dataForm.theme <code>theme</code>
 * @apiParam (Request body) {String} dataForm.city <code>city</code>
 * @apiParam (Request body) {String} dataForm.region <code>region</code>
 * @apiParam (Request body) {String} dataForm.current_enterprise <code>current_enterprise</code>
 * @apiParam (Request body) {String} dataForm.consent <code>consent</code>
 * @apiParam (Request body) {String} dataForm.general_information <code>general_information</code>
 * @apiParam (Request body) {String} dataForm.description_application <code>description_application</code>
 * @apiParam (Request body) {String} dataForm.certificates <code>certificates</code>
 * @apiParam (Request body) {String} dataForm.citizenship <code>citizenship</code>
 * @apiParam (Request body) {String} dataForm.fin <code>fin</code>
 * @apiParam (Request body) {String} dataForm.first_name <code>first_name</code>
 * @apiParam (Request body) {String} dataForm.last_name <code>last_name</code>
 * @apiParam (Request body) {String} dataForm.father_name <code>father_name</code>
 * @apiParam (Request body) {String} dataForm.birth_date <code>birth_date</code>
 * @apiParam (Request body) {String} dataForm.address <code>address</code>
 * @apiParam (Request body) {String} dataForm.is_address_current <code>is_address_current</code>
 * @apiParam (Request body) {String} dataForm.actual_address <code>actual_address</code>
 * @apiParam (Request body) {String} dataForm.country <code>country</code>
 * @apiParam (Request body) {String} dataForm.email <code>email</code>
 * @apiParam (Request body) {String} dataForm.phone <code>phone</code>
 *
 * @apiParamExample {json} Request-Example:
 * { "apply_type": "", "education_type": "", "contingent": "", "child_citizenship": "", "child_fin": "", "child_utis_code": "", "child_first_name": "", "child_last_name": "", "child_father_name": "", "child_birth_date": "", "child_address": "", "child_is_address_current": "", "child_actual_address": "", "child_city": "", "child_region": "", "child_current_enterprise": "", "child_teaching_language": "", "child_grade": "", "child_parent_type": "", "theme": "", "city": "", "region": "", "current_enterprise": "", "consent": "", "general_information": "", "description_application": "", "certificates": "", "citizenship": "", "fin": "", "first_name": "", "last_name": "", "father_name": "", "birth_date": "", "address": "", "is_address_current": "", "actual_address": "", "country": "", "email": "", "phone": "" }
 * @apiSampleRequest off
 */

router.post('/save', authenticate, (req, res) => {

    const { step, dataForm, status } = req.body;
    const { certificates } = dataForm;

    saveApply(0, step, dataForm, req.currentUser.fin, (result) => {
        if (result.id) {               
            db.notifications.destroy({where:{service:'support', fin:result.id, title:(!!status ? 1 : 0)}}).then(() => {
                db.notifications.create({ service: 'support', fin: result.id, title: !!status ? 1 : 0, description: !!status ? 'Sizin müraciətiniz baxılma mərhələsindədir, araşdırıldıqdan sonra sizə geri dönüş ediləcəkdir.' : 'Müraciətinizin araşdırılması üçün ərizə formasında tələb olunan bütün məlumatların doldurulub, göndərilməsi tələb olunur.', extra_data: "" }).then(() => {
                    db.support_files.destroy({where:{support_apply_id:result.id}}).then(() => {
                        if (certificates) {
                            certificates.flatMap(item => {
                                item.support_apply_id = result.id ;
                            });
                            db.support_files.bulkCreate(certificates).then(() => {
                                if (!!status) {
                                    sendDataProsys(dataForm, (r) => {
                                        if ((r || {}).id) {
                                            db.support_apply.update({ tms_id: (r || {}).id, status: 1 }, {where:{ id: result.id }}).then(() => {
                                                res.json(result);
                                            });
                                        } else {
                                            res.json({ id: result.id, error: 'Müraciətiniz hazırda göndərilə bilinmədi. Bir müddət sonra təkrar yoxlayın!' });
                                        }
                                    });
                                } else {
                                    res.json(result);
                                }
                            });
                        } else {
                            if (!!status) {
                                sendDataProsys(dataForm, (r) => {
                                    if ((r || {}).id) {
                                        db.support_apply.update({ tms_id: (r || {}).id, status: 1 }, {where:{ id: result.id }}).then(() => {
                                            res.json(result);
                                        });
                                    } else {
                                        res.json({ id: result.id, error: 'Müraciətiniz hazırda göndərilə bilinmədi. Bir müddət sonra təkrar yoxlayın!' });
                                    }
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
});

module.exports = router;

function saveApply(status, step, dataForm, fin, callback) {
    const { id, apply_type, education_type, contingent, child_citizenship, child_fin, child_utis_code,
        child_first_name, child_last_name, child_father_name, child_birth_date, child_address, country_code,
        child_is_address_current, child_actual_address, child_city, child_region, child_current_enterprise,
        child_teaching_language, child_grade, child_parent_type, theme, city, region, current_enterprise, child_id,
        consent, general_information, description_application, citizenship, first_name, born_country, area_id,
        last_name, father_name, birth_date, address, is_address_current, actual_address, country, email, phone } = dataForm
    if (id) {  
        db.support_apply.findAll({attributes:['id', 'fin'], where:{id}}).then(support_app => {
            if (support_app) {
                if (Number(fin) !== Number(support_app.fin)) {
                    callback({ error: 'Invailid fin' });
                } else { 
                    db.support_apply.update({
                        status, step, apply_type, education_type, contingent, child_citizenship, child_fin, child_utis_code,
                        child_first_name, child_last_name, child_father_name, child_birth_date, child_address, country_code,
                        child_is_address_current, child_actual_address, child_city, child_region, child_current_enterprise,
                        child_teaching_language, child_grade, child_parent_type, theme, city, region, current_enterprise, area_id,
                        consent, general_information, description_application, citizenship, fin, first_name, born_country, child_id,
                        last_name, father_name, birth_date, address, is_address_current, actual_address, country, email, phone
                    }, { where:{ id } }).then((support_apply_update) => {
                        if (support_apply_update.error) {
                            callback({ error: support_apply_update.error });
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
        db.support_apply.create({
            fin, child_id, status, step, apply_type, education_type, contingent, child_citizenship, child_fin, child_utis_code,
            child_first_name, child_last_name, child_father_name, child_birth_date, child_address, country_code,
            child_is_address_current, child_actual_address, child_city, child_region, child_current_enterprise,
            child_teaching_language, child_grade, child_parent_type, theme, city, region, current_enterprise,
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




const sendRequest = (data, path, method, token, callback) => {
    //console.log('data  **** ', data);
    const headers = (token ? {
        Authorization: "Bearer " + token
    } : {});
    headers.appKey = 'TMS';
    let api;
    if (method === "GET") {
        api = axios.get(process.env.SUPPORT_HOST + path, {
            headers: headers
        });
    } else {
        api = axios.post(process.env.SUPPORT_HOST + path, data, {
            headers: headers
        });
    }
    api.then(result => {
        //console.log('result  **** ', result.data);
        callback(result.data)
    }).catch(e => {
        ////console.log('error  **** ', e);
        if ((e.response || {}).data)
            callback(e.response.data)
    });
}

const sendDataProsys = (data, callback) => {
    ////console.log('data', data)
    const fieldvalues = [
        {
            'key': 'sm_citizenship',
            'valueType': 1,
            'value': (data.citizenship === 'AZE' ? 3326 : 3327)
        },
        {
            'key': 'sm_fincode',
            'valueType': 1,
            'value': data.fin
        },
        {
            'key': 'sm_name',
            'valueType': 1,
            'value': data.first_name
        },
        {
            'key': 'sm_surname',
            'valueType': 1,
            'value': data.last_name
        },
        {
            'key': 'sm_midname',
            'valueType': 1,
            'value': data.father_name
        },
        {
            'key': 'sm_birthday',
            'valueType': 2,
            'value': data.birth_date
        },
        {
            'key': 'sm_regaddress',
            'valueType': 1,
            'value': data.address
        },
        {
            'key': 'sm_actaddress',
            'valueType': 1,
            'value': data.actual_address
        },
        {
            'key': 'sm_country',
            'valueType': 1,
            'value': data.born_country
        },
        {
            'key': 'sm_number',
            'valueType': 1,
            'value': ('+' + data.country_code + data.phone)
        },
        {
            'key': 'sm_email',
            'valueType': 1,
            'value': data.email
        },
        {
            'key': 'om_citizenship',
            'valueType': 1,
            'value': data.child_citizenship ? (data.child_citizenship === 'AZE' ? 3326 : 3327) : ""
        },
        {
            'key': 'om_fincode',
            'valueType': 1,
            'value': (data.child_fin === ('UC' + data.child_utis_code)) ? null : data.child_fin
        },
        {
            'key': 'om_utiscode',
            'valueType': 1,
            'value': data.child_utis_code
        },
        {
            'key': 'om_image',
            'valueType': 1,
            'value': null
        },
        {
            'key': 'om_name',
            'valueType': 1,
            'value': data.child_first_name
        },
        {
            'key': 'om_surname',
            'valueType': 1,
            'value': data.child_last_name
        },
        {
            'key': 'om_midname',
            'valueType': 1,
            'value': data.child_father_name
        },
        {
            'key': 'om_birthday',
            'valueType': 2,
            'value': (data.child_birth_date || "").replace(/\//g, '.')
        },
        {
            'key': 'om_regaddress',
            'valueType': 1,
            'value': data.child_address
        },
        {
            'key': 'om_actaddress',
            'valueType': 1,
            'value': data.child_actual_address
        },
        {
            'key': 'om_city',
            'valueType': 1,
            'value': data.child_city
        },
        {
            'key': 'om_area',
            'valueType': 1,
            'value': data.child_region
        },
        {
            'key': 'om_enterprise',
            'valueType': 1,
            'value': data.child_current_enterprise
        },
        {
            'key': 'om_class',
            'valueType': 1,
            'value': data.child_grade
        },
        {
            'key': 'om_language',
            'valueType': 1,
            'value': data.child_teaching_language
        },

        {
            'key': 'om_commitment',
            'valueType': 1,
            'value': data.child_parent_type ? (data.child_parent_type === "Valideyn" ? 3331 : 3332) : ""
        },
        {
            'key': 'subject',
            'valueType': 1,
            'value': data.theme
        },
        {
            'key': 'information',
            'valueType': 1,
            'value': data.general_information
        },
        {
            'key': 'body',
            'valueType': 1,
            'value': data.description_application
        },
        {
            'key': 'm_enterprise',
            'valueType': 1,
            'value': Number(data.current_enterprise) || ""
        },
        {
            'key': 'm_city',
            'valueType': 1,
            'value': data.city
        },
        {
            'key': 'directions',
            'valueType': 1,
            'value': data.education_type
        },
        {
            'key': 'applicant',
            'valueType': 1,
            'value': data.contingent
        },
        {
            'key': 'areas',
            'valueType': 1,
            'value': data.area_id
        },
        {
            'key': 'derection_type',
            'valueType': 1,
            'value': data.apply_type
        }
    ];

    const requestData = {
        'id': 0,
        'clientCode': 'TN0003',
        'categoryName': 'Cabinet',
        'subject': data.theme,
        'body': data.description_application,
        'sender': {
            name: data.first_name,
            surname: data.last_name,
            midname: data.father_name,
            country: data.born_country,
            finCode: data.fin,
            email: data.email,
            address: data.actual_address || data.address,
            phone1: data.phone ? ('+' + data.country_code + data.phone) : '-',
            city: data.region || '-'
        },
        'documents': [],
        'fieldvalues': fieldvalues.filter(data => !!data.value)
    };
    (async () => {
        const fileTokens = (data.certificates || []).map(c => (c.doc_scan || "").replace('/file/', '')).filter(c => !!c);
        if (fileTokens.length > 0)  
        db.files.findAll({where:{token:{[Op.in]:[fileTokens]}}}).then((files) => {
                files.forEach(file => {
                    (async () => {
                        await fs.readFile(file.path, { encoding: 'base64' }, (err, data) => {
                            if (!err) {
                                const conctentType = data.substr(0, 4) !== 'data' ? 'data:image/png;base64,' : '';
                                requestData.documents.push({
                                    fileName: file.name,
                                    fileContent: (conctentType + data)
                                });
                            }
                        });
                    })();
                });
            });
    })();


    sendRequest({ username: 'portaledu', password: 'portaledu123' },
        '/Apiservice/api/Account/Authenticate', 'POST', null,
        (data) => {
            if (data && data.token) {
                sendRequest(requestData, '/Apiservice/api/tms/UService/Save', 'POST', data.token,
                    (data2) => {
                        callback(data2);
                    }
                );
            } else {
                callback(data);
            }
        }
    );
}
