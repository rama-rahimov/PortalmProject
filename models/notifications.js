const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('notifications', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    service: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: ""
    },
    fin: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: ""
    },
    key: {
      type: DataTypes.STRING(11),
      allowNull: true
    },
    title: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    extra_data: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    files: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'notifications',
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
        name: "notifications_index",
        using: "BTREE",
        fields: [
          { name: "service" },
          { name: "date" },
        ]
      },
    ]
  });
};
