const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('informal_edu_knowledge_and_skills', {
    inf_education_apply_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    file_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    file_name: {
      type: DataTypes.STRING(150),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'informal_edu_knowledge_and_skills',
    timestamps: false
  });
};
