const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ent_sp_join', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    year: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: "2020\/2021"
    },
    enterprise_DIM_ID: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    enterprise: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    enterprise_ATIS_ID: {
      type: DataTypes.STRING(250),
      allowNull: true,
      references: {
        model: 'atis_enterprises',
        key: 'ATIS_ID'
      }
    },
    specialty_code: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    specialty_DIM_ID: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    specialty: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    specialty_ATIS_ID: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    paymentTypeId: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    educationLanguageId: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    educationFormId: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    payment_amount: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    EducationStageId: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    educationLevelId: {
      type: DataTypes.STRING(250),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ent_sp_join',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      }
    ]
  });
};
