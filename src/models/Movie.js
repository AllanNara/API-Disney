const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('movie', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};