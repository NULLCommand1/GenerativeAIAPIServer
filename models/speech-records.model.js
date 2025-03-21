'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class SpeechRecords extends Model {
        static associate(models) {}
    }

    SpeechRecords.init({
        recordName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        serverUrl: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'SpeechRecords',
    });

    return SpeechRecords;
};