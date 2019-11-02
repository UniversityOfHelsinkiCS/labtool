module.exports = (sequelize, DataTypes) => {
  const ChecklistItem = sequelize.define(
    'ChecklistItem',
    {
      name: DataTypes.STRING,
      textWhenOff: DataTypes.STRING,
      textWhenOn: DataTypes.STRING,
      checkedPoints: DataTypes.DOUBLE,
      uncheckedPoints: DataTypes.DOUBLE,
      category: DataTypes.STRING
    },
    {
      timestamps: false
    }
  )
  ChecklistItem.associate = (models) => {
    ChecklistItem.belongsTo(models.Checklist, {
      foreignKey: 'checklistId',
      onDelete: 'CASCADE'
    })
  }
  return ChecklistItem
}
