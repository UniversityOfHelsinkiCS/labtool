module.exports = (sequelize, DataTypes) => {
  const Course_instances = sequelize.define('Course_instances', {
    name: DataTypes.STRING,
    start: DataTypes.DATE,
    end: DataTypes.DATE,
    active: DataTypes.BOOLEAN,
    week_amount: DataTypes.INTEGER,
    week_max_points: DataTypes.INTEGER,
    current_week: DataTypes.INTEGER
  })
  Course_instances.associate = (models) => {
    Course_instances.belongsTo(models.Course,{
      foreignKey: 'courseId',
      onDelete: 'CASCADE',
    })
  };
  return Course_instances;
};