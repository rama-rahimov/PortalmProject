const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('student_appeals_common_data', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    student_appeal_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'student_appeals',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    socialStep: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    socialDecisionReason: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    changeName: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    territorialIntegrityDisability: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    birthCertificate: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    changeNameDoc: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    typeHeroism: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    territorialIntegrityDeath: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    militaryOperationMissing: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    militaryOperationDeath: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    degreeKinship: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    marriageCertificate: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    birthCertificateOfMartyredChild: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    certificateFamilyComposition: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    certificateFamilyCompositionOther: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    documentConfirmingDisability: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    degreeDisability: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    degreeDisabilityIDoc: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    degreeDisabilityIIDoc: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    reasonOrphanhood: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    deprivationParentalCare: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    documentParentsUnknown: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    deathCertificateParents: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    socialOtherDoc: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    socialDescription: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    deprivationParentalCareDoc2: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    deprivationParentalCareDoc3: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    deprivationParentalCareDoc4: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    deprivationParentalCareDoc5: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    deprivationParentalCareDoc6: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    deprivationParentalCareDoc7: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    deprivationParentalCareDoc8: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    documentStatusIDP: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    doubleScholarship: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    studentLoan: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    studentLoanType: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'student_appeals_common_data',
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
