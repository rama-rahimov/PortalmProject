const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dim_datas', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    dimNo: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    specialtyDimCode: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: "specialtyDimCode"
    },
    entranceSpecialty: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    specialtyPassword: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    specialtyName: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    institutionAtisId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: "institutionAtisId"
    },
    EntranceYear: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    educationLanguageId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    educationFormId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    paymentTypeId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    entranceSpecialtyPaymentAmount: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    EducationStageId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    educationLevelId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    basicEducation: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    teachingYear: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    fin: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: "fin"
    },
    tur: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      unique: "tur"
    },
    pointsOnEntrance: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    phone_number: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    smssend: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 1
    },
    ReceptionLineId: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 1
    },
    isFinish: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'dim_datas',
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
        name: "tur",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "tur" },
        ]
      },
      {
        name: "specialtyDimCode",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "specialtyDimCode" },
        ]
      },
      {
        name: "institutionAtisId",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "institutionAtisId" },
        ]
      },
      {
        name: "fin",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "fin" },
        ]
      },
      {
        name: "dim_datas_index",
        using: "BTREE",
        fields: [
          { name: "fin" },
          { name: "end_date" },
          { name: "entranceSpecialty" },
        ]
      },
    ]
  });
};
