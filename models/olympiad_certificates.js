const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('olympiad_certificates', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    olympiad_apply_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    doc_scan: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ""
    }
  }, {
    sequelize,
    tableName: 'olympiad_certificates',
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
