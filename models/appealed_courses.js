const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('appealed_courses', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    course_appeals_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    enterprises_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    corpus_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    teaching_year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    oc_direction: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    specialty_code: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    specialty: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    max_student_capacity: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    special_student_capacity: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    education_duration: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    last_date: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: ""
    },
    lesson_hour: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    reason: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    holy: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    enterprises_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    corpus_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    specialty_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    teaching_language: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    teaching_year_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    oc_direction_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    specialty_code_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    financing: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    create_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'appealed_courses',
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
