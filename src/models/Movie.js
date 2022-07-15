const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('movie', {
    image: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    released: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: new Date().toISOString().split('T')[0],
      validate: {
        isDate: true
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 5,
        isNumeric: true
      }
    },
  }, {
    timestamps: false
  });
};