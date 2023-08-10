const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('elevens', {
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
    tableName: 'elevens',
    timestamps: false,
    indexes: [
      {
        name: "elevens_index",
        using: "BTREE",
        fields: [
          { name: "FIN" },
        ]
      },
    ]
  });
};
