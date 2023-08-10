const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: ""
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: ""
    },
    role: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    phone: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: ""
    },
    country_code: {
      type: DataTypes.STRING(11),
      allowNull: true
    },
    fin: {
      type: DataTypes.STRING(35),
      allowNull: false,
      defaultValue: "",
      unique: "fin"
    },
    citizenshipId: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    asanLogin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    create_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'users',
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
        name: "fin",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "fin" },
        ]
      },
    ]
  });
};