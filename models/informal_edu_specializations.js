const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('informal_edu_specializations', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    ATIS_ID: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'informal_edu_appeals',
        key: 'ATIS_ID'
      }
    },
    specialty_ATIS_ID: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    sn: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    specialty_group_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    specialty: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    module_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    teaching_period: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    education_level: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    section: {
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
    tableName: 'informal_edu_specializations',
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
