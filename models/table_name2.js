const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('table_name2', {
    iso: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    en_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    az_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    iso3: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'table_name2',
    timestamps: false
  });
};
