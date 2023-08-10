const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('rewards', {
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
    vacancy_appeals_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    rewarding_doc: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    rewarding_date: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    rewarding: {
      type: DataTypes.STRING(250),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'rewards',
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
