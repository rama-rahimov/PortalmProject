const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('utis_schools', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    address: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(30,6),
      allowNull: true
    },
    paralel: {
      type: DataTypes.DECIMAL(30,6),
      allowNull: true
    },
    regionId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    regionName: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    schoolCode: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    schoolKind: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    schoolKindId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    schoolType: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    schoolTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    subjection: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    subjectionId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'utis_schools',
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
