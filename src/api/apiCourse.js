
var apiCourse = (function apiCourse()
{
    function getCourseUsers(courseID)
    {
        return api.get('courses/' + courseID + '/users' + '?per_page=50');
    }

    return {
        getCourseUsers: getCourseUsers
    };
})();


