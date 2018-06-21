module.exports = (sequelize, DataTypes) => {
  /*feedback, hiddenComment, comment */
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
      from: {
        type: DataTypes.STRING,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {}
  )
  Comment.associate = function(models) {
    Comment.belongsTo(models.Week, {
      foreignKey: 'weekId',
      onDelete: 'CASCADE'
    })
  }
  return Comment
}
