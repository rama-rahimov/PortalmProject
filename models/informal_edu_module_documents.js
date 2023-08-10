const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('informal_edu_module_documents', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    inf_education_apply_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'informal_edu_user_modules',
        key: 'inf_education_apply_id'
      }
    },
    module_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    certificate: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    protocol: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    extract: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'informal_edu_module_documents',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      }
    ]
  });
};
