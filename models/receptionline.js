const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('receptionline', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    group: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ""
    },
    name: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ""
    },
    nameEn: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: ""
    },
    ATIS_ID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_delete: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'receptionline',
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
