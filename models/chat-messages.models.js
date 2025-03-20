'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatMessages extends Model {
    static associate(models) {
    }
  }
  ChatMessages.init({
    contextId: DataTypes.STRING,
    role: DataTypes.STRING,
    index: DataTypes.INTEGER,
    content: DataTypes.TEXT,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'ChatMessages',
  });
  return ChatMessages;
};
