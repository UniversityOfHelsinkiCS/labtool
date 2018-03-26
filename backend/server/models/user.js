module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    firsts: DataTypes.STRING,
    lastname: DataTypes.STRING,
    studentnumber: DataTypes.STRING,
    admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {})
  User.associate = (models) => {
    User.hasMany(models.StudentInstance, {
      foreignKey: 'userId',
      as: 'users'
    })
  }
  return User
}