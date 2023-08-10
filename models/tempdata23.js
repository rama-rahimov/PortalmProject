const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tempdata23', {
    name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ATIS_ID: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tempdata23',
    timestamps: false
  });
};
