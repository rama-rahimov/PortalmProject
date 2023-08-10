const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const http = require('http');
const db = require('./models');
// const {sequelize} = require('./middlewares/db.js');
// const soap_server = require("soap");
// eslint-disable-next-line import/no-unresolved
const cookieParser = require('cookie-parser');

const { checkurl } = require('./middlewares/authenticate.js');
const { cl, getfile, file, fileName } = require('./middlewares/helper.js');

// import mySoapServices from "./routes/soap_sever_func";

const auth = require('./routes/auth.js');
const edu_docs = require('./routes/edu_docs.js');
const main = require('./routes/main.js');
const user = require('./routes/users.js');
const { router } = require('./routes/soap.js');
const student_apply_new = require('./routes/student_apply_new.js');
const vacancy_appeals = require('./routes/vacancy_appeals.js');
const out_of_schools = require('./routes/out_of_schools.js');
const children = require('./routes/children.js');
const global = require('./routes/global.js');
const global_4448 = require('./routes/global_4448.js');
const olympiad = require('./routes/olympiad.js');
const course = require('./routes/course.js');
const pts = require('./routes/pts.js');
const edu_repair = require('./routes/edu_repair.js');
const informal_education = require('./routes/informal_education.js');
const e_reference = require('./routes/e-reference.js');
const certification = require('./routes/certification.js');
const admin = require('./routes/admin.js');
const support = require('./routes/support');
const debt = require('./routes/debt');

dotenv.config();

// if (cluster.isMaster) {
// 	for (let i = 0; i < 16; i++) {
// 		cluster.fork();
// 	}
// } else {
const app = express();
app.use(express.json());
app.use(bodyParser.json({ limit: '2000mb' }));
app.use(bodyParser.urlencoded({ limit: '2000mb', extended: true }));
app.use(checkurl);
app.use(cookieParser());
app.get('/getfile/:file', getfile);
app.get('/file/:token', file);
app.get('/filename/:token', fileName);
app.use('/api/auth', auth);
app.use('/api/edu_docs', edu_docs);
app.use('/api/main', main);
app.use('/api/users', user);
app.use('/api/soap', router);
app.use('/api/vacancy_appeals', vacancy_appeals);
app.use('/api/out_of_schools', out_of_schools);
app.use('/api/children', children);
app.use('/api/global', global);
app.use('/api/olympiad', olympiad);
app.use('/api/support', support);
app.use('/api/course', course);
app.use('/api/pts', pts);
app.use('/api/informal-education', informal_education);
app.use('/api/edu_repair', edu_repair);
app.use('/api/e-reference', e_reference);
app.use('/api/student_apply_new', student_apply_new);
app.use('/api/certification', certification);
app.use('/api/admin', admin);
app.use('/api/debt', debt);

/** QFIT - Admin panel */

// const qfit = express();
// import authorization from "../src/qfit/src/router/authorization"
// import dashboard from "../src/qfit/src/router/dashboard.js";
// import apply from "../src/qfit/src/router/apply.js";
// import expert from "../src/qfit/src/router/expert.js";
// import commission from "../src/qfit/src/router/commission.js";
// import soap_query from "../src/qfit/src/router/soap_query.js"
// import module from "../src/qfit/src/router/module.js";
// import specialty from "../src/qfit/src/router/specialty.js";
// import applysession from "../src/qfit/src/router/applysession.js";
// import {getExportExcel, qfitGetfile, getFileIn} from "../src/qfit/src/helper/helper.js";
// import documentation from "../src/qfit/src/router/documentation.js";
// import excelexport from "../src/qfit/src/router/excelexport.js";
//
// qfit.use(bodyParser.json({ limit: '2000mb' }));
// qfit.use(bodyParser.urlencoded({ limit: '2000mb', extended: true }));
// qfit.use(bodyParser.urlencoded({extended: true}))
// qfit.use(bodyParser.json())
// qfit.use(checkurl);
//
// qfit.get('/getfile/:file', qfitGetfile);
// qfit.get('/get/excel/export/:folder/:file', getExportExcel);
// qfit.get('/api/getfile/:doc/:type/:file', getFileIn);
//
// qfit.use('/api/auth', authorization)
// qfit.use('/api/dashboard',dashboard)
// qfit.use('/api/apply',apply)
// qfit.use('/api/expert',expert)
// qfit.use('/api/commission',commission)
// qfit.use('/api/soap',soap_query)
// qfit.use('/api/module',module)
// qfit.use('/api/specialty',specialty)
// qfit.use('/api/session',applysession)
// qfit.use('/api/documentation',documentation)
// qfit.use('/api/excel/export',excelexport)

/** QFIT - Admin panel -Kod sonu */

const app2 = express();
app2.use(cookieParser());
app2.use(bodyParser.json({ limit: '2000mb' }));
app2.use(bodyParser.urlencoded({ limit: '2000mb', extended: true }));
app2.use(checkurl);
app2.use('/api/global', global_4448);

/**
 * app.get('/.well-known/pki-validation/:f', (req, res) => {
	res.sendFile(req.params.f, { root: path.join(__dirname, './') })
});
 */

// const root = path.join(__dirname, '../../', 'build/')
// app.use(express.static(root))
// app.use((req, res, next) => {
// 	if (req.method === 'GET' && req.accepts('html') && !req.is('json') && !req.path.includes('.')) {
// 		res.sendFile('index.html', { root })
// 	} else next()
// });

app.get('/sequelize', async (req, res) => {
  await db.sequelize.sync();
  res.json('Sequelize work');
});

const server = http
  .createServer(app)
  .listen(4911, () => cl('Running on:4911', 'purple'));
// const server = http.createServer(app).listen(80, () => cl("Running on:80", "purple"));

const server2 = http
  .createServer(app2)
  .listen(4448, () => cl('Running on:4448', 'purple'));

// const server2 = http.createServer(app2).listen(4448, () => cl("Running on:4448", "purple"));

/* soap_server.listen(server, '/soap_server', mySoapServices, fs.readFileSync(path.resolve(__dirname, './http_myservice.wsdl'), 'utf8'), () => cl("Running HTTP SOAP Server", "purple"));
 */
// const httpsServer = https.createServer({
// 	key: fs.readFileSync("./ssl/portal_edu_az.key"),
// 	cert: fs.readFileSync("./ssl/portal_edu_az.crt")
// }, app).listen(443, () => cl("Running on:443", "purple"));
// soap_server.listen(httpsServer, '/soap_server', mySoapServices, fs.readFileSync(path.resolve(__dirname, './https_myservice.wsdl'), 'utf8'), () => cl("Running HTTPS SOAP Server", "purple"));
// socket(server);
// }
