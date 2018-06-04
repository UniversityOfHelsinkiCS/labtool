module.exports = (sequelize, DataTypes) => {
  const CodeReview = sequelize.define(
    'CodeReview',
    {
      points: DataTypes.DOUBLE,
      reviewNumber: DataTypes.INTEGER
    },
    {}
  )
  CodeReview.associate = models => {
    CodeReview.belongsTo(models.StudentInstance, {
      foreignKey: 'studentInstanceId',
      onDelete: 'CASCADE'
    })
    CodeReview.belongsTo(models.StudentInstance, {
      foreignKey: 'toReview'
    })
  }
  return CodeReview
}
