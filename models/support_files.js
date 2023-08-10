const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('support_files', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    support_apply_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    doc_scan: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: ""
    }
  }, {
    sequelize,
    tableName: 'support_files',
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
