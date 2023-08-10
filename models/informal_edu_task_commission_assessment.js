const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('informal_edu_task_commission_assessment', {
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
    commission_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    inf_education_apply_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    module_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    assessment_status: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'informal_edu_task_commission_assessment',
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
