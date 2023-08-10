const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('informal_edu_appeals', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    session_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    citizenship: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    fin: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    father_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    birth_date: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    genderId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    is_address_current: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ATIS_ID: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: "ATIS_ID"
    },
    specialty_ATIS_ID: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    sn: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    social_status: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    actual_address: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    borncity: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    social_scan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(17),
      allowNull: true
    },
    work_exp: {
      type: DataTypes.STRING(17),
      allowNull: true
    },
    social_card_number: {
      type: DataTypes.STRING(17),
      allowNull: true
    },
    id_copy: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    doc_scan2: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    theo_extract: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    prac_extract: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    confirm_email: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    assignment_status: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 0
    },
    payment_status: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 0
    },
    step: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    apply_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    apply_status: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'informal_edu_appeals',
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
        name: "ATIS_ID",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ATIS_ID" },
        ]
      },
    ]
  });
};
