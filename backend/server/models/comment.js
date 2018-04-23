module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    weekId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    to: {
      type: DataTypes.STRING,
      allowNull: false,
    },

  }, {})
  Comment.associate = function (models) {
    Comment.belongsTo(models.Week, {
      foreignKey: 'weekId',
      onDelete: 'CASCADE',
    })
  }
  return Comment
}