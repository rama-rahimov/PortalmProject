const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('temp7', {
    xtisasn_ifri: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    xtisasn_ad: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Atis_ixtisas_ID: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: "Atis_ixtisas_ID"
    }
  }, {
    sequelize,
    tableName: 'temp7',
    timestamps: false,
    indexes: [
      {
        name: "Atis_ixtisas_ID",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "Atis_ixtisas_ID" },
        ]
      },
    ]
  });
};
