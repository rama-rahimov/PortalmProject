const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('olympiad_apply', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    step: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    child_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    olympiad_process_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    olympiad_type: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    citizenship: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    fin: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    father_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    birth_date: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    is_address_current: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    actual_address: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    parent_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    utis_code: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    region: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    current_enterprise: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    teaching_language: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    grade: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    olympiad_module_id: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    english_indicator: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    exam_result: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    project_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    name_of_scientific_adviser: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    surname_of_scientific_adviser: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    phone_number_of_scientific_adviser: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    name_specialist_scientist: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    surname_specialist_scientist: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    phone_number_specialist_scientist: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    videoUrl: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    docUrl: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    enterprise_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    room_no: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    seat_no: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    create_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'olympiad_apply',
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
