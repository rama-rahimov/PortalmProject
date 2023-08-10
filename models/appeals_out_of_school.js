const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('appeals_out_of_school', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    children_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    step: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    status: {
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
      type: DataTypes.STRING(25),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    actual_address: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    genderId: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    is_address_current: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    region: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    current_enterprise: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    grade: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    parent_type: {
      type: DataTypes.STRING(11),
      allowNull: true
    },
    teaching_language: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    health_cert_date: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    health_cert_no: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    health_cert_scan: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    photo_3x4_scan: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    birth_cert_scan: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    create_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'appeals_out_of_school',
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
