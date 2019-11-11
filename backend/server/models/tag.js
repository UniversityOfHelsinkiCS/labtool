
module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define(
    'Tag',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      color: DataTypes.STRING
    },
    {}
  )
  Tag.associate = (models) => {
    Tag.belongsToMany(models.StudentInstance, {
      through: 'StudentTag',
      foreignKey: 'tagId'
    }),
    Tag.belongsTo(models.CourseInstance, {
      foreignKey: {
        name: 'courseInstanceId',
        allowNull: true
      },
      onDelete: 'CASCADE'
    })
  }
  return Tag
}
