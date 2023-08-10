const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('informal_edu_session_date', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    theo_protocol_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    theo_questions_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    theo_secretary: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    theo: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 0
    },
    theo_document: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    theo_minimum_point: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    theo_exam_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    theo_protocol_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    prac: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    prac_protocol_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    prac_secretary: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    prac_protocol_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    prac_exam_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    prac_document: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    theo_up_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    prac_up_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    apply_status: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'informal_edu_session_date',
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
