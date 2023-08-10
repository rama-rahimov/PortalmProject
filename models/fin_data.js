const Sequelize = require('sequelize') ;
module.exports =  function(sequelize, DataTypes) {
  return sequelize.define('fin_data', {
    fin: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: ""
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
      type: DataTypes.STRING(30),
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    series: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    number: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    giving_authority: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    giving_date: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    exp_date: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    district: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    born_country: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    citizenship: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    actual_address: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    social_status: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    i_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    i_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    not_photo: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    militaryStatus: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    e_documents_fin: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    children_fin: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'fin_data',
    timestamps: false,
    indexes: [
      {
        name: "fin_data_index",
        using: "BTREE",
        fields: [
          { name: "first_name" },
          { name: "last_name" },
          { name: "father_name" },
          { name: "birth_date" },
          { name: "gender" },
          { name: "series" },
          { name: "number" },
          { name: "giving_authority" },
          { name: "giving_date" },
          { name: "exp_date" },
          { name: "district" },
          { name: "born_country" },
          { name: "citizenship" },
          { name: "social_status" },
          { name: "address" },
        ]
      },
    ]
  });
};

