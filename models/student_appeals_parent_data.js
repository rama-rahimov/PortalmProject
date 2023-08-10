const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('student_appeals_parent_data', {
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
    student_appeal_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'student_appeals',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    parent_first_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_last_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_father_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_birth_date: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_actual_region: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_is_address_current: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    parent_citizenshipId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    parent_fin: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_series: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_number: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_type: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    parent_genderId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    parent_actual_address: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_n_country: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_phone: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_citizenship: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    parent_docType: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    parent_s_docType: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    parent_s_citizenshipId: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    parent_s_fin: {
      type: DataTypes.STRING(12),
      allowNull: true
    },
    parent_s_type: {
      type: DataTypes.STRING(12),
      allowNull: true
    },
    parent_country_code: {
      type: DataTypes.STRING(12),
      allowNull: true
    },
    parent_address: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_s_first_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_s_last_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_s_father_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_s_birth_date: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_s_actual_region: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_s_citizenship: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_s_series: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_s_number: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_s_genderId: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_s_actual_address: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_s_address: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_s_phone: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_s_country_code: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_s_absence_reason: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_absence_reason: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_s_n_country: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    parent_confirming_document: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_s_confirming_document: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_s_is_address_current: {
      type: DataTypes.STRING(2),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'student_appeals_parent_data',
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
