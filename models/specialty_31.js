const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('specialty_31', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    enterprises_id: {
      type: DataTypes.STRING(400),
      allowNull: true
    },
    code_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(450),
      allowNull: true
    },
    sifr: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
    },
    oc_direction: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    education_duration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    education_level: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    teaching_language: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    group_limit: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    },
    deleted: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    exc: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    teaching_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    holy: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'specialty_31',
    timestamps: false,
    paranoid: true,
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
        name: "specialty_31_index",
        using: "BTREE",
        fields: [
          { name: "enterprises_id" },
          { name: "code_id" },
          { name: "oc_direction" },
          { name: "teaching_year" },
        ]
      },
    ]
  });
};
