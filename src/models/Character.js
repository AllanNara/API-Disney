const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('character', {
    image: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    age: {
      type: DataTypes.INTEGER,
    },
    weigth: {
      type: DataTypes.INTEGER,
    },
    history: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
  }, {
    timestamps: false
  });
};
