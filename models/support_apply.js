const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('support_apply', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fin: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    child_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tms_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dublicateId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    step: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    theme: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    description_application: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    result: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    area_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    apply_type: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    education_type: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    contingent: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    child_citizenship: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    child_fin: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    child_utis_code: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    child_first_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    child_last_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    child_father_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    child_birth_date: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    child_address: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    child_is_address_current: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    child_actual_address: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    child_city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    child_region: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    child_current_enterprise: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    child_teaching_language: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    child_grade: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    child_parent_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    current_enterprise: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    consent: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    general_information: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    citizenship: {
      type: DataTypes.STRING(250),
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
      type: DataTypes.BOOLEAN,
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
    email: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    country_code: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    born_country: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    rate_value: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    edu_doc_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rate_comment: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    createInCallCenter: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    create_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'support_apply',
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
