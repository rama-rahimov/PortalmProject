const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('appealed_out_of_schools', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    appeals_out_of_school_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'appeals_out_of_school',
        key: 'id'
      }
    },
    out_of_school_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'appealed_out_of_schools',
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
