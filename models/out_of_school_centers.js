const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('out_of_school_centers', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: ""
    },
    direction: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: ""
    },
    circle: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: ""
    },
    enterprise: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: ""
    },
    city: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: ""
    },
    region: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: ""
    },
    address: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: ""
    },
    locationLat: {
      type: DataTypes.DOUBLE(22,5),
      allowNull: true
    },
    locationLon: {
      type: DataTypes.DOUBLE(22,5),
      allowNull: true
    },
    utis_id: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    phone1: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    phone2: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    director: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    min_age: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: "0"
    },
    min_age_2: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: "0"
    }
  }, {
    sequelize,
    tableName: 'out_of_school_centers',
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
