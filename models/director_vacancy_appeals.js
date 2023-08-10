const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('director_vacancy_appeals', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    step: {
      type: DataTypes.BOOLEAN,
      allowNull: false
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
    social_status: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    actual_address: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    is_address_current: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    genderId: {
      type: DataTypes.BOOLEAN,
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
    is_author_book: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    has_academic_degree: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    work_exp: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    pedagogical_exp: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    emp_history_scan: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    has_current_work: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    has_teaching_aids: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    social_scan: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    dq_subject: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    miq_subject: {
      type: DataTypes.STRING(250),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'director_vacancy_appeals',
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
