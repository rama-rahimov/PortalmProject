const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('edu_repair_apply', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    step: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    first_name: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    father_name: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    birth_date: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    actual_address: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    citizenship: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    is_address_current: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    fin: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    edu_institution: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    name_of_other_enterprise: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    apartment: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    specialty: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    name_of_other_specialty: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    year_of_admission: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    date_of_freezing_edu: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    teaching_group: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    reason_for_freezing_edu: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    number_of_order_freezing_edu: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    education_level: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    education_base: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    education_fees: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    education_duration: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    section: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    edu_direction: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    specialty_code: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    genderId: {
      type: DataTypes.TINYINT.UNSIGNED.ZEROFILL,
      allowNull: true
    },
    course: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    borncity: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: ""
    },
    name_of_other_apartment: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    edu_repair_number: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    edu_repair_date: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    edu_repair_file: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    reasonMessage: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    social_status: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    social_scan: {
      type: DataTypes.STRING(150),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'edu_repair_apply',
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
