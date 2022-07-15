const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('genre', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
  }, {
    timestamps: false
  });
};