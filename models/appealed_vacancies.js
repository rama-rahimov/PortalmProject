const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('appealed_vacancies', {
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
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'vacancy_appeals',
        key: 'id'
      }
    },
    vacancy_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    districts: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ""
    },
    enterprises: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ""
    },
    corpuses: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ""
    },
    modules: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: ""
    },
    vacant_load: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    vacant_place: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
      comment: "0,1 - Yeni, 2 - Müsahibəyə buraxıldı, 3 - Müsahibəyə buraxılmadı, 4 - Müsahibədən keçdi, 5 - Müsahibədən keçmədi, 6 - Qəbul oldu, 7 - Qəbul olmadı, 8 - Sənədlərini təqdim etməkdən imtina elədi, 9 - Sənədlərini geri götürdü, 10 - İmtahandan keçdi\/Müsahibəyə buraxıldı, 11 - İmtahandan keçmədi"
    },
    teaching_language: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    priority: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    position: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    position_id: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    reasonMessage: {
      type: DataTypes.STRING(250),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'appealed_vacancies',
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
