const rp = require("request-promise") ;
const https = require("https") ;
const axios = require("axios") ;
require('dotenv').config() ; 
const {Sequelize, QueryTypes} = require('sequelize') ;

const regex = /\'\'|\'null\'|\'Null\'|\'undefined\'/gi ;


const query = async (query, callback, credentials = {}) => {
  let takeType ;

  if(query.includes('insert into') || query.includes('Insert Into') || query.includes('INSERT INTO')){
    takeType = {type: QueryTypes.INSERT} ;
  }else if (query.includes('update') || query.includes('Update') || query.includes('UPDATE')){
    takeType = {type: QueryTypes.UPDATE}
  }else if  (query.includes('select') || query.includes('Select') || query.includes('SELECT')){
    takeType = {type: QueryTypes.SELECT}
  }else if(query.includes('delete') || query.includes('Delete') || query.includes('DELETE')){
    takeType = {type: QueryTypes.DELETE}
  }

  if(Object.keys(credentials).length === 0 || credentials === null || credentials[0] === null){
    takeType.replacements = null ;
  } else if(Object.keys(credentials).length > 0){
    takeType.replacements = credentials ;
  }
  try {
    const rows = await sequelize.query(query, takeType);
    callback(null, rows); 
  } catch (error) {
    callback(error, null);
  }
}

const querySync = (query, credentials = {}) => {
  let takeType ;
  let rows ;
  if(typeof(query) === 'string'){
    if(query.includes('insert into') || query.includes('Insert Into') || query.includes('INSERT INTO')){
      takeType = {type: QueryTypes.INSERT} ;
    }else if (query.includes('update') || query.includes('Update') || query.includes('UPDATE')){
      takeType = {type: QueryTypes.UPDATE}
    }else if  (query.includes('select') || query.includes('Select') || query.includes('SELECT')){
      takeType = {type: QueryTypes.SELECT}
    }else if(query.includes('delete') || query.includes('Delete') || query.includes('DELETE')){
      takeType = {type: QueryTypes.DELETE}
    }
  
    if(Object.keys(credentials).length === 0 || credentials === null || credentials[0] === null){
      takeType.replacements = null ;
    } else if(Object.keys(credentials).length > 0){
      takeType.replacements = credentials ;
    }
  }
  return new Promise(async function (resolve, reject) {
   

    if(takeType === null || takeType === undefined){
      rows = await query ;
    }else {
      rows = await sequelize.query(query, takeType) ;
    }
      if(!rows){
        return reject("Problem in querySync");
      }

      resolve(Object.keys(rows).length > 1 ? rows: Object.keys(rows).length > 0 ? rows[0] : null);
  }).catch(err => {
    console.log(err);
  })
}



const getConnection = () => {
  return new Promise(async function (resolve, reject) {
    const connection = await sequelize.authenticate();
    if(!connection){
      reject("Problem in connection");
    }
    resolve(connection);
  })
}

const insert = async (table, data, callback) => {
  if(typeof(table) === 'string'){
    const keys = Object.keys(data).join(',');
  const valuesK = Object.values(data).map(v => (v || String(v) === '0') ? "?" : "DEFAULT").join(",");
  const values = Object.values(data).filter(v => (v || String(v) === '0'));
  const query = `INSERT INTO ${table} (${keys}) VALUES (${valuesK})`;
  querySync(query, values).then(done => {
    callback(done);
  }).catch(err => console.log({ error: err.sqlMessage }));
  } else{
   querySync(await table).then(done => {
    callback(done);
   }).catch(err => console.log({ error: err.sqlMessage }));
  }
}


const querySyncForMap = (query, credentials = {}) => {
  let takeType ;
  let rows ;
  if(typeof(query) === 'string'){
    if(query.includes('insert into') || query.includes('Insert Into') || query.includes('INSERT INTO')){
      takeType = {type: QueryTypes.INSERT} ;
    }else if (query.includes('update') || query.includes('Update') || query.includes('UPDATE')){
      takeType = {type: QueryTypes.UPDATE}
    }else if  (query.includes('select') || query.includes('Select') || query.includes('SELECT')){
      takeType = {type: QueryTypes.SELECT}
    }else if(query.includes('delete') || query.includes('Delete') || query.includes('DELETE')){
      takeType = {type: QueryTypes.DELETE}
    }
  
    if(Object.keys(credentials).length === 0 || credentials === null || credentials[0] === null){
      takeType.replacements = null ;
    } else if(Object.keys(credentials).length > 0){
      takeType.replacements = credentials ;
    }
  }
  return new Promise(async function (resolve, reject) {
   

    if(takeType === null || takeType === undefined){
      rows = await query ;
    }else {
      rows = await sequelize.query(query, takeType) ;
    }
      if(!rows){
        return reject("Problem in querySyncForMap");
      }

      resolve(Object.keys(rows).length > 0 ? rows : []);
  });
} 


const update = async (table, data, credentials, callback) => {
  if(typeof(table) === 'string'){
    const values = [];
  const columns = `UPDATE ${table} SET` + Object.keys(data).map(v => {
    if (data[v] || String(data[v]) === '0') {
      values.push(data[v]);
      return ` ${v}=? `;
    } else {
      return ` ${v}=DEFAULT `;
    }
  }).join(',');

  const creds = " WHERE " + Object.keys(credentials).map(v => {
    values.push(credentials[v]);
    return ` ${v}=? `;
  }).join(' and ');

  querySync(columns + creds, values).then(done => {
    callback(true);
  }).catch(err => callback({ error: err.sqlMessage }));
  }else{
    querySync(await table).then(done => {
      callback(true);
    }).catch(err => callback({ error: err.sqlMessage }))
  }
}

const insertList = async (table, datas, datakeys, extraData, callback) => {
  if(typeof(table) === 'string'){
    const keys = datakeys.join(',');
  const valuesK = datas.map((data) => datakeys.map(k => (extraData[k] || String(extraData[k]) === '0' || data[k] || String(data[k]) === '0') ? "?" : "DEFAULT").join(',')).join('),(');
  const values = datas.flatMap(data => datakeys.map(key => (extraData[key] || String(extraData[key]) === '0') ? extraData[key] : ((data[key] || String(data[key]) === '0') ? data[key] : "")).filter(v => (v || String(v) === '0')));
  const query = `INSERT INTO ${table} (${keys}) VALUES (${valuesK})`;
  querySync(query, values).then((result) => {
    callback(true, result);
  }).catch(err => callback({ error: err.sqlMessage }));
  } else {
    querySync(await table).then(done => {
      callback(done);
     }).catch(err => console.log({ error: err.sqlMessage }));
  }
}

const deleteC = async (table, credentials, callback) => {
  if(typeof(table) === 'string'){
    const values = [];
  const query = `DELETE FROM ${table} WHERE ` + Object.keys(credentials).map(v => {
    values.push(credentials[v]);
    return ` ${v}=? `;
  }).join(' and ');
  querySync(query, values).then(done => {
    callback(true);
  }).catch(err => callback({ error: err.sqlMessage }));
  }else{
    querySync(await table).then(done => {
      callback(true);
    }).catch(err => callback({error: err.sqlMessage}))
  }
}

const select = (table, columns, credentials, callback) => {
  const values = [];
  let crndtls = '';
  if (credentials) {
    crndtls = "WHERE " + Object.keys(credentials).map(v => {
      values.push(credentials[v]);
      return ` ${v}=? `;
    }).join(' and ');
  }
  const query = `SELECT ${columns} FROM ${table} ${crndtls}`;
  querySync(query, values).then(done => {
    callback(done);
  }).catch(err => callback({ error: err.sqlMessage }));
}

const selectForMap = (table, columns, credentials, callback) => {
  const values = [];
  let crndtls = '';
  if (credentials) {
    crndtls = "WHERE " + Object.keys(credentials).map(v => {
      values.push(credentials[v]);
      return ` ${v}=? `;
    }).join(' and ');
  }
  query(`SELECT ${columns} FROM ${table} ${crndtls}`, (err, done) => {
    if (err) {
      callback({ error: err.sqlMessage });
    } else {
      callback(done);
    }
  }, values);
}

const clone = (table, data, credentials, callback) => {
  const values = [];
  const columns = Object.keys(data).join(', ');
  const valuesK = Object.values(data).join(', ');
  let crndtls = '';
  if (credentials) {
    crndtls = "WHERE " + Object.keys(credentials).map(v => {
      values.push(credentials[v]);
      return ` ${v}=? `;
    }).join(' and ');
  }
  const query = `INSERT INTO ${table} (${columns}) SELECT ${valuesK} FROM ${table} ${crndtls}`;
  querySync(query, values).then(done => {
    callback(done);
  }).catch(err => callback({ error: err.sqlMessage }));
}

exports.cloneLastLimit = (table, data, credentials, callback) => {
  const values = [];
  const columns = Object.keys(data).join(', ');
  const valuesK = Object.values(data).join(', ');
  let crndtls = '';
  if (credentials) {
    crndtls = "WHERE " + Object.keys(credentials).map(v => {
      values.push(credentials[v]);
      return ` ${v}=? `;
    }).join(' and ');
  }
  const query = `INSERT INTO ${table} (${columns}) SELECT ${valuesK} FROM ${table} ${crndtls} ORDER BY id DESC LIMIT 1`;
  querySync(query, values).then(done => {
    callback(done);
  }).catch(err => callback({ error: err.sqlMessage }));
}

const cloneTransferLastLimit = (oldtable, table, data, credentials, callback) => {
  const values = [];
  const columns = Object.keys(data).join(', ');
  const valuesK = Object.values(data).join(', ');
  let crndtls = '';
  if (credentials) {
    crndtls = "WHERE " + Object.keys(credentials).map(v => {
      return `${v}='${credentials[v]}'`;
    }).join(' and ');
  }
  const query = `INSERT INTO ${table} (${columns}) SELECT ${valuesK} FROM ${oldtable} ${crndtls} ORDER BY id DESC LIMIT 1`;
  querySync(query, values).then(done => {
    callback(done);
  }).catch(err => callback({ error: err.sqlMessage }));
}

// PESEQEBUL
const querySync2 = (query, credentials = {}) => {
  return new Promise(function (resolve, reject) {
    axios.post(`${process.env.PESEQEBUL_URL}`, { query, credentials, type: 1 }, { headers: { 'authorization': process.env.PESEQEBUL_TOKEN }, httpsAgent: new https.Agent({ rejectUnauthorized: false }) }).then(({ data }) => resolve(data));
  });
}

const querySyncForMap2 = (query, credentials = {}) => {
  return new Promise(function (resolve, reject) {
    axios.post(`${process.env.PESEQEBUL_URL}`, { query, credentials, type: 2 }, { headers: { 'authorization': process.env.PESEQEBUL_TOKEN }, httpsAgent: new https.Agent({ rejectUnauthorized: false }) }).then(({ data }) => resolve(data));
  });
}

// PESE
const querySync3 = (query, credentials = {}) => {
  return new Promise(function (resolve, reject) {
    rp.post({ url: `${process.env.PESE_URL}`, form: { query, credentials, type: 1 }, headers: { 'authorization': process.env.PESE_TOKEN } }).then(body => resolve(body ? JSON.parse(body) : null)).catch(err => console.log(err));
  });
}

const querySyncForMap3 = (query, credentials = {}) => {
  return new Promise(function (resolve, reject) {
    rp.post({ url: `${process.env.PESE_URL}`, form: { query, credentials, type: 2 }, headers: { 'authorization': process.env.PESE_TOKEN } }).then(body => resolve(body ? JSON.parse(body) : null)).catch(err => console.log(err));
  });
}


module.exports = {query, querySyncForMap3, querySync3, querySyncForMap2, querySync2, cloneTransferLastLimit, clone, selectForMap, 
  select, deleteC, insertList, update, querySyncForMap, insert, getConnection, querySync, query} ;