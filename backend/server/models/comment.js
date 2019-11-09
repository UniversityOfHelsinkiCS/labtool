module.exports = (sequelize, DataTypes) => {
  /* feedback, hiddenComment, comment */
  const Comment = sequelize.define(
    'Comment',
    {
      hidden: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      comment: {
        type: DataTypes.STRING
      },
      weekId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true // old comments will have null for "unknown author"
      },
      from: {
        type: DataTypes.STRING,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      notified: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      }
    },
    {}
  )
  Comment.associate = function (models) {
    Comment.belongsTo(models.Week, {
      foreignKey: 'weekId',
      onDelete: 'CASCADE'
    })
    Comment.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    })
  }
  return Comment
}
