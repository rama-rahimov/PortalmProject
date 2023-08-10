const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sub_specialities', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ATIS_ID: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    enterprise_ATIS_ID: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    specialty_ATIS_ID: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    specialty_code: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    paymentTypeId: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    educationLanguageId: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    educationFormId: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    EducationStageId: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    educationLevelId: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    teachingYear: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    entranceSpecialtyPaymentAmount: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    preparation_amunt: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    basicEducation: {
      type: DataTypes.DOUBLE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'sub_specialities',
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
    ]
  });
};
