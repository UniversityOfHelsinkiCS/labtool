module.exports = (sequelize, DataTypes) => {
  const CodeReview = sequelize.define(
    'CodeReview',
    {
      points: DataTypes.DOUBLE,
      reviewNumber: DataTypes.INTEGER,
      linkToReview: DataTypes.STRING
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
    // Alias names are the same as their reverses for consistency's sake.
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
