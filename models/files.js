const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('files', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    token: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "",
      unique: "token"
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    path: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    fin: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'files',
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
      {
        name: "token",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "token" },
        ]
      },
    ]
  });
};
