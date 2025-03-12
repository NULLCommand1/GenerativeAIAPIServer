'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Files extends Model {
        static associate(models) {}
    }

    Files.init({
        contextId: DataTypes.STRING,
        filePath: DataTypes.STRING,
        fileMimeType: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Files',
    });

    return Files;
};
