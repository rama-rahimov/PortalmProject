const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('additional_educations', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    fin: {
      type: DataTypes.STRING(250),
      allowNull: true
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
    ReceptionLineId: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    EducationStageId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    educationLevelId: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    institutionAtisId: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    entranceSpecialty: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    paymentTypeId: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.STRING(250),
      allowNull: true
    },
    specialtyPassword: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    previousEduStageId: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    previousEduLevelId: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    passportScan: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    scanningCertificateOfHealth: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    previousEducationDocument: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    previousEducationLegalizedDocument: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    previousEducationTranslatedDocument: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    certificateOfLanguageInstruction: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    secondarySpecialEducationDiplomaScan: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    equivalenceOfSpecialtyDocScan: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    paymentChekScan: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    cartType: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cardBinCode: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    EntranceYear: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    specialtyName: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    factorStudyAz: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    entranceSubSpecialty: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    teachingYear: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    graduationYear: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    documentType: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    documentNo: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    additionalEducationTypeId: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    previousSpecialtyName: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    reject_description: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    reject_files: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    previousInstitutionName: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    previousInstitution: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    previousSpecialty: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    previousSpecialtyCode: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    admissionYear: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    previousBasicEducation: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    basicEducation: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    isSend: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'additional_educations',
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
        name: "additional_educations_index",
        using: "BTREE",
        fields: [
          { name: "fin" },
          { name: "user_id" },
        ]
      },
    ]
  });
};
