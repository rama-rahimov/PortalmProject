const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('country', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    iso: {
      type: DataTypes.CHAR(2),
      allowNull: false,
      defaultValue: ""
    },
    nameEn: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: ""
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    iso3: {
      type: DataTypes.CHAR(3),
      allowNull: true
    },
    numcode: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    phonecode: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    min_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 4
    },
    max_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 13
    },
    recognized: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'country',
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
