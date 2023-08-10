const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sub_specializations', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    ATIS_ID: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    specialization_ATIS_ID: {
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
    }
  }, {
    sequelize,
    tableName: 'sub_specializations',
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
