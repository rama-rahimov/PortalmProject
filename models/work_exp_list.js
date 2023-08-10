const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('work_exp_list', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    vacancy_appeals_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    company: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    employer: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    contract_type: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    position: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    work_type: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    start_date: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    end_date: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    salary: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    area_of_activity: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    isApi: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'work_exp_list',
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
