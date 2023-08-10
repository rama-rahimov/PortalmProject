const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('service_left_bar', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    service_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: ""
    },
    title: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ""
    },
    titleEn: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    url: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ""
    },
    includes: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ""
    },
    is_equals: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'service_left_bar',
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
