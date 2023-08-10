const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('informal_edu_session_exam_results', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    session_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    inf_education_apply_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    fin: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    theo_value: {
      type: DataTypes.DECIMAL(10,0),
      allowNull: true
    },
    exam_not_passed: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'informal_edu_session_exam_results',
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
