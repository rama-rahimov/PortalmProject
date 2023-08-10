const Sequelize = require('sequelize') ;
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('phone_verification', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    country_code: {
      type: DataTypes.STRING(11),
      allowNull: true,
      defaultValue: ""
    },
    phone: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: "0"
    },
    code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "0"
    },
    applicants_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    verify: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updated_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    number_wait_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    count: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'phone_verification',
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
        name: "phone_verification_index",
        using: "BTREE",
        fields: [
          { name: "phone" },
          { name: "code" },
        ]
      },
    ]
  });
};
