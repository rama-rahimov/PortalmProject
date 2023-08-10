const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('enterprises_31', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    enterprises_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    create_date: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    subordination: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    district: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    species: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    end_date: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    teaching_week: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    teaching_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    accreditation: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    queue: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    profile: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    teaching_language: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    foreign_language: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    special_care: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    admission_plan: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    count_corpus: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    penitentiary: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "cəzaçəkmə müəssisəsi nəzdindədirmi"
    },
    voen: {
      type: DataTypes.STRING(155),
      allowNull: true
    },
    construction: {
      type: DataTypes.STRING(300),
      allowNull: true,
      comment: "Tikinti altında olan ərazi"
    },
    territory: {
      type: DataTypes.STRING(300),
      allowNull: true,
      comment: "İstifadə olunan ərazi"
    },
    extra_budgetary_funds: {
      type: DataTypes.STRING(300),
      allowNull: true,
      comment: "Büdcədənkənar vəsait"
    },
    ownership: {
      type: DataTypes.STRING(300),
      allowNull: true,
      comment: "Sahibkarlıq"
    },
    total_area: {
      type: DataTypes.STRING(15),
      allowNull: true,
      comment: "Ümumi sahə (korpuslar cəmi)"
    },
    image: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    thumb: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    edu_teaching_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    education_doc_type: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    series: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    start_date: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    edu_doc_end_date: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    count: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    differing: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    region: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    accreditation_date: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
    },
    deleted: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    teaching_year_list: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    inp_r1: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: "0",
      comment: "Ödənişli qəbuldan"
    },
    inp_r2: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: "0",
      comment: "Şagirdlərin istehsalat təcrübəsindən"
    },
    inp_r3: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: "0",
      comment: "Emalatxanalardan"
    },
    inp_r4: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: "0",
      comment: "Təlim - təsərrüfat sahələrindən"
    },
    inp_r5: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: "0",
      comment: "Cəmi"
    },
    student_place: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: "0"
    }
  }, {
    sequelize,
    tableName: 'enterprises_31',
    timestamps: false,
    paranoid: true,
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
        name: "enterprises_31_index",
        using: "BTREE",
        fields: [
          { name: "subordination" },
          { name: "district" },
          { name: "species" },
        ]
      },
    ]
  });
};
