const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tempdata22', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ATIS_ID: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    enterprise_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    enterprise_ATIS_ID: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    specialty_code: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    educationForms: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tempdata22',
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
