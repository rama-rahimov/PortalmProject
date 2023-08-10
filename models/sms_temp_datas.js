const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sms_temp_datas', {
    fin: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    login: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    pass: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    link: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'sms_temp_datas',
    timestamps: false
  });
};
