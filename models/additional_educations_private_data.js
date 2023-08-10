const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('additional_educations_private_data', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    fin: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    additional_education_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    first_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    father_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    middle_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    birth_date: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    actual_region: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    is_address_current: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    actual_address: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    n_country: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    genderId: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    passport_series: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    passport_number: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    citizenship: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    maritalStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    adress_in_foreign: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    last_live_country: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    country_code: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    birth_certificate: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    have_residence_permit: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'additional_educations_private_data',
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
        name: "additional_educations_private_data_index",
        using: "BTREE",
        fields: [
          { name: "additional_education_id" },
        ]
      },
    ]
  });
};
