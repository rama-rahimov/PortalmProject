const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('e_documents', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    fin: {
      type: DataTypes.STRING(30),
      allowNull: true,
      unique: "fin"
    },
    hash: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    editorial: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    diplom_cat_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    document_no: {
      type: DataTypes.STRING(100),
      allowNull: true,
      references: {
        model: 'e_documents_apply',
        key: 'docNo'
      }
    },
    document_name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    edoc_diplom_url: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    edoc_supplement_url: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    pdf_diplom_url: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    pdf_supplement_url: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    img_diplom_url: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    img_supplement_url: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    file_details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    attention: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    extra_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    extra_key: {
      type: DataTypes.STRING(250),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'e_documents',
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
        name: "fin",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "fin" },
        ]
      }
    ]
  });
};
