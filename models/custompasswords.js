const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('custompasswords', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    password: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ""
    },
    fin: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    stage: {
      type: DataTypes.STRING(1),
      allowNull: true,
      defaultValue: ""
    },
    line: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    iso3: {
      type: DataTypes.STRING(5),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'custompasswords',
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
