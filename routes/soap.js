const _ = require('lodash');
const moment = require('moment');
const db = require('../models');
const { querySyncForMap } = require('../middlewares/db');
const { authenticate, ipLimit } = require('../middlewares/authenticate');
const { recaptcha2verify } = require('../middlewares/helper');

const soap = require('soap');
const axios = require('axios');
const express = require('express');

const router = express.Router();

router.post('/iamas', ipLimit('iamas'), (req, res) => {
  const { pin, birthdate, recaptcha_token } = req.body;
  if (pin) {
  recaptcha2verify(
  recaptcha_token,
  (success) => {
  if (success) {
  updateFinData(pin, birthdate, (data) => {
  res.json(data);
  });
  } else {
  res.json({ err: 'Captcha xətası!', captcha_error: true });
  }
  },
  ''
  );
  } else {
  res.json({ err: 'Fini daxil edin!' });
  }
});

router.get('/iamas_update/:pin', authenticate, (req, res) => {
  const { pin } = req.params;
  const isAdmin = Number(req.currentUser.role) === 10;
  
  if (pin && (isAdmin || req.currentUser.fin === pin)) {
  db.fin_data
  .findOne({ attributes: ['fin', 'birth_date'], where: { fin: pin } })
  .then((check_fin) => {
  if (check_fin) {
  const birth_date = check_fin.birth_date || '' ;
  updateFinData(pin, birth_date, (data) => {
  res.json(data);
  });
  } else {
  res.json({ err: 'Fini düzgün daxil edin!' });
  }
  });
  } else {
  res.json({ err: 'Fini düzgün daxil edin!' });
  }
});

router.post('/miqration', ipLimit('miqration'), (req, res) => {
  const { pin, docType, recaptcha_token } = req.body;
  const iamasDocType = docType === 'DYİ' ? 'PRC' : 'TRC';
  if (pin) {
  recaptcha2verify(
  recaptcha_token,
  (success) => {
  if (success) {
  midRequest('/getDMXIssuedDocumentList', { pin }, (result) => {
  const data = _.find( 
  result.data || [],
  (d) =>
  d.active && (d.document || {}).documentType === iamasDocType
  );
  if (data) {
  db.fin_data
  .findOne({ attributes: ['fin'], where: { fin: pin } })
  .then((check_fin) => {
  const image = data.image;
  const address = data.address || {};
  const newData = {
  first_name: data.person.givenName || ' --- ',
  last_name: data.person.surname || ' --- ',
  father_name: ' --- ',
  born_country: data.person.birthCountry.nameAz,
  birth_date: data.person.birthDate.date
  ? moment(data.person.birthDate.date).format('DD.MM.YYYY')
  : null,
  citizenship: (data.nationality || {}).code3a || '',
  address:
  (address.regionName || '') + (address.street || ''),
  gender:
  (data.person.sex || '').toLowerCase() === 'male'
  ? 'Kişi'
  : 'Qadın',
  exp_date: ((data.document || {}).expire || {}).date
  ? moment(
  ((data.document || {}).expire || {}).date
  ).format('DD.MM.YYYY')
  : null,
  giving_date: ((data.document || {}).issuingDate || {})
  .issuing
  ? moment(
  ((data.document || {}).issuingDate || {}).issuing
  ).format('DD.MM.YYYY')
  : null,
  image: image ? `data:image/jpeg;base64,${image}` : null,
  series: docType,
  number: data.document.documentNumber,
  };
  if (!check_fin) {
  db.fin_data
  .create({ ...newData, fin: pin })
  .then((fin_data) => {
  if (fin_data.error) {
  res.json({ err: 'Fini düzgün daxil edin!1' });
  } else {
  res.json({
  err: '',
  soapdata: {
  pin,
  name:
  (newData.first_name || '').substr(0, 2) +
  'XXXXXX',
  surname:
  (newData.last_name || '').substr(0, 2) +
  'XXXXXX',
  fathername:
  (newData.father_name || '').substr(0, 2) +
  'XXXXXX',
  birthDate: newData.birth_date || '',
  addressPlace:
  (newData.address || '').substr(0, 4) +
  'XXXXXXXXXX',
  gender: newData.gender,
  series: newData.seria,
  seriesnumber:
  (newData.number || '').substr(0, 2) + 'XXXXXX',
  },
  });
  }
  });
  } else {
  db.fin_data
  .update(newData, { where: { fin: pin } })
  .then((fin_data) => {
  if (fin_data.error) {
  res.json({ err: 'Fini düzgün daxil edin!2' });
  } else {
  res.json({
  err: '',
  soapdata: {
  pin,
  name:
  (newData.first_name || '').substr(0, 2) +
  'XXXXXX',
  surname:
  (newData.last_name || '').substr(0, 2) +
  'XXXXXX',
  fathername:
  (newData.father_name || '').substr(0, 2) +
  'XXXXXX',
  birthDate: newData.birth_date || '',
  addressPlace:
  (newData.address || '').substr(0, 4) +
  'XXXXXXXXXX',
  gender: newData.gender,
  series: newData.seria,
  seriesnumber:
  (newData.number || '').substr(0, 2) + 'XXXXXX',
  },
  });
  }
  });
  }
  });
  } else {
  res.json({ err: 'Fin düzgün daxil edin!3' });
  }
  });
  } else {
  res.json({ err: 'Captcha xətası!', captcha_error: true });
  }
  },
  ''
  );
  } else {
  res.json({ err: 'Fini daxil edin!' });
  }
});

router.get('/mig', authenticate, (req, res) => {
  const { fin } = req.currentUser;
  midLogin((token) => {
  if (token) {
  let count = 0;
  let sosial = [];
  let sosialStatus = '';
  let work_list = [];
  midRequestWithToken(
  '/getActiveContractsDetailByPin',
  { SEARCH_PIN: fin },
  token,
  (result) => {
  count++;
  if ((result.data || []).length > 0) {
  querySyncForMap(`SELECT * FROM activity_sections`).then(
  (activity_sections) => {
  querySyncForMap(`SELECT * FROM employments`).then(
  (employments) => {
  work_list = result.data.map((r) => {
  const ac =
  _.find(
  activity_sections,
  (e) => e.Id === Number(r.ACTIVITY_SECTION_3)
  ) || {};
  const em =
  _.find(
  employments,
  (e) =>
  e.id_3 === Number(r.EMPLOYMENT_CLASSIFICATION_3)
  ) || {};
  return {
  employer: r.EMPLOYER_NAME,
  position: r.POSITION_MANUAL,
  area_of_activity: ac.value || em.name_3 || r.WORKPLACE,
  start_date: r.CON_BEGIN_DATE
  ? moment(r.CON_BEGIN_DATE).format('DD.MM.YYYY')
  : null,
  end_date: r.TERMİNATE_DATE
  ? moment(r.TERMİNATE_DATE).format('DD.MM.YYYY')
  : null,
  work_type:
  Number(r.WORKPLACE_TYPE) === 1
  ? 'Əsas iş yeri'
  : 'Əlava iş yeri',
  work_type_id: Number(r.WORKPLACE_TYPE),
  };
  });
  if (count >= 5) {
  res.json({ sosialStatus, work_list });
  }
  }
  );
  }
  );
  } else {
  if (count >= 5) {
  res.json({ sosialStatus, work_list });
  }
  }
  }
  );
  //getSosialPaymentsByPin   //??????
  /* midRequestWithToken('/getSosialPaymentsByPin', { 'SEARCH_PIN': fin }, token, (response) => {
  count++;
  if ((response.data || []).length > 0) {
 
  var data = response.data
 
  var found = _.some(data, (item) => Number(item.allowanceTypeId) === 110401);
 
  if (found) {
  sosial.push(9);
  sosialStatus = sosial.join(', ');
  }
  if (count >= 6) {
  res.json({ sosialStatus, work_list });
  }
  } else {
  if (count >= 6) {
  res.json({ sosialStatus, work_list });
  }
  }
  });*/

  midRequestWithToken(
  '/getSPMartyrByPIN',
  { SEARCH_PIN: fin },
  token,
  (response) => {
  count++;
  if ((response.data.data || []).length > 0) {
  sosial.push(5);
  sosialStatus = sosial.join(', ');
  }
  if (count >= 5) {
  res.json({ sosialStatus, work_list });
  }
  }
  );

  midRequestWithToken(
  '/getSocialsDetailByPin',
  { SEARCH_PIN: fin },
  token,
  (response) => {
  count++;
  if ((response.data || []).length > 0) {
  sosial.push(6);
  sosialStatus = sosial.join(', ');
  }
  if (count >= 5) {
  res.json({ sosialStatus, work_list });
  }
  }
  );
  midRequestWithToken(
  '/getDisabilityDetailByPin',
  { SEARCH_PIN: fin },
  token,
  (response) => {
  count++;
  if ((response.data || []).length > 0) {
  sosial.push(response.data[0].DISABILITY_ID);
  sosialStatus = sosial.join(', ');
  }
  if (count >= 5) {
  res.json({ sosialStatus, work_list });
  }
  }
  );
  midRequestWithToken(
  '/getIDPCardInfo',
  { pin: fin },
  token,
  (response) => {
  count++;
  if (Object.keys(response.data || {}).length > 1) {
  sosial.push(4);
  sosialStatus = sosial.join(', ');
  }
  if (count >= 5) {
  res.json({ sosialStatus, work_list });
  }
  }
  );
  } else {
  res.json({ err: 'Məlumat tapılmadı!' });
  }
  });
});

router.get('/getSocialsDetailByPin', authenticate, (req, res) => {
  const { fin } = req.currentUser;
  midRequest('/getSocialsDetailByPin', { SEARCH_PIN: fin }, (response) => {
  if ((response.data || []).length > 0) {
  res.json({
  success: true,
  data: response.data,
  });
  } else {
  res.json({
  success: false,
  });
  }
  });
});

router.get('/getDisabilityDetailByPin', authenticate, (req, res) => {
  const { fin } = req.currentUser;
  midRequest('/getDisabilityDetailByPin', { SEARCH_PIN: fin }, (response) => {
  if ((response.data || []).length > 0) {
  res.json({
  success: true,
  data: response.data,
  });
  } else {
  res.json({
  success: false,
  });
  }
  });
});

router.get('/getIDPCardInfo', authenticate, (req, res) => {
  const { fin } = req.currentUser;
  midRequest('/getIDPCardInfo', { pin: fin }, (response) => {
  if (Object.keys(response.data || {}).length > 1) {
  res.json({
  success: true,
  data: response.data,
  });
  } else {
  res.json({
  success: false,
  });
  }
  });
});

router.get('/getSPMartyrByPIN', authenticate, (req, res) => {
  const { fin } = req.currentUser;
  midRequest('/getSPMartyrByPIN', { SEARCH_PIN: fin }, (response) => {
  if (((response.data || {}).data || []).length > 0) {
  res.json({
  success: true,
  data: (response.data || {}).data,
  });
  } else {
  res.json({
  success: false,
  });
  }
  });
});

router.get('/activeContracts', authenticate, (req, res) => {
  const { fin } = req.currentUser;
  midRequest(
  '/getActiveContractsDetailByPin',
  { SEARCH_PIN: fin },
  (result) => {
  if ((result.data || []).length > 0) {
  querySyncForMap(`SELECT * FROM activity_sections`).then(
  (activity_sections) => {
  querySyncForMap(`SELECT * FROM employments`).then((employments) => {
  work_list = result.data.map((r) => {
  const ac =
  _.find(
  activity_sections,
  (e) => e.Id === Number(r.ACTIVITY_SECTION_3)
  ) || {};
  const em =
  _.find(
  employments,
  (e) => e.id_3 === Number(r.EMPLOYMENT_CLASSIFICATION_3)
  ) || {};
  return {
  employer: r.EMPLOYER_NAME,
  position: r.POSITION_MANUAL,
  area_of_activity: ac.value || em.name_3 || r.WORKPLACE,
  start_date: r.CON_BEGIN_DATE
  ? moment(r.CON_BEGIN_DATE).format('DD.MM.YYYY')
  : null,
  end_date: r.TERMİNATE_DATE
  ? moment(r.TERMİNATE_DATE).format('DD.MM.YYYY')
  : null,
  work_type:
  Number(r.WORKPLACE_TYPE) === 1
  ? 'Əsas iş yeri'
  : 'Əlava iş yeri',
  work_type_id: Number(r.WORKPLACE_TYPE),
  };
  });
  res.json({ success: true, data: work_list });
  });
  }
  );
  } else {
  res.json({ success: false });
  }
  }
  );
});

router.get('/allContracts', authenticate, (req, res) => {
  const { fin } = req.currentUser;
  midRequest('/getAllContractsDetailByPin', { SEARCH_PIN: fin }, (result) => {
  if ((result.data || []).length > 0) {
  querySyncForMap(`SELECT * FROM activity_sections`).then(
  (activity_sections) => {
  querySyncForMap(`SELECT * FROM employments`).then((employments) => {
  work_list = result.data.map((r) => {
  const ac =
  _.find(
  activity_sections,
  (e) => e.Id === Number(r.ACTIVITY_SECTION_3)
  ) || {};
  const em =
  _.find(
  employments,
  (e) => e.id_3 === Number(r.EMPLOYMENT_CLASSIFICATION_3)
  ) || {};
  return {
  employer: r.EMPLOYER_NAME,
  position: r.POSITION_MANUAL,
  area_of_activity: ac.value || em.name_3 || r.WORKPLACE,
  start_date: r.CON_BEGIN_DATE
  ? moment(r.CON_BEGIN_DATE).format('DD.MM.YYYY')
  : null,
  end_date: r.TERMİNATE_DATE
  ? moment(r.TERMİNATE_DATE).format('DD.MM.YYYY')
  : null,
  work_type:
  Number(r.WORKPLACE_TYPE) === 1
  ? 'Əsas iş yeri'
  : 'Əlava iş yeri',
  work_type_id: Number(r.WORKPLACE_TYPE),
  };
  });
  res.json({ success: true, data: work_list });
  });
  }
  );
  } else {
  res.json({ success: false });
  }
  });
});

router.post('/umumtehsil', authenticate, (req, res) => {
  const { pin } = req.body;
  if (pin) {
  (async () => {
  await soap.createClient(
  'http://127.0.0.1/getfile/wsdl~umumitehsil.wsdl',
  { wsdl_options: { timeout: 18000 } },
  async (err, client) => {
  if (client) {
  await client.getStudEduDocByPin(
  { pin: String(pin) },
  async (err2, result) => {
  if (
  result &&
  result.return &&
  (result.return || {}).eduDoc &&
  result.return.eduDoc.schoolName &&
  result.return.eduDoc.schoolName != '0'
  ) {
  //if (result.return.eduDoc.schoolName) {
  res.json(result.return);
  //}
  } else {
  res.json({ err: 'Məlumat tapılmadı!' });
  }
  },
  { timeout: 18000 }
  );
  } else {
  res.json({ err: 'Məlumat tapılmadı!' });
  }
  }
  );
  })();
  } else {
  res.json({ err: 'Fin düzgün daxil edin!' });
  }
});

router.get('/getAllSchoolInfo', authenticate, (req, res) => {
  soap.createClient(
  'http://127.0.0.1/getfile/wsdl~allschools.wsdl',
  { wsdl_options: { timeout: 18000 } },
  (err, client) => {
  if (client) {
  client.getAllSchoolInfo({}, (err2, result) => {
  if (result && result.return) {
  res.json(result.return.schools);
  } else {
  res.json({ err: 'Məlumat tapılmadı!2' });
  }
  });
  } else {
  res.json({ err: 'Məlumat tapılmadı!' });
  }
  }
  );
});

router.post('/utis', authenticate, (req, res) => {
  const { pin, utisCode, recaptcha_token, isOlympiad } = req.body;
  if (pin || utisCode) {
  recaptcha2verify(
  recaptcha_token,
  (success) => {
  if (success) {
  soap.createClient(
  'http://127.0.0.1/getfile/wsdl~utiswsdl.wsdl',
  {
  wsdl_options: {
  timeout: 18000,
  },
  },
  async (err, client) => {
  if (client) {
  client.getStudentInfoByParam(
  !!pin ? { pin: String(pin) } : { utisCode: Number(utisCode) },
  async (err2, result) => {
  if (
  result &&
  result.return &&
  result.return.student &&
  result.return.student.class_code &&
  result.return.student.class_code != '0'
  ) {
  const {
  address,
  birth_date,
  classname,
  birthcountry,
  doc_number,
  edulang,
  exp_date,
  doc_organization,
  fin,
  gender,
  middle_name,
  name,
  surname,
  region,
  school_code,
  seria,
  stud_utis_code,
  } = result.return.student;
  if (
  (fin || '').toLowerCase() ==
  (req.currentUser.fin || '').toLowerCase() ||
  !isOlympiad
  )
  db.children
  .findOne({
  attributes: ['fin'],
  where: {
  deleted: 0,
  fin: !fin ? 'UC' + stud_utis_code : fin,
  },
  })
  .then((chf) => {
  if (!chf || isOlympiad) {
  db.fin_data
  .findOne({
  attributes: ['fin'],
  where: {
  fin: !fin ? 'UC' + stud_utis_code : fin,
  },
  })
  .then((check_fin) => {
  if (!check_fin) {
  db.fin_data
  .create({
  fin: !fin ? 'UC' + stud_utis_code : fin,
  first_name: name,
  last_name: surname,
  father_name: middle_name,
  birth_date,
  gender:
  gender === 'Kişi' ? 'Kişi' : 'Qadın',
  series: seria,
  citizenship: seria,
  number: doc_number,
  giving_authority: doc_organization,
  exp_date,
  district: '',
  born_country: birthcountry,
  address,
  })
  .then((fin_data) => {
  if (fin_data.error) {
  res.json({
  success: false,
  error: fin_data.error,
  err: 'Xəta baş verdi.',
  });
  } else {
  res.json({
  name: name.substr(0, 2) + 'XXXX',
  surname:
  surname.substr(0, 2) + 'XXXX',
  middle_name:
  middle_name.substr(0, 2) + 'XXXX',
  birth_date:
  'XX.XX.' +
  (birth_date || '').substr(6, 10),
  classname,
  edulang,
  fin: !fin
  ? 'UC' + stud_utis_code
  : fin,
  region,
  school_code,
  stud_utis_code,
  });
  }
  });
  } else {
  db.fin_data
  .update(
  {
  first_name: name,
  last_name: surname,
  father_name: middle_name,
  birth_date,
  gender:
  gender === 'Kişi'
  ? 'Kişi'
  : 'Qadın',
  series: seria,
  citizenship: seria,
  number: doc_number,
  giving_authority: doc_organization,
  exp_date,
  district: '',
  born_country: birthcountry,
  address,
  },
  {
  where: {
  fin: !fin
  ? 'UC' + stud_utis_code
  : fin,
  },
  }
  )
  .then((fin_data) => {
  if (fin_data.error) {
  res.json({
  success: false,
  error: fin_data.error,
  err: 'Xəta baş verdi.',
  });
  } else {
  res.json({
  name: name.substr(0, 2) + 'XXXX',
  surname:
  surname.substr(0, 2) + 'XXXX',
  middle_name:
  middle_name.substr(0, 2) + 'XXXX',
  birth_date:
  'XX.XX.' +
  (birth_date || '').substr(6, 10),
  classname,
  edulang,
  fin: !fin
  ? 'UC' + stud_utis_code
  : fin,
  region,
  school_code,
  stud_utis_code,
  });
  }
  });
  }
  });
  } else
  res.json({ err: 'Duplicate!', duplicate: true });
  });
  else
  res.json({
  success: false,
  err: 'Xəta baş verdi.',
  fin,
  fin2: req.currentUser.fin,
  });
  } else {
  res.json({ err: 'Məlumat tapılmadı!' });
  }
  },
  { timeout: 18000 }
  );
  } else {
  res.json({ err: 'Məlumat tapılmadı!' });
  }
  }
  );
  } else {
          res.json({ err: 'Captcha xətası!', captcha_error: true });
  }
  },
  ''
  );
  } else {
  res.json({ err: 'Fin düzgün daxil edin!' });
  }
});
/*

const sendFun = (client, calback) => {
    querySync('SELECT fin,utis_code FROM children WHERE deleted=0 and edu_level=2 and api_update=3 order by rand() limit 1 ').then((child) => {
        if (child)
            client.getStudentInfoByParam({ utisCode: Number(child.utisCode) }, async (err2, result) => {
                console.log('fin: ' + child.fin + ' ', 2);
                if (result && result.return && result.return.student && result.return.student.class_code && result.return.student.class_code != '0') {
                    //if (result.return.eduDoc.schoolName) {
                    console.log('fin: ' + child.fin + ' ', 3);
                    const { address, birth_date, classname, birthcountry, doc_number, edulang, exp_date, doc_organization, fin, gender, middle_name, name, surname, region, school_code, seria } = result.return.student;
                    if (String(fin || '').toLowerCase() === String(child.fin || '').toLowerCase()) {
                        console.log('fin: ' + child.fin + ' ', 4);
                        update('fin_data', {
                            first_name: name,
                            last_name: surname,
                            father_name: middle_name,
                            birth_date: (birth_date || '').replace(/\//g, '.'),
                            gender: gender === 'Kişi' ? 1 : 2,
                            series: seria,
                            citizenship: seria,
                            number: doc_number,
                            giving_authority: doc_organization,
                            exp_date,
                            district: "",
                            born_country: birthcountry,
                            address
                        }, { fin: String(child.fin) }, () => {
                            console.log('fin: ' + child.fin + ' ', 5);
                            querySync('SELECT name FROM utis_schools WHERE schoolCode=? limit 1', [school_code || ""]).then((enterprise) => {
                                console.log('fin: ' + child.fin + ' ', 6);
                                querySync('SELECT region FROM districts WHERE name=? limit 1', [region || ""]).then((district) => {
                                    console.log('fin: ' + child.fin + ' ', 7);
                                    update('children', {
                                        region, city: (district || {}).region || "-", current_enterprise: (enterprise || {}).name || "---", grade: Number(classname) || null, teaching_language: edulang, school_code, api_update: 1
                                    }, { fin: String(child.fin) }, () => {
                                        console.log('fin: ' + child.fin + ' ', 8);
                                        setTimeout(() => {
                                            sendFun(client, calback);
                                        }, 500);
                                    });
                                });
                            });
                        });
                    } else {
                        update('children', {
                            api_update: 2
                        }, { fin: String(child.fin) }, () => {
                            console.log('fin: ' + child.fin + ' ', 8);
                            setTimeout(() => {
                                sendFun(client, calback);
                            }, 500);
                        });
                    }
                } else {
                    update('children', {
                        api_update: 4
                    }, { fin: String(child.fin) }, () => {
                        console.log('fin: ' + child.fin + ' ', 8);
                        setTimeout(() => {
                            sendFun(client, calback);
                        }, 500);
                    });
                }
            }, { timeout: 18000 });
        else calback(true);
    });
}


router.get("/utisUpdateAll", (req, res) => {
    soap.createClient("http://127.0.0.1/getfile/wsdl~utiswsdl.wsdl", {
        wsdl_options: {
            timeout: 18000
        }
    }, async (err, client) => {
        if (client) {
            sendFun(client, () => {
                res.json({ success: true });
            });
        } else {
            res.json({ err: 'client error' });
        }
    });
});*/

router.post('/dim', authenticate, (req, res) => {
  const { pin, sinif, dil } = req.body;

  if (pin && sinif) {
  soap.createClient(
  process.env.IAMAS_URL,
  { wsdl_options: { timeout: 18000 } },
  (err, client) => {
  if (client) {
  client.OrtaMektebInfoClass(
  {
  PIN: String(pin),
  sinif,
  user: '0QQV730FBN585FC',
  sifre: 'bMKuLTz2uR',
  errors: '?',
  },
  (err, result) => {
  const dimData = ((
  (
  (
  ((result || {}).OrtaMektebInfoClassResult || {}).response ||
  {}
  ).response || {}
  ).tnatehsilOrtaMektebInfo || []
  ).TnatehsilOrtaMektebInfo || [])[0];
  if (dimData) {
  db.specialty_subjects
  .findAll({ where: { sinif, deleted: 0 } })
  .then((subjectlist) => {
  let subjects = [];
  let tedirs_dili = '';
  let xarici_dil = '';

  subjectlist.forEach((subject) => {
  const value = dimData.att_q[subject.index - 1];
  subject.value = value;
  if (
  subject.index == 1 &&
  dimData.a9 &&
  dimData.a9.length > 1
  ) {
  subject.name =
  subject.name +
  ' (' +
  dimData.a9.charAt(0).toUpperCase() +
  dimData.a9.slice(1).toLowerCase() +
  ' dili)';
  tedirs_dili = subject.name;
  }
  if (
  subject.index == 4 &&
  dimData.a18 &&
  dimData.a18.length > 1
  ) {
  subject.name =
  subject.name +
  ' (' +
  dimData.a18.charAt(0).toUpperCase() +
  dimData.a18.slice(1).toLowerCase() +
  ' dili)';
  xarici_dil = subject.name;
  }
  if (
  subject.index == 5 &&
  dimData.a19 &&
  dimData.a19.length > 1
  ) {
  subject.name =
  subject.name +
  ' (' +
  dimData.a19.charAt(0).toUpperCase() +
  dimData.a19.slice(1).toLowerCase() +
  ' dili)';
  }
  if (value && value != '-') {
  subjects.push(subject);
  }
  });
  let exam_subjects = [];

  exam_subjects.push({
  name: tedirs_dili,
  value: dimData.anadili,
  });
  exam_subjects.push({
  name: 'Riyaziyyat',
  value: dimData.riyaziyyat,
  });
  if (
  dimData.xaricidil &&
  dimData.xaricidil != 'imtahan yoxdur' &&
  dimData.xaricidil != 0
  ) {
  exam_subjects.push({
  name: xarici_dil || 'Əsas xarici dil',
  value: dimData.xaricidil,
  });
  } else if (
  dimData.kimya &&
  dimData.kimya != 'imtahan yoxdur' &&
  dimData.kimya != 0
  ) {
  exam_subjects.push({
  name: 'Kimya',
  value: dimData.kimya,
  });
  }
  if (
  dimData.az_dili &&
  dimData.az_dili != 'imtahan yoxdur' &&
  dimData.az_dili != 0
  ) {
  exam_subjects.push({
  name: 'Azərbaycan dili',
  value: dimData.az_dili,
  });
  }

  res.json({ subjects, exam_subjects });
  });
  } else {
  db.specialty_subjects
  .findAll({ where: { sinif, deleted: 0 } })
  .then((subjectlist) => {
  let subjects = [];
  let tedirs_dili = dil;

  subjectlist.forEach((subject) => {
  if (
  subject.index == 1 &&
  tedirs_dili &&
  tedirs_dili.length > 1
  ) {
  subject.name =
  subject.name +
  ' (' +
  tedirs_dili.charAt(0).toUpperCase() +
  tedirs_dili.slice(1).toLowerCase() +
  ' dili)';
  }
  if (subject.index != 3 || tedirs_dili != 'azərbaycan') {
  subjects.push({
  ...subject,
  value: '',
  });
  }
  });
  let exam_subjects = [];

  exam_subjects.push({
  name: subjects[0].name,
  value: '',
  });
  exam_subjects.push({
  name: 'Riyaziyyat',
  value: '',
  });
  exam_subjects.push({
  name: 'Əsas xarici dil',
  value: '',
  });
  if (tedirs_dili != 'azerbacan') {
  exam_subjects.push({
  name: 'Azərbaycan dili',
  value: '',
  });
  }
  res.json({ subjects, exam_subjects });
  });
  }
  },
  { timeout: 18000 }
  );
  } else {
  db.specialty_subjects
  .findAll({ where: { sinif, deleted: 0 } })
  .then((subjectlist) => {
  let subjects = [];
  let tedirs_dili = dil;

  subjectlist.forEach((subject) => {
  if (
  subject.index == 1 &&
  tedirs_dili &&
  tedirs_dili.length > 1
  ) {
  subject.name =
  subject.name +
  ' (' +
  tedirs_dili.charAt(0).toUpperCase() +
  tedirs_dili.slice(1).toLowerCase() +
  ' dili)';
  }
  if (subject.index != 3 || tedirs_dili != 'azərbaycan') {
  subjects.push({
  ...subject,
  value: '',
  });
  }
  });
  let exam_subjects = [];

  exam_subjects.push({
  name: subjects[0].name,
  value: '',
  });
  exam_subjects.push({
  name: 'Riyaziyyat',
  value: '',
  });
  exam_subjects.push({
  name: 'Əsas xarici dil',
  value: '',
  });
  if (tedirs_dili != 'azerbacan') {
  exam_subjects.push({
  name: 'Azərbaycan dili',
  value: '',
  });
  }
  res.json({ subjects, exam_subjects });
  });
  //res.json({ err: "Məlumat tapılmadı!" });
  }
  }
  );
  } else {
  res.json({ err: 'Fin i düzgün daxil edin!' });
  }
});
/*
router.get("/dim2/:pin/:sinif/:dil", (req, res) => {
    const { pin, sinif, dil } = req.params;
 
    if (pin && sinif) {
        soap.createClient(process.env.IAMAS_URL, { wsdl_options: { timeout: 18000 } }, (err, client) => {
            // console.log({ client });
            if (client) {
                client.OrtaMektebInfoClass({ PIN: String(pin), sinif, user: "Bp7=T!e/!~$5C5(", sifre: "-hB};\\4WGR", errors: '?' }, (err, result) => {
                    console.log({ result: (((((result || {}).OrtaMektebInfoClassResult || {}).response || {}).response || {}).tnatehsilOrtaMektebInfo || []).TnatehsilOrtaMektebInfo || [] });
                    const dimData = ((((((result || {}).OrtaMektebInfoClassResult || {}).response || {}).response || {}).tnatehsilOrtaMektebInfo || []).TnatehsilOrtaMektebInfo || [])[0];
                    if (dimData) {
                        querySyncForMap(`select * from specialty_subjects where sinif=${sinif} and deleted=0`).then(subjectlist => {
                            let subjects = [];
                            let tedirs_dili = '';
                            let xarici_dil = '';
 
                            subjectlist.forEach(subject => {
                                const value = dimData.att_q[subject.index - 1];
                                subject.value = value;
                                if (subject.index == 1 && dimData.a9 && dimData.a9.length > 1) {
                                    subject.name = subject.name + " (" + dimData.a9.charAt(0).toUpperCase() + dimData.a9.slice(1).toLowerCase() + " dili)";
                                    tedirs_dili = subject.name;
                                }
                                if (subject.index == 4 && dimData.a18 && dimData.a18.length > 1) {
                                    subject.name = subject.name + " (" + dimData.a18.charAt(0).toUpperCase() + dimData.a18.slice(1).toLowerCase() + " dili)";
                                    xarici_dil = subject.name;
                                }
                                if (subject.index == 5 && dimData.a19 && dimData.a19.length > 1) {
                                    subject.name = subject.name + " (" + dimData.a19.charAt(0).toUpperCase() + dimData.a19.slice(1).toLowerCase() + " dili)";
                                }
                                if (value && value != '-') {
                                    subjects.push(subject);
                                }
 
                            });
                            let exam_subjects = [];
 
                            exam_subjects.push({
                                name: tedirs_dili,
                                value: dimData.anadili
                            });
                            exam_subjects.push({
                                name: 'Riyaziyyat',
                                value: dimData.riyaziyyat
                            });
                            if (dimData.xaricidil && dimData.xaricidil != 'imtahan yoxdur' && dimData.xaricidil != 0) {
                                exam_subjects.push({
                                    name: (xarici_dil || 'Əsas xarici dil'),
                                    value: dimData.xaricidil
                                });
                            } else if (dimData.kimya && dimData.kimya != 'imtahan yoxdur' && dimData.kimya != 0) {
                                exam_subjects.push({
                                    name: 'Kimya',
                                    value: dimData.kimya
                                });
                            }
                            if (dimData.az_dili && dimData.az_dili != 'imtahan yoxdur' && dimData.az_dili != 0) {
                                exam_subjects.push({
                                    name: 'Azərbaycan dili',
                                    value: dimData.az_dili
                                });
                            }
 
                            res.json({ subjects, exam_subjects })
                        });
                    } else {
                        querySyncForMap(`select * from specialty_subjects where sinif=${sinif} and deleted=0`).then(subjectlist => {
                            let subjects = [];
                            let tedirs_dili = dil;
 
                            subjectlist.forEach(subject => {
                                if (subject.index == 1 && tedirs_dili && tedirs_dili.length > 1) {
                                    subject.name = subject.name + " (" + tedirs_dili.charAt(0).toUpperCase() + tedirs_dili.slice(1).toLowerCase() + " dili)";
                                }
                                if (subject.index != 3 || tedirs_dili != 'azərbaycan') {
                                    subjects.push({
                                        ...subject,
                                        value: ''
                                    });
                                }
                            });
                            let exam_subjects = [];
 
                            exam_subjects.push({
                                name: subjects[0].name,
                                value: ''
                            });
                            exam_subjects.push({
                                name: 'Riyaziyyat',
                                value: ''
                            });
                            exam_subjects.push({
                                name: 'Əsas xarici dil',
                                value: ''
                            });
                            if (tedirs_dili != 'azerbacan') {
                                exam_subjects.push({
                                    name: 'Azərbaycan dili',
                                    value: ''
                                });
                            }
                            res.json({ subjects, exam_subjects })
                        });
                    }
                }, { timeout: 18000 });
            } else {
                querySyncForMap(`select * from specialty_subjects where sinif=${sinif} and deleted=0`).then(subjectlist => {
                    let subjects = [];
                    let tedirs_dili = dil;
 
                    subjectlist.forEach(subject => {
                        if (subject.index == 1 && tedirs_dili && tedirs_dili.length > 1) {
                            subject.name = subject.name + " (" + tedirs_dili.charAt(0).toUpperCase() + tedirs_dili.slice(1).toLowerCase() + " dili)";
                        }
                        if (subject.index != 3 || tedirs_dili != 'azərbaycan') {
                            subjects.push({
                                ...subject,
                                value: ''
                            });
                        }
                    });
                    let exam_subjects = [];
 
                    exam_subjects.push({
                        name: subjects[0].name,
                        value: ''
                    });
                    exam_subjects.push({
                        name: 'Riyaziyyat',
                        value: ''
                    });
                    exam_subjects.push({
                        name: 'Əsas xarici dil',
                        value: ''
                    });
                    if (tedirs_dili != 'azerbacan') {
                        exam_subjects.push({
                            name: 'Azərbaycan dili',
                            value: ''
                        });
                    }
                    res.json({ subjects, exam_subjects })
                });
                //res.json({ err: "Məlumat tapılmadı!" });
            }
        });
    } else {
        res.json({ err: 'Fin i düzgün daxil edin!' });
    }
});
 
*/

const midRequest = (url, data, callback, retry = true) => {
  midLogin((token) => {
  const options = {
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
  },
  data: data,
  timeout: process.env.TIMEOUT || 8000,
  url: `${process.env.MID_HOST}${url}`,
  };
  axios(options)
  .then((result) => {
  if (((result || {}).data || {}).status) {
  callback((result || {}).data || {});
  } else {
  if (retry) midRequest(url, data, callback, false);
  else callback(false);
  }
  })
  .catch((e) => {
  console.log('midRequest error: ', e);
  if (Object.keys(e).length > 0) {
  if (retry) midRequest(url, data, callback, false);
  else callback(false);
  }
  });
  });
};

const midRequestWithToken = (url, data, token, callback, retry = true) => {
  const options = {
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
  },
  data: data,
  timeout: process.env.TIMEOUT || 8000,
  url: `${process.env.MID_HOST}${url}`,
  };
  axios(options)
  .then((result) => {
  if (((result || {}).data || {}).status) {
  callback((result || {}).data || {});
  } else {
  if (retry) midRequest(url, data, callback, false);
  else callback(false);
  }
  })
  .catch((e) => {
  console.log('midRequest error: ', e);
  if (Object.keys(e).length > 0) {
  if (retry) midRequest(url, data, callback, false);
  else callback(false);
  }
  });
};

const midLogin = (callback) => {
  const options = {
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
  },
  data: {
  email: process.env.MID_EMAIL,
  password: process.env.MID_PASSWORD,
  },
  timeout: process.env.TIMEOUT || 8000,
  url: `${process.env.MID_HOST}/auth/login`,
  };

  axios(options)
  .then((login_result) => {
  if (((login_result || {}).data || {}).access_token) {
  callback(((login_result || {}).data || {}).access_token);
  } else {
  callback(false);
  }
  })
  .catch((e) => {
  console.log('midLogin error: ', e);
  if (Object.keys(e).length > 0) callback(false);
  });
};

const updateChild = (pin, birth_date, utisCode, user_id) => {
  return new Promise((resolve) => {
  updateFinData(pin, birth_date, (iamasResponse) => {
  soap.createClient(
  'http://127.0.0.1/getfile/wsdl~utiswsdl.wsdl',
  {
  wsdl_options: {
  timeout: 18000,
  },
  },
  (err, client) => {
  if (client) {
  db.utis_schools
  .findAll({ order: [['name', 'ASC']] })
  .then((umumtehsil_schools) => {
  db.districts
  .findAll({ where: { deleted: 0 }, order: [['name', 'ASC']] })
  .then((regions) => {
  db.children
  .findOne({
  attributes: ['id'],
  where: {
  deleted: 0,
  fin: pin || 'UC' + stud_utis_code,
  },
  })
  .then((chf) => {
  client.getStudentInfoByParam(
  !!utisCode
  ? { utisCode: Number(utisCode) }
  : { pin: String(pin) },
  (err2, result) => {
  if (
  result &&
  result.return &&
  result.return.student &&
  result.return.student.class_code &&
  result.return.student.class_code != '0'
  ) {
  const {
  classname,
  edulang,
  fin,
  region,
  school_code,
  stud_utis_code,
  } = result.return.student;
  const newData = {
  city: (
  _.find(
  regions,
  (r) =>
  (r.name || '').toLowerCase() ===
  (region || '').toLowerCase()
  ) || { region: '-' }
  ).region,
  current_enterprise: (
  _.find(
  umumtehsil_schools,
  (u) =>
  Number(u.schoolCode) ===
  Number(school_code)
  ) || { name: '-' }
  ).name,
  grade: classname || null,
  teaching_language: edulang,
  region,
  school_code,
  utis_code: stud_utis_code,
  };
  if (chf) {
  db.children
  .update(
  {
  ...newData,
  type: pin ? 2 : 1,
  edu_level: 2,
  },
  { where: { id: chf.id } }
  )
  .then(() => {
  resolve(true);
  });
  } else {
  db.children
  .create({
  ...newData,
  user_id,
  type: pin ? 2 : 1,
  edu_level: 2,
  parent_type: 'Valideyn',
  fin: fin || pin,
  })
  .then(() => {
  resolve(true);
  });
  }
  } else if (chf) {
  resolve(true);
  } else if (!iamasResponse.err) {
  db.children
  .create({
  user_id,
  type: 1,
  edu_level: 3,
  parent_type: 'Valideyn',
  fin: pin,
  })
  .then(() => {
  resolve(true);
  });
  } else {
  resolve(false);
  }
  },
  { timeout: 18000 }
  );
  });
  });
  });
  } else {
  resolve(false);
  }
  }
  );
  });
  });
};

const updateFinData = (pin, birthdate, calback) => {
  if (pin && birthdate)
  midRequest(
  '/getIdCardByPinBirthdate',
  { pin, birthdate: moment(birthdate, 'DD.MM.YYYY').format('YYYY-MM-DD') },
  (result) => {
  const data = _.find(result.data || [], 'active');
  if (data) {
  db.fin_data
  .findOne({ attributes: ['fin'], where: { fin: pin } })
  .then((check_fin) => {
  const image = (
  _.find((data.personAz || {}).images || [], [
  'imageName',
  'PRINT IMAGE',
  ]) || {}
  ).imageStream;
  const newData = {
  first_name: (data.personAz || {}).name || ' --- ',
  last_name: (data.personAz || {}).surname || ' --- ',
  father_name: (data.personAz || {}).patronymic || ' --- ',
  social_status:
  (
  ((data.maritalStatusList || [])[0] || {}).maritalStatus ||
  ''
  ).toLowerCase() === 'married'
  ? 'Evli'
  : 'Subay',
  militaryStatus:
  (
  ((data.militaryStatusList || [])[0] || {}).militaryStatus ||
  ''
  ).toLowerCase() === 'liable'
  ? 1
  : 2,
  birth_date: ((data.personAz || {}).birthDate || {}).date
  ? moment(data.personAz.birthDate.date).format('DD.MM.YYYY')
  : null,
  citizenship: 'AZE',
  address: ((data.personAz || {}).iamasAddress || {}).fullAddress,
  gender:
  ((data.personAz || {}).gender || '').toLowerCase() === 'male'
  ? 'Kişi'
  : 'Qadın',
  exp_date: (data.expiryDate || {}).date
  ? moment(data.expiryDate.date).format('DD.MM.YYYY')
  : null,
  giving_date: (data.issuingDate || {}).date
  ? moment(data.issuingDate.date).format('DD.MM.YYYY')
  : null,
  giving_authority: (data.organisation || {}).name,
  image: image ? `data:image/jpeg;base64,${image}` : null,
  series: 'AZE', //???
  number: data.documentNumber,
  };
  if (!check_fin) {
  db.fin_data
  .create({ ...newData, fin: data.personAz.pin })
  .then((fin_data) => {
  if (fin_data.error) {
  calback({ err: 'Fini düzgün daxil edin!' });
  } else {
  calback({
  err: '',
  soapdata: {
  pin,
  name:
  (newData.first_name || '').substr(0, 2) + 'XXXXXX',
  surname:
  (newData.last_name || '').substr(0, 2) + 'XXXXXX',
  fathername:
  (newData.father_name || '').substr(0, 2) + 'XXXXXX',
  birthDate: newData.birth_date || '',
  addressPlace:
  (newData.address || '').substr(0, 4) + 'XXXXXXXXXX',
  gender: newData.gender,
  series: newData.seria,
  seriesnumber:
  (newData.number || '').substr(0, 2) + 'XXXXXX',
  },
  });
  }
  });
  } else {
  db.fin_data
  .update(newData, { where: { fin: pin } })
  .then((fin_data) => {
  if (fin_data.error) {
  calback({ err: 'Fini düzgün daxil edin!' });
  } else {
  calback({
  err: '',
  soapdata: {
  pin,
  name:
  (newData.first_name || '').substr(0, 2) + 'XXXXXX',
  surname:
  (newData.last_name || '').substr(0, 2) + 'XXXXXX',
  fathername:
  (newData.father_name || '').substr(0, 2) + 'XXXXXX',
  birthDate: newData.birth_date || '',
  addressPlace:
  (newData.address || '').substr(0, 4) + 'XXXXXXXXXX',
  gender: newData.gender,
  series: newData.seria,
  seriesnumber:
  (newData.number || '').substr(0, 2) + 'XXXXXX',
  },
  });
  }
  });
  }
  });
  } else {
  calback({ err: 'Fin düzgün daxil edin!' });
  }
  }
  );
  else {
  calback({ err: 'Fin düzgün daxil edin!' });
  }
};

module.exports = {
  router,
  midLogin,
  midRequest,
  midRequestWithToken,
  updateChild,
  updateFinData,
};
