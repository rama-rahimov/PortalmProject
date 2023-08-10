const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('nines', {
    SOYADI: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ADI: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ATA_ADI: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    FIN: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'nines',
    timestamps: false,
    indexes: [
      {
        name: "nines_index",
        using: "BTREE",
        fields: [
          { name: "FIN" },
        ]
      },
    ]
  });
};
