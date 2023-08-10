const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('informal_edu_previous_info', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    inf_education_apply_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    education_type: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    abroad_education_type: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    enterprises: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    edu_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    doc_scan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    teaching_language: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    specialty: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    edu_base: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    education_level: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    doc_series_number: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    diplom_series_number: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    material_base: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    graduate_date: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    given_date: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    admission_date: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    education_duration: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'informal_edu_previous_info',
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
