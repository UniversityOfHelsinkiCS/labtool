module.exports = (sequelize, DataTypes) => {
  const CodeReview = sequelize.define(
    'CodeReview',
    {
      points: DataTypes.DOUBLE,
      reviewNumber: DataTypes.INTEGER
    },
    {
      hooks: {
        // This will automatically destroy any pre-existing row before inserting to avoid duplicates.
        // Updating happens by destroying the old, then inserting the new.
        beforeCreate: (newCodeReview, options) => {
          CodeReview.destroy({
            where: {
              studentInstanceId: newCodeReview.studentInstanceId,
              reviewNumber: newCodeReview.reviewNumber
            }
          })
        }
      }
    }
  )
  CodeReview.associate = models => {
    CodeReview.belongsTo(models.StudentInstance, {
      foreignKey: 'studentInstanceId',
      onDelete: 'CASCADE',
      as: 'codeReviews'
    })
    CodeReview.belongsTo(models.StudentInstance, {
      foreignKey: 'toReview',
      as: 'toReviews'
    })
  }
  return CodeReview
}
