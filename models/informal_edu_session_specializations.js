const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('informal_edu_session_specializations', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    session_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    specialty_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'informal_edu_specializations',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    specialty_status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    module_status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'informal_edu_session_specializations',
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
        name: "specialty_id",
        using: "BTREE",
        fields: [
          { name: "specialty_id" },
        ]
      },
    ]
  });
};
