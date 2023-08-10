const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('informal_edu_user_modules', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    inf_education_apply_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      unique: "inf_education_apply_id"
    },
    module_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'informal_edu_specialty_modules',
        key: 'id'
      }
    },
    sn: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    module_name: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    payment_status: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    assignment_status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      unique: "status"
    }
  }, {
    sequelize,
    tableName: 'informal_edu_user_modules',
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
      {
        name: "inf_education_apply_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "inf_education_apply_id" },
        ]
      },
      {
        name: "status",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      }
    ]
  });
};
