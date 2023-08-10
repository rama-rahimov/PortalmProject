const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('currencies', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    Code: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: ""
    },
    Nominal: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: ""
    },
    Value: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'currencies',
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
