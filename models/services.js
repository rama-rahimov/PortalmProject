const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('services', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    preference: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ""
    },
    redirect_url: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ""
    },
    icon: {
      type: DataTypes.STRING(250),
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
    description: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ""
    },
    descriptionEn: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    is_test: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    is_global: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    is_finish: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    is_soon: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    is_translate: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'services',
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
