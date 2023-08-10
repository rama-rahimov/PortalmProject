const https = require("https") ;
const http = require("http") ;
const axios = require("axios") ;
const db = require('../models');
const fs = require('fs') ;
const utf8 = require('utf8') ;

// const sharp = require('sharp');


const getAge = (birth_date, format = 'DD.MM.YYYY') => moment.duration(moment().diff(moment(birth_date, format))).years();

const recaptcha2verify = (token, ip, calback) => {
  const data = {
    secret: process.env.RECAPTCHA_SECRET, response: token
  };
  if (ip && process.env.RECAPTCHA_CHEKIP) {
    data.remoteip = ip;
  }
  axios({
    method: 'POST',
    url: `${process.env.RECAPTCHA_URL}`,
    //https://www.google.com/recaptcha/api/siteverify
    timeout: process.env.TIMEOUT || 8000,
    data
  }).then(result => {
    if (result.data.success) {
      calback(true);
    } else {
      calback(false);
    }
  }).catch(e => {
    if (e.response) {
      console.log(e.response.data);
    } else {
      console.log(e);
    }
    if (e && Object.keys(e).length > 0)
      calback(false);
  });
}

const exts = ['jpg', 'jpeg', 'png', 'pdf', 'mp4', 'docx', 'doc', 'wsdl'];

const file = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  const token = req.params.token;
  if (token) { 
    db.files.findAll({where:{token}}).then(file => {
      if (!file) {
        res.status(404).send('File not found.');
      } else {
        var readStream = fs.createReadStream(file.path);

        // This will wait until we know the readable stream is actually valid before piping
        readStream.on('open', function () {
          // This just pipes the read stream to the response object (which goes to the client)
          readStream.pipe(res);
        });

        // This catches any errors that happen while creating the readable stream (usually invalid names)
        readStream.on('error', function (err) {
          res.status(404).send('File not found.');
        });
        /* fs.readFile(file.path, (err, data) => {
           if (err) {
             res.status(404).send('File not found.');
           } else {
             res.end(data);
           }
         });*/
      }
    });
  } else {
    res.status(404).send('File not found.');
  }
}

const fileName = (req, res) => {
  const token = req.params.token;
  if (token) { 
    db.files.findAll({where:{token}}).then(file => {
      if (!file) {
        res.json('');
      } else {
        res.json(file.name);
      }
    });
  } else {
    res.json('');
  }
}

const getfile = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  var file = req.params.file.replace(/\.\./g, '').replace(/\//g, '').split('~');
  const mCheck = file[file.length - 1].split('.')[file[file.length - 1].split('.').length - 1];
  if (exts.includes(mCheck)) {
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
    fs.readFile(up, (err, data) => {
      if (err) {
        res.status(404).send('File not found.');
      } else {
        res.end(data);
      }
    });
  } else {
    res.status(404).send('File not found.');
  }
}

const makeid = (length) => {
  if (!length) {
    length = Math.floor(Math.random() * (45 - 10) + 10);
  }
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}

const generateFileToken = (data, callback) => {
  const token = makeid(); 
  db.files.findAll({where:{token}}).then(chek => {
    if (chek) {
      generateFileToken(data, callback);
    } else {  
      db.files.create({ ...data, token }).then(() => {
        callback(token);
      });
    }
  });
}

const saveFile = async (data, _path, fin, callback) => {
  const path = _path.replace(/\.\./g, '');
  const extraPath = Math.floor(Math.random() * (99 - 10) + 10);
  if (!fs.existsSync(`./uploads`)) { fs.mkdirSync(`./uploads`); }
  if (!fs.existsSync(`./uploads/${path}`)) { fs.mkdirSync(`./uploads/${path}`); }
  if (!fs.existsSync(`./uploads/${path}/${extraPath}`)) { fs.mkdirSync(`./uploads/${path}/${extraPath}`); }
  if (!exts.includes(data.ext)) {
    callback('');
  } else if (data.filedata) {
    var name = makeid() + `.${data.ext}`;
    while (fs.existsSync(`./uploads/${path}/${extraPath}/${name}`)) {
      name = makeid() + `.${data.ext}`;
    }
    let base64Data = Buffer.from(data.filedata.split(',')[1], 'base64');
    fs.writeFileSync(`./uploads/${path}/${extraPath}/${name}`, base64Data);
    generateFileToken({ path: `./uploads/${path}/${extraPath}/${name}`, fin, name: data.fname + `.${data.ext}` }, (token) => {
      callback('/file/' + token);
    });
  } else {
    callback('');
  }
}

const cl = (text, color) => {
  let c = "\x1b[0m%s\x1b[0m";
  if (color) {
    if (color == "blue") c = "\x1b[36m%s\x1b[0m";
    if (color == "yellow") c = "\x1b[33m%s\x1b[0m";
    if (color == "red") c = "\x1b[31m%s\x1b[0m";
    if (color == "black") c = "\x1b[30m%s\x1b[0m";
    if (color == "white") c = "\x1b[1m%s\x1b[0m";
    if (color == "green") c = "\x1b[32m%s\x1b[0m";
    if (color == "purple") c = "\x1b[35m%s\x1b[0m";
    if (color == "gray") c = "\x1b[37m%s\x1b[0m";
  }
  console.log(c, text);
}

const today = () => {
  const nd = new Date();
  const y = nd.getFullYear();
  const m = (nd.getMonth() + 1);
  const d = nd.getDate();
  return `${y}-${m < 10 ? `0${m}` : m}-${d < 10 ? `0${d}` : d}`;
}

const yesterday = () => {
  const nd = new Date();
  const y = nd.getFullYear();
  const m = (nd.getMonth() + 1);
  const d = nd.getDate() - 1;
  return `${y}-${m < 10 ? `0${m}` : m}-${d < 10 ? `0${d}` : d}`;
}

const now = () => {
  const nd = new Date();
  const y = nd.getFullYear();
  const m = (nd.getMonth() + 1);
  const d = nd.getDate();
  const h = nd.getHours();
  const mm = nd.getMinutes();
  const s = nd.getSeconds();
  return `${y}-${m < 10 ? `0${m}` : m}-${d < 10 ? `0${d}` : d} ${h < 10 ? `0${h}` : h}:${mm < 10 ? `0${mm}` : mm}:${s < 10 ? `0${s}` : s}`;
}

const request = (postData, o, callback, extra = {
  result_json: true,
  request_json: true
}) => {
  const extra_headers = {};
  if (extra.request_json) {
    if (postData){
      postData = JSON.stringify(postData);
    extra_headers['Content-Type'] = 'application/json' ;
    }
  }
  if (postData) {
    extra_headers['Content-Length'] = utf8.encode(postData).length;
  }
  const options = {
    ...o,
    port: o.port || 80,
    method: o.method || 'GET',
    headers: {
      ...o.headers,
      ...extra_headers
    }
  }

  var req = (options.port == 443 && https || http).request(options, (res) => {
    const body = [];
    res.on('data', (d) => {
      body.push(d);
    }).on('end', () => {
      let data = Buffer.concat(body).toString();
      if (extra.result_json)
        try {
          data = JSON.parse(data);
        } catch (error) {
          callback({ error });
        } finally {
          callback({ data });
        }

    });
  });

  req.on('error', (e) => {
    callback({ err: e });
    return;
  });
  if (postData)
    req.write(postData);
  req.end();
}

module.exports = {request, now, yesterday, today, cl, saveFile, makeid, getfile, fileName, file, recaptcha2verify, getAge} ;