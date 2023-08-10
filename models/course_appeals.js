const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('course_appeals', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    country: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    fin: {
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
    borncity: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    address: {
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
    actual_address: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    is_address_current: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    genderId: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    position_type: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    dq_point: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    miq_point: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    step: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    country_code: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    militaryService: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    social_status: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    social_scan: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    actual_region: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    lang: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    training_date: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    training_about: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    training_about_text: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    training_motivation: {
      type: DataTypes.STRING(250),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'course_appeals',
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
