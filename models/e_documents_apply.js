const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('e_documents_apply', {
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
    status: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    step: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fin: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    docNo: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: "docNo"
    },
    country: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    country_code: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    first_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    father_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    birth_date: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    actual_address: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    actual_region: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    citizenship: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    is_address_current: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    direction: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    edu_level: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    document_purpose: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    programs_type: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    reference_provided: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    agency_government: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'agency_government',
        key: 'id'
      }
    },
    program: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    edu_institution: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    level_of_edu: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    specialty: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    edu_duration: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    entranceYear: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    update_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    apply_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'e_documents_apply',
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
