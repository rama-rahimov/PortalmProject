const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dq_miq_exam', {
    fin: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    fenn: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    bolme: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    umumi_bal: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    ixtisas_bal: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    metodika_bal: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    tarix: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    imtahan: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'dq_miq_exam',
    timestamps: false
  });
};
