const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('miq_neticeler', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fin: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ad: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    soyad: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ata_adi: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    peshe_istiqameti: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ixtisas_duz: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ixtisas_sehv: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ixtisas_cavablandirilmayan: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    metodika_duz: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    metodika_sehv: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    metodika_cavablandirilmayan: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    mentiq_duz: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    mentiq_sehv: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    mentiq_cavablandirilmayan: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    umumi_duz: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    umumi_sehv: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    umumi_cavablandirilmayan: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    imtahan_gunu: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    seans: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    bashlama_vaxti: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    bitirme_vaxti: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    istifade_edilen_deqiqe: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    elave_olunmush_deqiqe: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'miq_neticeler',
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
