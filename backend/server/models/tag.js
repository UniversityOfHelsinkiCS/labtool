
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
    })
  }
  return Tag
}
