const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('student_appeals', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    fin: {
      type: DataTypes.STRING(100),
      allowNull: true,
      references: {
        model: 'dim_datas',
        key: 'fin'
      }
    },
    step: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    ReceptionLineId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    EducationStageId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    educationLevelId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    institutionAtisId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    dimNo: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    specialtyDimCode: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    entranceSpecialty: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    paymentTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    subordinateSpecialization: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    educationFormId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    educationLanguageId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    entranceSpecialtyPaymentAmount: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    specialtyPassword: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    previousEduStageId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    previousEduLevelId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    passportScan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    scanningCertificateOfHealth: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    previousEducationDocument: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    previousEducationLegalizedDocument: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    previousEducationTranslatedDocument: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    certificateOfLanguageInstruction: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    personnelRegistrationCard: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    biographyDocScan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    photo3x4: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    workCertificateScan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    workExperienceScan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    publishedScientificWorksScan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    publishedScientificWorkListScan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    diplomaOfHigherEducationScan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    identityDocumentScan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    diplomaOfDoctorOfPhilosophyScan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    basicEducation: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    pointsOnEntrance: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    schoolDiplomaScan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    higherSchoolDiplomaScan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    higherVocationalEducationDiplomaScan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    secondarySpecialEducationDiplomaScan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    highEducationDiplomaScan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    equivalenceOfSpecialtyDocScan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    medicalActivityDocScan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    healthCertificateScan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    militaryRegistrationDocumentScan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    militaryIDDocumentScan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    paymentChekScan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cartType: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cardBinCode: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    EntranceYear: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    militaryService: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_new_payment: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    reject_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    specialtyName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    reject_files: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    custom_password: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    tur: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'dim_datas',
        key: 'tur'
      }
    },
    isSend: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    create_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    preparation: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    factorStudyAz: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    entranceSubSpecialization: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    entranceSubSpecialty: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    entranceSpecialization: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    previousBasicEducation: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    teachingYear: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    preparation_amount: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    update_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    checkCustomPassword: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    customPassword: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    previousInstitutionName: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    semester: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    preparation_amunt: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    payment_method: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    hasDiscount: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    isHaveIELTS: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    examForeignLanguage: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    isEmployee: {
      type: DataTypes.STRING(2),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'student_appeals',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "student_appeals_index",
        using: "BTREE",
        fields: [
          { name: "create_date" },
          { name: "fin" },
          { name: "user_id" },
        ]
      },
    ]
  });
};
