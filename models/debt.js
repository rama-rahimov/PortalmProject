const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('debt', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    status: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    step: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    fin: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: ""
    },
    citizenship: {
      type: DataTypes.STRING(5),
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
    birth_date: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    is_address_current: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    actual_address: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    confirm_email: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    level_of_education: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    education_level: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    education_institution: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    education_base: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    admission_year: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    specialty: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    specialty_password: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    sub_specialty: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    specialization: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    sub_specialization: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    education_type: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    education_language: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    invoice: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    subjectName: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    directed_enterprise: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    remainDebt: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    invoiceCreateDate: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    invoiceEndDate: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    RecoveryType: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    isSend: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    reject_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reject_files: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'debt',
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
