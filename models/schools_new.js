const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('schools_new', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    student_cart_id: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    DIM_ID: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    DTS_ID: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    DM_NAME: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    name_eng: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    Abreviatura_AZE: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    Abreviatura_ENG: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    old_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    org_id: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    org_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    org_old_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    org_old_id: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(250),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'schools_new',
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
