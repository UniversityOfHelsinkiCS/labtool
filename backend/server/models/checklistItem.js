module.exports = (sequelize, DataTypes) => {
  const ChecklistItem = sequelize.define(
    'ChecklistItem',
    {
      name: DataTypes.TEXT,
      textWhenOff: DataTypes.TEXT,
      textWhenOn: DataTypes.TEXT,
      checkedPoints: DataTypes.DOUBLE,
      uncheckedPoints: DataTypes.DOUBLE,
      category: DataTypes.TEXT,
      order: DataTypes.INTEGER,
      minimumRequirement: DataTypes.BOOLEAN
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
