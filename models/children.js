const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('children', {
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
    fin: {
      type: DataTypes.STRING(25),
      allowNull: true,
      defaultValue: "",
      unique: true
    },
    birth_certificate_no: {
      type: DataTypes.STRING(25),
      allowNull: true,
      defaultValue: ""
    },
    type: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ""
    },
    region: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ""
    },
    current_enterprise: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ""
    },
    grade: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ""
    },
    teaching_language: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ""
    },
    parent_type: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ""
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    school_code: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    utis_code: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    edu_level: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ""
    }
  }, {
    sequelize,
    tableName: 'children',
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
