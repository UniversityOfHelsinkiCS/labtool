
module.exports = (sequelize, DataTypes) => {
  const course_instances = sequelize.define('course_instances', {
    name: DataTypes.STRING,
    start: DataTypes.DATE,
    end: DataTypes.DATE,
    active: DataTypes.BOOLEAN,
    week_amount: DataTypes.INTEGER,
    week_max_points: DataTypes.INTEGER,
    current_week: DataTypes.INTEGER
  }, {});
  course_instances.associate = function (models) {
    // associations can be defined here
    course_instances.belongsTo(models.courses, {
      foreignKey: 'courseId',
      onDelete: 'CASCADE',
    })
  };
  return course_instances;
};