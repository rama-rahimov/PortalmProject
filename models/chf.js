const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('chf', {
    fin: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'chf',
    timestamps: false,
    indexes: [
      {
        name: "chf_fin",
        using: "BTREE",
        fields: [
          { name: "fin" },
        ]
      },
    ]
  });
};
