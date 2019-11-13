module.exports = (sequelize, DataTypes) => {
  const ReviewCheck = sequelize.define(
    'ReviewCheck',
    {
      checklistItemId: DataTypes.INTEGER,
      checked: DataTypes.BOOLEAN
    },
    {
      timestamps: false
    }
  )
  ReviewCheck.associate = (models) => {
    ReviewCheck.belongsTo(models.Week, {
      foreignKey: 'weekId',
      onDelete: 'CASCADE',
      allowNull: true
    })
  }
  return ReviewCheck
}
