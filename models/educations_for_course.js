const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('educations_for_course', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    course_appeals_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    education_type: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    abroad_education_type: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    enterprises: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    edu_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    doc_scan: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    specialty: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    teaching_language: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    material_base: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    doc_series_number: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    admission_date: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    graduate_date: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    education_level: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    diplom_series_number: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    education_duration: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    region: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    edu_base: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    given_date: {
      type: DataTypes.STRING(250),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'educations_for_course',
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
