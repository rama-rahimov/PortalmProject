const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('informal_edu_task_content_assessment', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    task_assessment_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    task_content_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    evaluate: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    evaluate_note: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'informal_edu_task_content_assessment',
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
