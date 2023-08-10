const fs = require('fs');
const PDFDocument = require('pdfkit');
const PDFIm = require("pdf-image") ;
const qrcode = require('qrcode') ;

const PDFImage = PDFIm.PDFImage ;

const readyDoc = (data, callback) => {

      if (!fs.existsSync(`./uploads/reference`)) { fs.mkdirSync(`./uploads/reference`, { recursive: true }, err => { console.log(err) }); }
      const doc = new PDFDocument({ margin: 0, size: [595, 841] });
      let stcolor = '#bababa';
      let tcolor = '#696a6e';

      doc.font(__dirname + '/edoc/Segoeui.ttf');
      doc.fillColor(tcolor).fontSize(11.22).text('Azərbaycan Respublikası Təhsil Nazirliyi', 200, 29.04);
      doc.fillColor(stcolor).fontSize(8).text('Redaksiya /Version: #1', 483.43, 22.53);

      doc.image(__dirname + '/edoc/logo.png', 40.74, 62.42, { width: 120.34 });

      doc.fillColor(tcolor).fontSize(8).text('ARAYIŞ', 200, 75);
      doc.fillColor(stcolor).fontSize(8).text('sənəd', 200, 90);

      doc.fillColor(tcolor).fontSize(8).text((data.direction || "").toLocaleUpperCase('az-AZ'), 200, 110);
      doc.fillColor(stcolor).fontSize(8).text('istiqamət', 200, 125);

      doc.fillColor(tcolor).fontSize(8).text((data.document_purpose || "").toLocaleUpperCase('az-AZ'), 200, 145);
      doc.fillColor(stcolor).fontSize(8).text('Sənədin təyinatı', 200, 160);


      doc.fillColor(tcolor).fontSize(8).text(data.document_series_number, 450, 75);
      doc.fillColor(stcolor).fontSize(8).text('IN', 450, 90); //????

      var d = new Date(),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

      if (month.length < 2)
            month = '0' + month;
      if (day.length < 2)
            day = '0' + day;

      [day, month, year].join('.')
      doc.fillColor(tcolor).fontSize(8).text([day, month, year].join('.'), 450, 110);
      doc.fillColor(stcolor).fontSize(8).text('verilmə tarixi', 450, 125);

      if (data.type !== 1 || data.document_purpose_type === 1) {
            doc.fillColor(tcolor).fontSize(8).text('30 gün', 450, 145);
            doc.fillColor(stcolor).fontSize(8).text('Etibarlılıq müddəti', 450, 160);
      }

      line(doc, 200);

      doc.fillColor(tcolor).fontSize(8).text('ŞƏXSİYYƏT VƏSİQƏSİ', 40.74, 220);
      doc.fillColor(stcolor).fontSize(8).text('Şəxsi identifikasiya sənədi', 40.74, 235); //????

      doc.fillColor(tcolor).fontSize(8).text((data.first_name || "").toLocaleUpperCase('az-AZ'), 40.74, 255);
      doc.fillColor(stcolor).fontSize(8).text('Ad', 40.74, 270);

      doc.fillColor(tcolor).fontSize(8).text((data.last_name || "").toLocaleUpperCase('az-AZ'), 40.74, 290);
      doc.fillColor(stcolor).fontSize(8).text('Soyad', 40.74, 305);


      doc.fillColor(tcolor).fontSize(8).text((data.fin || "").toLocaleUpperCase('az-AZ'), 450, 220);
      doc.fillColor(stcolor).fontSize(8).text('FİN', 450, 235);

      doc.fillColor(tcolor).fontSize(8).text((data.birth_date || "").toLocaleUpperCase('az-AZ'), 450, 255);
      doc.fillColor(stcolor).fontSize(8).text('Doğum tarixi', 450, 270);

      line(doc, 340);
      // -----
      if ([2, 3, 4].includes(data.type)) {
            doc.fillColor(tcolor).fontSize(8).text((data.edu_institution || "").toLocaleUpperCase('az-AZ'), 40.74, 360, { width: 380 });
            const edu_institutionH = doc.heightOfString((data.edu_institution || "").toLocaleUpperCase('az-AZ'), { width: 380 });
            doc.fillColor(stcolor).fontSize(8).text('Təhsil müəssisəsi', 40.74, edu_institutionH + 362);

            doc.fillColor(tcolor).fontSize(8).text((data.specialty || "").toLocaleUpperCase('az-AZ'), 40.74, 415);
            const specialtyH = doc.heightOfString((data.specialty || "").toLocaleUpperCase('az-AZ'), { width: 380 });
            doc.fillColor(stcolor).fontSize(8).text('İxtisas', 40.74, specialtyH + 417);

            doc.fillColor(tcolor).fontSize(8).text(data.educationLanguage, 40.74, 470);
            doc.fillColor(stcolor).fontSize(8).text('Tədris dili', 40.74, 485);

            doc.fillColor(tcolor).fontSize(8).text((data.educationForm || "").toLocaleUpperCase('az-AZ'), 40.74, 525);
            doc.fillColor(stcolor).fontSize(8).text('Təhsil alma forması', 40.74, 540);

            doc.fillColor(tcolor).fontSize(8).text((data.paymentType || "").toLocaleUpperCase('az-AZ'), 40.74, 580);
            doc.fillColor(stcolor).fontSize(8).text('Ödəniş forması', 40.74, 595);

            doc.fillColor(tcolor).fontSize(8).text((data.country || "").toLocaleUpperCase('az-AZ'), 450, 360);
            doc.fillColor(stcolor).fontSize(8).text('Ölkə', 450, 375);
            if (data.type !== 4) {
                  doc.fillColor(tcolor).fontSize(8).text((data.edu_level || "").toLocaleUpperCase('az-AZ'), 450, 415, { width: 105 });
                  const edu_level2H = doc.heightOfString((data.edu_level || "").toLocaleUpperCase('az-AZ'), { width: 105 });
                  doc.fillColor(stcolor).fontSize(8).text('Təhsil səviyyəsi', 450, edu_level2H + 417);
            }
            doc.fillColor(tcolor).fontSize(8).text(data.entranceYear || "", 450, 470);
            doc.fillColor(stcolor).fontSize(8).text('Qəbul ili', 450, 485);

            doc.fillColor(tcolor).fontSize(8).text((data.edu_duration || "").toLocaleUpperCase('az-AZ'), 450, 525);
            doc.fillColor(stcolor).fontSize(8).text('Təhsil müddəti', 450, 540);

            doc.fillColor(tcolor).fontSize(8).text(data.course || "", 450, 580);
            doc.fillColor(stcolor).fontSize(8).text('Kurs', 450, 595);

      } /*else if (data.type === 4) {
      ///utis
            doc.fillColor(tcolor).fontSize(8).text((data.edu_institution || "").toLocaleUpperCase('az-AZ'), 40.74, 360);
            doc.fillColor(stcolor).fontSize(8).text('Təhsil müəssisəsi', 40.74, 375);

            doc.fillColor(tcolor).fontSize(8).text(data.educationLanguage, 40.74, 415);
            doc.fillColor(stcolor).fontSize(8).text('Tədris dili', 40.74, 430);

            doc.fillColor(tcolor).fontSize(8).text((data.educationForm || "").toLocaleUpperCase('az-AZ'), 40.74, 470);
            doc.fillColor(stcolor).fontSize(8).text('Təhsil alma forması', 40.74, 485);

            doc.fillColor(tcolor).fontSize(8).text((data.region || "").toLocaleUpperCase('az-AZ'), 450, 360);
            doc.fillColor(stcolor).fontSize(8).text('Rayon (şəhər)', 450, 375);

            doc.fillColor(tcolor).fontSize(8).text((data.edu_level || "").toLocaleUpperCase('az-AZ'), 450, 415);
            doc.fillColor(stcolor).fontSize(8).text('Təhsil səviyyəsi', 450, 430);

            doc.fillColor(tcolor).fontSize(8).text((data.grade || "").toLocaleUpperCase('az-AZ'), 450, 470);
            doc.fillColor(stcolor).fontSize(8).text('Sinif', 450, 485);

      } */else if (data.type === 1) {
            doc.fillColor(tcolor).fontSize(8).text((data.program || "").toLocaleUpperCase('az-AZ'), 40.74, 370);
            doc.fillColor(stcolor).fontSize(8).text('Proqramın adı', 40.74, 390); //????

            doc.fillColor(tcolor).fontSize(8).text((data.edu_institution || "").toLocaleUpperCase('az-AZ'), 40.74, 415);
            doc.fillColor(stcolor).fontSize(8).text('Təhsil müəssisəsi', 40.74, 430);

            doc.fillColor(tcolor).fontSize(8).text('Ali təhsil', 40.74, 470);
            doc.fillColor(stcolor).fontSize(8).text('Təhsil pilləsi', 40.74, 485);

            doc.fillColor(tcolor).fontSize(8).text((data.specialty || "").toLocaleUpperCase('az-AZ'), 40.74, 525);
            doc.fillColor(stcolor).fontSize(8).text('İxtisas', 40.74, 540);


            doc.fillColor(tcolor).fontSize(8).text((data.country || "").toLocaleUpperCase('az-AZ'), 450, 415);
            doc.fillColor(stcolor).fontSize(8).text('Ölkə', 450, 430);

            doc.fillColor(tcolor).fontSize(8).text((data.edu_level || "").toLocaleUpperCase('az-AZ'), 450, 470, { width: 105 });
            const edu_level1H = doc.heightOfString((data.edu_level || "").toLocaleUpperCase('az-AZ'), { width: 105 });
            doc.fillColor(stcolor).fontSize(8).text('Təhsil səviyyəsi', 450, edu_level1H + 472);

            doc.fillColor(tcolor).fontSize(8).text((data.edu_duration || "").toLocaleUpperCase('az-AZ'), 450, 525);
            doc.fillColor(stcolor).fontSize(8).text('Təhsil müddəti', 450, 540);
      } else if (data.type === 5) {

            doc.fillColor(stcolor).fontSize(8).text("imtahan nəticələri", 48.74, 355);

            doc.fillColor(stcolor).fontSize(8).text("İMTAHAN NÖVÜ", 40.74, 380);
            doc.fillColor(stcolor).fontSize(8).text("İMTAHAN İLİ", 210, 380);
            doc.fillColor(stcolor).fontSize(8).text("BÖLMƏ", 275, 380);
            doc.fillColor(stcolor).fontSize(8).text("FƏNN", 340, 380);
            doc.fillColor(stcolor).fontSize(8).text("ÜMUMİ BAL", 450, 380);
            doc.fillColor(stcolor).fontSize(8).text("İXTİSAS BALI", 500, 380);

            let color_gray = true;
            let row_y = 395;
            (data.exam_datas || []).forEach(exam => {
                  doc.rect(39.73, row_y, 515.82, 14.42).fill(color_gray && '#f9f9fa' || '#ffffff');
                  doc.fillColor(tcolor).fontSize(7).text((exam.type || "").toLocaleUpperCase('az-AZ'), 40.74, row_y + 1.6);
                  doc.fillColor(tcolor).fontSize(7).text(exam.exam_year || "", 210, row_y + 1.6);
                  doc.fillColor(tcolor).fontSize(7).text((exam.language || "").toLocaleUpperCase('az-AZ'), 275, row_y + 1.6);
                  doc.fillColor(tcolor).fontSize(7).text((exam.lesson || "").toLocaleUpperCase('az-AZ'), 340, row_y + 1.6);
                  doc.fillColor(tcolor).fontSize(7).text(Number(exam.total_point), 450, row_y + 1.6);
                  doc.fillColor(tcolor).fontSize(7).text(Number(exam.ixtisas_point || 0) || "", 500, row_y + 1.6);
                  color_gray = !color_gray;
                  row_y = row_y + 14.45;
            });

      }
      // -----
      line(doc, 630);
      if (data.reference_provided) {
            doc.fillColor(stcolor).fontSize(8).text('Arayış təqdim edilir:', 40.74, 640);
            doc.fillColor(tcolor).fontSize(8).text((data.reference_provided || "").toLocaleUpperCase('az-AZ'), 40.74, 660);
      }
      (async () => {
            const qr = await qrcode.toDataURL(`https://edu.gov.az/yoxla?hash=${encodeURIComponent(data.hash)}`);
            doc.image(Buffer.from(qr.split(',')[1] || '', 'base64'), 40.74, 710, { width: 100 });

            // subtitle2(doc, 165.38, 740, `DİQQƏT! |||Cari attestatın çap forması məlumat məqsədlidir və yalnız orijinal attestatın sürəti kimi istifadə oluna bilər. Orijinal attestatın yoxlanılması mobil cıhazlarda QR kodu oxuyan proqram təminatı və ya |||www.edu.gov.az||| səhifəsinə daxil olaraq yuxarida qeyd olunan seriya nömrəsi vasitələriylə mümkündür.`);
            subtitle2(doc, 165.38, 740, `DİQQƏT! Elektron arayışın kağız daşıyıcıda çap edilmiş surətinin üzərindəki məlumatların doğruluğu Azərbaycan Respublikası Təhsil Nazirliyinin rəsmi internet səhifəsindən (www.edu.gov.az) sənədin identifikasiya nömrəsi əsasında və ya mobil telefondan sənədin üzərində təsvir olunmuş “QR kod” vasitəsilə yoxlanılması mümkündür.`);

            doc.end();
            doc.pipe(fs.createWriteStream(`./uploads/reference/${data.filename}.pdf`).on('close', function () {

                  save_img(data.filename, callback);
            }));
      })()


}



function subtitle2(doc, x, y, subTitle) {
      const tt = subTitle.split('|||');
      doc.fontSize(8).fillColor('#696a6e')
            .text(tt[0], x, y, {
                  underline: false,
                  link: 0,
                  continued: true,
                  width: 400
            }).fillColor('#bbbbbb')
            .text(tt[1]).fillColor('blue')
            .text(tt[2], {
                  underline: true,
                  link: 'www.diplom.edu.az',
                  continued: true
            }).fillColor('#bbbbbb')
            .text(tt[3], {
                  underline: false,
                  link: 0,
                  continued: false
            });
}


function line(doc, y, lcolor = '#E3E0E0') {
      doc.moveTo(40, y).lineTo(553, y).fill(lcolor).stroke();
}

function save_img(imagePath, callback) {
      var pdfImage = new PDFImage(`/var/www/sexsi_kabinet/api/uploads/reference/${imagePath}.pdf`, {
            graphicsMagick: true,
      });

      pdfImage.convertPage(0).then(function (imagePaths) {
            callback(imagePath);
      }).catch((e) => { callback(false); console.log(e); })

}

module.exports =  readyDoc;
